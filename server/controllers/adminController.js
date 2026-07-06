import User from '../models/User.js';
import Food from '../models/Food.js';
import Recipe from '../models/Recipe.js';
import NutritionLog from '../models/NutritionLog.js';
import WaterLog from '../models/WaterLog.js';
import Favorite from '../models/Favorite.js';
import Settings from '../models/Settings.js';
import Meal from '../models/Meal.js';
import { ErrorResponse } from '../middleware/error.js';

// @desc    Get admin panel overview stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalRecipes = await Recipe.countDocuments();
    const systemRecipes = await Recipe.countDocuments({ isSystemRecipe: true });
    const totalFoods = await Food.countDocuments({ creator: null });
    const activeLogsToday = await NutritionLog.countDocuments({
      date: new Date().toISOString().split('T')[0]
    });

    // Recent signups
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRecipes,
        systemRecipes,
        totalFoods,
        activeLogsToday,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user and cascade delete logs
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.role === 'admin') {
      return next(new ErrorResponse('Cannot delete admin accounts', 400));
    }

    // Cascade delete
    await user.deleteOne();
    await Settings.deleteOne({ user: userId });
    await Favorite.deleteMany({ user: userId });
    await NutritionLog.deleteMany({ user: userId });
    await WaterLog.deleteMany({ user: userId });
    await Meal.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create default system food
// @route   POST /api/admin/foods
// @access  Private/Admin
export const createSystemFood = async (req, res, next) => {
  try {
    // Force creator to null to represent system/default
    const foodData = { ...req.body, creator: null };
    const food = await Food.create(foodData);

    res.status(201).json({
      success: true,
      message: 'System food created successfully',
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system food
// @route   PUT /api/admin/foods/:id
// @access  Private/Admin
export const updateSystemFood = async (req, res, next) => {
  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      return next(new ErrorResponse('Food not found', 404));
    }

    // Ensure it is a system food
    if (food.creator !== null) {
      return next(new ErrorResponse('Not a system food', 400));
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'System food updated successfully',
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete system food
// @route   DELETE /api/admin/foods/:id
// @access  Private/Admin
export const deleteSystemFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return next(new ErrorResponse('Food not found', 404));
    }

    if (food.creator !== null) {
      return next(new ErrorResponse('Not authorized to delete user food items', 400));
    }

    await food.deleteOne();

    res.status(200).json({
      success: true,
      message: 'System food deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
