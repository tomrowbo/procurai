import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
    to,
    body,
  });
}
