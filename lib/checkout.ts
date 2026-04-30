import { Product } from "@/types";
import { getOrCreateWallet, fundWallet, submitAndApproveTransaction } from "@/lib/wallet";

const CROSSMINT_BASE = process.env.CROSSMINT_ENVIRONMENT === "staging"
  ? "https://staging.crossmint.com/api"
  : "https://www.crossmint.com/api";

function getHeaders() {
  return {
    "X-API-KEY": process.env.CROSSMINT_API_KEY!,
    "Content-Type": "application/json",
  };
}

export async function createOrder(
  product: Product,
  userPhone: string
): Promise<{ orderId: string; status: string; quote?: unknown }> {
  const walletAddress = await getOrCreateWallet(userPhone);

  // Auto-fund wallet on staging for demo
  if (process.env.CROSSMINT_ENVIRONMENT === "staging") {
    await fundWallet(walletAddress, 100).catch(() => {});
  }

  // 1. Create order to get quote
  const res = await fetch(`${CROSSMINT_BASE}/2022-06-09/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      payment: {
        method: "base-sepolia",
        currency: "usdxm",
        payerAddress: walletAddress,
      },
      lineItems: [
        {
          productLocator: `amazon:${product.asin}`,
        },
      ],
      recipient: {
        email: process.env.RECIPIENT_EMAIL || "demo@hackathon.com",
        physicalAddress: {
          name: process.env.RECIPIENT_NAME || "Hackathon Demo",
          line1: process.env.RECIPIENT_ADDRESS_LINE1 || "1600 Pennsylvania Avenue NW",
          city: process.env.RECIPIENT_ADDRESS_CITY || "Washington",
          state: process.env.RECIPIENT_ADDRESS_STATE || "DC",
          postalCode: process.env.RECIPIENT_ADDRESS_ZIP || "20500",
          country: process.env.RECIPIENT_ADDRESS_COUNTRY || "US",
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Order failed: ${err}`);
  }

  const data = await res.json();
  const order = data.order || data;
  const orderId = order.orderId;
  const quoteStatus = order.quote?.status;

  if (quoteStatus !== "valid") {
    return {
      orderId,
      status: "quote-invalid",
      quote: order.quote,
    };
  }

  // 2. Get payment preparation (serialized transaction)
  const orderDetails = await fetch(`${CROSSMINT_BASE}/2022-06-09/orders/${orderId}`, {
    headers: getHeaders(),
  }).then((r) => r.json());

  const prep = orderDetails.payment?.preparation;
  if (!prep?.serializedTransaction) {
    return { orderId, status: "no-payment-prep", quote: order.quote };
  }

  // 3. Extract the ERC20 transfer call from serialized tx
  const serialized = prep.serializedTransaction;
  const transferIdx = serialized.indexOf("a9059cbb");
  if (transferIdx === -1) {
    throw new Error("Could not parse payment transaction");
  }

  const tokenContract = "0x14196f08a4fa0b66b7331bc40dd6bcd8a1deea9f"; // USDXM on base-sepolia
  const callData = "0x" + serialized.slice(transferIdx);

  // 4. Submit and auto-approve the payment transaction
  const txResult = await submitAndApproveTransaction(walletAddress, tokenContract, callData);

  return {
    orderId,
    status: txResult.status === "success" ? "paid" : "payment-pending",
    quote: order.quote,
  };
}

export async function checkOrderStatus(orderId: string): Promise<string> {
  const res = await fetch(`${CROSSMINT_BASE}/2022-06-09/orders/${orderId}`, {
    headers: getHeaders(),
  });

  if (!res.ok) return "unknown";
  const data = await res.json();
  return data.phase || data.status;
}
