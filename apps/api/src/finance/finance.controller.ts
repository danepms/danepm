import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('invoices')
  async getInvoices(
    @Query('managerId') managerId: string,
    @Query('page') page: string,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
    @Query('period') period?: string,
  ) {
    return this.financeService.getInvoices(
        managerId, 
        parseInt(page) || 1, 
        { status, propertyId, period }
    );
  }

  @Get('invoices/:id')
  async getInvoiceDetails(
    @Param('id') id: string,
    @Query('managerId') managerId: string,
  ) {
    return this.financeService.getInvoiceDetails(id, managerId);
  }

  @Get('invoices/:id/payments')
  async getPaymentsForInvoice(@Param('id') id: string) {
    return this.financeService.getPaymentsForInvoice(id);
  }

  @Post('reconcile')
  async reconcilePayment(@Body() data: any) {
    return this.financeService.reconcilePayment(data);
  }

  @Get('reconciliation-summary')
  async getReconciliationSummary(
    @Query('managerId') managerId: string,
    @Query('period') period?: string,
  ) {
    return this.financeService.getReconciliationSummary(managerId, period);
  }

  @Get('arrears-ledger')
  async getArrearsLedger(
    @Query('managerId') managerId: string,
    @Query('page') page: string,
  ) {
    return this.financeService.getArrearsLedger(managerId, parseInt(page) || 1);
  }

  @Get('revenue-history')
  async getRevenueHistory(
    @Query('managerId') managerId: string,
    @Query('months') months: string,
  ) {
    return this.financeService.getRevenueHistory(managerId, parseInt(months) || 6);
  }

  @Get('tenant-ledger')
  async getTenantLedger(
    @Query('tenantId') tenantId: string,
    @Query('managerId') managerId: string,
  ) {
    return this.financeService.getTenantLedger(tenantId, managerId);
  }

  @Post('create-invoice')
  async createInvoice(@Body() data: any) {
    return this.financeService.createInvoice(data);
  }

  @Post('apply-penalties')
  async applyPenalties(@Body() data: { managerId: string }) {
    return this.financeService.applyPenalties(data.managerId);
  }

  @Post('generate-invoices')
  async generateMonthlyInvoices(@Body() data: any) {
    return this.financeService.generateMonthlyInvoices(
        data.managerId, 
        data.period, 
        data.propertyId,
        data.tenantId
    );
  }

  @Get('owner-stats')
  async getOwnerPortfolioStats(@Query('ownerId') ownerId: string) {
    return this.financeService.getOwnerPortfolioStats(ownerId);
  }
}
