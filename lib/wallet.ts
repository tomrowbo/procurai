// Per-user wallet creation via Crossmint API (v2025)
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

  // Derive a stable email from phone number for wallet ownership
  const phoneClean = userPhone.replace(/[^0-9]/g, "");
  const email = `user-${phoneClean}@procurai.app`;

  const res = await fetch(`${CROSSMINT_BASE}/2025-06-09/wallets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      chainType: "evm",
      type: "smart",
      config: {
        adminSigner: { type: "email", email },
      },
      owner: `email:${email}`,
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
    `${CROSSMINT_BASE.replace("/api", "")}/api/v1-alpha2/wallets/${address}/balances?tokens=usdxm&chains=base-sepolia`,
    { headers: getHeaders() }
  );

  if (!res.ok) return 0;

  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    const raw = data[0]?.balances?.["base-sepolia"] || data[0]?.balances?.total || "0";
    return parseFloat(raw) / 1e6; // 6 decimals
  }
  return 0;
}

export async function fundWallet(address: string, amount: number = 100): Promise<string> {
  const res = await fetch(
    `${CROSSMINT_BASE.replace("/api", "")}/api/v1-alpha2/wallets/${address}/balances`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount, token: "usdxm", chain: "base-sepolia" }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Funding failed: ${err}`);
  }

  const data = await res.json();
  return data.txId;
}
