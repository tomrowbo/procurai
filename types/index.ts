export interface WhatsAppMessage {
  body: string;
  from: string;
  profileName: string;
  messageSid: string;
}

export interface ConversationState {
  stage: "idle" | "searching" | "reviewing" | "confirming" | "purchasing" | "batch-confirming" | "batch-purchasing" | "done";
  searchQuery?: string;
  products?: Product[];
  selectedProduct?: Product;
  selectedProducts?: Product[];
  walletAddress?: string;
}

export interface Product {
  asin: string;
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
}
