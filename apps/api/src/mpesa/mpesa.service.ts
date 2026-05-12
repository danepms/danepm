import { Injectable, Logger } from '@nestjs/common';
import { db } from '@dane/database';
import { tenant, payment, invoice, settlementAllocation, property, systemAuditLog } from '@dane/database';
import { eq, and, sql, asc } from 'drizzle-orm';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);

  async processStkCallback(body: any) {
    const result = body.Body.stkCallback;
    if (result.ResultCode !== 0) {
      this.logger.warn(`STK Push failed: ${result.ResultDesc}`);
      return { success: false };
    }

    const metadata = result.CallbackMetadata.Item;
    const amount = metadata.find(i => i.Name === 'Amount')?.Value;
    const reference = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const phone = metadata.find(i => i.Name === 'PhoneNumber')?.Value.toString();

    return this.reconcileAutomatedPayment({
      phone,
      amount: amount.toString(),
      reference,
      method: 'mpesa_stk'
    });
  }

  async processC2BConfirmation(body: any) {
    return this.reconcileAutomatedPayment({
      phone: body.MSISDN,
      amount: body.TransAmount,
      reference: body.TransID,
      method: 'mpesa_c2b',
      billRef: body.BillRefNumber
    });
  }

  private async reconcileAutomatedPayment(data: {
    phone: string;
    amount: string;
    reference: string;
    method: string;
    billRef?: string;
  }) {
    try {
      this.logger.log(`Processing M-Pesa Payment: ${data.reference} (${data.amount})`);

      // 1. Identify Tenant
      // We try by phone first, then billRef if it looks like a tenant ID
      let [targetTenant] = await db.select().from(tenant).where(eq(tenant.phone, data.phone));
      
      if (!targetTenant && data.billRef) {
          [targetTenant] = await db.select().from(tenant).where(eq(tenant.id, data.billRef));
      }

      if (!targetTenant) {
        this.logger.error(`No tenant found for M-Pesa payment: ${data.phone} / ${data.billRef}`);
        // Log to an "Unreconciled" table if we had one
        return { success: false, error: 'Tenant not found' };
      }

      const amountNum = parseFloat(data.amount);
      const paymentId = `pay-${Math.random().toString(36).substring(2, 10)}`;

      await db.transaction(async (tx) => {
        // 2. Record the Payment
        await tx.insert(payment).values({
          id: paymentId,
          tenantId: targetTenant.id,
          managerId: targetTenant.managerId,
          amount: data.amount,
          method: data.method,
          reference: data.reference,
          recordedAt: new Date(),
          createdAt: new Date(),
        });

        // 3. FIFO Allocation (Forensic Standard)
        const unpaidInvoices = await tx
          .select()
          .from(invoice)
          .where(and(
            eq(invoice.tenantId, targetTenant.id),
            sql`${invoice.status} != 'paid'`
          ))
          .orderBy(asc(invoice.issuedAt));

        let remainingAmount = amountNum;

        for (const inv of unpaidInvoices) {
          if (remainingAmount <= 0) break;

          const currentBalance = parseFloat(inv.balance);
          const currentPaid = parseFloat(inv.paid || '0');
          const allocationAmount = Math.min(remainingAmount, currentBalance);

          const newPaid = (currentPaid + allocationAmount).toString();
          const newBalance = (currentBalance - allocationAmount).toString();
          const newStatus = parseFloat(newBalance) <= 0 ? 'paid' : 'partial';

          await tx.update(invoice)
            .set({ 
              paid: newPaid, 
              balance: newBalance, 
              status: newStatus,
              paidAt: newStatus === 'paid' ? new Date() : null
            })
            .where(eq(invoice.id, inv.id));

          await tx.insert(settlementAllocation).values({
            id: `alloc-${Math.random().toString(36).substring(2, 10)}`,
            paymentId,
            invoiceId: inv.id,
            managerId: targetTenant.managerId,
            amount: allocationAmount.toString(),
            createdAt: new Date(),
          });

          remainingAmount -= allocationAmount;
        }

        // 4. Update Tenant Arrears
        const currentArrears = parseFloat(targetTenant.arrears || '0');
        const newArrears = Math.max(0, currentArrears - amountNum).toString();
        await tx.update(tenant).set({ arrears: newArrears }).where(eq(tenant.id, targetTenant.id));

        // 5. Audit Log
        await tx.insert(systemAuditLog).values({
            id: `log-${Math.random().toString(36).substring(2, 10)}`,
            managerId: targetTenant.managerId,
            action: 'MPESA_PAYMENT_RECONCILED',
            entityType: 'payment',
            entityId: paymentId,
            payload: JSON.stringify({ reference: data.reference, amount: data.amount, phone: data.phone }),
            createdAt: new Date(),
        });
      });

      this.logger.log(`Successfully reconciled M-Pesa payment ${data.reference} for ${targetTenant.name}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Reconciliation Failed for ${data.reference}:`, error);
      return { success: false, error: error.message };
    }
  }
}
