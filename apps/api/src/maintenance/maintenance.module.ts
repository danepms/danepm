import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { SystemModule } from '../system/system.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [SystemModule, StorageModule],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}
