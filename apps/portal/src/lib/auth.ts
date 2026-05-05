import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "@better-auth/passkey";
import { twoFactor } from "better-auth/plugins/two-factor";
import { db } from "@dane/database";
import * as schema from "@dane/database";

// Memory cache for email rate limiting
const otpRateLimit = new Map<string, { timestamps: number[], lastSent: number }>();

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
            twoFactor: schema.twoFactor,
            passkey: schema.passkey
        }
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "manager",
                input: true
            }
        }
    },
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        passkey(),
        twoFactor({
            otpOptions: {
                async sendOTP({ user, otp }, context) {
                    const now = Date.now();
                    const record = otpRateLimit.get(user.email) || { timestamps: [], lastSent: 0 };
                    
                    // Filter timestamps to only keep those from the last 24 hours
                    record.timestamps = record.timestamps.filter(time => now - time < 86400000);

                    if (now - record.lastSent < 60000) {
                        console.warn(`[RATE LIMIT] Request ignored for ${user.email} - under 1 minute.`);
                        throw new Error("Please wait 1 minute before requesting another code.");
                    }

                    if (record.timestamps.length >= 10) {
                        console.warn(`[RATE LIMIT] Request blocked for ${user.email} - max 10 per day.`);
                        throw new Error("You have reached the maximum number of requests for today.");
                    }

                    // Update memory state
                    record.timestamps.push(now);
                    record.lastSent = now;
                    otpRateLimit.set(user.email, record);

                    const userAgent = context?.request?.headers.get("user-agent") || "Unknown Device";
                    const deviceName = userAgent.includes("iPhone") ? "iPhone" : 
                                     userAgent.includes("Android") ? "Android Device" : 
                                     userAgent.includes("Windows") ? "Windows PC" : 
                                     userAgent.includes("Mac") ? "MacBook" : "Authorized Device";

                    console.log(`[ZEPTOMAIL] Dispatching OTP ${otp} to ${user.email} from ${deviceName}`);

                    try {
                        const response = await fetch("https://api.zeptomail.com/v1.1/email", {
                            method: "POST",
                            headers: {
                                "accept": "application/json",
                                "content-type": "application/json",
                                "authorization": "Zoho-enczapikey wSsVR60kqR+jW697lGX/duY+kQhTBVigER5621uiuCKuS/yRpsc+lEDGUFCvSKMeQmQ6FWFDo79/m00B1Ttbidkuw1BUDiiF9mqRe1U4J3x17qnvhDzPVmtZkxuBLowJxAhtmWBjGs4g+g==",
                            },
                            body: JSON.stringify({
                                from: { address: "security@danesproperties.com", name: "Dane Platform" },
                                to: [{ email_address: { address: user.email, name: user.name } }],
                                subject: "Dane Platform Verification",
                                htmlbody: `
                                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #111827; padding: 40px; border-radius: 8px; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb;">
                                        <h1 style="color: #111827; font-size: 18px; font-weight: 600; margin-bottom: 24px;">Dane Authentication</h1>
                                        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">Hello ${user.name},</p>
                                        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">A request was made to verify your identity. Please use the code below to securely complete your session:</p>
                                        
                                        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 24px 0; text-align: center;">
                                            <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827;">${otp}</span>
                                        </div>
                                        
                                        <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">
                                            This code will expire in 5 minutes.<br/>
                                            Requested from: <b>${deviceName}</b>
                                        </p>
                                        
                                        <p style="font-size: 12px; color: #6b7280; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                                            If you did not request this code, please safely ignore this email.
                                        </p>
                                    </div>
                                `
                            })
                        });
                        const responseData = await response.json();
                        if (!response.ok) {
                            console.error("[ZEPTOMAIL ERROR]:", responseData);
                        } else {
                            console.log("[ZEPTOMAIL SUCCESS]: Email sent to", user.email);
                        }
                    } catch (e) {
                        console.error("ZeptoMail Failure:", e);
                    }
                },
                expiresIn: 300, 
            }
        })
    ]
});
