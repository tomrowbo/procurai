import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { processMessage } from "@/lib/agent";
import { getSession, updateSession, resetSession } from "@/lib/conversation";
import { checkTransaction, recordSpending } from "@/lib/trust";
import { createOrder } from "@/lib/checkout";
import { Product } from "@/types";

async function purchaseProduct(product: Product, from: string): Promise<string> {
  const trustCheck = checkTransaction(product, from);
  if (!trustCheck.approved) {
    return `Blocked: ${product.title} — ${trustCheck.reason}`;
  }

  try {
    const order = await createOrder(product, from);
    recordSpending(from, product.price);
    if (order.status === "paid") {
      return `${product.title} — $${product.price} — Paid!`;
    } else if (order.status === "quote-invalid") {
      return `${product.title} — Not available on Amazon right now`;
    } else {
      return `${product.title} — $${product.price} — ${order.status}`;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `${product.title} — Failed: ${message}`;
  }
}

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

    // Single purchase
    if (newState.stage === "purchasing" && newState.selectedProduct) {
      const result = await purchaseProduct(newState.selectedProduct, from);
      replyText = `Order complete!\n\n${result}\n\nThank you!`;
      newState = { stage: "done" };
    }

    // Batch purchase
    if (newState.stage === "batch-purchasing" && newState.selectedProducts?.length) {
      const results: string[] = [];
      let totalSpent = 0;

      for (const product of newState.selectedProducts) {
        const result = await purchaseProduct(product, from);
        results.push(result);
        if (result.includes("Paid!")) {
          totalSpent += product.price;
        }
      }

      replyText =
        `Batch order complete!\n\n` +
        results.map((r, i) => `${i + 1}. ${r}`).join("\n") +
        `\n\nTotal spent: $${totalSpent.toFixed(2)}`;
      newState = { stage: "done" };
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
