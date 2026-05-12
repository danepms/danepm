import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { CommsModule } from '../comms/comms.module';

@Module({
  imports: [CommsModule],
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InvitesModule {}
