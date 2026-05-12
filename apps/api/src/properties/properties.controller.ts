import { Controller, Get, Post, Body, Query, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  async getUserProperties(@Query('managerId') managerId: string) {
    return this.propertiesService.getUserProperties(managerId);
  }

  @Get('count')
  async getUserPropertyCount(@Query('managerId') managerId: string) {
    return this.propertiesService.getUserPropertyCount(managerId);
  }

  @Get('owner')
  async getOwnerProperties(@Query('ownerId') ownerId: string) {
    return this.propertiesService.getOwnerProperties(ownerId);
  }

  @Get(':id')
  async getPropertyById(@Param('id') id: string, @Query('managerId') managerId: string) {
    return this.propertiesService.getPropertyById(id, managerId);
  }

  @Post()
  async createProperty(@Body() data: any) {
    return this.propertiesService.createProperty(data);
  }

  @Post(':id/setup')
  async completePropertySetup(@Param('id') id: string, @Body() data: any) {
    return this.propertiesService.completePropertySetup(id, data, data.managerId);
  }

  @Post(':id/upload-excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMasterExcel(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('managerId') managerId: string,
  ) {
    return this.propertiesService.uploadMasterExcel(
        id, 
        file.buffer, 
        managerId, 
        file.originalname, 
        file.mimetype
    );
  }

  @Post('relocate-tenant')
  async updateTenantAssignment(@Body() data: any) {
    return this.propertiesService.updateTenantAssignment(
        data.tenantId, 
        data.propertyId, 
        data.unitId, 
        data.moveMode
    );
  }

  @Get(':id/stats')
  async getPropertyStats(@Param('id') id: string, @Query('managerId') managerId: string) {
    return this.propertiesService.getPropertyStats(id, managerId);
  }

  @Post(':id/config')
  async updatePropertyConfig(@Param('id') id: string, @Body() data: any) {
    return this.propertiesService.updatePropertyConfig(id, data.configData, data.managerId);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPropertyImage(@UploadedFile() file: Express.Multer.File) {
    return this.propertiesService.uploadPropertyImage(file.buffer, file.originalname, file.mimetype);
  }

  @Post(':id/marketing')
  async updateMarketingVisibility(@Param('id') id: string, @Body() data: any) {
    return this.propertiesService.updateMarketingVisibility(id, data.enabled, data.managerId);
  }
}
