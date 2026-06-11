// ── Firestore data model ──
//
// Collections
//   categories/{id}   dynamic category tree (departments → sub-categories)
//   products/{id}     catalog
//   inquiries/{id}    WhatsApp click-throughs + on-site contact / bespoke forms
//   analytics/...     daily page views + per-product counters (server-written)
//   users/{uid}       customer profile; role === 'admin' unlocks /admin
//   orders, reviews, carts, mail — commerce + operations

/**
 * Sizes are plain strings so each department can carry its own scale
 * (XS–XXL for women, age bands for kids, 36–46 for men later) without a type change.
 * "Custom" marks a made-to-measure line.
 */
export type Size = string;

/** Which size chart + measurement form a product uses. Add 'men' when that line launches. */
export type SizeSetId = 'women' | 'kids' | 'men';

export interface Category {
  id: string;
  name: string; // "Lehengas"
  slug: string; // "lehengas" — unique across the tree
  /** null for a department (Women, Kids, Men); otherwise the parent category id. */
  parentId: string | null;
  description?: string;
  image?: string;
  /** Size scale for products in this branch; inherited from the department when unset. */
  sizeSet?: SizeSetId;
  order: number;
  /** Inactive categories are hidden from the storefront but kept for admin. */
  active: boolean;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export interface ColorVariant {
  name: string; // "Rani Pink"
  hex: string; // "#C2185B"
  images: string[]; // Firebase Storage URLs for this colour
}

export type ProductStatus = 'active' | 'draft' | 'archived';

export interface Product {
  id: string;
  /** Human-readable stock code shown to customers and quoted in WhatsApp enquiries. */
  sku: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number; // strike-through for markdown sales
  currency: string; // "INR"
  description: string;
  /** Department slug — "women" | "kids" | "men". */
  category: string;
  /** Sub-category slug — "sarees" | "lehengas" | "frocks" … */
  subcategory: string;
  /** Optional merchandising edit — "bridal" | "festive" | "new" … */
  collection?: string;
  tags: string[];
  occasions?: string[];
  /** The design story: inspiration, craft, artisan notes. */
  designStory?: string;
  /** Fabric composition and work — "Pure Banarasi silk, zari weave". */
  fabric?: string;
  fabricCare: string;
  variants: ColorVariant[];
  /** real-time inventory: { color → { size → count } } */
  sizesStock: Record<string, Record<Size, number>>;
  sizeSet?: SizeSetId;
  /** Accepts custom measurements at enquiry / order time. */
  customizable?: boolean;
  /** Stitched on order rather than held in stock. */
  madeToOrder?: boolean;
  leadTimeDays?: number;
  status?: ProductStatus; // treated as 'active' when missing
  rating?: number;
  featured?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/** Free-form measurements in inches, keyed by field id (bust, waist, …). */
export type Measurements = Record<string, string>;

export type InquiryType = 'enquiry' | 'order' | 'bespoke' | 'contact';
export type InquiryChannel = 'whatsapp' | 'form';
export type InquiryStatus = 'new' | 'contacted' | 'converted' | 'closed';

export interface Inquiry {
  id: string;
  type: InquiryType;
  channel: InquiryChannel;
  status: InquiryStatus;
  productId?: string;
  productName?: string;
  sku?: string;
  color?: string;
  size?: string;
  measurements?: Measurements;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  occasionDate?: string;
  message?: string;
  pageUrl?: string;
  uid?: string | null;
  createdAt: number;
  updatedAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
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
  sku?: string;
  measurements?: Measurements;
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
