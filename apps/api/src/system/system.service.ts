import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@dane/database';
import { eq, desc, count, and } from 'drizzle-orm';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async logSystemEvent(data: {
    managerId: string;
    action: string;
    entityType: string;
    entityId: string;
    payload?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.db.insert(schema.systemAuditLog).values({
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        managerId: data.managerId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        payload: data.payload || {},
        ipAddress: data.ipAddress || '0.0.0.0',
        userAgent: data.userAgent || 'API',
        createdAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Forensic Log Failure: ${error.message}`);
    }
  }

  async getAuditLogs(managerId: string, page = 1, limit = 50, filters: any = {}) {
    const offset = (page - 1) * limit;
    let conditions = [eq(schema.systemAuditLog.managerId, managerId)];
    if (filters.action) conditions.push(eq(schema.systemAuditLog.action, filters.action));
    if (filters.entityType) conditions.push(eq(schema.systemAuditLog.entityType, filters.entityType));

    const data = await this.db.select()
      .from(schema.systemAuditLog)
      .where(and(...conditions))
      .orderBy(desc(schema.systemAuditLog.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRes] = await this.db.select({ count: count() })
      .from(schema.systemAuditLog)
      .where(and(...conditions));
      
    return { success: true, logs: data, total: totalRes.count };
  }

  async getCronLogs(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const data = await this.db.select()
      .from(schema.cronHeartbeat)
      .orderBy(desc(schema.cronHeartbeat.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRes] = await this.db.select({ count: count() })
      .from(schema.cronHeartbeat);
      
    return { success: true, logs: data, total: totalRes.count };
  }

  async updateSecuritySettings(userId: string, data: { twoFactorEnabled?: boolean; config?: any }) {
    const updateData: any = {};
    if (data.twoFactorEnabled !== undefined) updateData.twoFactorEnabled = data.twoFactorEnabled;
    if (data.config !== undefined) updateData.securityConfig = data.config;

    await this.db.update(schema.user).set(updateData).where(eq(schema.user.id, userId));
    
    await this.logSystemEvent({
      managerId: userId,
      action: 'SECURITY_SETTINGS_UPDATED',
      entityType: 'user',
      entityId: userId,
      payload: data
    });

    return { success: true };
  }

  async getActiveSessions(userId: string) {
    const data = await this.db.select().from(schema.session).where(eq(schema.session.userId, userId));
    return { success: true, sessions: data };
  }

  async revokeSession(sessionId: string, userId: string) {
    await this.db.delete(schema.session).where(and(eq(schema.session.id, sessionId), eq(schema.session.userId, userId)));
    
    await this.logSystemEvent({
      managerId: userId,
      action: 'SESSION_REVOKED',
      entityType: 'session',
      entityId: sessionId
    });

    return { success: true };
  }

  async updateBusinessSettings(userId: string, data: any) {
    await this.db.update(schema.user).set({ businessConfig: data }).where(eq(schema.user.id, userId));
    
    await this.logSystemEvent({
      managerId: userId,
      action: 'BUSINESS_SETTINGS_UPDATED',
      entityType: 'user',
      entityId: userId,
      payload: data
    });

    return { success: true };
  }

  async updateFinanceSettings(userId: string, data: any) {
    await this.db.update(schema.user).set({ financeConfig: data }).where(eq(schema.user.id, userId));
    
    await this.logSystemEvent({
      managerId: userId,
      action: 'FINANCE_SETTINGS_UPDATED',
      entityType: 'user',
      entityId: userId,
      payload: data
    });

    return { success: true };
  }
}
