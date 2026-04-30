import { NextRequest, NextResponse } from "next/server";
import { getOrCreateWallet, getWalletBalance } from "@/lib/wallet";
import { createOrder, checkOrderStatus } from "@/lib/checkout";
import { checkTransaction, recordSpending } from "@/lib/trust";

// GET /api/test-payment?step=wallet  -> create wallet
// GET /api/test-payment?step=balance -> check balance
// GET /api/test-payment?step=trust   -> test trust layer
// GET /api/test-payment?step=order   -> place test order
// GET /api/test-payment              -> full pipeline
export async function GET(req: NextRequest) {
  const step = req.nextUrl.searchParams.get("step") || "full";
  const results: Record<string, unknown> = { step };

  try {
    // Step 1: Create wallet
    if (step === "wallet" || step === "full") {
      const walletAddress = await getOrCreateWallet("test-user-hackathon");
      results.wallet = { address: walletAddress };
      if (step === "wallet") return NextResponse.json(results);
    }

    // Step 2: Check balance
    if (step === "balance" || step === "full") {
      const walletAddress = await getOrCreateWallet("test-user-hackathon");
      const balance = await getWalletBalance(walletAddress);
      results.balance = { address: walletAddress, usdc: balance };
      if (step === "balance") return NextResponse.json(results);
    }

    // Step 3: Trust check
    if (step === "trust" || step === "full") {
      const cheapProduct = { asin: "B08SVZ775L", title: "USB-C Cable", price: 9.99, currency: "USD" };
      const expensiveProduct = { asin: "B0FAKE", title: "Expensive Laptop", price: 999.99, currency: "USD" };

      const cheapCheck = checkTransaction(cheapProduct, "test-user");
      const expensiveCheck = checkTransaction(expensiveProduct, "test-user");

      results.trust = {
        cheapItem: { product: cheapProduct.title, price: cheapProduct.price, ...cheapCheck },
        expensiveItem: { product: expensiveProduct.title, price: expensiveProduct.price, ...expensiveCheck },
      };
      if (step === "trust") return NextResponse.json(results);
    }

    // Step 4: Place order (only if explicitly requested)
    if (step === "order") {
      const testProduct = { asin: "B08SVZ775L", title: "USB-C Cable 3-Pack", price: 9.99, currency: "USD" };

      const trustCheck = checkTransaction(testProduct, "test-order-user");
      if (!trustCheck.approved) {
        results.order = { blocked: true, reason: trustCheck.reason };
        return NextResponse.json(results);
      }

      const order = await createOrder(testProduct, "test-order-user");
      recordSpending("test-order-user", testProduct.price);
      results.order = order;
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message, step }, { status: 500 });
  }
}
