import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@dane/database';
import { eq, and, desc, sql } from 'drizzle-orm';
import { SystemService } from '../system/system.service';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private systemService: SystemService,
    private storageService: StorageService,
  ) {}

  async getPaginatedTenants(managerId: string, page: number = 1, filters?: { propertyId?: string; status?: string }) {
    const limit = 10;
    const offset = (page - 1) * limit;

    let conditions = [eq(schema.tenant.managerId, managerId)];
    if (filters?.propertyId) conditions.push(eq(schema.tenant.propertyId, filters.propertyId));
    if (filters?.status) conditions.push(eq(schema.tenant.status, filters.status));

    const results = await this.db
      .select({
        id: schema.tenant.id,
        name: schema.tenant.name,
        email: schema.tenant.email,
        phone: schema.tenant.phone,
        status: schema.tenant.status,
        unitId: schema.tenant.unitId,
        arrears: schema.tenant.arrears,
        propertyName: schema.property.name,
        createdAt: schema.tenant.createdAt,
      })
      .from(schema.tenant)
      .leftJoin(schema.property, eq(schema.tenant.propertyId, schema.property.id))
      .where(and(...conditions))
      .orderBy(desc(schema.tenant.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await this.db.select({ count: sql`count(*)` }).from(schema.tenant).where(and(...conditions));
    const totalCountVal = Number(countResult.count);

    return { 
        success: true, 
        tenants: results, 
        total: totalCountVal,
        hasMore: totalCountVal > offset + limit 
    };
  }

  async getDetailedTenantProfile(id: string, managerId?: string) {
    let query = eq(schema.tenant.id, id);
    if (managerId) query = and(query, eq(schema.tenant.managerId, managerId)) as any;

    const [result] = await this.db
      .select()
      .from(schema.tenant)
      .where(query);
    
    if (!result) return { success: false, error: "Tenant not found" };
    return { success: true, tenant: result };
  }

  async getTenantsByPropertyId(propertyId: string, managerId?: string) {
    let query = eq(schema.tenant.propertyId, propertyId);
    if (managerId) query = and(query, eq(schema.tenant.managerId, managerId)) as any;

    const results = await this.db
        .select()
        .from(schema.tenant)
        .where(query)
        .orderBy(schema.tenant.name);
    
    return { success: true, tenants: results };
  }

  async createTenant(data: any) {
    const id = `tnt-${uuidv4().slice(0, 8)}`;
    await this.db.insert(schema.tenant).values({
      id,
      ...data,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.systemService.logSystemEvent({
        managerId: data.managerId,
        action: 'TENANT_CREATED',
        entityType: 'tenant',
        entityId: id,
        payload: { name: data.name, unit: data.unitId }
    });

    return { success: true, id };
  }

  async archiveTenant(id: string, managerId: string, metadata: any = {}) {
    await this.db.update(schema.tenant)
        .set({ 
            status: 'archived',
            updatedAt: new Date(),
        })
        .where(and(eq(schema.tenant.id, id), eq(schema.tenant.managerId, managerId)));

    await this.systemService.logSystemEvent({
        managerId,
        action: 'TENANT_ARCHIVED',
        entityType: 'tenant',
        entityId: id,
        payload: metadata
    });

    return { success: true };
  }

  async getTenantStats(managerId: string) {
    const [totalRes] = await this.db.select({ count: sql`count(*)` }).from(schema.tenant).where(eq(schema.tenant.managerId, managerId));
    const [activeRes] = await this.db.select({ count: sql`count(*)` }).from(schema.tenant).where(and(eq(schema.tenant.managerId, managerId), eq(schema.tenant.status, 'active')));
    const [archivedRes] = await this.db.select({ count: sql`count(*)` }).from(schema.tenant).where(and(eq(schema.tenant.managerId, managerId), eq(schema.tenant.status, 'archived')));
    
    const [arrears] = await this.db
        .select({ 
            sum: sql`sum(cast(${schema.tenant.arrears} as decimal))`,
            count: sql`count(*) filter (where cast(${schema.tenant.arrears} as decimal) > 0)`
        })
        .from(schema.tenant)
        .where(and(eq(schema.tenant.managerId, managerId), eq(schema.tenant.status, 'active')));

    return {
        success: true,
        stats: {
            total: Number(totalRes.count),
            active: Number(activeRes.count),
            archived: Number(archivedRes.count),
            arrearsSum: parseFloat(arrears?.sum as any || "0"),
            withArrearsCount: Number(arrears?.count || 0)
        }
    };
  }

  async getArchivedTenants(managerId: string, page: number = 1) {
    const limit = 10;
    const offset = (page - 1) * limit;

    const results = await this.db
        .select()
        .from(schema.tenant)
        .where(and(eq(schema.tenant.managerId, managerId), eq(schema.tenant.status, 'archived')))
        .orderBy(desc(schema.tenant.updatedAt))
        .limit(limit)
        .offset(offset);

    const [countResult] = await this.db.select({ count: sql`count(*)` }).from(schema.tenant).where(and(eq(schema.tenant.managerId, managerId), eq(schema.tenant.status, 'archived')));
    const totalCountVal = Number(countResult.count);

    return { 
        success: true, 
        tenants: results,
        total: totalCountVal,
        hasMore: totalCountVal > offset + limit
    };
  }

  async uploadTenantPhoto(file: Buffer, key: string, contentType: string) {
    const url = await this.storageService.uploadToR2(file, key, contentType);
    return { success: true, imageUrl: url };
  }
}
