export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    console.log("[Twilio] No credentials, skipping send:", body.slice(0, 50));
    return;
  }

  const twilio = (await import("twilio")).default;
  const client = twilio(sid, token);

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
    to,
    body,
  });
}
