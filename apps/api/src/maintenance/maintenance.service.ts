import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@dane/database';
import { eq, and, desc, count, sql, gte } from 'drizzle-orm';
import { SystemService } from '../system/system.service';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private systemService: SystemService,
    private storageService: StorageService,
  ) {}

  async getMaintenanceRequests(managerId: string, page: number = 1, filters?: { status?: string; propertyId?: string }) {
    const limit = 10;
    const offset = (page - 1) * limit;

    let conditions = [eq(schema.maintenanceRequest.managerId, managerId)];
    if (filters?.status) conditions.push(eq(schema.maintenanceRequest.status, filters.status));
    if (filters?.propertyId) conditions.push(eq(schema.maintenanceRequest.propertyId, filters.propertyId));

    const results = await this.db
      .select({
        id: schema.maintenanceRequest.id,
        tenantId: schema.maintenanceRequest.tenantId,
        tenantName: schema.tenant.name,
        propertyId: schema.maintenanceRequest.propertyId,
        propertyName: schema.property.name,
        unitId: schema.maintenanceRequest.unitId,
        category: schema.maintenanceRequest.category,
        title: schema.maintenanceRequest.title,
        description: schema.maintenanceRequest.description,
        priority: schema.maintenanceRequest.priority,
        status: schema.maintenanceRequest.status,
        createdAt: schema.maintenanceRequest.createdAt,
        photos: schema.maintenanceRequest.photos
      })
      .from(schema.maintenanceRequest)
      .leftJoin(schema.tenant, eq(schema.maintenanceRequest.tenantId, schema.tenant.id))
      .leftJoin(schema.property, eq(schema.maintenanceRequest.propertyId, schema.property.id))
      .where(and(...conditions))
      .orderBy(desc(schema.maintenanceRequest.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await this.db.select({ count: sql`count(*)` }).from(schema.maintenanceRequest).where(and(...conditions));
    const totalCount = Number(countResult.count);
    
    const counts = await this.db
        .select({ status: schema.maintenanceRequest.status, count: count() })
        .from(schema.maintenanceRequest)
        .where(eq(schema.maintenanceRequest.managerId, managerId))
        .groupBy(schema.maintenanceRequest.status);
    
    return { 
        success: true, 
        requests: results, 
        total: totalCount,
        hasMore: totalCount > offset + limit,
        statusCounts: counts
    };
  }

  async createMaintenanceRequest(data: any) {
    const id = `req-${uuidv4().slice(0, 8)}`;
    await this.db.insert(schema.maintenanceRequest).values({
        id,
        ...data,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    await this.systemService.logSystemEvent({
        managerId: data.managerId,
        action: 'MAINTENANCE_REQUESTED',
        entityType: 'maintenance',
        entityId: id,
        payload: { title: data.title }
    });

    return { success: true, id };
  }

  async updateRequestStatus(id: string, status: string) {
    await this.db.update(schema.maintenanceRequest)
        .set({ status, updatedAt: new Date() })
        .where(eq(schema.maintenanceRequest.id, id));
    
    return { success: true };
  }

  async getExpenses(managerId: string, page: number = 1, filters?: { category?: string; propertyId?: string }) {
    const limit = 10;
    const offset = (page - 1) * limit;

    let conditions = [eq(schema.expense.managerId, managerId)];
    if (filters?.category) conditions.push(eq(schema.expense.category, filters.category));
    if (filters?.propertyId) conditions.push(eq(schema.expense.propertyId, filters.propertyId));

    const results = await this.db
        .select({
            id: schema.expense.id,
            description: schema.expense.description,
            amount: schema.expense.amount,
            category: schema.expense.category,
            paidDate: schema.expense.paidDate,
            propertyId: schema.expense.propertyId,
            propertyName: schema.property.name,
            vendorName: schema.expense.vendorName,
            receipt: schema.expense.receipt,
            createdAt: schema.expense.createdAt
        })
        .from(schema.expense)
        .leftJoin(schema.property, eq(schema.expense.propertyId, schema.property.id))
        .where(and(...conditions))
        .orderBy(desc(schema.expense.paidDate))
        .limit(limit)
        .offset(offset);

    const [countResult] = await this.db.select({ count: sql`count(*)` }).from(schema.expense).where(and(...conditions));
    const totalCount = Number(countResult.count);

    const breakdown = await this.db
        .select({ category: schema.expense.category, total: sql`sum(cast(${schema.expense.amount} as decimal))` })
        .from(schema.expense)
        .where(eq(schema.expense.managerId, managerId))
        .groupBy(schema.expense.category);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const [monthly] = await this.db
        .select({ val: sql`sum(cast(${schema.expense.amount} as decimal))` })
        .from(schema.expense)
        .where(and(eq(schema.expense.managerId, managerId), gte(schema.expense.paidDate, startOfMonth)));

    return { 
        success: true, 
        expenses: results, 
        total: totalCount,
        monthlyTotal: parseFloat(monthly?.val as any || "0"),
        hasMore: totalCount > offset + limit,
        categoryBreakdown: breakdown.map(b => ({ category: b.category, total: parseFloat(b.total as any || "0") }))
    };
  }

  async createExpense(data: any) {
    const id = `exp-${uuidv4().slice(0, 8)}`;
    await this.db.insert(schema.expense).values({
        id,
        ...data,
        paidDate: data.paidDate ? new Date(data.paidDate) : new Date(),
        createdAt: new Date(),
    });

    await this.systemService.logSystemEvent({
        managerId: data.managerId,
        action: 'EXPENSE_LOGGED',
        entityType: 'expense',
        entityId: id,
        payload: { description: data.description, amount: data.amount }
    });

    return { success: true, id };
  }

  async getExpenseById(id: string, managerId?: string) {
    let conditions = [eq(schema.expense.id, id)];
    if (managerId) conditions.push(eq(schema.expense.managerId, managerId));

    const [result] = await this.db
        .select({
            expense: {
                id: schema.expense.id,
                propertyId: schema.expense.propertyId,
                unitId: schema.expense.unitId,
                tenantId: schema.expense.tenantId,
                requestId: schema.expense.requestId,
                category: schema.expense.category,
                description: schema.expense.description,
                amount: schema.expense.amount,
                vendorName: schema.expense.vendorName,
                vendorPhone: schema.expense.vendorPhone,
                receipt: schema.expense.receipt,
                initiatedBy: schema.expense.initiatedBy,
                paidDate: schema.expense.paidDate,
                createdAt: schema.expense.createdAt
            },
            propertyName: schema.property.name,
            tenantName: schema.tenant.name,
            requestTitle: schema.maintenanceRequest.title,
            requestDescription: schema.maintenanceRequest.description
        })
        .from(schema.expense)
        .leftJoin(schema.property, eq(schema.expense.propertyId, schema.property.id))
        .leftJoin(schema.tenant, eq(schema.expense.tenantId, schema.tenant.id))
        .leftJoin(schema.maintenanceRequest, eq(schema.expense.requestId, schema.maintenanceRequest.id))
        .where(and(...conditions));

    if (!result) return { success: false, error: "Expense not found" };
    return { success: true, expense: result };
  }

  async resolveMaintenanceWithExpense(data: {
    requestId: string;
    managerId: string;
    amount: string;
    category: string;
    description: string;
    vendorName?: string;
    paidDate?: string;
    receiptUrl?: string;
    propertyId?: string;
  }) {
    return await this.db.transaction(async (tx) => {
        const expenseId = `exp-${uuidv4().slice(0, 8)}`;
        
        await tx.insert(schema.expense).values({
            id: expenseId,
            managerId: data.managerId,
            propertyId: data.propertyId || '',
            amount: data.amount,
            category: data.category,
            description: data.description,
            vendorName: data.vendorName,
            paidDate: data.paidDate ? new Date(data.paidDate) : new Date(),
            receipt: data.receiptUrl, 
            createdAt: new Date(),
        });

        await tx.update(schema.maintenanceRequest)
            .set({ 
                status: 'resolved', 
                updatedAt: new Date(),
                resolvedAt: new Date()
            })
            .where(and(
                eq(schema.maintenanceRequest.id, data.requestId),
                eq(schema.maintenanceRequest.managerId, data.managerId)
            ));

        await this.systemService.logSystemEvent({
            managerId: data.managerId,
            action: 'MAINTENANCE_RESOLVED_WITH_EXPENSE',
            entityType: 'maintenance',
            entityId: data.requestId,
            payload: { expenseId, amount: data.amount }
        });

        return { success: true, expenseId };
    });
  }

  async uploadReceipt(file: Buffer, key: string, contentType: string) {
    const url = await this.storageService.uploadToR2(file, key, contentType);
    return { success: true, imageUrl: url };
  }

  async getVendors(managerId: string) {
    const results = await this.db
        .select()
        .from(schema.vendor)
        .where(eq(schema.vendor.managerId, managerId))
        .orderBy(desc(schema.vendor.createdAt));
    return { success: true, vendors: results };
  }

  async createVendor(data: any) {
    const id = `ven-${uuidv4().slice(0, 8)}`;
    await this.db.insert(schema.vendor).values({
        id,
        ...data,
        createdAt: new Date(),
    });
    return { success: true, id };
  }

  async updateVendor(id: string, data: any) {
    await this.db.update(schema.vendor)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.vendor.id, id));
    return { success: true };
  }
}
