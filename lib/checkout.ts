import { Product } from "@/types";
import { getOrCreateWallet } from "@/lib/wallet";

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
): Promise<{ orderId: string; status: string }> {
  const walletAddress = await getOrCreateWallet(userPhone);

  const res = await fetch(`${CROSSMINT_BASE}/2022-06-09/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      payment: {
        method: "base-sepolia",
        currency: "usdc",
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
          line1: process.env.RECIPIENT_ADDRESS_LINE1 || "123 Demo Street",
          city: process.env.RECIPIENT_ADDRESS_CITY || "London",
          state: process.env.RECIPIENT_ADDRESS_STATE || "London",
          postalCode: process.env.RECIPIENT_ADDRESS_ZIP || "EC1A 1BB",
          country: process.env.RECIPIENT_ADDRESS_COUNTRY || "GB",
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Order failed: ${err}`);
  }

  const data = await res.json();
  return { orderId: data.orderId || data.id, status: data.status };
}

export async function checkOrderStatus(orderId: string): Promise<string> {
  const res = await fetch(`${CROSSMINT_BASE}/2022-06-09/orders/${orderId}`, {
    headers: getHeaders(),
  });

  if (!res.ok) return "unknown";
  const data = await res.json();
  return data.status;
}
