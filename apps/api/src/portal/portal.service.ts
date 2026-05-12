import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@dane/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);

  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async getTenantDashboardData(userId: string) {
    const [currentUser] = await this.db.select().from(schema.user).where(eq(schema.user.id, userId));
    if (!currentUser) return { success: false, error: "User not found" };

    const matchedTenants = await this.db.select().from(schema.tenant).where(eq(schema.tenant.email, currentUser.email));
    if (matchedTenants.length === 0) {
      return { success: true, isLinked: false };
    }

    const currentTenant = matchedTenants[0];

    let prop: typeof schema.property.$inferSelect | null = null;
    if (currentTenant.propertyId) {
      const [p] = await this.db.select().from(schema.property).where(eq(schema.property.id, currentTenant.propertyId));
      prop = p;
    }

    const invoices = await this.db.select().from(schema.invoice).where(eq(schema.invoice.tenantId, currentTenant.id));

    return {
      success: true,
      isLinked: true,
      tenant: currentTenant,
      property: prop,
      invoices
    };
  }

  async initializePaystackPayment(tenantId: string, amount: number, email: string) {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return { success: false, error: "Paystack is not configured." };
    }

    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100),
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/tenant/verify-payment`,
          metadata: {
            tenantId
          }
        })
      });

      const data = await response.json();
      if (data.status) {
        return { success: true, authUrl: data.data.authorization_url, reference: data.data.reference };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      this.logger.error(`Paystack Init Error: ${err.message}`);
      return { success: false, error: "Failed to initialize payment." };
    }
  }

  async verifyPaystackPayment(reference: string) {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return { success: false, error: "Paystack is not configured." };
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      });

      const data = await response.json();
      if (data.status && data.data.status === "success") {
        const tenantId = data.data.metadata.tenantId;
        const amountPaid = data.data.amount / 100;

        const [t] = await this.db.select().from(schema.tenant).where(eq(schema.tenant.id, tenantId));
        if (t) {
          const currentArrears = parseFloat(t.arrears || "0");
          const newArrears = Math.max(0, currentArrears - amountPaid);
          
          await this.db.update(schema.tenant).set({ arrears: newArrears.toString() }).where(eq(schema.tenant.id, tenantId));
          
          const pendingInvoices = await this.db.select().from(schema.invoice).where(eq(schema.invoice.tenantId, tenantId));
          let remainingPayment = amountPaid;
          
          for (const inv of pendingInvoices) {
            if (inv.status !== 'paid' && remainingPayment > 0) {
              const balance = parseFloat(inv.balance);
              if (remainingPayment >= balance) {
                await this.db.update(schema.invoice).set({ status: 'paid', balance: '0', paid: (parseFloat(inv.paid || "0") + balance).toString() }).where(eq(schema.invoice.id, inv.id));
                remainingPayment -= balance;
              } else {
                await this.db.update(schema.invoice).set({ balance: (balance - remainingPayment).toString(), paid: (parseFloat(inv.paid || "0") + remainingPayment).toString() }).where(eq(schema.invoice.id, inv.id));
                remainingPayment = 0;
              }
            }
          }
        }
        return { success: true };
      }
      return { success: false, error: "Payment verification failed." };
    } catch (err) {
      this.logger.error(`Paystack Verify Error: ${err.message}`);
      return { success: false, error: "Server verification error." };
    }
  }
}
