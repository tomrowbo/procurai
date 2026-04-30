export interface WhatsAppMessage {
  body: string;
  from: string;
  profileName: string;
  messageSid: string;
}

export interface ConversationState {
  stage: "idle" | "searching" | "reviewing" | "confirming" | "purchasing" | "done";
  searchQuery?: string;
  products?: Product[];
  selectedProduct?: Product;
  walletAddress?: string;
}

export interface Product {
  asin: string;
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
}
