import { Controller, Get, Post, Body, Query, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('user-stats')
  async getAdminUserStats(@Query('adminId') adminId: string) {
    return this.adminService.getAdminUserStats(adminId);
  }

  @Get('role-breakdown')
  async getRoleBreakdown(@Query('adminId') adminId: string) {
    return this.adminService.getRoleBreakdown(adminId);
  }

  @Get('signup-timeline')
  async getSignupTimeline(@Query('adminId') adminId: string) {
    return this.adminService.getSignupTimeline(adminId);
  }

  @Get('users')
  async getUsersByRole(
    @Query('adminId') adminId: string,
    @Query('role') role: string,
    @Query('page') page: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsersByRole(adminId, role, parseInt(page) || 1, search);
  }

  @Get('users/:id')
  async getAdminUserDetail(@Param('id') id: string, @Query('adminId') adminId: string) {
    return this.adminService.getAdminUserDetail(adminId, id);
  }

  @Post('users/:id/suspend')
  async suspendUser(@Param('id') id: string, @Body('adminId') adminId: string) {
    return this.adminService.suspendUser(adminId, id);
  }

  @Post('users/:id/reactivate')
  async reactivateUser(@Param('id') id: string, @Body('adminId') adminId: string) {
    return this.adminService.reactivateUser(adminId, id);
  }

  @Post('users/:id/role')
  async changeUserRole(
    @Param('id') id: string,
    @Body('adminId') adminId: string,
    @Body('role') role: string,
  ) {
    return this.adminService.changeUserRole(adminId, id, role);
  }

  @Get('property-stats')
  async getAdminPropertyStats(@Query('adminId') adminId: string) {
    return this.adminService.getAdminPropertyStats(adminId);
  }

  @Get('properties')
  async getAdminProperties(
    @Query('adminId') adminId: string,
    @Query('filter') filter: string,
    @Query('page') page: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAdminProperties(adminId, filter, parseInt(page) || 1, search);
  }

  @Get('properties/:id')
  async getAdminPropertyDetail(@Param('id') id: string, @Query('adminId') adminId: string) {
    return this.adminService.getAdminPropertyDetail(adminId, id);
  }
  
  @Get('audit-logs')
  async getAuditLogs(
    @Query('managerId') managerId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.adminService.getAuditLogs(managerId, parseInt(page) || 1, parseInt(limit) || 50, { action, entityType });
  }

  @Get('cron-logs')
  async getCronLogs(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.adminService.getCronLogs(parseInt(page) || 1, parseInt(limit) || 50);
  }

  @Get('sessions')
  async getSessions(@Query('managerId') managerId: string) {
    return this.adminService.getSessions(managerId);
  }

  @Post('sessions/:id/revoke')
  async revokeSession(@Param('id') id: string, @Body('managerId') managerId: string) {
    return this.adminService.revokeSession(id, managerId);
  }

  @Post('business-settings')
  async updateBusinessSettings(@Body() data: any) {
    const { managerId, ...rest } = data;
    return this.adminService.updateBusinessSettings(managerId, rest);
  }

  @Post('finance-settings')
  async updateFinanceSettings(@Body() data: any) {
    const { managerId, ...rest } = data;
    return this.adminService.updateFinanceSettings(managerId, rest);
  }

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@UploadedFile() file: any) {
    return this.adminService.uploadLogo(file.buffer, file.originalname, file.mimetype);
  }
}
