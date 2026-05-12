import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CommsService {
  private readonly logger = new Logger(CommsService.name);

  async sendEmail({ to, subject, html, text }: { to: string, subject: string, html: string, text: string }) {
    const ZEPTOMAIL_API_KEY = process.env.ZEPTOMAIL_API_KEY;
    if (!ZEPTOMAIL_API_KEY) {
      this.logger.warn("ZEPTOMAIL_API_KEY not configured.");
      return { success: false, error: "Email configuration missing" };
    }

    try {
      const response = await fetch("https://api.zeptomail.com/v1.1/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Zoho-enczapikey ${ZEPTOMAIL_API_KEY}`
        },
        body: JSON.stringify({
          from: { address: "noreply@danesproperties.com", name: "Dane" },
          to: [{ email_address: { address: to } }],
          subject: subject,
          htmlbody: html,
          textbody: text
        })
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true, messageId: data.data?.[0]?.message_id };
      } else {
        this.logger.error(`ZeptoMail Error: ${JSON.stringify(data)}`);
        return { success: false, error: data.error?.message || "Email failed" };
      }
    } catch (error) {
      this.logger.error(`ZeptoMail Exception: ${error.message}`);
      return { success: false, error: "Network error" };
    }
  }

  async sendSMS({ to, message }: { to: string, message: string }) {
    const AT_USERNAME = process.env.AT_USERNAME;
    const AT_API_KEY = process.env.AT_API_KEY;
    if (!AT_USERNAME || !AT_API_KEY) {
      this.logger.warn("Africa's Talking config missing.");
      return { success: false, error: "SMS configuration missing" };
    }

    try {
      const url = AT_USERNAME === 'sandbox' 
        ? "https://api.sandbox.africastalking.com/version1/messaging"
        : "https://api.africastalking.com/version1/messaging";

      const params = new URLSearchParams();
      params.append("username", AT_USERNAME);
      params.append("to", to);
      params.append("message", message);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "apikey": AT_API_KEY
        },
        body: params.toString()
      });

      const data = await response.json();
      if (response.ok && data.SMSMessageData) {
        const recipient = data.SMSMessageData.Recipients[0];
        if (recipient.status === 'Success' || recipient.status === 'Sent') {
          return { success: true, messageId: recipient.messageId };
        } else {
          return { success: false, error: recipient.status };
        }
      } else {
        this.logger.error(`Africa's Talking Error: ${JSON.stringify(data)}`);
        return { success: false, error: "SMS failed" };
      }
    } catch (error) {
      this.logger.error(`Africa's Talking Exception: ${error.message}`);
      return { success: false, error: "Network error" };
    }
  }
}
