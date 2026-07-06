import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    default: 'g',
  },
});

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a recipe title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a recipe description'],
    },
    ingredients: [ingredientSchema],
    instructions: {
      type: [String],
      required: [true, 'Please add step-by-step instructions'],
    },
    cookingTime: {
      type: Number, // in minutes
      required: [true, 'Please add cooking time'],
      min: [1, 'Cooking time must be at least 1 minute'],
    },
    image: {
      type: String,
      default: '',
    },
    nutritionFacts: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means created by system/admin
    },
    isSystemRecipe: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
recipeSchema.index({ title: 'text', description: 'text' });

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;
