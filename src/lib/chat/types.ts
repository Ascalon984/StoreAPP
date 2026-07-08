export interface Message {
  id: string;
  role: "user" | "agent";
  type: "text" | "image" | "product" | "order";
  text?: string;
  imageUrl?: string;
  productSnippet?: {
    slug: string;
    name: string;
    price: number;
    image?: string;
  };
  orderSnippet?: {
    orderId: string;
    name: string;
    total: number;
    imageUrls?: string[];
  };
  timestamp: Date;
  status?: "sending" | "sent";
}

export interface QuickReply {
  id: string;
  text: string;
  context?: "order" | "product" | "payment" | "complaint" | "profile";
}
