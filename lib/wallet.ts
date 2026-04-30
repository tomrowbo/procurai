import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";

const isStaging = process.env.CROSSMINT_ENVIRONMENT === "staging";

const CROSSMINT_BASE = isStaging
  ? "https://staging.crossmint.com/api"
  : "https://www.crossmint.com/api";

const CROSSMINT_BASE_LEGACY = CROSSMINT_BASE.replace("/api", "") + "/api";

const CHAIN = isStaging ? "base-sepolia" : "base";
const TOKEN = isStaging ? "usdxm" : "usdc";

function getHeaders() {
  return {
    "X-API-KEY": process.env.CROSSMINT_API_KEY!,
    "Content-Type": "application/json",
  };
}

// Server signer key for auto-approving transactions
const SIGNER_PRIVATE_KEY = (process.env.WALLET_SIGNER_KEY || generatePrivateKey()) as `0x${string}`;
const signerAccount = privateKeyToAccount(SIGNER_PRIVATE_KEY);

const walletCache = new Map<string, string>();

export function getSignerAddress(): string {
  return signerAccount.address;
}

export function getChain(): string {
  return CHAIN;
}

export function getToken(): string {
  return TOKEN;
}

export async function getOrCreateWallet(userPhone: string): Promise<string> {
  if (walletCache.has(userPhone)) {
    return walletCache.get(userPhone)!;
  }

  const phoneClean = userPhone.replace(/[^0-9]/g, "");
  const linkedUser = `userId:agent-${phoneClean}`;

  // Try to get existing wallet first
  const locator = encodeURIComponent(`${linkedUser}:evm:smart-wallet`);
  const getRes = await fetch(`${CROSSMINT_BASE}/2025-06-09/wallets/${locator}`, {
    headers: getHeaders(),
  });

  if (getRes.ok) {
    const data = await getRes.json();
    if (data.address) {
      walletCache.set(userPhone, data.address);
      return data.address;
    }
  }

  // Create new wallet if none exists
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
      linkedUser,
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
    `${CROSSMINT_BASE_LEGACY}/v1-alpha2/wallets/${address}/balances?tokens=${TOKEN}&chains=${CHAIN}`,
    { headers: getHeaders() }
  );

  if (!res.ok) return 0;

  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    const raw = data[0]?.balances?.[CHAIN] || data[0]?.balances?.total || "0";
    return parseFloat(raw) / 1e6; // 6 decimals for both USDC and USDXM
  }
  return 0;
}

export async function fundWallet(address: string, amount: number = 100): Promise<string> {
  // Faucet only works on staging
  if (!isStaging) {
    throw new Error("Faucet not available on production -- fund wallet with real USDC");
  }

  const res = await fetch(
    `${CROSSMINT_BASE_LEGACY}/v1-alpha2/wallets/${address}/balances`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount, token: TOKEN, chain: CHAIN }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Funding failed: ${err}`);
  }

  const data = await res.json();
  return data.txId;
}

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
        chain: CHAIN,
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

  // 2. Sign with server key
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

  // 4. Poll for confirmation (max 30s)
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
        throw new Error("Transaction failed on-chain");
      }
    }
  }

  return { txHash: txId, status: "pending" };
}
