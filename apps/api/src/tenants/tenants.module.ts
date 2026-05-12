import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { SystemModule } from '../system/system.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [SystemModule, StorageModule],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
