export interface ProductVariant {
  id: string;
  name: string;
  stock: number;
  price?: number;
  originalPrice?: number;
}

export type ProductTargetType =
  | "phone"
  | "text"
  | "number"
  | "email"
  | "pln"
  | "none";

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  discount?: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviewCount: number;
  sold: number;
  stock: number;
  description: string;
  images?: string[]; // Max 3 — controlled by admin
  variants?: ProductVariant[];
  variant?: string;
  targetType?: ProductTargetType;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  priority?: number;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
  likes?: number;
  dislikes?: number;
  reply?: {
    adminName: string;
    comment: string;
    createdAt: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  category: string;
  image: string | null;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderId: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  customerName: string;
  phone: string;
  address: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string | null;
  kabupaten: string;
  provinsi: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
}

export type NotifType = "activity" | "promo";

export interface Notification {
  id: string;
  type: NotifType;
  isRead: boolean;
  createdAt: string; // ISO string
  // Activity-specific
  activityTitle?: string;
  productName?: string;
  orderId?: string;
  // Promo-specific
  promoProduct?: string;
  promoDiscount?: number; // percent
  promoCopy?: string;
}
