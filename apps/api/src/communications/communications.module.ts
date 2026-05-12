import { Module } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { CommunicationsController } from './communications.controller';
import { SystemModule } from '../system/system.module';
import { CommsModule } from '../comms/comms.module';

@Module({
  imports: [SystemModule, CommsModule],
  controllers: [CommunicationsController],
  providers: [CommunicationsService],
})
export class CommunicationsModule {}
