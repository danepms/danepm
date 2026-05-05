

const ZEPTOMAIL_API_KEY = process.env.ZEPTOMAIL_API_KEY;
const AT_USERNAME = process.env.AT_USERNAME;
const AT_API_KEY = process.env.AT_API_KEY;

export async function sendEmail({ to, subject, html, text }: { to: string, subject: string, html: string, text: string }) {
  if (!ZEPTOMAIL_API_KEY) {
    console.warn("ZEPTOMAIL_API_KEY not configured.");
    return { success: false, error: "Email configuration missing" };
  }

  try {
    const response = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": ZEPTOMAIL_API_KEY
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
      console.error("ZeptoMail Error:", data);
      return { success: false, error: data.error?.message || "Email failed" };
    }
  } catch (error) {
    console.error("ZeptoMail Exception:", error);
    return { success: false, error: "Network error" };
  }
}

export async function sendSMS({ to, message }: { to: string, message: string }) {
  if (!AT_USERNAME || !AT_API_KEY) {
    console.warn("Africa's Talking config missing.");
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
    // params.append("from", "DANE"); // Optional: if you have a shortcode/alphanumeric sender ID

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
      console.error("Africa's Talking Error:", data);
      return { success: false, error: "SMS failed" };
    }
  } catch (error) {
    console.error("Africa's Talking Exception:", error);
    return { success: false, error: "Network error" };
  }
}
