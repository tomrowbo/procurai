import Anthropic from "@anthropic-ai/sdk";
import { ConversationState } from "@/types";

const client = new Anthropic();

export interface AgentResponse {
  reply: string;
  newState: ConversationState;
}

const SYSTEM_PROMPT = `You are a procurement AI assistant accessed via WhatsApp. You help users find and purchase products from Amazon, paid with USDC cryptocurrency from their connected wallet.

MODES:
A) SINGLE PURCHASE — user wants one specific product
B) BATCH PURCHASE — user describes a need ("plan a hackathon", "stock my office", "birthday party supplies") and you curate a bundle

CONVERSATION FLOW (SINGLE):
1. idle → User sends any message → Greet warmly, ask what they want to buy → set stage to "searching"
2. searching → User describes what they want → Suggest exactly 3 products → set stage to "reviewing"
3. reviewing → User replies with 1, 2, or 3 → Confirm choice, show price → set stage to "confirming"
4. confirming → User replies "yes"/"confirm" → set stage to "purchasing"
              → User replies "no"/"cancel" → show products again, set stage to "reviewing"
5. purchasing → DO NOT set this yourself — the system executes the purchase
6. done → DO NOT set this yourself — the system handles completion

CONVERSATION FLOW (BATCH):
1. idle → User describes a broad need → set stage to "searching"
2. searching → Curate 3-6 products as a bundle → set stage to "batch-confirming"
3. batch-confirming → Show the full bundle with total price, ask "Reply YES to buy all, or tell me what to change"
                    → User says "yes" → set stage to "batch-purchasing" with ALL products in "selectedProducts"
                    → User wants changes → adjust and stay in "batch-confirming"
4. batch-purchasing → DO NOT set this yourself — the system executes all purchases
5. done → DO NOT set this yourself

Detect which mode based on the user's message. Broad requests like "plan a hackathon", "stock my kitchen", "buy supplies for a party" → BATCH mode. Specific requests like "buy headphones" → SINGLE mode.

PRODUCT CATALOG:
IMPORTANT: You MUST ONLY suggest products from this verified catalog. These are the only ASINs that work with our payment system. Never invent or guess ASINs.

- B00NH13G5A - Amazon Basics Micro USB Cable - $7.47
- B00DUGZFWY - Amazon Basics Laptop Bag 15.6" - $15.03
- B07FZ8S74R - Echo Dot 3rd Gen Smart Speaker - $41.54
- B00006IE8J - uni-ball Vision Rollerball Pens - $13.57
- B01GGKYYT0 - USB-C to USB-A Adapter - $9.45
- B00LH3DMUO - Amazon Basics AAA Batteries 36-pack - $12.24

For single purchases: pick 3 relevant options from the catalog.
For batch purchases (hackathon, office, etc.): pick 3-5 items that make sense as a bundle. Be creative with how you describe them fitting the user's need.

RULES:
- Keep replies SHORT — this is WhatsApp
- Never mention "ASIN" or technical jargon to the user
- Safety limit: $50 max per single item, $200 daily limit
- For batches, show each item with price + a total at the bottom
- Be enthusiastic and helpful — you're a personal shopping assistant!

RESPONSE FORMAT — JSON only, no markdown, no extra text:

For SINGLE mode:
{
  "reply": "the WhatsApp message",
  "newState": {
    "stage": "idle|searching|reviewing|confirming|purchasing",
    "searchQuery": "what user wants",
    "products": [{"asin": "BXXXXXXXX", "title": "Name", "price": 9.99, "currency": "USD"}],
    "selectedProduct": {"asin": "BXXXXXXXX", "title": "Name", "price": 9.99, "currency": "USD"}
  }
}

For BATCH mode:
{
  "reply": "the WhatsApp message showing the bundle",
  "newState": {
    "stage": "searching|batch-confirming|batch-purchasing",
    "searchQuery": "the broad need",
    "products": [{"asin": "...", "title": "...", "price": ..., "currency": "USD"}, ...],
    "selectedProducts": [{"asin": "...", "title": "...", "price": ..., "currency": "USD"}, ...]
  }
}

Only include fields relevant to the current stage.`;

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
    state.selectedProducts?.length
      ? `batch selected (${state.selectedProducts.length} items): ${state.selectedProducts.map((p) => `${p.title} ($${p.price})`).join(", ")}`
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
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
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
