import express from 'express';
import Food from '../models/Food.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { foodItemSchema } from '../validators/tracker.js';

const router = express.Router();

router.use(protect);

// @desc    Search and get food items
// @route   GET /api/foods
// @access  Private
router.get('/', async (req, res, next) => {
  const { search } = req.query;

  try {
    let query = {
      // Find food items created by system (null) or this user
      $or: [{ creator: null }, { creator: req.user.id }],
    };

    if (search) {
      query = {
        ...query,
        name: { $regex: search, $options: 'i' },
      };
    }

    const foods = await Food.find(query).limit(20);

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create user-defined food item
// @route   POST /api/foods
// @access  Private
router.post('/', validate(foodItemSchema), async (req, res, next) => {
  try {
    const food = await Food.create({
      ...req.body,
      creator: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Custom food item created successfully',
      data: food,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
