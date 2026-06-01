export interface ProductVariant {
  id: string;
  name: string;
  stock: number;
}

export type ProductTargetType = "phone" | "text" | "number" | "email" | "none";

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
