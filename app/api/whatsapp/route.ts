import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { processMessage } from "@/lib/agent";
import { getSession, updateSession, resetSession } from "@/lib/conversation";
import { checkTransaction, recordSpending } from "@/lib/trust";
import { createOrder } from "@/lib/checkout";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get("From") as string;
  const body = formData.get("Body") as string;

  if (!from || !body) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  console.log(`[WhatsApp] ${from}: ${body}`);

  const session = getSession(from);
  let replyText: string;
  let newState = session.state;

  try {
    const agentResponse = await processMessage(body, session.state, session.history);
    replyText = agentResponse.reply;
    newState = agentResponse.newState;

    // Agent signalled to purchase — execute it here
    if (newState.stage === "purchasing" && newState.selectedProduct) {
      const product = newState.selectedProduct;
      const trustCheck = checkTransaction(product, from);

      if (!trustCheck.approved) {
        replyText = `Purchase blocked: ${trustCheck.reason}`;
        newState = { stage: "idle" };
      } else {
        try {
          const order = await createOrder(product, from);
          recordSpending(from, product.price);
          replyText =
            `Order placed!\n\n` +
            `Product: ${product.title}\n` +
            `Price: $${product.price}\n` +
            `Order ID: ${order.orderId}\n` +
            `Status: ${order.status}\n\n` +
            `Thank you!`;
          newState = { stage: "done" };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          replyText = `Order failed: ${message}\n\nPlease try again.`;
          newState = { stage: "idle" };
        }
      }
    }

    updateSession(from, newState, body, replyText);

    if (newState.stage === "done") {
      setTimeout(() => resetSession(from), 10_000);
    }
  } catch (err) {
    console.error("[WhatsApp] Error:", err);
    replyText = "Something went wrong. Please try again.";
    updateSession(from, newState, body, replyText);
  }

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(replyText);

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
