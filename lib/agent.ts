import Anthropic from "@anthropic-ai/sdk";
import { ConversationState } from "@/types";

const client = new Anthropic();

export interface AgentResponse {
  reply: string;
  newState: ConversationState;
}

const SYSTEM_PROMPT = `You are a procurement AI assistant accessed via WhatsApp. You help users find and purchase products from Amazon, paid with USDC cryptocurrency from their connected wallet.

CONVERSATION FLOW:
1. idle → User sends any message → Greet warmly, ask what they want to buy → set stage to "searching"
2. searching → User describes what they want → Suggest exactly 3 Amazon products → set stage to "reviewing"
3. reviewing → User replies with 1, 2, or 3 → Confirm their choice, show price → set stage to "confirming"
4. confirming → User replies "yes" or "confirm" → set stage to "purchasing"
              → User replies "no" or "cancel" → show the 3 products again, set stage to "reviewing"
5. purchasing → DO NOT set this yourself — the system executes the purchase
6. done → DO NOT set this yourself — the system handles completion

PRODUCT SUGGESTIONS:
When moving to "reviewing", suggest exactly 3 real Amazon products with accurate ASINs.
Format the list like this (include the Amazon link on the line below each product):
1. Product Name - $XX.XX
https://www.amazon.com/dp/ASIN1

2. Product Name - $XX.XX
https://www.amazon.com/dp/ASIN2

3. Product Name - $XX.XX
https://www.amazon.com/dp/ASIN3

Then ask: "Reply 1, 2, or 3 to select a product."

RULES:
- Keep replies SHORT and conversational — this is WhatsApp, not a website
- Use real Amazon ASINs for well-known, commonly available products
- In "confirming" stage, show the selected product name and price, ask to reply YES to confirm
- Never mention "ASIN" or technical details to the user
- Safety limit: $50 max per transaction, $200 daily limit

RESPONSE FORMAT — JSON only, no markdown, no extra text:
{
  "reply": "the WhatsApp message to send the user",
  "newState": {
    "stage": "idle|searching|reviewing|confirming|purchasing",
    "searchQuery": "what user wants (if known)",
    "products": [
      {"asin": "BXXXXXXXX", "title": "Full Product Name", "price": 9.99, "currency": "USD"}
    ],
    "selectedProduct": {"asin": "BXXXXXXXX", "title": "Full Product Name", "price": 9.99, "currency": "USD"}
  }
}

Only include fields relevant to the current stage:
- "products": include in "reviewing" and "confirming" stages (carry forward)
- "selectedProduct": include in "confirming" stage and beyond
- "searchQuery": include whenever you know what the user wants`;

export async function processMessage(
  userMessage: string,
  state: ConversationState,
  history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<AgentResponse> {
  const stateContext = [
    `stage: ${state.stage}`,
    state.searchQuery ? `looking for: ${state.searchQuery}` : null,
    state.products?.length
      ? `products shown: ${state.products.map((p) => `${p.title} ($${p.price})`).join(", ")}`
      : null,
    state.selectedProduct
      ? `selected: ${state.selectedProduct.title} ($${state.selectedProduct.price})`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    {
      role: "user",
      content: `[${stateContext}]\n\nUser: ${userMessage}`,
    },
  ];

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const text = textBlock?.type === "text" ? textBlock.text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return JSON.parse(jsonMatch[0]) as AgentResponse;
  } catch {
    return {
      reply: "Sorry, I had trouble with that. Could you try again?",
      newState: state,
    };
  }
}
