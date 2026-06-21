// ── Firestore data model (mirrors PROJECT SETUP → Products Database Architecture) ──

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface ColorVariant {
  name: string; // "Charcoal"
  hex: string; // "#3A3A3A"
  images: string[]; // Firebase Storage URLs for this colour
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number; // current price (minor unit handled in formatting)
  compareAtPrice?: number; // strike-through for markdown sales
  currency: string; // "INR" | "USD"
  description: string;
  category: string; // "women" | "men" | ...
  collection: string; // "exclusive" | "bayes" | "couple" | "black"
  tags: string[];
  fabricCare: string;
  variants: ColorVariant[];
  /** real-time inventory: { color → { size → count } } */
  sizesStock: Record<string, Partial<Record<Size, number>>>;
  rating?: number;
  featured?: boolean;
  createdAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  addresses: ShippingAddress[];
  wishlist: string[]; // product ids
  createdAt: number;
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  color: string;
  size: Size;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  uid: string | null; // null = guest
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  address: ShippingAddress;
  trackingUrl?: string;
  createdAt: number;
}
