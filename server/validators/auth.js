import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Please provide a valid email').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email').trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  age: z.number().int().min(1).max(120).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  height: z.number().min(30).max(300).optional(),
  weight: z.number().min(10).max(500).optional(),
  goal: z.enum(['lose_weight', 'gain_weight', 'maintain_weight', 'build_muscle']).optional(),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']).optional(),
  dietPreference: z.enum(['standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'low_carb']).optional(),
  medicalConditions: z.array(z.string()).optional(),
  foodAllergies: z.array(z.string()).optional(),
  dailyCalorieGoal: z.number().min(500).max(10000).optional(),
  dailyWaterGoal: z.number().min(500).max(10000).optional(),
});
