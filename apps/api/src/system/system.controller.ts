import { Controller, Get, Post, Body, Query, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SystemService } from './system.service';
import { Request } from 'express';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('system')
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly storageService: StorageService,
  ) {}

  @Get('audit-logs')
  async getAuditLogs(
    @Query('managerId') managerId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.systemService.getAuditLogs(
        managerId, 
        parseInt(page) || 1, 
        parseInt(limit) || 50, 
        { action, entityType }
    );
  }

  @Get('cron-logs')
  async getCronLogs(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.systemService.getCronLogs(
        parseInt(page) || 1, 
        parseInt(limit) || 50
    );
  }

  @Post('security-settings')
  async updateSecuritySettings(
    @Body() body: { userId: string; twoFactorEnabled?: boolean; config?: any },
  ) {
    return this.systemService.updateSecuritySettings(body.userId, body);
  }

  @Get('sessions')
  async getActiveSessions(@Query('userId') userId: string) {
    return this.systemService.getActiveSessions(userId);
  }

  @Post('revoke-session')
  async revokeSession(
    @Body() body: { sessionId: string; userId: string },
  ) {
    return this.systemService.revokeSession(body.sessionId, body.userId);
  }

  @Post('business-settings')
  async updateBusinessSettings(
    @Body() body: { userId: string; data: any },
  ) {
    return this.systemService.updateBusinessSettings(body.userId, body.data);
  }

  @Post('finance-settings')
  async updateFinanceSettings(
    @Body() body: { userId: string; data: any },
  ) {
    return this.systemService.updateFinanceSettings(body.userId, body.data);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const ext = file.originalname.split('.').pop() || 'bin';
      const key = `uploads/general/${uuidv4()}.${ext}`;
      const url = await this.storageService.uploadToR2(file.buffer, key, file.mimetype);
      return { success: true, url };
    } catch (error) {
      return { success: false, error: 'Upload failed' };
    }
  }
}
