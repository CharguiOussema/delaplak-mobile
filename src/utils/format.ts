import type { Language } from '../contexts/AppContext';
import type { CartItem, I18nText, Product, ProductAttribute } from '../models';

export function pickI18nText(value: I18nText | undefined | null, language: Language): string {
  if (!value) return '';
  return value[language] || value.en || '';
}

// Selected options only carry (attribute, option) ids — their display names live on the
// populated product.attributeOptions[].attribute (a ProductAttribute doc with its options).
export function describeSelectedOptions(item: CartItem & { product: Product }, language: Language): string[] {
  return item.selectedOptions.map((selection) => {
    const configured = item.product.attributeOptions.find(
      (entry) => (typeof entry.attribute === 'string' ? entry.attribute : entry.attribute._id) === selection.attribute,
    );
    const attribute = typeof configured?.attribute === 'object' ? (configured.attribute as ProductAttribute) : undefined;
    const option = attribute?.options.find((o) => o._id === selection.option);
    return option ? pickI18nText(option.name, language) : selection.option;
  });
}

export function formatCurrency(amount: number, currency = 'MAD'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatDate(value: string | Date, locale = 'en-US'): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

export function formatDateTime(value: string | Date, locale = 'en-US'): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
