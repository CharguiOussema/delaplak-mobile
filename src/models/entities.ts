import { LANGUAGES, ORDER_STATUS, USER_ROLES } from './consts';

export type I18nText = {
  en: string;
  fr: string;
  ar: string;
};

export type User = {
  _id: string;
  email: string;
  role: USER_ROLES;
  isActive: boolean;
  preferredLanguage: LANGUAGES;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  _id: string;
  name: I18nText;
  description?: I18nText;
  slug: string;
  parent: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[];
};

export type AttributeOption = {
  _id: string;
  name: I18nText;
};

// Admin-managed vocabulary (e.g. Texture, Thickness, Dimensions). Carries no price — the
// price impact of an option is product-specific, see Product.attributeOptions below.
export type ProductAttribute = {
  _id: string;
  name: I18nText;
  slug: string;
  options: AttributeOption[];
  createdAt: string;
  updatedAt: string;
};

// One entry per option this product offers, with the price it adds (or, if negative,
// subtracts) when a client selects it. `attribute` is populated by the API.
export type ProductAttributeSelection = {
  attribute: ProductAttribute | string;
  option: string;
  priceAdjustment: number;
};

export type Product = {
  _id: string;
  name: I18nText;
  description: I18nText;
  images: string[];
  price: number;
  currency: string;
  attributeOptions: ProductAttributeSelection[];
  applicationDomains: string[];
  categories: (string | Category)[];
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type SelectedOption = {
  attribute: string;
  option: string;
};

export type CartItem = {
  _id: string;
  product: Product | string;
  quantity: number;
  selectedOptions: SelectedOption[];
  // Computed by the API (base price + matching attributeOptions adjustments); not stored.
  unitPrice: number;
};

export type Cart = {
  _id: string;
  client: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrderItemSelectedOption = {
  attributeName: I18nText;
  optionName: I18nText;
  priceAdjustment: number;
};

export type OrderItem = {
  product: string;
  name: I18nText;
  price: number;
  currency: string;
  quantity: number;
  selectedOptions: OrderItemSelectedOption[];
};

export type Order = {
  _id: string;
  client: string | User;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: ORDER_STATUS;
  confirmedBy: string | User | null;
  confirmedAt: string | null;
  cancelledBy: string | User | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceLine = {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Invoice = {
  _id: string;
  order: string | Order;
  client: string | User;
  number: string;
  lines: InvoiceLine[];
  subtotal: number;
  total: number;
  currency: string;
  pdfPath: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
