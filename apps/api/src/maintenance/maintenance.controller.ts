import { Controller, Get, Post, Body, Query, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get('requests')
  async getMaintenanceRequests(
    @Query('managerId') managerId: string,
    @Query('page') page: string,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.maintenanceService.getMaintenanceRequests(
        managerId, 
        parseInt(page) || 1, 
        { status, propertyId }
    );
  }

  @Post('requests')
  async createMaintenanceRequest(@Body() data: any) {
    return this.maintenanceService.createMaintenanceRequest(data);
  }

  @Post('requests/:id/status')
  async updateRequestStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.maintenanceService.updateRequestStatus(id, status);
  }

  @Get('expenses')
  async getExpenses(
    @Query('managerId') managerId: string,
    @Query('page') page: string,
    @Query('category') category?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.maintenanceService.getExpenses(
        managerId, 
        parseInt(page) || 1, 
        { category, propertyId }
    );
  }

  @Post('expenses')
  async createExpense(@Body() data: any) {
    return this.maintenanceService.createExpense(data);
  }

  @Get('expenses/:id')
  async getExpenseById(@Param('id') id: string, @Query('managerId') managerId: string) {
    return this.maintenanceService.getExpenseById(id, managerId);
  }

  @Post('resolve-with-expense')
  async resolveMaintenanceWithExpense(@Body() data: any) {
    return this.maintenanceService.resolveMaintenanceWithExpense(data);
  }

  @Post('upload-receipt')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadReceipt(@UploadedFile() file: Express.Multer.File) {
    const fileExtension = file.originalname.split('.').pop();
    const key = `receipts/${uuidv4()}.${fileExtension}`;
    return this.maintenanceService.uploadReceipt(file.buffer, key, file.mimetype);
  }

  @Get('vendors')
  async getVendors(@Query('managerId') managerId: string) {
    return this.maintenanceService.getVendors(managerId);
  }

  @Post('vendors')
  async createVendor(@Body() data: any) {
    return this.maintenanceService.createVendor(data);
  }

  @Post('vendors/:id')
  async updateVendor(@Param('id') id: string, @Body() data: any) {
    return this.maintenanceService.updateVendor(id, data);
  }
}
