import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { PortalService } from './portal.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('tenant-dashboard')
  async getTenantDashboardData(@Query('userId') userId: string) {
    return this.portalService.getTenantDashboardData(userId);
  }

  @Post('paystack/initialize')
  async initializePaystackPayment(@Body() data: any) {
    return this.portalService.initializePaystackPayment(
        data.tenantId, 
        data.amount, 
        data.email
    );
  }

  @Get('paystack/verify')
  async verifyPaystackPayment(@Query('reference') reference: string) {
    return this.portalService.verifyPaystackPayment(reference);
  }
}
