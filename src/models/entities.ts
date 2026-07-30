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

export type Product = {
  _id: string;
  name: I18nText;
  description: I18nText;
  images: string[];
  price: number;
  currency: string;
  dimensions: string;
  thickness: string;
  texture: string;
  applicationDomains: string[];
  categories: (string | Category)[];
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  product: Product | string;
  quantity: number;
};

export type Cart = {
  _id: string;
  client: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  product: string;
  name: I18nText;
  price: number;
  currency: string;
  quantity: number;
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
