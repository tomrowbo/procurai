import { Product } from "@/types";

export interface TrustCheck {
  approved: boolean;
  reason?: string;
  riskLevel: "low" | "medium" | "high";
}

const MAX_AMOUNT = parseFloat(process.env.MAX_TRANSACTION_AMOUNT || "50");
const DAILY_LIMIT = 200;

// Track daily spending per user
const dailySpending = new Map<string, { total: number; date: string }>();

export function checkTransaction(
  product: Product,
  userPhone: string
): TrustCheck {
  const today = new Date().toISOString().split("T")[0];

  // Get or reset daily tracking
  const spending = dailySpending.get(userPhone);
  if (!spending || spending.date !== today) {
    dailySpending.set(userPhone, { total: 0, date: today });
  }

  const currentDaily = dailySpending.get(userPhone)!;

  // Check 1: Single transaction limit
  if (product.price > MAX_AMOUNT) {
    return {
      approved: false,
      reason: `Transaction of $${product.price} exceeds the single purchase limit of $${MAX_AMOUNT}. Human review required.`,
      riskLevel: "high",
    };
  }

  // Check 2: Daily spending limit
  if (currentDaily.total + product.price > DAILY_LIMIT) {
    return {
      approved: false,
      reason: `This purchase would exceed your daily spending limit of $${DAILY_LIMIT}. Current spend today: $${currentDaily.total.toFixed(2)}.`,
      riskLevel: "high",
    };
  }

  // Check 3: Risk level based on amount relative to limit
  const riskLevel = product.price > MAX_AMOUNT * 0.7 ? "medium" : "low";

  return { approved: true, riskLevel };
}

export function recordSpending(userPhone: string, amount: number) {
  const today = new Date().toISOString().split("T")[0];
  const spending = dailySpending.get(userPhone) || { total: 0, date: today };
  spending.total += amount;
  dailySpending.set(userPhone, spending);
}
