import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@dane/database';
import { eq, and, desc, sql, count, inArray } from 'drizzle-orm';
import { SystemService } from '../system/system.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private systemService: SystemService,
  ) {}

  async getInvoices(managerId: string, page: number = 1, filters?: { status?: string; propertyId?: string; period?: string; type?: string; tenantId?: string }) {
    const limit = 10;
    const offset = (page - 1) * limit;

    let conditions = [eq(schema.invoice.managerId, managerId)];
    if (filters?.status) conditions.push(eq(schema.invoice.status, filters.status));
    if (filters?.propertyId) conditions.push(eq(schema.invoice.propertyId, filters.propertyId));
    if (filters?.period) conditions.push(eq(schema.invoice.period, filters.period));
    if (filters?.type) conditions.push(eq(schema.invoice.type, filters.type));
    if (filters?.tenantId) conditions.push(eq(schema.invoice.tenantId, filters.tenantId));

    const results = await this.db
      .select({
        id: schema.invoice.id,
        tenantId: schema.invoice.tenantId,
        tenantName: schema.tenant.name,
        tenantPhone: schema.tenant.phone,
        propertyId: schema.invoice.propertyId,
        propertyName: schema.property.name,
        unitId: schema.tenant.unitId,
        period: schema.invoice.period,
        type: schema.invoice.type,
        amount: schema.invoice.amount,
        paid: schema.invoice.paid,
        balance: schema.invoice.balance,
        status: schema.invoice.status,
        dueDate: schema.invoice.dueDate,
        issuedAt: schema.invoice.issuedAt,
        description: schema.invoice.description
      })
      .from(schema.invoice)
      .leftJoin(schema.tenant, sql`${schema.invoice.tenantId} = ${schema.tenant.id}`)
      .leftJoin(schema.property, sql`${schema.invoice.propertyId} = ${schema.property.id}`)
      .where(and(...conditions))
      .orderBy(desc(schema.invoice.issuedAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await this.db.select({ count: sql`count(*)` }).from(schema.invoice).where(and(...conditions));
    const totalCountVal = Number(countResult.count);

    const [last] = await this.db
        .select({ period: schema.invoice.period, date: schema.invoice.issuedAt })
        .from(schema.invoice)
        .where(eq(schema.invoice.managerId, managerId))
        .orderBy(desc(schema.invoice.issuedAt))
        .limit(1);

    return { 
        success: true, 
        invoices: results, 
        total: totalCountVal,
        hasMore: totalCountVal > offset + limit,
        lastGenerated: last || null
    };
  }

  async getTenantLedger(tenantId: string, managerId: string) {
    const invoices = await this.db
      .select({
        id: schema.invoice.id,
        type: schema.invoice.type,
        period: schema.invoice.period,
        description: schema.invoice.description,
        amount: schema.invoice.amount,
        paid: schema.invoice.paid,
        balance: schema.invoice.balance,
        status: schema.invoice.status,
        issuedAt: schema.invoice.issuedAt,
        dueDate: schema.invoice.dueDate
      })
      .from(schema.invoice)
      .where(and(eq(schema.invoice.tenantId, tenantId), eq(schema.invoice.managerId, managerId)))
      .orderBy(desc(schema.invoice.issuedAt));

    const payments = await this.db
      .select()
      .from(schema.payment)
      .where(and(eq(schema.payment.tenantId, tenantId), eq(schema.payment.managerId, managerId)))
      .orderBy(desc(schema.payment.recordedAt));

    const allocations = await this.db
      .select()
      .from(schema.settlementAllocation)
      .where(eq(schema.settlementAllocation.managerId, managerId));

    return { success: true, invoices, payments, allocations };
  }

  async createInvoice(data: {
    tenantId: string;
    propertyId: string;
    managerId: string;
    period: string;
    amount: string;
    type: string;
    description: string;
    dueDate?: string;
  }) {
    return await this.db.transaction(async (tx) => {
      const id = `inv-${uuidv4().slice(0, 8)}`;
      await tx.insert(schema.invoice).values({
        id,
        tenantId: data.tenantId,
        propertyId: data.propertyId,
        managerId: data.managerId,
        period: data.period,
        amount: data.amount,
        type: data.type || 'rent',
        description: data.description,
        balance: data.amount,
        status: 'unpaid',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        issuedAt: new Date(),
        createdAt: new Date(),
      });

      // Update tenant arrears
      const [tnt] = await tx.select().from(schema.tenant).where(eq(schema.tenant.id, data.tenantId));
      if (tnt) {
        const currentArrears = parseFloat(tnt.arrears || "0");
        const newArrears = (currentArrears + parseFloat(data.amount)).toString();
        await tx.update(schema.tenant).set({ arrears: newArrears }).where(eq(schema.tenant.id, data.tenantId));
      }

      await this.systemService.logSystemEvent({
        managerId: data.managerId,
        action: 'INVOICE_CREATED',
        entityType: 'invoice',
        entityId: id,
        payload: { type: data.type, amount: data.amount, tenantId: data.tenantId }
      });

      return { success: true, invoiceId: id };
    });
  }

  async generateMonthlyInvoices(managerId: string, period: string, propertyId?: string, tenantId?: string) {
    return await this.db.transaction(async (tx) => {
        let conditions = [eq(schema.tenant.managerId, managerId), eq(schema.tenant.status, 'active')];
        if (propertyId) conditions.push(eq(schema.tenant.propertyId, propertyId));
        if (tenantId) conditions.push(eq(schema.tenant.id, tenantId));

        const activeTenants = await tx
            .select()
            .from(schema.tenant)
            .where(and(...conditions));

        let createdCount = 0;
        let skippedCount = 0;
        let totalAmount = 0;

        for (const tnt of activeTenants) {
            const [existing] = await tx
                .select()
                .from(schema.invoice)
                .where(and(
                    eq(schema.invoice.tenantId, tnt.id),
                    eq(schema.invoice.period, period),
                    eq(schema.invoice.type, 'rent')
                ))
                .limit(1);

            if (existing) {
                skippedCount++;
                continue;
            }

            if (!tnt.propertyId) {
                skippedCount++;
                continue;
            }
            const [prop] = await tx.select().from(schema.property).where(eq(schema.property.id, tnt.propertyId));
            const config = (prop?.config as any) || {};
            const units = config.units || [];
            const unit = units.find((u: any) => u.name === tnt.unitId);
            const rentAmount = unit?.rent || "0";
            
            const id = `inv-${uuidv4().slice(0, 8)}`;
            await tx.insert(schema.invoice).values({
                id,
                tenantId: tnt.id,
                propertyId: tnt.propertyId,
                managerId: managerId,
                period: period,
                description: `Rent for ${period}`,
                type: 'rent',
                amount: rentAmount,
                paid: "0",
                balance: rentAmount,
                status: 'unpaid',
                issuedAt: new Date(),
                createdAt: new Date(),
            });

            const currentArrears = parseFloat(tnt.arrears || "0");
            const newArrears = (currentArrears + parseFloat(rentAmount)).toString();
            await tx.update(schema.tenant).set({ arrears: newArrears }).where(eq(schema.tenant.id, tnt.id));
            
            createdCount++;
            totalAmount += parseFloat(rentAmount);
        }

        await this.systemService.logSystemEvent({
            managerId,
            action: 'MONTHLY_INVOICES_GENERATED',
            entityType: 'manager',
            entityId: managerId,
            payload: { period, createdCount, skippedCount, propertyId, tenantId }
        });

        return { success: true, created: createdCount, skipped: skippedCount, totalAmount };
    });
  }

  async getInvoiceDetails(invoiceId: string, managerId: string) {
    const [result] = await this.db
        .select({
            invoice: schema.invoice,
            tenant: schema.tenant,
            property: schema.property
        })
        .from(schema.invoice)
        .leftJoin(schema.tenant, sql`${schema.invoice.tenantId} = ${schema.tenant.id}`)
        .leftJoin(schema.property, sql`${schema.invoice.propertyId} = ${schema.property.id}`)
        .where(and(eq(schema.invoice.id, invoiceId), eq(schema.invoice.managerId, managerId)));

    if (!result) return { success: false, error: "Invoice not found" };

    const allocations = await this.db
        .select()
        .from(schema.settlementAllocation)
        .where(eq(schema.settlementAllocation.invoiceId, invoiceId));

    return { success: true, ...result, allocations };
  }

  async getPaymentsForInvoice(invoiceId: string) {
    const results = await this.db
        .select({
            id: schema.payment.id,
            amount: schema.settlementAllocation.amount,
            method: schema.payment.method,
            reference: schema.payment.reference,
            recordedAt: schema.payment.recordedAt,
            notes: schema.payment.notes
        })
        .from(schema.settlementAllocation)
        .innerJoin(schema.payment, eq(schema.settlementAllocation.paymentId, schema.payment.id))
        .where(eq(schema.settlementAllocation.invoiceId, invoiceId))
        .orderBy(desc(schema.payment.recordedAt));
    
    return { success: true, payments: results };
  }

  async reconcilePayment(data: {
    tenantId: string;
    managerId: string;
    amount: string;
    method: string;
    reference: string;
    notes?: string;
    date?: string;
    invoiceId?: string;
    allocations?: { invoiceId: string; amount: number }[];
  }) {
    return await this.db.transaction(async (tx) => {
        const paymentId = `pay-${uuidv4().slice(0, 8)}`;
        const amountNum = parseFloat(data.amount);

        await tx.insert(schema.payment).values({
            id: paymentId,
            tenantId: data.tenantId,
            managerId: data.managerId,
            amount: data.amount,
            method: data.method,
            reference: data.reference,
            notes: data.notes,
            recordedAt: data.date ? new Date(data.date) : new Date(),
            createdAt: new Date(),
        });

        if (data.invoiceId) {
            const [inv] = await tx.select().from(schema.invoice).where(eq(schema.invoice.id, data.invoiceId));
            if (inv) {
                const newPaid = (parseFloat(inv.paid || "0") + amountNum).toString();
                const newBalance = (parseFloat(inv.balance) - amountNum).toString();
                const newStatus = parseFloat(newBalance) <= 0 ? 'paid' : 'partial';

                await tx.update(schema.invoice)
                    .set({ paid: newPaid, balance: newBalance, status: newStatus, paidAt: newStatus === 'paid' ? new Date() : null })
                    .where(eq(schema.invoice.id, inv.id));

                await tx.insert(schema.settlementAllocation).values({
                    id: `alloc-${uuidv4().slice(0, 8)}`,
                    paymentId,
                    invoiceId: inv.id,
                    managerId: data.managerId,
                    amount: data.amount,
                    createdAt: new Date(),
                });
            }
        } else if (data.allocations && data.allocations.length > 0) {
            for (const alloc of data.allocations) {
                const [inv] = await tx.select().from(schema.invoice).where(eq(schema.invoice.id, alloc.invoiceId));
                if (!inv) continue;

                const newPaid = (parseFloat(inv.paid || "0") + alloc.amount).toString();
                const newBalance = (parseFloat(inv.balance) - alloc.amount).toString();
                const newStatus = parseFloat(newBalance) <= 0 ? 'paid' : 'partial';

                await tx.update(schema.invoice)
                    .set({ paid: newPaid, balance: newBalance, status: newStatus, paidAt: newStatus === 'paid' ? new Date() : null })
                    .where(eq(schema.invoice.id, inv.id));

                await tx.insert(schema.settlementAllocation).values({
                    id: `alloc-${uuidv4().slice(0, 8)}`,
                    paymentId,
                    invoiceId: inv.id,
                    managerId: data.managerId,
                    amount: alloc.amount.toString(),
                    createdAt: new Date(),
                });
            }
        } else {
            const unpaidInvoices = await tx
                .select()
                .from(schema.invoice)
                .where(and(
                    eq(schema.invoice.tenantId, data.tenantId),
                    sql`${schema.invoice.status} != 'paid'`
                ))
                .orderBy(schema.invoice.issuedAt);

            let remainingAmount = amountNum;

            for (const inv of unpaidInvoices) {
                if (remainingAmount <= 0) break;

                const currentBalance = parseFloat(inv.balance);
                const currentPaid = parseFloat(inv.paid || "0");
                const allocationAmount = Math.min(remainingAmount, currentBalance);

                const newPaid = (currentPaid + allocationAmount).toString();
                const newBalance = (currentBalance - allocationAmount).toString();
                const newStatus = parseFloat(newBalance) <= 0 ? 'paid' : 'partial';

                await tx.update(schema.invoice)
                    .set({ 
                        paid: newPaid, 
                        balance: newBalance, 
                        status: newStatus,
                        paidAt: newStatus === 'paid' ? new Date() : null
                    })
                    .where(eq(schema.invoice.id, inv.id));

                await tx.insert(schema.settlementAllocation).values({
                    id: `alloc-${uuidv4().slice(0, 8)}`,
                    paymentId,
                    invoiceId: inv.id,
                    managerId: data.managerId,
                    amount: allocationAmount.toString(),
                    createdAt: new Date(),
                });

                remainingAmount -= allocationAmount;
            }
        }

        const [tnt] = await tx.select().from(schema.tenant).where(eq(schema.tenant.id, data.tenantId));
        if (tnt) {
            const currentArrears = parseFloat(tnt.arrears || "0");
            const newArrears = Math.max(0, currentArrears - amountNum).toString();
            await tx.update(schema.tenant).set({ arrears: newArrears }).where(eq(schema.tenant.id, data.tenantId));
        }

        await this.systemService.logSystemEvent({
            managerId: data.managerId,
            action: 'PAYMENT_RECONCILED',
            entityType: 'payment',
            entityId: paymentId,
            payload: { amount: data.amount, reference: data.reference }
        });

        return { success: true, paymentId };
    });
  }

  async getReconciliationSummary(managerId: string, period?: string) {
    let conditions = [eq(schema.invoice.managerId, managerId)];
    if (period) conditions.push(eq(schema.invoice.period, period));

    const [stats] = await this.db
        .select({
            totalExpected: sql`sum(cast(${schema.invoice.amount} as decimal))`,
            totalCollected: sql`sum(cast(${schema.invoice.paid} as decimal))`,
            totalArrears: sql`sum(cast(${schema.invoice.balance} as decimal))`
        })
        .from(schema.invoice)
        .where(and(...conditions));

    const breakdown = await this.db
        .select({
            propertyId: schema.property.id,
            propertyName: schema.property.name,
            expected: sql`sum(cast(${schema.invoice.amount} as decimal))`,
            collected: sql`sum(cast(${schema.invoice.paid} as decimal))`,
            outstanding: sql`sum(cast(${schema.invoice.balance} as decimal))`,
            invoiceCount: count(schema.invoice.id),
            paidCount: sql`count(case when ${schema.invoice.status} = 'paid' then 1 end)`
        })
        .from(schema.invoice)
        .leftJoin(schema.property, sql`${schema.invoice.propertyId} = ${schema.property.id}`)
        .where(and(...conditions))
        .groupBy(schema.property.id, schema.property.name);

    return {
        success: true,
        summary: {
            expected: parseFloat(stats?.totalExpected as any || "0"),
            collected: parseFloat(stats?.totalCollected as any || "0"),
            outstanding: parseFloat(stats?.totalArrears as any || "0"),
            collectionRate: stats?.totalExpected ? Math.round((parseFloat(stats.totalCollected as any) / parseFloat(stats.totalExpected as any) * 100)) : 100
        },
        breakdown: breakdown.map(b => ({
            ...b,
            expected: parseFloat(b.expected as any || "0"),
            collected: parseFloat(b.collected as any || "0"),
            outstanding: parseFloat(b.outstanding as any || "0")
        }))
    };
  }

  async getArrearsLedger(managerId: string, page: number = 1) {
    const limit = 10;
    const offset = (page - 1) * limit;

    const results = await this.db
        .select({
            tenantId: schema.tenant.id,
            tenantName: schema.tenant.name,
            tenantPhone: schema.tenant.phone,
            propertyName: schema.property.name,
            unitName: schema.tenant.unitId,
            totalArrears: schema.tenant.arrears,
            lastPaymentDate: sql`(SELECT max(${schema.payment.recordedAt}) FROM ${schema.payment} WHERE ${schema.payment.tenantId} = ${schema.tenant.id})`
        })
        .from(schema.tenant)
        .leftJoin(schema.property, sql`${schema.tenant.propertyId} = ${schema.property.id}`)
        .where(and(eq(schema.tenant.managerId, managerId), sql`cast(${schema.tenant.arrears} as decimal) > 0`))
        .orderBy(desc(sql`cast(${schema.tenant.arrears} as decimal)`))
        .limit(limit)
        .offset(offset);

    const [countResult] = await this.db.select({ count: sql`count(*)` }).from(schema.tenant).where(and(eq(schema.tenant.managerId, managerId), sql`cast(${schema.tenant.arrears} as decimal) > 0`));
    const totalCountVal = Number(countResult.count);

    return { 
        success: true, 
        ledger: results.map(r => ({ ...r, totalArrears: parseFloat(r.totalArrears as any || "0") })),
        hasMore: totalCountVal > offset + limit
    };
  }

  async getRevenueHistory(managerId: string, months: number = 6) {
    const revenue = await this.db
        .select({
            period: schema.invoice.period,
            collected: sql`sum(cast(${schema.invoice.paid} as decimal))`,
            expected: sql`sum(cast(${schema.invoice.amount} as decimal))`
        })
        .from(schema.invoice)
        .where(eq(schema.invoice.managerId, managerId))
        .groupBy(schema.invoice.period)
        .orderBy(desc(schema.invoice.period))
        .limit(months);

    const expenses = await this.db
        .select({
            period: sql`to_char(${schema.expense.paidDate}, 'YYYY-MM')`,
            total: sql`sum(cast(${schema.expense.amount} as decimal))`
        })
        .from(schema.expense)
        .where(and(eq(schema.expense.managerId, managerId), sql`${schema.expense.paidDate} is not null`))
        .groupBy(sql`to_char(${schema.expense.paidDate}, 'YYYY-MM')`);

    const history = revenue.map(r => {
        const exp = expenses.find(e => e.period === r.period);
        const burn = parseFloat(exp?.total as any || "0");
        const collected = parseFloat(r.collected as any || "0");
        const expected = parseFloat(r.expected as any || "0");

        return {
            period: r.period,
            expected,
            collected,
            maintenanceBurn: burn,
            netRevenue: collected - burn
        };
    });

    return { success: true, history: history.reverse() };
  }

  async applyPenalties(managerId: string) {
    const [manager] = await this.db.select().from(schema.user).where(eq(schema.user.id, managerId));
    const config = (manager?.financeConfig as any) || {};
    const graceDays = config.penaltyGraceDays || 5;
    const penaltyType = config.penaltyType || 'flat';
    const penaltyValue = parseFloat(config.penaltyValue || "0");

    if (penaltyValue <= 0) return { success: true, message: "No penalty configured" };

    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - graceDays);

    const overdueInvoices = await this.db
      .select()
      .from(schema.invoice)
      .where(and(
        eq(schema.invoice.managerId, managerId),
        eq(schema.invoice.status, 'unpaid'),
        eq(schema.invoice.type, 'rent'),
        sql`${schema.invoice.dueDate} < ${overdueDate}`
      ));

    let countApplied = 0;
    for (const inv of overdueInvoices) {
      // Check if penalty already applied for this invoice
      const [existingPenalty] = await this.db
        .select()
        .from(schema.invoice)
        .where(and(
          eq(schema.invoice.tenantId, inv.tenantId),
          eq(schema.invoice.type, 'penalty'),
          eq(schema.invoice.period, inv.period)
        ))
        .limit(1);

      if (existingPenalty) continue;

      const penaltyAmount = penaltyType === 'flat' 
        ? penaltyValue 
        : (parseFloat(inv.amount) * (penaltyValue / 100));

      await this.createInvoice({
        tenantId: inv.tenantId,
        propertyId: inv.propertyId!,
        managerId,
        period: inv.period,
        amount: penaltyAmount.toString(),
        type: 'penalty',
        description: `Late payment penalty for ${inv.period}`
      });
      countApplied++;
    }

    return { success: true, applied: countApplied };
  }

  async getOwnerPortfolioStats(ownerId: string) {
    const ownerProperties = await this.db.select().from(schema.property).where(eq(schema.property.ownerId, ownerId));
    const propertyIds = ownerProperties.map(p => p.id);

    if (propertyIds.length === 0) return { success: true, stats: { revenue: 0, occupancy: 0, totalUnits: 0 } };

    const invoices = await this.db.select().from(schema.invoice).where(inArray(schema.invoice.propertyId, propertyIds));
    
    let totalUnits = 0;
    let occupiedUnits = 0;
    ownerProperties.forEach(p => {
        const config = typeof p.config === 'string' ? JSON.parse(p.config) : (p.config || {});
        const units = config.units || [];
        totalUnits += units.length;
        occupiedUnits += units.filter((u: any) => u.status === 'occupied').length;
    });

    const totalRevenue = invoices.reduce((acc, inv) => acc + parseFloat(inv.paid || "0"), 0);

    return {
        success: true,
        stats: {
            revenue: totalRevenue,
            occupancy: (occupiedUnits / (totalUnits || 1)) * 100,
            totalUnits,
            distribution: {
                residential: occupiedUnits, 
                commercial: totalUnits - occupiedUnits
            }
        }
    };
  }
}
