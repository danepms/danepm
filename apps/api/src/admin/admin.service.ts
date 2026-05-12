import { Injectable, Inject, Logger, ForbiddenException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@dane/database';
import { sql, eq, desc, count, and, or, asc, inArray, ilike } from 'drizzle-orm';
import { SystemService } from '../system/system.service';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private systemService: SystemService,
    private storageService: StorageService,
  ) {}

  async verifyAdmin(adminId: string) {
    const [adminUser] = await this.db.select().from(schema.user).where(eq(schema.user.id, adminId));
    if (!adminUser || adminUser.role !== 'admin') {
      throw new ForbiddenException('Unauthorized: Admin access required');
    }
    return adminUser;
  }

  async getAdminUserStats(adminId: string) {
    await this.verifyAdmin(adminId);

    const [totalUsers] = await this.db.select({ val: count() }).from(schema.user);
    const [totalManagers] = await this.db.select({ val: count() }).from(schema.user).where(eq(schema.user.role, 'manager'));
    const [totalOwners] = await this.db.select({ val: count() }).from(schema.user).where(eq(schema.user.role, 'owner'));
    const [totalAdmins] = await this.db.select({ val: count() }).from(schema.user).where(eq(schema.user.role, 'admin'));
    const [verifiedEmails] = await this.db.select({ val: count() }).from(schema.user).where(eq(schema.user.emailVerified, true));
    const [twoFactorCount] = await this.db.select({ val: count() }).from(schema.twoFactor).where(eq(schema.twoFactor.verified, true));
    const [suspendedUsers] = await this.db.select({ val: count() }).from(schema.user).where(eq(schema.user.suspended, true));

    return {
      success: true,
      stats: {
        total: totalUsers.val,
        managers: totalManagers.val,
        owners: totalOwners.val,
        admins: totalAdmins.val,
        verified: verifiedEmails.val,
        twoFactor: twoFactorCount.val,
        suspended: suspendedUsers.val,
      }
    };
  }

  async getRoleBreakdown(adminId: string) {
    await this.verifyAdmin(adminId);
    
    const roles = await this.db.select({
      role: schema.user.role,
      count: count()
    }).from(schema.user).groupBy(schema.user.role);

    return { success: true, data: roles.map(r => ({ name: r.role || 'unknown', value: Number(r.count) })) };
  }

  async getSignupTimeline(adminId: string) {
    await this.verifyAdmin(adminId);
    
    const users = await this.db.select({
      createdAt: schema.user.createdAt,
    }).from(schema.user).orderBy(asc(schema.user.createdAt));

    const timelineMap = new Map<string, number>();
    
    users.forEach(u => {
      const date = new Date(u.createdAt);
      const monthString = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      timelineMap.set(monthString, (timelineMap.get(monthString) || 0) + 1);
    });

    const data = Array.from(timelineMap.entries()).map(([date, count]) => ({ date, count }));
    return { success: true, data };
  }

  async getUsersByRole(adminId: string, roleFilter: string, page: number = 1, searchQuery?: string) {
    await this.verifyAdmin(adminId);
    
    const limit = 12;
    const offset = (page - 1) * limit;

    let conditions: any[] = [];
    if (roleFilter !== 'all') {
       if (roleFilter === 'suspended') {
           conditions.push(eq(schema.user.suspended, true));
       } else {
           conditions.push(eq(schema.user.role, roleFilter));
       }
    }
    
    if (searchQuery) {
      conditions.push(
        or(
          ilike(schema.user.name, `%${searchQuery}%`),
          ilike(schema.user.email, `%${searchQuery}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = this.db.select()
      .from(schema.user);
    
    if (whereClause) {
      query.where(whereClause);
    }

    const data = await query
      .orderBy(desc(schema.user.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = this.db.select({ val: count() })
      .from(schema.user);
    
    if (whereClause) {
      countQuery.where(whereClause);
    }

    const [totalRes] = await countQuery;

    const enrichedUsers = await Promise.all(data.map(async (u) => {
      const [propAsMgr] = await this.db.select({ val: count() }).from(schema.property).where(eq(schema.property.userId, u.id));
      const [propAsOwner] = await this.db.select({ val: count() }).from(schema.property).where(eq(schema.property.ownerId, u.id));
      const totalProps = Math.max(propAsMgr.val, propAsOwner.val) || (propAsMgr.val + propAsOwner.val);

      const userProperties = await this.db.select({ id: schema.property.id }).from(schema.property).where(
        or(eq(schema.property.userId, u.id), eq(schema.property.ownerId, u.id))
      );
      const propertyIds = userProperties.map(p => p.id);
      let tenantCount = 0;
      if (propertyIds.length > 0) {
        const [tc] = await this.db.select({ val: count() }).from(schema.tenant).where(inArray(schema.tenant.propertyId, propertyIds));
        tenantCount = tc.val;
      }

      const [tfRecord] = await this.db.select({ verified: schema.twoFactor.verified }).from(schema.twoFactor).where(eq(schema.twoFactor.userId, u.id));
      const has2FA = tfRecord?.verified === true;

      return {
        ...u,
        propertiesCount: totalProps,
        tenantsCount: tenantCount,
        twoFactorEnabled: has2FA,
      };
    }));

    return { 
      success: true, 
      users: enrichedUsers, 
      total: totalRes.val,
      hasMore: offset + enrichedUsers.length < totalRes.val 
    };
  }

  async getAdminUserDetail(adminId: string, targetUserId: string) {
    await this.verifyAdmin(adminId);
    
    const [targetUser] = await this.db.select().from(schema.user).where(eq(schema.user.id, targetUserId));
    if (!targetUser) throw new Error("User not found");

    const userProperties = await this.db.select().from(schema.property).where(
      or(eq(schema.property.userId, targetUserId), eq(schema.property.ownerId, targetUserId))
    );
    const propertyIds = userProperties.map(p => p.id);

    let tenantTotal = 0;
    if (propertyIds.length > 0) {
      const [tc] = await this.db.select({ val: count() }).from(schema.tenant).where(inArray(schema.tenant.propertyId, propertyIds));
      tenantTotal = tc.val;
    }
    
    const [revenueRes] = await this.db.select({ total: sql`sum(CAST(${schema.payment.amount} AS NUMERIC))` })
      .from(schema.payment).where(eq(schema.payment.managerId, targetUserId));
      
    let arrearsTotal = 0;
    if (propertyIds.length > 0) {
      const [arrearsRes] = await this.db.select({ total: sql`sum(CAST(${schema.tenant.arrears} AS NUMERIC))` })
        .from(schema.tenant).where(inArray(schema.tenant.propertyId, propertyIds));
      arrearsTotal = Number(arrearsRes?.total) || 0;
    }

    const [tfRecord] = await this.db.select({ verified: schema.twoFactor.verified }).from(schema.twoFactor).where(eq(schema.twoFactor.userId, targetUserId));
    const has2FA = tfRecord?.verified === true;

    const auditLogs = await this.db.select().from(schema.systemAuditLog)
      .where(or(
        eq(schema.systemAuditLog.managerId, targetUserId),
        eq(schema.systemAuditLog.actorId, targetUserId)
      ))
      .orderBy(desc(schema.systemAuditLog.createdAt))
      .limit(20);

    const activeSessions = await this.db.select().from(schema.session).where(eq(schema.session.userId, targetUserId));

    return {
      success: true,
      user: { ...targetUser, twoFactorEnabled: has2FA },
      stats: {
        properties: userProperties.length,
        tenants: tenantTotal,
        revenue: revenueRes?.total || 0,
        arrears: arrearsTotal,
      },
      properties: userProperties.slice(0, 10),
      auditLogs,
      sessions: activeSessions
    };
  }

  async suspendUser(adminId: string, targetUserId: string) {
    await this.verifyAdmin(adminId);
    await this.db.update(schema.user).set({
      suspended: true,
      suspendedAt: new Date(),
      suspendedBy: adminId
    }).where(eq(schema.user.id, targetUserId));

    await this.systemService.logSystemEvent({
      managerId: adminId,
      action: 'USER_SUSPENDED',
      entityType: 'user',
      entityId: targetUserId,
    });

    return { success: true };
  }

  async reactivateUser(adminId: string, targetUserId: string) {
    await this.verifyAdmin(adminId);
    await this.db.update(schema.user).set({
      suspended: false,
      suspendedAt: null,
      suspendedBy: null
    }).where(eq(schema.user.id, targetUserId));

    await this.systemService.logSystemEvent({
      managerId: adminId,
      action: 'USER_REACTIVATED',
      entityType: 'user',
      entityId: targetUserId,
    });

    return { success: true };
  }

  async changeUserRole(adminId: string, targetUserId: string, newRole: string) {
    await this.verifyAdmin(adminId);
    await this.db.update(schema.user).set({
      role: newRole
    }).where(eq(schema.user.id, targetUserId));

    await this.systemService.logSystemEvent({
      managerId: adminId,
      action: 'USER_ROLE_CHANGED',
      entityType: 'user',
      entityId: targetUserId,
      payload: { newRole },
    });

    return { success: true };
  }

  async getAdminPropertyStats(adminId: string) {
    await this.verifyAdmin(adminId);

    const properties = await this.db.select().from(schema.property);
    
    let totalUnits = 0;
    let occupiedUnits = 0;
    
    for (const prop of properties) {
      const config = typeof prop.config === 'string' ? JSON.parse(prop.config) : (prop.config || {});
      const units = config.units || [];
      totalUnits += units.length;
      occupiedUnits += units.filter((u: any) => u.status === 'occupied').length;
    }

    const liveCount = properties.filter(p => p.isLive).length;
    const withOwner = properties.filter(p => p.ownerId).length;

    return {
      success: true,
      stats: {
        total: properties.length,
        live: liveCount,
        inSetup: properties.length - liveCount,
        totalUnits,
        occupiedUnits,
        vacancyRate: totalUnits > 0 ? ((totalUnits - occupiedUnits) / totalUnits) * 100 : 0,
        withOwner,
        noOwner: properties.length - withOwner,
      }
    };
  }

  async getAdminProperties(adminId: string, filter: string, page: number, searchQuery?: string) {
    await this.verifyAdmin(adminId);
    
    const limit = 12;
    const offset = (page - 1) * limit;

    let conditions: any[] = [];
    if (filter === 'live') conditions.push(eq(schema.property.isLive, true));
    if (filter === 'setup') conditions.push(eq(schema.property.isLive, false));
    if (filter === 'unowned') conditions.push(sql`${schema.property.ownerId} IS NULL`);
    
    if (searchQuery) {
      conditions.push(
        or(
          ilike(schema.property.name, `%${searchQuery}%`),
          ilike(schema.property.location, `%${searchQuery}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = this.db.select()
      .from(schema.property);
    
    if (whereClause) {
      query.where(whereClause);
    }

    const data = await query
      .orderBy(desc(schema.property.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = this.db.select({ val: count() })
      .from(schema.property);
    
    if (whereClause) {
      countQuery.where(whereClause);
    }

    const [totalRes] = await countQuery;

    const enrichedProperties = await Promise.all(data.map(async (p) => {
      const [manager] = await this.db.select({ id: schema.user.id, name: schema.user.name, image: schema.user.image }).from(schema.user).where(eq(schema.user.id, p.userId));
      const [owner] = p.ownerId ? await this.db.select({ id: schema.user.id, name: schema.user.name, image: schema.user.image }).from(schema.user).where(eq(schema.user.id, p.ownerId)) : [null];
      
      const config = typeof p.config === 'string' ? JSON.parse(p.config) : (p.config || {});
      const units = config.units || [];
      const totalUnits = units.length;
      const occupiedUnits = units.filter((u: any) => u.status === 'occupied').length || 0;
      
      const [tc] = await this.db.select({ val: count() }).from(schema.tenant).where(eq(schema.tenant.propertyId, p.id));

      return {
        ...p,
        manager,
        owner,
        totalUnits,
        occupiedUnits,
        tenantCount: tc.val
      };
    }));

    return { 
      success: true, 
      properties: enrichedProperties, 
      total: totalRes.val,
      hasMore: offset + enrichedProperties.length < totalRes.val 
    };
  }

  async getAdminPropertyDetail(adminId: string, propertyId: string) {
    await this.verifyAdmin(adminId);
    
    const [targetProperty] = await this.db.select().from(schema.property).where(eq(schema.property.id, propertyId));
    if (!targetProperty) throw new Error("Property not found");

    const [manager] = await this.db.select({ id: schema.user.id, name: schema.user.name, email: schema.user.email, image: schema.user.image })
      .from(schema.user).where(eq(schema.user.id, targetProperty.userId));
      
    const [owner] = targetProperty.ownerId ? 
      await this.db.select({ id: schema.user.id, name: schema.user.name, email: schema.user.email, image: schema.user.image })
        .from(schema.user).where(eq(schema.user.id, targetProperty.ownerId)) : [null];

    const config = typeof targetProperty.config === 'string' ? JSON.parse(targetProperty.config) : (targetProperty.config || {});
    const units = config.units || [];
    const totalUnits = units.length;
    const occupiedUnits = units.filter((u: any) => u.status === 'occupied').length || 0;
    const vacancyRate = totalUnits > 0 ? ((totalUnits - occupiedUnits) / totalUnits) * 100 : 0;
    
    const rents = config.rents || {};
    let monthlyRevenue = 0;
    // Assuming config.units has type info to match with rents
    units.forEach((u: any) => {
        if (u.status === 'occupied' && u.type && rents[u.type]) {
            monthlyRevenue += parseFloat(rents[u.type]);
        }
    });

    const [tenantCountRes] = await this.db.select({ val: count() }).from(schema.tenant).where(eq(schema.tenant.propertyId, propertyId));
    
    const [arrearsRes] = await this.db.select({ total: sql`sum(CAST(${schema.tenant.arrears} AS NUMERIC))` })
      .from(schema.tenant).where(eq(schema.tenant.propertyId, propertyId));

    const tenantsList = await this.db.select().from(schema.tenant).where(eq(schema.tenant.propertyId, propertyId)).limit(10);
    const expenses = await this.db.select().from(schema.expense).where(eq(schema.expense.propertyId, propertyId)).limit(5);
    const maintenanceRequests = await this.db.select().from(schema.maintenanceRequest).where(eq(schema.maintenanceRequest.propertyId, propertyId)).limit(5);
    
    const auditLogs = await this.db.select().from(schema.systemAuditLog)
      .where(and(eq(schema.systemAuditLog.entityId, propertyId), eq(schema.systemAuditLog.entityType, 'property')))
      .orderBy(desc(schema.systemAuditLog.createdAt))
      .limit(20);

    return {
      success: true,
      property: targetProperty,
      manager,
      owner,
      stats: {
        totalUnits,
        occupiedUnits,
        vacancyRate,
        tenants: tenantCountRes.val,
        revenue: monthlyRevenue,
        arrears: Number(arrearsRes?.total) || 0
      },
      units: config.units || [],
      rents: config.rents || {},
      recurring: config.recurring || [],
      tenants: tenantsList,
      expenses,
      maintenanceRequests,
      auditLogs
    };
  }

  async getAuditLogs(managerId: string, page: number, limit: number, filters: any) {
    return this.systemService.getAuditLogs(managerId, page, limit, filters);
  }

  async getCronLogs(page: number, limit: number) {
    return this.systemService.getCronLogs(page, limit);
  }

  async getSessions(userId: string) {
    return this.systemService.getActiveSessions(userId);
  }

  async revokeSession(sessionId: string, userId: string) {
    return this.systemService.revokeSession(sessionId, userId);
  }

  async updateBusinessSettings(userId: string, data: any) {
    return this.systemService.updateBusinessSettings(userId, data);
  }

  async updateFinanceSettings(userId: string, data: any) {
    return this.systemService.updateFinanceSettings(userId, data);
  }

  async uploadLogo(file: Buffer, fileName: string, contentType: string) {
    const key = `logos/${uuidv4()}-${fileName}`;
    const url = await this.storageService.uploadToR2(file, key, contentType);
    return { success: true, url };
  }
}
