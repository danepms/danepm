import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@dane/database';
import { eq } from 'drizzle-orm';
import { CommsService } from '../comms/comms.service';
import { nanoid } from 'nanoid';

@Injectable()
export class InvitesService {
  private readonly logger = new Logger(InvitesService.name);

  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private commsService: CommsService,
  ) {}

  async sendPropertyInvite(propertyId: string, email: string, inviterId: string) {
    const inviteId = nanoid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.db.insert(schema.invite).values({
      id: inviteId,
      inviterId,
      email,
      role: 'owner',
      status: 'pending',
      targetId: propertyId,
      createdAt: new Date(),
      expiresAt,
    });

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${inviteId}`;
    
    const [inviterRes] = await this.db.select().from(schema.user).where(eq(schema.user.id, inviterId)).limit(1);
    const [propRes] = await this.db.select().from(schema.property).where(eq(schema.property.id, propertyId)).limit(1);

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 20px;">You've been invited.</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          <strong>${inviterRes?.name || 'A property manager'}</strong> has invited you to join DanePMS to oversee the performance and financials of <strong>${propRes?.name || 'your property'}</strong>.
        </p>
        <div style="margin: 40px 0;">
          <a href="${inviteLink}" style="background: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Accept Invitation</a>
        </div>
        <p style="font-size: 12px; color: #999; margin-top: 40px; border-top: 1px solid #eee; pt-20">
          If you did not expect this invitation, please ignore this email. This link will expire in 7 days.
        </p>
      </div>
    `;

    const res = await this.commsService.sendEmail({
        to: email,
        subject: `Invitation to manage ${propRes?.name || 'your property'} on DanePMS`,
        html,
        text: `You've been invited to manage ${propRes?.name || 'your property'} on DanePMS. Accept here: ${inviteLink}`
    });

    return { 
      success: res.success, 
      inviteLink,
      message: res.success ? "Invite sent successfully via email." : res.error
    };
  }

  async getInvite(id: string) {
    const res = await this.db.select().from(schema.invite).where(eq(schema.invite.id, id)).limit(1);
    if (res.length === 0) return { success: false, message: "Invite not found" };
    
    const inv = res[0];
    if (inv.expiresAt < new Date()) return { success: false, message: "Invite expired" };
    if (inv.status !== 'pending') return { success: false, message: "Invite already used" };

    const inviter = await this.db.select().from(schema.user).where(eq(schema.user.id, inv.inviterId)).limit(1);

    return { success: true, invite: inv, inviter: inviter[0] };
  }

  async acceptInvite(inviteId: string, userId: string, userEmail: string) {
    const invRes = await this.db.select().from(schema.invite).where(eq(schema.invite.id, inviteId)).limit(1);
    if (invRes.length === 0) return { success: false, message: "Invite not found" };
    
    const inv = invRes[0];

    if (inv.email.toLowerCase() !== userEmail.toLowerCase()) {
      return { success: false, message: "This invite was sent to a different email address." };
    }
    
    if (inv.role === 'owner' && inv.targetId) {
      await this.db.update(schema.property)
        .set({ ownerId: userId })
        .where(eq(schema.property.id, inv.targetId));
    }

    await this.db.update(schema.invite)
      .set({ status: 'accepted' })
      .where(eq(schema.invite.id, inviteId));

    return { success: true, role: inv.role };
  }
}
