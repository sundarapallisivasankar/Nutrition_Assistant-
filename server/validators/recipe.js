import { z } from 'zod';

const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required').trim(),
  amount: z.number().positive('Amount must be positive'),
  unit: z.string().min(1, 'Unit is required').default('g'),
});

export const recipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').trim(),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string().min(1, 'Instruction step cannot be empty')).min(1, 'At least one instruction step is required'),
  cookingTime: z.number().positive('Cooking time must be a positive number'),
  image: z.string().optional(),
  nutritionFacts: z.object({
    calories: z.number().nonnegative().default(0),
    protein: z.number().nonnegative().default(0),
    carbs: z.number().nonnegative().default(0),
    fat: z.number().nonnegative().default(0),
    fiber: z.number().nonnegative().default(0),
  }).optional(),
});

export const updateRecipeSchema = recipeSchema.partial();
