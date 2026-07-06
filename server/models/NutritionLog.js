import mongoose from 'mongoose';

const loggedFoodSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  protein: {
    type: Number,
    default: 0,
  },
  carbs: {
    type: Number,
    default: 0,
  },
  fat: {
    type: Number,
    default: 0,
  },
  fiber: {
    type: Number,
    default: 0,
  },
  sugar: {
    type: Number,
    default: 0,
  },
  sodium: {
    type: Number,
    default: 0,
  },
  servingSize: {
    type: Number,
    default: 100,
  },
  servingUnit: {
    type: String,
    default: 'g',
  },
  servingCount: {
    type: Number,
    required: true,
    min: [0.01, 'Serving count must be greater than 0'],
    default: 1,
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
});

const nutritionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // format: YYYY-MM-DD
      required: true,
    },
    meals: [loggedFoodSchema],
    totalNutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user has only one log document per date
nutritionLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Pre-save hook to recalculate totalNutrition based on logged meals
nutritionLogSchema.pre('save', function (next) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
  
  this.meals.forEach((meal) => {
    totals.calories += meal.calories * meal.servingCount;
    totals.protein += meal.protein * meal.servingCount;
    totals.carbs += meal.carbs * meal.servingCount;
    totals.fat += meal.fat * meal.servingCount;
    totals.fiber += meal.fiber * meal.servingCount;
    totals.sugar += meal.sugar * meal.servingCount;
    totals.sodium += meal.sodium * meal.servingCount;
  });

  // Round values to 1 decimal place
  this.totalNutrition = {
    calories: Math.round(totals.calories * 10) / 10,
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    fiber: Math.round(totals.fiber * 10) / 10,
    sugar: Math.round(totals.sugar * 10) / 10,
    sodium: Math.round(totals.sodium * 10) / 10,
  };

  next();
});

const NutritionLog = mongoose.model('NutritionLog', nutritionLogSchema);
export default NutritionLog;
