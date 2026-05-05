"use server";

import { db } from "@dane/database";
import { 
  property, tenant, invoice, payment, maintenanceRequest, 
  expense, vendor, communicationTemplate, communicationBatch, 
  communicationLog, communicationFlow, communicationFlowStep, 
  communicationAnalytics, systemAuditLog, cronHeartbeat
} from "@dane/database";
import { uploadToR2 } from "@/lib/r2";
import { sql, eq, desc, count, and, asc, gte, lte } from "drizzle-orm";

// ... existing functions ...

export async function getPaginatedTenants(userId: string, page: number = 1) {
  try {
    const limit = 10;
    const offset = (page - 1) * limit;

    const results = await db
      .select({
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email,
        idNumber: tenant.idNumber,
        idType: tenant.idType,
        propertyId: tenant.propertyId,
        unitId: tenant.unitId,
        moveInCharges: tenant.moveInCharges,
        moveInPhotos: tenant.moveInPhotos,
        moveInDate: tenant.moveInDate,
        notes: tenant.notes,
        arrears: tenant.arrears,
        propertyName: property.name,
      })
      .from(tenant)
      .leftJoin(property, eq(tenant.propertyId, property.id))
      .where(eq(tenant.managerId, userId))
      .orderBy(desc(tenant.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db
      .select({ val: count() })
      .from(tenant)
      .where(eq(tenant.managerId, userId));

    return { 
        success: true, 
        tenants: results, 
        total: totalCount.val,
        hasMore: totalCount.val > offset + limit
    };
  } catch (error) {
    console.error("Failed to fetch tenants:", error);
    return { success: false, error: "Database error" };
  }
}

export async function createTenant(data: any) {
  try {
    const id = `tnt-${crypto.randomUUID().slice(0, 8)}`;
    
    let moveInCharges = "0";
    if (data.propertyId && data.unitId) {
      const [prop] = await db.select().from(property).where(eq(property.id, data.propertyId));
      if (prop && prop.config) {
        const config = JSON.parse(prop.config);
        const unit = config.units?.find((u: any) => u.name === data.unitId);
        if (unit) {
           const baseRent = config.rents?.[unit.typeId] || 0;
           const rent = typeof baseRent === 'object' ? (parseFloat(baseRent.min) || 0) : (parseFloat(baseRent) || 0);
           moveInCharges = (rent * 2).toString();
        }
      }
    }

    await db.insert(tenant).values({
      id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      idNumber: data.idNumber,
      idType: data.idType,
      nextOfKin: data.nextOfKin,
      propertyId: data.propertyId || null,
      unitId: data.unitId || null,
      notes: data.notes,
      moveInDate: data.moveInDate ? new Date(data.moveInDate) : null,
      moveInPhotos: data.moveInPhotos,
      managerId: data.managerId,
      moveInCharges,
      arrears: moveInCharges, // Set initial arrears to move-in charges
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // AUTOMATION: Trigger welcome flow
    await triggerFlow(data.managerId, 'tenant_added', id, {
      move_in_date: data.moveInDate || "N/A"
    });

    return { success: true, id, moveInCharges };
  } catch (error) {
    console.error("Failed to create tenant:", error);
    return { success: false, error: "Creation failed" };
  }
}

export async function updateTenantAssignment(tenantId: string, propertyId: string | null, unitId: string | null) {
  try {
    let moveInCharges = "0";
    if (propertyId && unitId) {
       const [prop] = await db.select().from(property).where(eq(property.id, propertyId));
       if (prop && prop.config) {
         const config = JSON.parse(prop.config);
         const unit = config.units?.find((u: any) => u.name === unitId);
         if (unit) {
           const baseRent = config.rents?.[unit.typeId] || 0;
           const rent = typeof baseRent === 'object' ? (parseFloat(baseRent.min) || 0) : (parseFloat(baseRent) || 0);
           moveInCharges = (rent * 2).toString();
         }
       }
    }

    await db.update(tenant)
      .set({ 
        propertyId, 
        unitId, 
        moveInCharges,
        updatedAt: new Date() 
      })
      .where(eq(tenant.id, tenantId));
    return { success: true, moveInCharges };
  } catch (error) {
    console.error("Failed to move tenant:", error);
    return { success: false, error: "Movement failed" };
  }
}

export async function getTenantStats(userId: string) {
  try {
    const [stats] = await db
      .select({
        totalTenants: count(),
        totalArrears: sql<number>`SUM(CAST(${tenant.arrears} AS DECIMAL))`,
        withArrears: count(sql`CASE WHEN CAST(${tenant.arrears} AS DECIMAL) > 0 THEN 1 END`),
      })
      .from(tenant)
      .where(eq(tenant.managerId, userId));

    return { 
        success: true, 
        stats: {
            total: stats.totalTenants || 0,
            arrearsSum: stats.totalArrears || 0,
            withArrearsCount: stats.withArrears || 0,
            avgRent: 0 // Will calculate this later or from property rents
        }
    };
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return { success: false, error: "Stats calculation failed" };
  }
}

export async function uploadPropertyImage(formData: FormData) {
  try {
    const photo = formData.get("photo") as File;
    if (!photo || photo.size === 0) return { success: false, error: "No photo provided" };

    const fileExtension = photo.name.split('.').pop();
    const key = `properties/${crypto.randomUUID()}.${fileExtension}`;
    const imageUrl = await uploadToR2(photo, key);

    return { success: true, imageUrl };
  } catch (error) {
    console.error("Failed to upload image:", error);
    return { success: false, error: "Image upload failed." };
  }
}

export async function uploadTenantPhoto(formData: FormData) {
  try {
    const photo = formData.get("photo") as File;
    if (!photo || photo.size === 0) return { success: false, error: "No photo provided" };

    const fileExtension = photo.name.split('.').pop();
    const key = `tenants/${crypto.randomUUID()}.${fileExtension}`;
    const imageUrl = await uploadToR2(photo, key);

    return { success: true, imageUrl };
  } catch (error) {
    console.error("Failed to upload tenant photo:", error);
    return { success: false, error: "Photo upload failed." };
  }
}

function generateShortId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `dane-${result}`;
}

export async function createProperty(data: {
  name: string;
  location: string;
  userId: string;
  hasResidential: boolean;
  hasCommercial: boolean;
  residentialUnits: string;
  commercialUnits: string;
  imageUrl?: string;
}) {
  try {
    await db.insert(property).values({
      id: generateShortId(),
      name: data.name,
      location: data.location,
      userId: data.userId,
      hasResidential: data.hasResidential,
      hasCommercial: data.hasCommercial,
      residentialUnits: data.residentialUnits,
      commercialUnits: data.commercialUnits,
      imageUrl: data.imageUrl || "https://placeholder.com/property.jpg",
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create property:", error);
    return { success: false, error: "Database initialization failed." };
  }
}

export async function getUserPropertyCount(userId: string) {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(property)
      .where(eq(property.userId, userId));
    
    return { success: true, count: Number(result[0]?.count || 0) };
  } catch (error) {
    console.error("Failed to fetch property count:", error);
    return { success: false, count: 0 };
  }
}
export async function getUserProperties(userId: string) {
  try {
    const result = await db
      .select()
      .from(property)
      .where(and(eq(property.userId, userId), eq(property.isLive, true)));
    
    return { success: true, properties: result };
  } catch (error) {
    console.error("Failed to fetch user properties:", error);
    return { success: false, properties: [] };
  }
}

export async function getPropertyById(id: string, userId: string) {
  try {
    const result = await db
      .select()
      .from(property)
      .where(
        and(
          eq(property.id, id),
          or(eq(property.userId, userId), eq(property.ownerId, userId))
        )
      );
    
    if (result.length === 0) return { success: false, property: null, error: "Access Denied" };
    return { success: true, property: result[0] };
  } catch (error) {
    console.error("Failed to fetch property:", error);
    return { success: false, property: null };
  }
}

export async function completePropertySetup(id: string, config: any) {
  try {
    await db
      .update(property)
      .set({
        isLive: true,
        setupStep: "completed",
        config: JSON.stringify(config)
      })
      .where(eq(property.id, id));
    
    return { success: true };
  } catch (error) {
    console.error("Failed to complete property setup:", error);
    return { success: false, error: "Setup finalization failed." };
  }
}

// ==========================================
// FINANCE — INVOICES
// ==========================================

export async function generateMonthlyInvoices(managerId: string, period: string) {
  try {
    // Get all tenants with assigned units
    const tenants = await db
      .select({
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        propertyId: tenant.propertyId,
        unitId: tenant.unitId,
      })
      .from(tenant)
      .where(and(eq(tenant.managerId, managerId)));

    const activeTenants = tenants.filter(t => t.propertyId && t.unitId);

    // Check which tenants already have invoices for this period
    const existingInvoices = await db
      .select({ tenantId: invoice.tenantId })
      .from(invoice)
      .where(and(eq(invoice.managerId, managerId), eq(invoice.period, period)));

    const existingTenantIds = new Set(existingInvoices.map(i => i.tenantId));

    let created = 0;
    let skipped = 0;
    let totalAmount = 0;

    for (const t of activeTenants) {
      if (existingTenantIds.has(t.id)) {
        skipped++;
        continue;
      }

      // Get rent from property config
      const [prop] = await db.select().from(property).where(eq(property.id, t.propertyId!));
      if (!prop || !prop.config) continue;

      const config = JSON.parse(prop.config);
      const unit = config.units?.find((u: any) => u.name === t.unitId);
      if (!unit) continue;

      const baseRent = config.rents?.[unit.typeId] || 0;
      const rent = typeof baseRent === 'object' ? (parseFloat(baseRent.min) || 0) : (parseFloat(baseRent) || 0);
      if (rent === 0) continue;

      const amount = rent.toString();
      const dueDate = new Date(`${period}-05`); // Due on the 5th

      await db.insert(invoice).values({
        id: `inv-${crypto.randomUUID().slice(0, 8)}`,
        tenantId: t.id,
        propertyId: t.propertyId,
        managerId,
        period,
        description: `Rent — ${new Date(period + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        amount,
        balance: amount,
        status: "unpaid",
        dueDate,
        issuedAt: new Date(),
        createdAt: new Date(),
      });

      // Add to tenant arrears
      const [currentTenant] = await db.select({ arrears: tenant.arrears }).from(tenant).where(eq(tenant.id, t.id));
      const newArrears = (parseFloat(currentTenant?.arrears || "0") + rent).toString();
      created++;
      totalAmount += rent;

      // AUTOMATION: Trigger configured Flows
      await triggerFlow(managerId, 'invoice_generated', t.id, {
        invoice_month: period,
        total_amount: amount,
        due_date: '5th'
      });
    }

    return { success: true, created, skipped, totalAmount, total: activeTenants.length };
  } catch (error) {
    console.error("Failed to generate invoices:", error);
    return { success: false, error: "Invoice generation failed." };
  }
}

export async function getInvoices(managerId: string, page: number = 1, filters?: { status?: string; period?: string; propertyId?: string }) {
  try {
    const limit = 10;
    const offset = (page - 1) * limit;

    let conditions = [eq(invoice.managerId, managerId)];
    if (filters?.status) conditions.push(eq(invoice.status, filters.status));
    if (filters?.period) conditions.push(eq(invoice.period, filters.period));
    if (filters?.propertyId) conditions.push(eq(invoice.propertyId, filters.propertyId));

    const results = await db
      .select({
        id: invoice.id,
        tenantId: invoice.tenantId,
        tenantName: tenant.name,
        tenantPhone: tenant.phone,
        propertyId: invoice.propertyId,
        propertyName: property.name,
        unitId: tenant.unitId,
        period: invoice.period,
        description: invoice.description,
        amount: invoice.amount,
        paid: invoice.paid,
        balance: invoice.balance,
        status: invoice.status,
        dueDate: invoice.dueDate,
        issuedAt: invoice.issuedAt,
        paidAt: invoice.paidAt,
      })
      .from(invoice)
      .leftJoin(tenant, eq(invoice.tenantId, tenant.id))
      .leftJoin(property, eq(invoice.propertyId, property.id))
      .where(and(...conditions))
      .orderBy(desc(invoice.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db
      .select({ val: count() })
      .from(invoice)
      .where(and(...conditions));

    // Get last generation info
    const [lastInvoice] = await db
      .select({ issuedAt: invoice.issuedAt, period: invoice.period })
      .from(invoice)
      .where(eq(invoice.managerId, managerId))
      .orderBy(desc(invoice.issuedAt))
      .limit(1);

    return {
      success: true,
      invoices: results,
      total: totalCount.val,
      hasMore: totalCount.val > offset + limit,
      lastGenerated: lastInvoice ? { date: lastInvoice.issuedAt, period: lastInvoice.period } : null,
    };
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return { success: false, error: "Database error" };
  }
}

export async function recordPayment(data: {
  invoiceId: string;
  tenantId: string;
  managerId: string;
  amount: string;
  method: string;
  reference?: string;
  notes?: string;
}) {
  try {
    const paymentAmount = parseFloat(data.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    // Create payment record
    await db.insert(payment).values({
      id: `pay-${crypto.randomUUID().slice(0, 8)}`,
      tenantId: data.tenantId,
      invoiceId: data.invoiceId,
      managerId: data.managerId,
      amount: data.amount,
      method: data.method,
      reference: data.reference,
      notes: data.notes,
      recordedAt: new Date(),
      createdAt: new Date(),
    });

    // Update invoice
    const [inv] = await db.select().from(invoice).where(eq(invoice.id, data.invoiceId));
    if (inv) {
      const newPaid = (parseFloat(inv.paid || "0") + paymentAmount).toString();
      const newBalance = Math.max(0, parseFloat(inv.balance) - paymentAmount).toString();
      const newStatus = parseFloat(newBalance) === 0 ? "paid" : parseFloat(newPaid) > 0 ? "partial" : "unpaid";

      await db.update(invoice).set({
        paid: newPaid,
        balance: newBalance,
        status: newStatus,
        paidAt: newStatus === "paid" ? new Date() : null,
      }).where(eq(invoice.id, data.invoiceId));
    }

    // Update tenant arrears
    const [t] = await db.select({ arrears: tenant.arrears }).from(tenant).where(eq(tenant.id, data.tenantId));
    if (t) {
      const newArrears = Math.max(0, parseFloat(t.arrears || "0") - paymentAmount).toString();
      await db.update(tenant).set({ arrears: newArrears, updatedAt: new Date() }).where(eq(tenant.id, data.tenantId));
    }

    // AUTOMATION: Trigger payment receipt flow
    await triggerFlow(data.managerId, 'payment_received', data.tenantId, {
      payment_amount: data.amount,
      payment_method: data.method,
      reference: data.reference || "N/A"
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to record payment:", error);
    return { success: false, error: "Payment recording failed." };
  }
}

export async function getPaymentsForInvoice(invoiceId: string) {
  try {
    const results = await db
      .select()
      .from(payment)
      .where(eq(payment.invoiceId, invoiceId))
      .orderBy(desc(payment.recordedAt));

    return { success: true, payments: results };
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return { success: false, error: "Database error" };
  }
}

// ==========================================
// FINANCE — RECONCILIATION
// ==========================================

export async function getReconciliationSummary(managerId: string, period: string) {
  try {
    const [summary] = await db
      .select({
        totalExpected: sql<number>`COALESCE(SUM(CAST(${invoice.amount} AS DECIMAL)), 0)`,
        totalCollected: sql<number>`COALESCE(SUM(CAST(${invoice.paid} AS DECIMAL)), 0)`,
        totalOutstanding: sql<number>`COALESCE(SUM(CAST(${invoice.balance} AS DECIMAL)), 0)`,
        invoiceCount: count(),
        paidCount: count(sql`CASE WHEN ${invoice.status} = 'paid' THEN 1 END`),
      })
      .from(invoice)
      .where(and(eq(invoice.managerId, managerId), eq(invoice.period, period)));

    // Property breakdown
    const breakdown = await db
      .select({
        propertyId: invoice.propertyId,
        propertyName: property.name,
        expected: sql<number>`COALESCE(SUM(CAST(${invoice.amount} AS DECIMAL)), 0)`,
        collected: sql<number>`COALESCE(SUM(CAST(${invoice.paid} AS DECIMAL)), 0)`,
        outstanding: sql<number>`COALESCE(SUM(CAST(${invoice.balance} AS DECIMAL)), 0)`,
        invoiceCount: count(),
        paidCount: count(sql`CASE WHEN ${invoice.status} = 'paid' THEN 1 END`),
      })
      .from(invoice)
      .leftJoin(property, eq(invoice.propertyId, property.id))
      .where(and(eq(invoice.managerId, managerId), eq(invoice.period, period)))
      .groupBy(invoice.propertyId, property.name);

    return {
      success: true,
      summary: {
        expected: summary.totalExpected || 0,
        collected: summary.totalCollected || 0,
        outstanding: summary.totalOutstanding || 0,
        invoiceCount: summary.invoiceCount || 0,
        paidCount: summary.paidCount || 0,
        collectionRate: summary.totalExpected > 0 
          ? Math.round((summary.totalCollected / summary.totalExpected) * 100) 
          : 0,
      },
      breakdown,
    };
  } catch (error) {
    console.error("Failed to get reconciliation:", error);
    return { success: false, error: "Reconciliation failed." };
  }
}

export async function getArrearsLedger(managerId: string, page: number = 1) {
  try {
    const limit = 10;
    const offset = (page - 1) * limit;

    const results = await db
      .select({
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        unitId: tenant.unitId,
        propertyId: tenant.propertyId,
        propertyName: property.name,
        arrears: tenant.arrears,
      })
      .from(tenant)
      .leftJoin(property, eq(tenant.propertyId, property.id))
      .where(and(
        eq(tenant.managerId, managerId),
        sql`CAST(${tenant.arrears} AS DECIMAL) > 0`
      ))
      .orderBy(sql`CAST(${tenant.arrears} AS DECIMAL) DESC`)
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db
      .select({ val: count() })
      .from(tenant)
      .where(and(
        eq(tenant.managerId, managerId),
        sql`CAST(${tenant.arrears} AS DECIMAL) > 0`
      ));

    return { success: true, tenants: results, total: totalCount.val, hasMore: totalCount.val > offset + limit };
  } catch (error) {
    console.error("Failed to fetch arrears ledger:", error);
    return { success: false, error: "Database error" };
  }
}

// ==========================================
// FINANCE — ANALYTICS
// ==========================================

export async function getRevenueHistory(managerId: string, months: number = 6) {
  try {
    const results = await db
      .select({
        period: invoice.period,
        expected: sql<number>`COALESCE(SUM(CAST(${invoice.amount} AS DECIMAL)), 0)`,
        collected: sql<number>`COALESCE(SUM(CAST(${invoice.paid} AS DECIMAL)), 0)`,
        invoiceCount: count(),
      })
      .from(invoice)
      .where(eq(invoice.managerId, managerId))
      .groupBy(invoice.period)
      .orderBy(desc(invoice.period))
      .limit(months);

    return { success: true, history: results.reverse() };
  } catch (error) {
    console.error("Failed to fetch revenue history:", error);
    return { success: false, error: "Analytics failed." };
  }
}

// ==========================================
// MAINTENANCE — REQUESTS
// ==========================================

export async function createMaintenanceRequest(data: {
  propertyId: string;
  unitId?: string;
  tenantId?: string;
  managerId: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  photos?: string;
}) {
  try {
    const id = `mr-${crypto.randomUUID().slice(0, 8)}`;
    await db.insert(maintenanceRequest).values({
      id,
      ...data,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, id };
  } catch (error) {
    console.error("Failed to create request:", error);
    return { success: false, error: "Request creation failed." };
  }
}

export async function getMaintenanceRequests(managerId: string, page: number = 1, filters?: { status?: string; propertyId?: string; priority?: string }) {
  try {
    const limit = 10;
    const offset = (page - 1) * limit;

    let conditions = [eq(maintenanceRequest.managerId, managerId)];
    if (filters?.status) conditions.push(eq(maintenanceRequest.status, filters.status));
    if (filters?.propertyId) conditions.push(eq(maintenanceRequest.propertyId, filters.propertyId));
    if (filters?.priority) conditions.push(eq(maintenanceRequest.priority, filters.priority));

    const results = await db
      .select({
        id: maintenanceRequest.id,
        propertyId: maintenanceRequest.propertyId,
        propertyName: property.name,
        unitId: maintenanceRequest.unitId,
        tenantName: tenant.name,
        title: maintenanceRequest.title,
        description: maintenanceRequest.description,
        category: maintenanceRequest.category,
        priority: maintenanceRequest.priority,
        status: maintenanceRequest.status,
        photos: maintenanceRequest.photos,
        createdAt: maintenanceRequest.createdAt,
        resolvedAt: maintenanceRequest.resolvedAt,
      })
      .from(maintenanceRequest)
      .leftJoin(property, eq(maintenanceRequest.propertyId, property.id))
      .leftJoin(tenant, eq(maintenanceRequest.tenantId, tenant.id))
      .where(and(...conditions))
      .orderBy(desc(maintenanceRequest.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db
      .select({ val: count() })
      .from(maintenanceRequest)
      .where(and(...conditions));

    // Status counts
    const statusCounts = await db
      .select({
        status: maintenanceRequest.status,
        count: count(),
      })
      .from(maintenanceRequest)
      .where(eq(maintenanceRequest.managerId, managerId))
      .groupBy(maintenanceRequest.status);

    return { success: true, requests: results, total: totalCount.val, hasMore: totalCount.val > offset + limit, statusCounts };
  } catch (error) {
    console.error("Failed to fetch requests:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateRequestStatus(requestId: string, status: string) {
  try {
    const updates: any = { status, updatedAt: new Date() };
    if (status === "resolved") updates.resolvedAt = new Date();

    await db.update(maintenanceRequest).set(updates).where(eq(maintenanceRequest.id, requestId));
    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Status update failed." };
  }
}

// ==========================================
// MAINTENANCE — EXPENSES
// ==========================================

export async function createExpense(data: {
  propertyId: string;
  managerId: string;
  requestId?: string;
  category: string;
  description: string;
  amount: string;
  vendorName?: string;
  vendorPhone?: string;
  receipt?: string;
  paidDate?: string;
}) {
  try {
    const id = `exp-${crypto.randomUUID().slice(0, 8)}`;
    await db.insert(expense).values({
      id,
      propertyId: data.propertyId,
      managerId: data.managerId,
      requestId: data.requestId || null,
      category: data.category,
      description: data.description,
      amount: data.amount,
      vendorName: data.vendorName,
      vendorPhone: data.vendorPhone,
      receipt: data.receipt,
      paidDate: data.paidDate ? new Date(data.paidDate) : new Date(),
      createdAt: new Date(),
    });
    return { success: true, id };
  } catch (error) {
    console.error("Failed to create expense:", error);
    return { success: false, error: "Expense creation failed." };
  }
}

export async function getExpenses(managerId: string, page: number = 1, filters?: { propertyId?: string; category?: string }) {
  try {
    const limit = 10;
    const offset = (page - 1) * limit;

    let conditions = [eq(expense.managerId, managerId)];
    if (filters?.propertyId) conditions.push(eq(expense.propertyId, filters.propertyId));
    if (filters?.category) conditions.push(eq(expense.category, filters.category));

    const results = await db
      .select({
        id: expense.id,
        propertyId: expense.propertyId,
        propertyName: property.name,
        requestId: expense.requestId,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        vendorName: expense.vendorName,
        vendorPhone: expense.vendorPhone,
        receipt: expense.receipt,
        paidDate: expense.paidDate,
        createdAt: expense.createdAt,
      })
      .from(expense)
      .leftJoin(property, eq(expense.propertyId, property.id))
      .where(and(...conditions))
      .orderBy(desc(expense.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db
      .select({ val: count() })
      .from(expense)
      .where(and(...conditions));

    // Monthly total
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthlyTotal] = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${expense.amount} AS DECIMAL)), 0)`,
      })
      .from(expense)
      .where(and(eq(expense.managerId, managerId), gte(expense.createdAt, monthStart)));

    // Category breakdown
    const categoryBreakdown = await db
      .select({
        category: expense.category,
        total: sql<number>`COALESCE(SUM(CAST(${expense.amount} AS DECIMAL)), 0)`,
        count: count(),
      })
      .from(expense)
      .where(and(eq(expense.managerId, managerId), gte(expense.createdAt, monthStart)))
      .groupBy(expense.category);

    return { 
      success: true, expenses: results, total: totalCount.val, 
      hasMore: totalCount.val > offset + limit,
      monthlyTotal: monthlyTotal?.total || 0,
      categoryBreakdown,
    };
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return { success: false, error: "Database error" };
  }
}

export async function uploadReceipt(formData: FormData) {
  try {
    const photo = formData.get("photo") as File;
    if (!photo || photo.size === 0) return { success: false, error: "No file" };
    const ext = photo.name.split('.').pop();
    const key = `receipts/${crypto.randomUUID()}.${ext}`;
    const imageUrl = await uploadToR2(photo, key);
    return { success: true, imageUrl };
  } catch (error) {
    console.error("Failed to upload receipt:", error);
    return { success: false, error: "Upload failed." };
  }
}

// ==========================================
// MAINTENANCE — VENDORS
// ==========================================

export async function createVendor(data: {
  managerId: string;
  name: string;
  phone: string;
  email?: string;
  specialty: string;
  notes?: string;
}) {
  try {
    const id = `vnd-${crypto.randomUUID().slice(0, 8)}`;
    await db.insert(vendor).values({
      id,
      ...data,
      createdAt: new Date(),
    });
    return { success: true, id };
  } catch (error) {
    console.error("Failed to create vendor:", error);
    return { success: false, error: "Vendor creation failed." };
  }
}

export async function getVendors(managerId: string) {
  try {
    const results = await db
      .select()
      .from(vendor)
      .where(eq(vendor.managerId, managerId))
      .orderBy(desc(vendor.createdAt));
    return { success: true, vendors: results };
  } catch (error) {
    console.error("Failed to fetch vendors:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateVendor(vendorId: string, data: { rating?: string; notes?: string }) {
  try {
    await db.update(vendor).set(data).where(eq(vendor.id, vendorId));
    return { success: true };
  } catch (error) {
    console.error("Failed to update vendor:", error);
    return { success: false, error: "Update failed." };
  }
}
// ==========================================
// COMMUNICATIONS — ADVANCED ENGINE
// ==========================================

import { sendEmail as mailer, sendSMS as texter } from "@/lib/communications";

/**
 * Advanced Template Parser
 * Replaces {{variable}} with actual data
 */
function parseTemplate(template: string, data: any) {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const k = key.trim();
    return data[k] !== undefined ? String(data[k]) : `{{${k}}}`;
  });
}

export async function getCommunicationTemplates(managerId: string) {
  try {
    const results = await db
      .select()
      .from(communicationTemplate)
      .where(eq(communicationTemplate.managerId, managerId))
      .orderBy(desc(communicationTemplate.createdAt));
    return { success: true, templates: results };
  } catch (error) {
    return { success: false, error: "Failed to fetch templates" };
  }
}

export async function saveCommunicationTemplate(data: any) {
  try {
    const id = data.id || `tpl-${crypto.randomUUID().slice(0, 8)}`;
    const values = {
      id,
      managerId: data.managerId,
      name: data.name,
      subject: data.subject || null,
      contentHtml: data.contentHtml || null,
      contentText: data.contentText,
      channel: data.channel || 'both',
      category: data.category || 'general',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (data.id) {
      await db.update(communicationTemplate).set(values).where(eq(communicationTemplate.id, id));
    } else {
      await db.insert(communicationTemplate).values(values);
    }
    return { success: true, id };
  } catch (error) {
    console.error("Template save failed:", error);
    return { success: false, error: "Save failed" };
  }
}

export async function getTargetedTenants(managerId: string, filters: {
  propertyId?: string;
  status?: string; // occupied, vacant
  hasArrears?: boolean;
}) {
  try {
    let conditions = [eq(tenant.managerId, managerId)];
    if (filters.propertyId) conditions.push(eq(tenant.propertyId, filters.propertyId));
    if (filters.status) {
        // Need to join with property config to check unit status 
        // For simplicity now, we'll assume tenant exists = occupied
    }
    if (filters.hasArrears) {
      conditions.push(sql`CAST(${tenant.arrears} AS DECIMAL) > 0`);
    }

    const results = await db
      .select({
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email,
        unitId: tenant.unitId,
        arrears: tenant.arrears,
        propertyId: tenant.propertyId,
        propertyName: property.name,
        location: property.location,
        config: property.config
      })
      .from(tenant)
      .leftJoin(property, eq(tenant.propertyId, property.id))
      .where(and(...conditions));

    return { success: true, tenants: results };
  } catch (error) {
    return { success: false, error: "Failed to fetch target list" };
  }
}

export async function launchCampaign(data: {
  managerId: string;
  name: string;
  templateId?: string;
  customContent?: string;
  customSubject?: string;
  channel: 'sms' | 'email' | 'both';
  recipientIds: string[];
}) {
  const batchId = `cam-${crypto.randomUUID().slice(0, 8)}`;
  try {
    // 1. Create Batch Record
    await db.insert(communicationBatch).values({
      id: batchId,
      managerId: data.managerId,
      name: data.name,
      channel: data.channel,
      totalRecipients: data.recipientIds.length.toString(),
      status: 'processing',
      createdAt: new Date(),
    });

    // 2. Fetch Recipients & Template
    const recipients = await db.select().from(tenant).where(and(eq(tenant.managerId, data.managerId), sql`${tenant.id} IN ${data.recipientIds}`));
    let tpl: any = null;
    if (data.templateId) {
      [tpl] = await db.select().from(communicationTemplate).where(eq(communicationTemplate.id, data.templateId));
    }

    let success = 0;
    let failed = 0;

    // 3. Dispatch Loop
    for (const t of recipients) {
      const [prop] = await db.select().from(property).where(eq(property.id, t.propertyId!));
      
      let baseRent = "0";
      let utilityTotal = "0";
      let serviceFees = "0";

      if (prop && prop.config) {
        try {
          const config = JSON.parse(prop.config);
          const unit = config.units?.find((u: any) => u.name === t.unitId);
          if (unit) {
            const rentVal = config.rents?.[unit.typeId] || 0;
            baseRent = typeof rentVal === 'object' ? (rentVal.min || "0") : rentVal.toString();
            
            // Extract utilities and fees from config if they exist
            const utils = config.billing?.utilities || [];
            utilityTotal = utils.reduce((acc: number, u: any) => acc + (parseFloat(u.fixed) || 0), 0).toString();
            
            const fees = config.billing?.fees || [];
            serviceFees = fees.reduce((acc: number, f: any) => acc + (parseFloat(f.amount) || 0), 0).toString();
          }
        } catch (e) {}
      }

      const injectData = {
        tenant_name: t.name,
        unit_name: t.unitId || "N/A",
        property_name: prop?.name || "Dane Property",
        property_location: prop?.location || "",
        base_rent: baseRent,
        utility_total: utilityTotal,
        service_fees: serviceFees,
        total_amount: t.arrears,
        due_date: "5th", 
        invoice_month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      };

      const rawContent = data.customContent || tpl?.contentText || "";
      const rawSubject = data.customSubject || tpl?.subject || "Update from Management";

      const parsedContent = parseTemplate(rawContent, injectData);
      const parsedSubject = parseTemplate(rawSubject, injectData);

      // Send Email
      if (data.channel === 'email' || data.channel === 'both') {
        if (t.email) {
           const res = await mailer({ 
             to: t.email, 
             subject: parsedSubject, 
             html: `<div style="font-family:sans-serif;white-space:pre-wrap;">${parsedContent}</div>`,
             text: parsedContent 
           });
           await db.insert(communicationLog).values({
              id: `log-${crypto.randomUUID().slice(0, 8)}`,
              managerId: data.managerId,
              tenantId: t.id,
              propertyId: t.propertyId,
              batchId: batchId,
              channel: 'email',
              type: 'campaign',
              subject: parsedSubject,
              content: parsedContent,
              status: res.success ? 'sent' : 'failed',
              externalId: res.messageId || null,
              sentAt: new Date(),
              createdAt: new Date()
           });
           if (res.success) success++; else failed++;
        }
      }

      // Send SMS
      if (data.channel === 'sms' || data.channel === 'both') {
         const res = await texter({ to: t.phone, message: parsedContent });
         await db.insert(communicationLog).values({
            id: `log-${crypto.randomUUID().slice(0, 8)}`,
            managerId: data.managerId,
            tenantId: t.id,
            propertyId: t.propertyId,
            batchId: batchId,
            channel: 'sms',
            type: 'campaign',
            content: parsedContent,
            status: res.success ? 'sent' : 'failed',
            externalId: res.messageId || null,
            sentAt: new Date(),
            createdAt: new Date()
         });
         if (res.success) success++; else failed++;
      }
    }

    // 4. Update Batch
    await db.update(communicationBatch).set({
      status: 'completed',
      successCount: success.toString(),
      failedCount: failed.toString()
    }).where(eq(communicationBatch.id, batchId));

    return { success: true, batchId, summary: { success, failed } };
  } catch (error) {
    console.error("Campaign launch failed:", error);
    return { success: false, error: "Campaign failed midway" };
  }
}

export async function getCommunicationBatches(managerId: string) {
  try {
    const results = await db
      .select()
      .from(communicationBatch)
      .where(eq(communicationBatch.managerId, managerId))
      .orderBy(desc(communicationBatch.createdAt));
    return { success: true, batches: results };
  } catch (error) {
    return { success: false, error: "Failed to fetch batches" };
  }
}

export async function getCommunicationFlows(managerId: string) {
  try {
    const results = await db
      .select()
      .from(communicationFlow)
      .where(eq(communicationFlow.managerId, managerId))
      .orderBy(desc(communicationFlow.createdAt));

    const flowsWithSteps = await Promise.all(results.map(async (f) => {
      const steps = await db
        .select({
          id: communicationFlowStep.id,
          templateId: communicationFlowStep.templateId,
          templateName: communicationTemplate.name,
          channel: communicationFlowStep.channel,
          offsetDays: communicationFlowStep.offsetDays
        })
        .from(communicationFlowStep)
        .leftJoin(communicationTemplate, eq(communicationFlowStep.templateId, communicationTemplate.id))
        .where(eq(communicationFlowStep.flowId, f.id))
        .orderBy(asc(communicationFlowStep.offsetDays));
      return { ...f, steps };
    }));

    return { success: true, flows: flowsWithSteps };
  } catch (error) {
    return { success: false, error: "Failed to fetch flows" };
  }
}

export async function saveCommunicationFlow(data: any) {
  try {
    const id = data.id || `flo-${crypto.randomUUID().slice(0, 8)}`;
    const flowValues = {
      id,
      managerId: data.managerId,
      name: data.name,
      trigger: data.trigger,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (data.id) {
      await db.update(communicationFlow).set(flowValues).where(eq(communicationFlow.id, id));
    } else {
      await db.insert(communicationFlow).values(flowValues);
    }

    // Handle Steps
    if (data.steps) {
      // Simple approach: Delete and re-insert for now
      await db.delete(communicationFlowStep).where(eq(communicationFlowStep.flowId, id));
      for (const step of data.steps) {
        await db.insert(communicationFlowStep).values({
          id: `stp-${crypto.randomUUID().slice(0, 8)}`,
          flowId: id,
          templateId: step.templateId,
          channel: step.channel || 'both',
          offsetDays: step.offsetDays || 0,
          createdAt: new Date(),
        });
      }
    }

    return { success: true, id };
  } catch (error) {
    console.error("Flow save failed:", error);
    return { success: false, error: "Flow save failed" };
  }
}

export async function getCommunicationAnalytics(managerId: string, propertyId?: string) {
  try {
    const period = new Date().toISOString().slice(0, 7); // YYYY-MM
    let conditions = [eq(communicationLog.managerId, managerId)];
    if (propertyId) conditions.push(eq(communicationLog.propertyId, propertyId));

    // Aggregate from logs (real-time)
    const stats = await db
      .select({
        channel: communicationLog.channel,
        status: communicationLog.status,
        count: count()
      })
      .from(communicationLog)
      .where(and(...conditions))
      .groupBy(communicationLog.channel, communicationLog.status);

    // Distribution by property
    const propertyDist = await db
      .select({
        propertyId: communicationLog.propertyId,
        propertyName: property.name,
        count: count()
      })
      .from(communicationLog)
      .leftJoin(property, eq(communicationLog.propertyId, property.id))
      .where(and(...conditions))
      .groupBy(communicationLog.propertyId, property.name);

    return { success: true, stats, propertyDist };
  } catch (error) {
    return { success: false, error: "Analytics failed" };
  }
}

/**
 * TRIGGER PROCESSOR V2 (Multi-Step Support)
 */
export async function triggerFlow(managerId: string, trigger: string, tenantId: string, customData: any = {}) {
  try {
    const flows = await db
      .select()
      .from(communicationFlow)
      .where(and(
        eq(communicationFlow.managerId, managerId),
        eq(communicationFlow.trigger, trigger),
        eq(communicationFlow.isActive, true)
      ));

    if (flows.length === 0) return { success: true, count: 0 };

    const [t] = await db.select().from(tenant).where(eq(tenant.id, tenantId));
    if (!t) return { success: false, error: "Tenant not found" };
    const [prop] = await db.select().from(property).where(eq(property.id, t.propertyId!));

    let dispatched = 0;
    for (const flow of flows) {
      const steps = await db
        .select()
        .from(communicationFlowStep)
        .where(eq(communicationFlowStep.flowId, flow.id));

      for (const step of steps) {
        // For now, we only fire steps with offset 0 immediately
        // Scheduled steps would normally be handled by a cron/queue
        if (step.offsetDays !== 0) continue;

        const [tpl] = await db.select().from(communicationTemplate).where(eq(communicationTemplate.id, step.templateId));
        if (!tpl) continue;

        const injectData = {
          tenant_name: t.name,
          unit_name: t.unitId || "N/A",
          property_name: prop?.name || "Dane Property",
          property_location: prop?.location || "",
          total_amount: t.arrears,
          ...customData
        };

        const parsedContent = parseTemplate(tpl.contentText, injectData);
        const parsedSubject = parseTemplate(tpl.subject || "Update", injectData);

        if (step.channel === 'email' || step.channel === 'both') {
          if (t.email) {
             const res = await mailer({ to: t.email, subject: parsedSubject, text: parsedContent });
             await db.insert(communicationLog).values({
                id: `log-${crypto.randomUUID().slice(0, 8)}`,
                managerId, tenantId, propertyId: t.propertyId,
                channel: 'email', type: 'auto_responder',
                subject: parsedSubject, content: parsedContent,
                status: res.success ? 'sent' : 'failed', sentAt: new Date(), createdAt: new Date()
             });
             dispatched++;
          }
        }

        if (step.channel === 'sms' || step.channel === 'both') {
           const res = await texter({ to: t.phone, message: parsedContent });
           await db.insert(communicationLog).values({
              id: `log-${crypto.randomUUID().slice(0, 8)}`,
              managerId, tenantId, propertyId: t.propertyId,
              channel: 'sms', type: 'auto_responder',
              content: parsedContent,
              status: res.success ? 'sent' : 'failed', sentAt: new Date(), createdAt: new Date()
           });
           dispatched++;
        }
      }
    }

    return { success: true, count: dispatched };
  } catch (error) {
    console.error("Flow trigger failed:", error);
    return { success: false, error: "Trigger failed" };
  }
}

// --- GOVERNANCE & AUDIT ACTIONS ---

export async function getAuditLogs(managerId: string, page = 1, limit = 50, filters: any = {}) {
  try {
    const offset = (page - 1) * limit;
    
    let conditions = [eq(systemAuditLog.managerId, managerId)];
    if (filters.action) conditions.push(eq(systemAuditLog.action, filters.action));
    if (filters.entityType) conditions.push(eq(systemAuditLog.entityType, filters.entityType));

    const data = await db.select()
      .from(systemAuditLog)
      .where(and(...conditions))
      .orderBy(desc(systemAuditLog.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRes] = await db.select({ count: count() })
      .from(systemAuditLog)
      .where(and(...conditions));
      
    return { success: true, logs: data, total: totalRes.count };
  } catch (error: any) {
    console.error("Audit Fetch Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getCronLogs(managerId: string, page = 1, limit = 50) {
  try {
    const offset = (page - 1) * limit;
    
    const data = await db.select()
      .from(cronHeartbeat)
      .orderBy(desc(cronHeartbeat.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRes] = await db.select({ count: count() })
      .from(cronHeartbeat);
      
    return { success: true, logs: data, total: totalRes.count };
  } catch (error: any) {
    console.error("Cron Log Fetch Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateSecuritySettings(userId: string, data: { twoFactorEnabled?: boolean; config?: any }) {
  try {
    const updateData: any = {};
    if (data.twoFactorEnabled !== undefined) updateData.twoFactorEnabled = data.twoFactorEnabled;
    if (data.config !== undefined) updateData.securityConfig = data.config;

    await db.update(user).set(updateData).where(eq(user.id, userId));
    
    await logSystemEvent({
      managerId: userId,
      action: 'SECURITY_SETTINGS_UPDATED',
      entityType: 'user',
      entityId: userId,
      payload: data
    });

    return { success: true };
  } catch (error: any) {
    console.error("Security Update Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getActiveSessions(userId: string) {
  try {
    const data = await db.select().from(schema.session).where(eq(schema.session.userId, userId));
    return { success: true, sessions: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function revokeSession(sessionId: string, userId: string) {
  try {
    await db.delete(schema.session).where(and(eq(schema.session.id, sessionId), eq(schema.session.userId, userId)));
    
    await logSystemEvent({
      managerId: userId,
      action: 'SESSION_REVOKED',
      entityType: 'session',
      entityId: sessionId
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logSystemEvent(data: {
  managerId: string;
  action: string;
  entityType: string;
  entityId: string;
  payload?: any;
  ipAddress?: string;
}) {
  try {
    await db.insert(systemAuditLog).values({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      managerId: data.managerId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      payload: data.payload || {},
      ipAddress: data.ipAddress || "0.0.0.0",
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Forensic Log Failure:", error);
  }
}
export async function getOwnerProperties(ownerId: string) {
  try {
    const result = await db
      .select()
      .from(property)
      .where(eq(property.ownerId, ownerId));
    
    return { success: true, properties: result };
  } catch (error) {
    console.error("Failed to fetch owner properties:", error);
    return { success: false, properties: [] };
  }
}

export async function getOwnerPortfolioStats(ownerId: string) {
  try {
    const properties = await db
      .select()
      .from(property)
      .where(eq(property.ownerId, ownerId));
    
    let totalRevenue = 0;
    let totalUnits = 0;
    let occupiedUnits = 0;
    let resUnitsTotal = 0;
    let comUnitsTotal = 0;

    for (const prop of properties) {
      const config = JSON.parse(prop.config || '{}');
      const resCount = JSON.parse(prop.residentialUnits || '{}');
      const comCount = JSON.parse(prop.commercialUnits || '{}');

      // Calculate potential revenue
      Object.entries(config.rents || {}).map(([type, price]: any) => {
        const count = (parseInt(resCount[type]) || 0) + (parseInt(comCount[type]) || 0);
        totalRevenue += (count * parseFloat(price));
      });

      // Unit counts
      const units = config.units || [];
      totalUnits += units.length;
      occupiedUnits += units.filter((u: any) => u.status === 'occupied').length;

      // Distribution
      resUnitsTotal += Object.values(resCount).reduce((a: number, b: any) => a + (parseInt(b) || 0), 0);
      comUnitsTotal += Object.values(comCount).reduce((a: number, b: any) => a + (parseInt(b) || 0), 0);
    }

    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    return {
      success: true,
      stats: {
        revenue: totalRevenue,
        occupancy: occupancyRate,
        totalUnits,
        distribution: {
          residential: resUnitsTotal,
          commercial: comUnitsTotal
        }
      }
    };
  } catch (error) {
    console.error("Failed to fetch owner stats:", error);
    return { success: false, error: "Stats calculation failed" };
  }
}
