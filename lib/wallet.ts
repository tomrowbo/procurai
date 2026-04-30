// Per-user wallet creation via Crossmint API
const CROSSMINT_BASE = process.env.CROSSMINT_ENVIRONMENT === "staging"
  ? "https://staging.crossmint.com/api"
  : "https://www.crossmint.com/api";

function getHeaders() {
  return {
    "X-API-KEY": process.env.CROSSMINT_API_KEY!,
    "Content-Type": "application/json",
  };
}

// Cache wallets by phone number
const walletCache = new Map<string, string>();

export async function getOrCreateWallet(userPhone: string): Promise<string> {
  if (walletCache.has(userPhone)) {
    return walletCache.get(userPhone)!;
  }

  const userId = userPhone.replace(/[^a-zA-Z0-9]/g, "");

  const res = await fetch(`${CROSSMINT_BASE}/2022-06-09/wallets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "evm-smart-wallet",
      config: {
        adminSigner: { type: "evm-fireblocks-custodial" },
      },
      linkedUser: `userId:${userId}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Wallet creation failed: ${err}`);
  }

  const data = await res.json();
  const address = data.address;
  walletCache.set(userPhone, address);
  return address;
}

export async function getWalletBalance(address: string): Promise<number> {
  const res = await fetch(
    `${CROSSMINT_BASE}/v1-alpha2/wallets/${address}/balances?tokens=usdc&chains=base-sepolia`,
    { headers: getHeaders() }
  );

  if (!res.ok) return 0;

  const data = await res.json();
  const usdcBalance = data?.[0]?.balances?.[0]?.amount || "0";
  return parseFloat(usdcBalance);
}
