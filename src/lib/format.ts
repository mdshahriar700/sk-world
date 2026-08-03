export const formatPrice = (price: number): string => {
  if (isNaN(price) || price === null || price === undefined) return '৳ 0';
  return `৳ ${Math.round(price).toLocaleString('en-BD')}`;
};
