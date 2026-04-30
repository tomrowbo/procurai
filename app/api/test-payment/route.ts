import { NextRequest, NextResponse } from "next/server";
import { getOrCreateWallet, getWalletBalance, fundWallet } from "@/lib/wallet";
import { createOrder, checkOrderStatus } from "@/lib/checkout";
import { checkTransaction, recordSpending } from "@/lib/trust";

// GET /api/test-payment?step=wallet   -> create wallet
// GET /api/test-payment?step=fund     -> fund wallet with 100 USDXM
// GET /api/test-payment?step=balance  -> check balance
// GET /api/test-payment?step=trust    -> test trust layer
// GET /api/test-payment?step=order    -> place test order (B00NH13G5A - $7.47 USB cable)
// GET /api/test-payment?step=full     -> wallet + fund + balance + order
export async function GET(req: NextRequest) {
  const step = req.nextUrl.searchParams.get("step") || "full";
  const results: Record<string, unknown> = { step };

  try {
    // Step 1: Create wallet
    if (["wallet", "fund", "balance", "order", "full"].includes(step)) {
      const walletAddress = await getOrCreateWallet("test-user-hackathon");
      results.wallet = { address: walletAddress };
      if (step === "wallet") return NextResponse.json(results);
    }

    // Step 2: Fund wallet
    if (step === "fund" || step === "full") {
      const walletAddress = (results.wallet as { address: string }).address;
      const txId = await fundWallet(walletAddress, 100);
      results.funded = { txId, amount: "100 USDXM" };
      if (step === "fund") return NextResponse.json(results);
    }

    // Step 3: Check balance
    if (step === "balance" || step === "full") {
      const walletAddress = (results.wallet as { address: string }).address;
      const balance = await getWalletBalance(walletAddress);
      results.balance = { address: walletAddress, usdxm: balance };
      if (step === "balance") return NextResponse.json(results);
    }

    // Step 4: Trust check
    if (step === "trust" || step === "full") {
      const cheapProduct = { asin: "B00NH13G5A", title: "USB-A Cable", price: 7.47, currency: "USD" };
      const expensiveProduct = { asin: "B0FAKE", title: "Expensive Laptop", price: 999.99, currency: "USD" };

      const cheapCheck = checkTransaction(cheapProduct, "test-user");
      const expensiveCheck = checkTransaction(expensiveProduct, "test-user");

      results.trust = {
        cheapItem: { product: cheapProduct.title, price: cheapProduct.price, ...cheapCheck },
        expensiveItem: { product: expensiveProduct.title, price: expensiveProduct.price, ...expensiveCheck },
      };
      if (step === "trust") return NextResponse.json(results);
    }

    // Step 5: Place order
    if (step === "order" || step === "full") {
      const testProduct = { asin: "B00NH13G5A", title: "Amazon Basics Micro USB Cable", price: 7.47, currency: "USD" };

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
