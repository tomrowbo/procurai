import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";

// Per-user wallet creation via Crossmint API (v2025, server signer)
const CROSSMINT_BASE = process.env.CROSSMINT_ENVIRONMENT === "staging"
  ? "https://staging.crossmint.com/api"
  : "https://www.crossmint.com/api";

const CROSSMINT_BASE_LEGACY = CROSSMINT_BASE.replace("/api", "") + "/api";

function getHeaders() {
  return {
    "X-API-KEY": process.env.CROSSMINT_API_KEY!,
    "Content-Type": "application/json",
  };
}

// Deterministic server signer key -- one key signs for all wallets
const SIGNER_PRIVATE_KEY = (process.env.WALLET_SIGNER_KEY || generatePrivateKey()) as `0x${string}`;
const signerAccount = privateKeyToAccount(SIGNER_PRIVATE_KEY);

// Cache wallets by phone number
const walletCache = new Map<string, string>();

export function getSignerAddress(): string {
  return signerAccount.address;
}

export async function getOrCreateWallet(userPhone: string): Promise<string> {
  if (walletCache.has(userPhone)) {
    return walletCache.get(userPhone)!;
  }

  const phoneClean = userPhone.replace(/[^0-9]/g, "");

  const res = await fetch(`${CROSSMINT_BASE}/2025-06-09/wallets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      chainType: "evm",
      type: "smart",
      config: {
        adminSigner: {
          type: "server",
          address: signerAccount.address,
        },
      },
      linkedUser: `userId:agent-${phoneClean}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Wallet creation failed: ${err}`);
  }

  const data = await res.json();
  walletCache.set(userPhone, data.address);
  return data.address;
}

export async function getWalletBalance(address: string): Promise<number> {
  const res = await fetch(
    `${CROSSMINT_BASE_LEGACY}/v1-alpha2/wallets/${address}/balances?tokens=usdxm&chains=base-sepolia`,
    { headers: getHeaders() }
  );

  if (!res.ok) return 0;

  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    const raw = data[0]?.balances?.["base-sepolia"] || data[0]?.balances?.total || "0";
    return parseFloat(raw) / 1e6;
  }
  return 0;
}

export async function fundWallet(address: string, amount: number = 100): Promise<string> {
  const res = await fetch(
    `${CROSSMINT_BASE_LEGACY}/v1-alpha2/wallets/${address}/balances`,
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

// Submit a transaction from wallet and auto-approve with server signer
export async function submitAndApproveTransaction(
  walletAddress: string,
  to: string,
  data: string
): Promise<{ txHash: string; status: string }> {
  // 1. Create transaction
  const createRes = await fetch(`${CROSSMINT_BASE}/2025-06-09/wallets/${walletAddress}/transactions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      params: {
        calls: [{ to: to.toLowerCase(), value: "0", data }],
        chain: "base-sepolia",
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Transaction creation failed: ${err}`);
  }

  const txData = await createRes.json();
  const txId = txData.id;
  const messageToSign = txData.approvals?.pending?.[0]?.message;

  if (!messageToSign) {
    throw new Error("No approval message returned");
  }

  // 2. Sign the message with our server key
  const signature = await signerAccount.signMessage({ message: { raw: messageToSign as `0x${string}` } });

  // 3. Submit approval
  const approveRes = await fetch(
    `${CROSSMINT_BASE}/2025-06-09/wallets/${walletAddress}/transactions/${txId}/approvals`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        approvals: [{
          signer: `server:${signerAccount.address}`,
          signature,
        }],
      }),
    }
  );

  if (!approveRes.ok) {
    const err = await approveRes.text();
    throw new Error(`Approval failed: ${err}`);
  }

  // 4. Poll for completion (max 30s)
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 3000));

    const statusRes = await fetch(
      `${CROSSMINT_BASE}/2025-06-09/wallets/${walletAddress}/transactions/${txId}`,
      { headers: getHeaders() }
    );

    if (statusRes.ok) {
      const statusData = await statusRes.json();
      if (statusData.status === "success") {
        return {
          txHash: statusData.onChain?.txId || txId,
          status: "success",
        };
      }
      if (statusData.status === "failed") {
        throw new Error(`Transaction failed on-chain`);
      }
    }
  }

  return { txHash: txId, status: "pending" };
}
