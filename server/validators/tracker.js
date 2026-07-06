import { z } from 'zod';

export const logFoodSchema = z.object({
  foodId: z.string().optional(), // Reference to Food model, optional
  name: z.string().min(1, 'Food name is required').trim(),
  calories: z.number().nonnegative('Calories cannot be negative'),
  protein: z.number().nonnegative('Protein cannot be negative').default(0),
  carbs: z.number().nonnegative('Carbohydrates cannot be negative').default(0),
  fat: z.number().nonnegative('Fat cannot be negative').default(0),
  fiber: z.number().nonnegative('Fiber cannot be negative').default(0),
  sugar: z.number().nonnegative('Sugar cannot be negative').default(0),
  sodium: z.number().nonnegative('Sodium cannot be negative').default(0),
  servingSize: z.number().positive('Serving size must be positive').default(100),
  servingUnit: z.string().default('g'),
  servingCount: z.number().positive('Serving count must be positive'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
});

export const logWaterSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
});

export const foodItemSchema = z.object({
  name: z.string().min(1, 'Food name is required').trim(),
  calories: z.number().nonnegative('Calories cannot be negative'),
  protein: z.number().nonnegative('Protein cannot be negative').default(0),
  carbs: z.number().nonnegative('Carbs cannot be negative').default(0),
  fat: z.number().nonnegative('Fat cannot be negative').default(0),
  fiber: z.number().nonnegative('Fiber cannot be negative').default(0),
  sugar: z.number().nonnegative('Sugar cannot be negative').default(0),
  sodium: z.number().nonnegative('Sodium cannot be negative').default(0),
  servingSize: z.number().positive('Serving size must be positive').default(100),
  servingUnit: z.string().default('g'),
});
