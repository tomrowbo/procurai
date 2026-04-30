import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/agent";
import { getSession, updateSession, resetSession } from "@/lib/conversation";
import { checkTransaction, recordSpending } from "@/lib/trust";
import { createOrder } from "@/lib/checkout";
import { Product } from "@/types";

export const maxDuration = 60;

async function purchaseProduct(product: Product, userId: string): Promise<string> {
  const trustCheck = checkTransaction(product, userId);
  if (!trustCheck.approved) {
    return `Blocked: ${product.title} — ${trustCheck.reason}`;
  }

  try {
    const order = await createOrder(product, userId);
    recordSpending(userId, product.price);
    if (order.status === "paid") {
      const explorer = process.env.CROSSMINT_ENVIRONMENT === "staging"
        ? `https://sepolia.basescan.org/tx/${order.txHash}`
        : `https://basescan.org/tx/${order.txHash}`;
      return `${product.title} — $${product.price} — Paid!\nhttps://amazon.com/dp/${product.asin}\n${explorer}`;
    } else if (order.status === "quote-invalid") {
      return `${product.title} — Not available right now`;
    } else {
      return `${product.title} — $${product.price} — ${order.status}`;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `${product.title} — Failed: ${message}`;
  }
}

// POST /api/chat
// Body: { "message": "I need a phone charger", "sessionId": "optional-session-id" }
// Returns: { "reply": "...", "state": {...}, "purchaseResult": "..." }
export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const userId = sessionId || "demo-user";
    const session = getSession(userId);

    const agentResponse = await processMessage(message, session.state, session.history);
    let replyText = agentResponse.reply;
    let newState = agentResponse.newState;
    let purchaseResult: string | undefined;

    // Single purchase
    if (newState.stage === "purchasing" && newState.selectedProduct) {
      const result = await purchaseProduct(newState.selectedProduct, userId);
      purchaseResult = result;
      replyText = `Order complete!\n\n${result}\n\nThank you!`;
      newState = { stage: "done" };
    }

    // Batch purchase
    if (newState.stage === "batch-purchasing" && newState.selectedProducts?.length) {
      const results: string[] = [];
      let totalSpent = 0;

      for (const product of newState.selectedProducts) {
        const result = await purchaseProduct(product, userId);
        results.push(result);
        if (result.includes("Paid!")) {
          totalSpent += product.price;
        }
      }

      purchaseResult = results.join("\n\n");
      replyText =
        `Batch order complete!\n\n` +
        results.map((r, i) => `${i + 1}. ${r}`).join("\n\n") +
        `\n\nTotal spent: $${totalSpent.toFixed(2)}`;
      newState = { stage: "done" };
    }

    updateSession(userId, newState, message, replyText);

    if (newState.stage === "done") {
      setTimeout(() => resetSession(userId), 10_000);
    }

    return NextResponse.json({
      reply: replyText,
      state: newState,
      purchaseResult,
    });
  } catch (err) {
    console.error("[Chat API] Error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/chat?sessionId=xxx — reset session
export async function DELETE(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || "demo-user";
  resetSession(sessionId);
  return NextResponse.json({ ok: true });
}
