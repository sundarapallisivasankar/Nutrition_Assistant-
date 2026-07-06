import NutritionLog from '../models/NutritionLog.js';
import WaterLog from '../models/WaterLog.js';
import User from '../models/User.js';
import Food from '../models/Food.js';
import { ErrorResponse } from '../middleware/error.js';

// Helper to get formatted YYYY-MM-DD date in UTC/local boundary
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Log water intake
// @route   POST /api/tracker/water
// @access  Private
export const logWater = async (req, res, next) => {
  const { amount } = req.body;
  const date = req.body.date || getTodayDateString();

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    let log = await WaterLog.findOne({ user: req.user.id, date });

    if (!log) {
      log = new WaterLog({
        user: req.user.id,
        date,
        goal: user.dailyWaterGoal,
        entries: [],
      });
    }

    log.entries.push({ amount });
    await log.save();

    res.status(200).json({
      success: true,
      message: `${amount}ml water logged successfully`,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get water log for a date
// @route   GET /api/tracker/water/:date?
// @access  Private
export const getWaterLog = async (req, res, next) => {
  const date = req.params.date || getTodayDateString();

  try {
    let log = await WaterLog.findOne({ user: req.user.id, date });

    if (!log) {
      const user = await User.findById(req.user.id);
      // Return a clean empty state log structure
      return res.status(200).json({
        success: true,
        data: {
          user: req.user.id,
          date,
          amount: 0,
          goal: user ? user.dailyWaterGoal : 2500,
          entries: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom water log entry
// @route   DELETE /api/tracker/water/entry/:logId/:entryId
// @access  Private
export const deleteWaterEntry = async (req, res, next) => {
  const { logId, entryId } = req.params;

  try {
    const log = await WaterLog.findOne({ _id: logId, user: req.user.id });

    if (!log) {
      return next(new ErrorResponse('Water log not found', 404));
    }

    log.entries = log.entries.filter((entry) => entry._id.toString() !== entryId);
    await log.save();

    res.status(200).json({
      success: true,
      message: 'Water log entry removed',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log food consumption
// @route   POST /api/tracker/food
// @access  Private
export const logFood = async (req, res, next) => {
  const {
    name,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
    servingSize,
    servingUnit,
    servingCount,
    mealType,
  } = req.body;

  const date = req.body.date || getTodayDateString();

  try {
    let log = await NutritionLog.findOne({ user: req.user.id, date });

    if (!log) {
      log = new NutritionLog({
        user: req.user.id,
        date,
        meals: [],
      });
    }

    log.meals.push({
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      servingSize,
      servingUnit,
      servingCount,
      mealType,
    });

    await log.save();

    res.status(200).json({
      success: true,
      message: 'Food logged successfully',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nutrition log for a date
// @route   GET /api/tracker/food/:date?
// @access  Private
export const getNutritionLog = async (req, res, next) => {
  const date = req.params.date || getTodayDateString();

  try {
    let log = await NutritionLog.findOne({ user: req.user.id, date });

    if (!log) {
      return res.status(200).json({
        success: true,
        data: {
          user: req.user.id,
          date,
          meals: [],
          totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
        },
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove food item from log
// @route   DELETE /api/tracker/food/:logId/:mealId
// @access  Private
export const removeFoodFromLog = async (req, res, next) => {
  const { logId, mealId } = req.params;

  try {
    const log = await NutritionLog.findOne({ _id: logId, user: req.user.id });

    if (!log) {
      return next(new ErrorResponse('Nutrition log not found', 404));
    }

    log.meals = log.meals.filter((m) => m._id.toString() !== mealId);
    await log.save();

    res.status(200).json({
      success: true,
      message: 'Logged food item removed',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary stats for Dashboard (Daily progress + charts data)
// @route   GET /api/tracker/dashboard
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  const date = getTodayDateString();

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Today's Logs
    let nutLog = await NutritionLog.findOne({ user: req.user.id, date });
    let waterLog = await WaterLog.findOne({ user: req.user.id, date });

    // Aggregated details
    const caloriesToday = nutLog ? nutLog.totalNutrition.calories : 0;
    const proteinToday = nutLog ? nutLog.totalNutrition.protein : 0;
    const carbsToday = nutLog ? nutLog.totalNutrition.carbs : 0;
    const fatToday = nutLog ? nutLog.totalNutrition.fat : 0;
    const waterToday = waterLog ? waterLog.amount : 0;

    // BMI Calculations
    const heightM = user.height / 100;
    const bmiScore = user.weight && user.height ? Math.round((user.weight / (heightM * heightM)) * 10) / 10 : 0;
    let bmiCategory = 'Unknown';
    if (bmiScore > 0) {
      if (bmiScore < 18.5) bmiCategory = 'Underweight';
      else if (bmiScore < 25) bmiCategory = 'Normal';
      else if (bmiScore < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';
    }

    // Fetch food items for today's logs
    const todayMeals = nutLog ? nutLog.meals : [];

    // Weekly history (last 7 days including today)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const nL = await NutritionLog.findOne({ user: req.user.id, date: dateStr });
      const wL = await WaterLog.findOne({ user: req.user.id, date: dateStr });

      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      weeklyProgress.push({
        dayName: weekdayNames[d.getDay()],
        date: dateStr,
        calories: nL ? nL.totalNutrition.calories : 0,
        water: wL ? wL.amount : 0,
      });
    }

    // Dynamic Recommendations based on Goal
    const recommendations = [];
    if (user.goal === 'lose_weight') {
      recommendations.push(
        'Incorporate more leafy greens and water-rich foods into lunch to support satiety.',
        'Keep a small calorie deficit (~300-500 kcal) to lose fat safely while preserving lean tissue.',
        'Snack on raw carrots, celery with hummus, or plain non-fat Greek yogurt.'
      );
    } else if (user.goal === 'gain_weight' || user.goal === 'build_muscle') {
      recommendations.push(
        'Ensure you eat high-protein meals post-workout to support muscle recovery and growth.',
        'Incorporate healthy caloric fats like nuts, seeds, nut butters, and olive oil to meet surplus goals.',
        'Drink a whey/plant-based shake with oatmeal and bananas for an easy calorie boost.'
      );
    } else {
      recommendations.push(
        'Maintain a balanced macronutrient ratio: roughly 45% carbs, 30% fat, 25% protein.',
        'Aim to complete your daily water goal (2.5L) earlier in the afternoon to optimize hydration.',
        'Mix up your veggie options to ensure you obtain a broad spectrum of trace minerals.'
      );
    }

    // Generate recent activities feed
    const activities = [];
    if (waterLog && waterLog.entries.length > 0) {
      const lastW = waterLog.entries[waterLog.entries.length - 1];
      activities.push({
        id: `water-${lastW._id}`,
        type: 'water',
        message: `Logged ${lastW.amount}ml of water`,
        time: lastW.loggedAt,
      });
    }
    if (nutLog && nutLog.meals.length > 0) {
      const lastM = nutLog.meals[nutLog.meals.length - 1];
      activities.push({
        id: `food-${lastM._id}`,
        type: 'food',
        message: `Logged ${lastM.name} for ${lastM.mealType}`,
        time: lastM.loggedAt,
      });
    }
    if (activities.length === 0) {
      activities.push({
        id: 'welcome',
        type: 'system',
        message: 'Welcome to your Nutrition Assistant dashboard! Start logging your meals or water intake.',
        time: user.createdAt,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        nutritionGoal: {
          calories: user.dailyCalorieGoal,
          water: user.dailyWaterGoal,
          protein: Math.round(user.dailyCalorieGoal * 0.25 / 4), // 25% protein
          carbs: Math.round(user.dailyCalorieGoal * 0.45 / 4), // 45% carbs
          fat: Math.round(user.dailyCalorieGoal * 0.30 / 9), // 30% fat
        },
        today: {
          calories: caloriesToday,
          protein: proteinToday,
          carbs: carbsToday,
          fat: fatToday,
          water: waterToday,
        },
        bmi: {
          score: bmiScore,
          category: bmiCategory,
        },
        todayMeals,
        weeklyProgress,
        recommendations,
        recentActivities: activities,
      },
    });
  } catch (error) {
    next(error);
  }
};
