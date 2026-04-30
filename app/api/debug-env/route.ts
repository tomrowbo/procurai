import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.CROSSMINT_API_KEY || "";
  return NextResponse.json({
    hasKey: !!key,
    keyLength: key.length,
    keyPrefix: key.slice(0, 20),
    keySuffix: key.slice(-10),
    environment: process.env.CROSSMINT_ENVIRONMENT,
    hasSignerKey: !!process.env.WALLET_SIGNER_KEY,
  });
}
