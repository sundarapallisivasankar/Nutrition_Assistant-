import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    age: {
      type: Number,
      default: 25,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    height: {
      type: Number, // in cm
      default: 170,
    },
    weight: {
      type: Number, // in kg
      default: 70,
    },
    goal: {
      type: String,
      enum: ['lose_weight', 'gain_weight', 'maintain_weight', 'build_muscle'],
      default: 'maintain_weight',
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
      default: 'sedentary',
    },
    dietPreference: {
      type: String,
      enum: ['standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'low_carb'],
      default: 'standard',
    },
    medicalConditions: {
      type: [String],
      default: [],
    },
    foodAllergies: {
      type: [String],
      default: [],
    },
    dailyCalorieGoal: {
      type: Number,
      default: 2000,
    },
    dailyWaterGoal: {
      type: Number, // in ml
      default: 2500,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
