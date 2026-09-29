export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 50;

export const calcShipping = (itemsPrice) =>
  itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;