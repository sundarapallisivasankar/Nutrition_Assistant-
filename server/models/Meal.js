import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a meal name'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    calories: {
      type: Number,
      required: [true, 'Please add calories'],
      min: [0, 'Calories cannot be negative'],
    },
    protein: {
      type: Number,
      default: 0,
      min: [0, 'Protein cannot be negative'],
    },
    carbs: {
      type: Number,
      default: 0,
      min: [0, 'Carbs cannot be negative'],
    },
    fat: {
      type: Number,
      default: 0,
      min: [0, 'Fat cannot be negative'],
    },
    fiber: {
      type: Number,
      default: 0,
      min: [0, 'Fiber cannot be negative'],
    },
    sugar: {
      type: Number,
      default: 0,
      min: [0, 'Sugar cannot be negative'],
    },
    mealTime: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: [true, 'Please specify meal time (breakfast, lunch, dinner, snack)'],
    },
  },
  {
    timestamps: true,
  }
);

const Meal = mongoose.model('Meal', mealSchema);
export default Meal;
