import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a food name'],
      trim: true,
    },
    calories: {
      type: Number,
      required: [true, 'Please add calories'],
      min: [0, 'Calories cannot be negative'],
    },
    protein: {
      type: Number,
      required: [true, 'Please add protein'],
      min: [0, 'Protein cannot be negative'],
      default: 0,
    },
    carbs: {
      type: Number,
      required: [true, 'Please add carbs'],
      min: [0, 'Carbs cannot be negative'],
      default: 0,
    },
    fat: {
      type: Number,
      required: [true, 'Please add fat'],
      min: [0, 'Fat cannot be negative'],
      default: 0,
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
    sodium: {
      type: Number,
      default: 0,
      min: [0, 'Sodium cannot be negative'],
    },
    servingSize: {
      type: Number,
      default: 100,
    },
    servingUnit: {
      type: String,
      default: 'g',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means standard food provided by the system
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search functionality
foodSchema.index({ name: 'text' });

const Food = mongoose.model('Food', foodSchema);
export default Food;
