import { Product } from "@/types";
import { getOrCreateWallet, fundWallet, submitAndApproveTransaction, getChain, getToken } from "@/lib/wallet";

const isStaging = process.env.CROSSMINT_ENVIRONMENT === "staging";

const CROSSMINT_BASE = isStaging
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
  userPhone: string,
  walletOverride?: string
): Promise<{ orderId: string; status: string; quote?: unknown; txHash?: string }> {
  const walletAddress = walletOverride || await getOrCreateWallet(userPhone);

  // Auto-fund on staging only
  if (isStaging) {
    await fundWallet(walletAddress, 100).catch(() => {});
  }

  const chain = getChain();
  const token = getToken();

  // 1. Create order
  const res = await fetch(`${CROSSMINT_BASE}/2022-06-09/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      payment: {
        method: chain,
        currency: token,
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

  // 2. Get payment preparation
  const orderDetails = await fetch(`${CROSSMINT_BASE}/2022-06-09/orders/${orderId}`, {
    headers: getHeaders(),
  }).then((r) => r.json());

  const prep = orderDetails.payment?.preparation;
  if (!prep?.serializedTransaction) {
    return { orderId, status: "no-payment-prep", quote: order.quote };
  }

  // 3. Extract ERC20 transfer call from serialized tx
  const serialized = prep.serializedTransaction;
  const transferIdx = serialized.indexOf("a9059cbb");
  if (transferIdx === -1) {
    throw new Error("Could not parse payment transaction");
  }

  // Extract the token contract address from the serialized tx
  // Format: ...94<40-char-address>80... where 94 is the RLP prefix before the to address
  // Or just use the known contracts
  const tokenContract = isStaging
    ? "0x14196f08a4fa0b66b7331bc40dd6bcd8a1deea9f"  // USDXM on Base Sepolia
    : "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"; // USDC on Base

  const callData = "0x" + serialized.slice(transferIdx);

  // 4. Submit and auto-approve payment
  const txResult = await submitAndApproveTransaction(walletAddress, tokenContract, callData);

  return {
    orderId,
    status: txResult.status === "success" ? "paid" : "payment-pending",
    quote: order.quote,
    txHash: txResult.txHash,
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
