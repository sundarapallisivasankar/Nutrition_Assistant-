import Meal from '../models/Meal.js';
import { ErrorResponse } from '../middleware/error.js';

// @desc    Get user planned meals
// @route   GET /api/meals
// @access  Private
export const getPlannedMeals = async (req, res, next) => {
  try {
    const meals = await Meal.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: meals.length,
      data: meals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add meal to planner
// @route   POST /api/meals
// @access  Private
export const createPlannedMeal = async (req, res, next) => {
  try {
    const mealData = {
      ...req.body,
      user: req.user.id,
    };

    if (req.fileUrl) {
      mealData.image = req.fileUrl;
    }

    const meal = await Meal.create(mealData);

    res.status(201).json({
      success: true,
      message: 'Meal planned successfully',
      data: meal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove planned meal
// @route   DELETE /api/meals/:id
// @access  Private
export const deletePlannedMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user.id });

    if (!meal) {
      return next(new ErrorResponse('Planned meal not found', 404));
    }

    await meal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Planned meal removed',
    });
  } catch (error) {
    next(error);
  }
};
