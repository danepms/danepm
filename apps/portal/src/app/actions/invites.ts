"use server";

import { db, user as userTable, invite, property } from "@dane/database";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { SendMailClient } from "zeptomail";

const url = "api.zeptomail.com/";
const token = process.env.ZEPTOMAIL_API_KEY;

export async function sendPropertyInvite(
  propertyId: string, 
  email: string, 
  inviterId: string
) {
  try {
    const inviteId = nanoid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(invite).values({
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
    
    // Fetch inviter and property details for the email
    const [inviterRes] = await db.select().from(userTable).where(eq(userTable.id, inviterId)).limit(1);
    const [propRes] = await db.select().from(property).where(eq(property.id, propertyId)).limit(1);

    if (token) {
      const client = new SendMailClient({ url, token });
      
      await client.sendMail({
        from: {
          address: "noreply@danepms.com",
          name: "DanePMS"
        },
        to: [
          {
            email_address: {
              address: email,
              name: "Property Owner"
            }
          }
        ],
        subject: `Invitation to manage ${propRes?.name || 'your property'} on DanePMS`,
        htmlbody: `
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
        `
      });
      
      console.log(`[INVITE SENT] via ZeptoMail to: ${email}`);
    } else {
      console.warn("[ZEPTOMAIL] No API Key found, logging link instead:", inviteLink);
    }

    return { 
      success: true, 
      inviteLink,
      message: "Invite sent successfully via email." 
    };
  } catch (error: any) {
    console.error("Invite error:", error);
    return { success: false, message: error.message };
  }
}

export async function getInvite(id: string) {
  try {
    const res = await db.select().from(invite).where(eq(invite.id, id)).limit(1);
    if (res.length === 0) return { success: false, message: "Invite not found" };
    
    const inv = res[0];
    if (inv.expiresAt < new Date()) return { success: false, message: "Invite expired" };
    if (inv.status !== 'pending') return { success: false, message: "Invite already used" };

    const inviter = await db.select().from(userTable).where(eq(userTable.id, inv.inviterId)).limit(1);

    return { success: true, invite: inv, inviter: inviter[0] };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function acceptInvite(inviteId: string, userId: string, userEmail: string) {
  try {
    const invRes = await db.select().from(invite).where(eq(invite.id, inviteId)).limit(1);
    if (invRes.length === 0) return { success: false, message: "Invite not found" };
    
    const inv = invRes[0];

    // Security check: Email must match
    if (inv.email.toLowerCase() !== userEmail.toLowerCase()) {
      return { success: false, message: "This invite was sent to a different email address." };
    }
    
    // Assign the property owner
    if (inv.role === 'owner' && inv.targetId) {
      await db.update(property)
        .set({ ownerId: userId })
        .where(eq(property.id, inv.targetId));
    }

    // Mark invite as accepted
    await db.update(invite)
      .set({ status: 'accepted' })
      .where(eq(invite.id, inviteId));

    return { success: true, role: inv.role };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
