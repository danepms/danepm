import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SystemModule } from '../system/system.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [SystemModule, StorageModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
