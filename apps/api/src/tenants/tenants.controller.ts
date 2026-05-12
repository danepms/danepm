import { Controller, Get, Post, Body, Query, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  async getPaginatedTenants(
    @Query('managerId') managerId: string,
    @Query('page') page: string,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
  ) {
    return this.tenantsService.getPaginatedTenants(
        managerId, 
        parseInt(page) || 1, 
        { propertyId, status }
    );
  }

  @Get('archived')
  async getArchivedTenants(
    @Query('managerId') managerId: string,
    @Query('page') page: string,
  ) {
    return this.tenantsService.getArchivedTenants(
        managerId, 
        parseInt(page) || 1
    );
  }

  @Get('stats')
  async getTenantStats(@Query('managerId') managerId: string) {
    return this.tenantsService.getTenantStats(managerId);
  }

  @Get(':id')
  async getDetailedTenantProfile(@Param('id') id: string, @Query('managerId') managerId: string) {
    return this.tenantsService.getDetailedTenantProfile(id, managerId);
  }

  @Post()
  async createTenant(@Body() data: any) {
    return this.tenantsService.createTenant(data);
  }

  @Post(':id/archive')
  async archiveTenant(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.archiveTenant(id, data.managerId, data.metadata);
  }

  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadTenantPhoto(@UploadedFile() file: Express.Multer.File) {
    const fileExtension = file.originalname.split('.').pop();
    const key = `tenants/documentation/${uuidv4()}.${fileExtension}`;
    return this.tenantsService.uploadTenantPhoto(file.buffer, key, file.mimetype);
  }
}
