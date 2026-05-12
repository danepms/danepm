import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @UseGuards(AuthGuard)
  @Post('send')
  async sendPropertyInvite(@Body() data: any) {
    return this.invitesService.sendPropertyInvite(
        data.propertyId, 
        data.email, 
        data.inviterId
    );
  }

  @Get(':id')
  async getInvite(@Param('id') id: string) {
    return this.invitesService.getInvite(id);
  }

  @Post('accept')
  async acceptInvite(@Body() data: any) {
    return this.invitesService.acceptInvite(
        data.inviteId, 
        data.userId, 
        data.userEmail
    );
  }
}
