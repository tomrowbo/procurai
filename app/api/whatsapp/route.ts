import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { processMessage } from "@/lib/agent";
import { getSession, updateSession, resetSession } from "@/lib/conversation";
import { checkTransaction, recordSpending } from "@/lib/trust";
import { createOrder } from "@/lib/checkout";
import { sendWhatsApp } from "@/lib/twilio";
import { Product } from "@/types";

export const maxDuration = 60;

async function purchaseProduct(product: Product, from: string): Promise<string> {
  const trustCheck = checkTransaction(product, from);
  if (!trustCheck.approved) {
    return `Blocked: ${product.title} — ${trustCheck.reason}`;
  }

  try {
    const order = await createOrder(product, from);
    recordSpending(from, product.price);
    if (order.status === "paid") {
      return `${product.title} — $${product.price} — Paid!\nhttps://amazon.com/dp/${product.asin}`;
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

const PRODUCT_IMAGE_BY_ASIN: Record<string, string> = {
  B00NH13G5A: "https://m.media-amazon.com/images/I/71q3M4K22BL._AC_SL1500_.jpg",
  B00DUGZFWY: "https://m.media-amazon.com/images/I/71jP-5N6LwL._AC_SL1500_.jpg",
  B07FZ8S74R: "https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg",
  B0756CYWWD: "https://m.media-amazon.com/images/I/61N4d6fJXKL._AC_SL1500_.jpg",
  B074TDJQT8: "https://m.media-amazon.com/images/I/61uM7n8P7XL._AC_SL1500_.jpg",
};

function isImageRequest(message: string): boolean {
  return /(image|images|photo|photos|picture|pictures|pic|pics)/i.test(message);
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
  let mediaUrls: string[] = [];

  try {
    const agentResponse = await processMessage(body, session.state, session.history);
    replyText = agentResponse.reply;
    newState = agentResponse.newState;

    // Offer images when showing products
    if (
      newState.stage === "reviewing" &&
      Array.isArray(newState.products) &&
      newState.products.length > 0 &&
      !/image|photo|picture/i.test(replyText)
    ) {
      replyText += "\n\nWant to see product images? Reply IMAGES.";
    }

    // Handle image requests
    if (newState.stage === "reviewing" && isImageRequest(body)) {
      mediaUrls = newState.products
        ?.map((product) => product.imageUrl || PRODUCT_IMAGE_BY_ASIN[product.asin])
        .filter((url): url is string => Boolean(url))
        .slice(0, 3) || [];

      if (mediaUrls.length > 0) {
        const productLines = newState.products
          ?.slice(0, mediaUrls.length)
          .map((p, idx) => `${idx + 1}. ${p.title}`)
          .join("\n");
        replyText = `Here are product images:\n${productLines}\n\nReply 1, 2, or 3 to select a product.`;
      } else {
        replyText = "I could not fetch product images right now, but you can still reply 1, 2, or 3 to choose.";
      }
    }

    // Single purchase — reply immediately, process async
    if (newState.stage === "purchasing" && newState.selectedProduct) {
      const product = newState.selectedProduct;
      updateSession(from, newState, body, "Processing your order...");

      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(`Processing your order for ${product.title}...`);

      purchaseProduct(product, from).then(async (result) => {
        const msg = `Order complete!\n\n${result}\n\nThank you!`;
        await sendWhatsApp(from, msg).catch(console.error);
        updateSession(from, { stage: "done" }, "", msg);
        setTimeout(() => resetSession(from), 10_000);
      });

      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Batch purchase — reply immediately, process async
    if (newState.stage === "batch-purchasing" && newState.selectedProducts?.length) {
      const products = newState.selectedProducts;
      updateSession(from, newState, body, `Processing ${products.length} items...`);

      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(`Processing ${products.length} items... I'll message you when done!`);

      (async () => {
        const results: string[] = [];
        let totalSpent = 0;

        for (const product of products) {
          const result = await purchaseProduct(product, from);
          results.push(result);
          if (result.includes("Paid!")) {
            totalSpent += product.price;
          }
        }

        const msg =
          `Batch order complete!\n\n` +
          results.map((r, i) => `${i + 1}. ${r}`).join("\n\n") +
          `\n\nTotal spent: $${totalSpent.toFixed(2)}`;

        await sendWhatsApp(from, msg).catch(console.error);
        updateSession(from, { stage: "done" }, "", msg);
        setTimeout(() => resetSession(from), 10_000);
      })();

      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
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
  const message = twiml.message(replyText);
  mediaUrls.forEach((url) => message.media(url));

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
