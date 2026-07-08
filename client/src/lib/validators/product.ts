/**
 * Product Validators
 * Validation functions cho products
 */

/**
 * Validate price (phải là số dương)
 */
export const isValidPrice = (price: number): boolean => {
  return !isNaN(price) && price >= 0;
};

/**
 * Validate quantity (phải là số nguyên dương)
 */
export const isValidQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity >= 0;
};

/**
 * Validate discount percentage (0-100)
 */
export const isValidDiscount = (discount: number): boolean => {
  return !isNaN(discount) && discount >= 0 && discount <= 100;
};

/**
 * Validate product name (không rỗng)
 */
export const isValidProductName = (name: string): boolean => {
  return Boolean(name && name.trim().length > 0);
};
