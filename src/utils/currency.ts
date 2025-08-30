export const formatCurrency = (amount: number, locale: string = 'ky-KG'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'KGS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number, locale: string = 'ky-KG'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

export const calculateTax = (amount: number, taxRate: number = 0.12): number => {
  return amount * taxRate;
};

export const calculateVAT = (amount: number, vatRate: number = 0.12): number => {
  return amount * vatRate;
};