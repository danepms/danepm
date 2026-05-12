import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { MarketingController } from './marketing.controller';
import { SystemModule } from '../system/system.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [SystemModule, StorageModule],
  controllers: [PropertiesController, MarketingController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
