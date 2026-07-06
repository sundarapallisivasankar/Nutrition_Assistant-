import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Food from '../models/Food.js';
import Recipe from '../models/Recipe.js';
import Settings from '../models/Settings.js';

dotenv.config();

const usersData = [
  {
    name: 'Admin User',
    email: 'admin@assistant.com',
    password: 'admin123',
    role: 'admin',
    age: 30,
    gender: 'female',
    height: 165,
    weight: 60,
    goal: 'maintain_weight',
    activityLevel: 'moderately_active',
  },
  {
    name: 'John Doe',
    email: 'user@assistant.com',
    password: 'user123',
    role: 'user',
    age: 28,
    gender: 'male',
    height: 178,
    weight: 80,
    goal: 'lose_weight',
    activityLevel: 'lightly_active',
    dailyCalorieGoal: 2000,
    dailyWaterGoal: 2500,
  },
];

const foodsData = [
  { name: 'Apple (with skin)', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1, servingSize: 100, servingUnit: 'g' },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1, servingSize: 100, servingUnit: 'g' },
  { name: 'Whole Egg (Boiled)', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124, servingSize: 100, servingUnit: 'g' },
  { name: 'Chicken Breast (Grilled)', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, servingSize: 100, servingUnit: 'g' },
  { name: 'Salmon (Cooked)', calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 61, servingSize: 100, servingUnit: 'g' },
  { name: 'White Rice (Cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1, servingSize: 100, servingUnit: 'g' },
  { name: 'Brown Rice (Cooked)', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.1, sodium: 5, servingSize: 100, servingUnit: 'g' },
  { name: 'Whole Wheat Bread (1 slice)', calories: 69, protein: 3.6, carbs: 12, fat: 0.9, fiber: 1.9, sugar: 1.4, sodium: 148, servingSize: 30, servingUnit: 'g' },
  { name: 'Broccoli (Steamed)', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3, sugar: 1.4, sodium: 41, servingSize: 100, servingUnit: 'g' },
  { name: 'Greek Yogurt (Plain, Low Fat)', calories: 73, protein: 10, carbs: 3.6, fat: 2, fiber: 0, sugar: 3.6, sodium: 36, servingSize: 100, servingUnit: 'g' },
  { name: 'Peanut Butter (Smooth)', calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, sugar: 9, sodium: 429, servingSize: 100, servingUnit: 'g' },
  { name: 'Rolled Oats (Raw)', calories: 379, protein: 13, carbs: 68, fat: 6.5, fiber: 10, sugar: 1, sodium: 2, servingSize: 100, servingUnit: 'g' },
  { name: 'Almond Milk (Unsweetened)', calories: 15, protein: 0.6, carbs: 0.6, fat: 1.1, fiber: 0.2, sugar: 0, sodium: 70, servingSize: 100, servingUnit: 'ml' },
  { name: 'Mixed Berries (Frozen)', calories: 50, protein: 1, carbs: 12, fat: 0.5, fiber: 3, sugar: 7, sodium: 1, servingSize: 100, servingUnit: 'g' },
];

const recipesData = [
  {
    title: 'Protein-Packed Oatmeal Berry Bowl',
    description: 'A comforting, warm oatmeal bowl packed with berries, chia seeds, and vanilla protein powder. Perfect for morning energy.',
    ingredients: [
      { name: 'Rolled Oats', amount: 50, unit: 'g' },
      { name: 'Unsweetened Almond Milk', amount: 250, unit: 'ml' },
      { name: 'Greek Yogurt', amount: 50, unit: 'g' },
      { name: 'Mixed Berries', amount: 50, unit: 'g' },
      { name: 'Peanut Butter', amount: 15, unit: 'g' },
    ],
    instructions: [
      'In a saucepan, combine rolled oats and almond milk over medium heat.',
      'Simmer for 5-6 minutes, stirring occasionally, until oats are creamy.',
      'Pour cooked oats into a serving bowl and stir in the Greek yogurt.',
      'Top with mixed berries and a drizzle of peanut butter.',
      'Serve warm immediately.'
    ],
    cookingTime: 10,
    image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=500&auto=format&fit=crop&q=60',
    nutritionFacts: { calories: 380, protein: 18, carbs: 49, fat: 12, fiber: 8 },
    isSystemRecipe: true,
  },
  {
    title: 'Lemon Herb Grilled Chicken Salad',
    description: 'Fresh romaine lettuce topped with juicy sliced grilled chicken breast, cucumbers, cherry tomatoes, and a light lemon olive oil dressing.',
    ingredients: [
      { name: 'Chicken Breast', amount: 150, unit: 'g' },
      { name: 'Romaine Lettuce', amount: 100, unit: 'g' },
      { name: 'Cherry Tomatoes', amount: 50, unit: 'g' },
      { name: 'Cucumber', amount: 50, unit: 'g' },
      { name: 'Olive Oil', amount: 10, unit: 'ml' },
    ],
    instructions: [
      'Season chicken breast with salt, black pepper, and dried oregano.',
      'Heat a grill pan or skillet over medium-high heat. Cook chicken for 6-7 minutes on each side until fully cooked.',
      'Let chicken rest for 3 minutes, then slice thinly.',
      'Chop romaine lettuce and dice cherry tomatoes and cucumber.',
      'Combine veggies in a large bowl, top with sliced chicken, and drizzle with olive oil and a squeeze of fresh lemon.'
    ],
    cookingTime: 20,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
    nutritionFacts: { calories: 360, protein: 48, carbs: 8, fat: 15, fiber: 3 },
    isSystemRecipe: true,
  },
  {
    title: 'Garlic Herb Baked Salmon & Broccoli',
    description: 'Flaky baked salmon fillet served with tender steamed garlic broccoli and a side of brown rice.',
    ingredients: [
      { name: 'Salmon', amount: 150, unit: 'g' },
      { name: 'Broccoli', amount: 120, unit: 'g' },
      { name: 'Brown Rice', amount: 100, unit: 'g' },
      { name: 'Olive Oil', amount: 5, unit: 'ml' },
    ],
    instructions: [
      'Preheat oven to 400°F (200°C). Line a baking sheet with foil.',
      'Place salmon fillet on the sheet, brush with olive oil, and season with garlic powder, dill, salt, and pepper.',
      'Bake salmon for 12-15 minutes until flaky.',
      'While salmon is baking, steam broccoli florets for 5 minutes until tender.',
      'Serve salmon and broccoli hot alongside pre-cooked warm brown rice.'
    ],
    cookingTime: 20,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=60',
    nutritionFacts: { calories: 510, protein: 38, carbs: 32, fat: 21, fiber: 5 },
    isSystemRecipe: true,
  },
  {
    title: 'Avocado Toast with Boiled Egg',
    description: 'Crispy whole wheat toast smeared with creamy mashed avocado, sliced hard-boiled eggs, and chili flakes.',
    ingredients: [
      { name: 'Whole Wheat Bread', amount: 60, unit: 'g' },
      { name: 'Avocado', amount: 60, unit: 'g' },
      { name: 'Whole Egg', amount: 50, unit: 'g' },
    ],
    instructions: [
      'Boil the egg in hot water for 8-9 minutes, cool, peel, and slice.',
      'Toast two slices of whole wheat bread until crisp.',
      'Mash avocado flesh with a pinch of salt, pepper, and a drop of lemon juice.',
      'Spread avocado evenly over toasts and layer egg slices on top.',
      'Garnish with red pepper flakes and serve.'
    ],
    cookingTime: 10,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60',
    nutritionFacts: { calories: 310, protein: 12, carbs: 28, fat: 16, fiber: 7 },
    isSystemRecipe: true,
  },
];

const seedDB = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected.');

    // Clear DB
    console.log('Wiping database collections...');
    await User.deleteMany({});
    await Food.deleteMany({});
    await Recipe.deleteMany({});
    await Settings.deleteMany({});
    console.log('Database wiped.');

    // Seed Users
    console.log('Seeding user profiles...');
    const createdUsers = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);

      // Create default settings for each user
      await Settings.create({ user: user._id });
    }
    console.log(`Successfully seeded ${createdUsers.length} users.`);

    // Seed Foods
    console.log('Seeding standard foods...');
    await Food.insertMany(foodsData);
    console.log(`Successfully seeded ${foodsData.length} food catalog items.`);

    // Seed Recipes
    console.log('Seeding standard recipes...');
    await Recipe.insertMany(recipesData);
    console.log(`Successfully seeded ${recipesData.length} recipes.`);

    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDB();
