import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get('templates')
  async getCommunicationTemplates(@Query('managerId') managerId: string) {
    return this.communicationsService.getCommunicationTemplates(managerId);
  }

  @Post('templates')
  async saveCommunicationTemplate(@Body() data: any) {
    return this.communicationsService.saveCommunicationTemplate(data);
  }

  @Get('targeted-tenants')
  async getTargetedTenants(
    @Query('managerId') managerId: string,
    @Query('propertyId') propertyId?: string,
    @Query('hasArrears') hasArrears?: string,
    @Query('status') status?: string,
  ) {
    return this.communicationsService.getTargetedTenants(managerId, {
        propertyId,
        hasArrears: hasArrears === 'true',
        status
    });
  }

  @Post('launch-campaign')
  async launchCampaign(@Body() data: any) {
    return this.communicationsService.launchCampaign(data);
  }

  @Get('batches')
  async getCommunicationBatches(@Query('managerId') managerId: string) {
    return this.communicationsService.getCommunicationBatches(managerId);
  }

  @Get('flows')
  async getCommunicationFlows(@Query('managerId') managerId: string) {
    return this.communicationsService.getCommunicationFlows(managerId);
  }

  @Post('flows')
  async saveCommunicationFlow(@Body() data: any) {
    return this.communicationsService.saveCommunicationFlow(data);
  }

  @Get('analytics')
  async getCommunicationAnalytics(@Query('managerId') managerId: string) {
    return this.communicationsService.getCommunicationAnalytics(managerId);
  }

  @Post('trigger-flow')
  async triggerFlow(@Body() data: any) {
    return this.communicationsService.triggerFlow(data.managerId, data.trigger, data.tenantId);
  }

  @Get('upcoming')
  async getUpcomingMessages(@Query('managerId') managerId: string) {
    return this.communicationsService.getUpcomingMessages(managerId);
  }

  @Post('flows/:id/status')
  async updateFlowStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
    @Body('managerId') managerId: string,
  ) {
    return this.communicationsService.updateFlowStatus(id, isActive, managerId);
  }
}
