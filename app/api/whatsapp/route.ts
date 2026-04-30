import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get("From") as string;
  const body = formData.get("Body") as string;

  if (!from || !body) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  console.log(`[WhatsApp] ${from}: ${body}`);

  // TEMP: echo test — remove once Twilio integration is confirmed working
  const replyText = `Echo: ${body}`;

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(replyText);

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
