import express from 'express';
import {
  logWater,
  getWaterLog,
  deleteWaterEntry,
  logFood,
  getNutritionLog,
  removeFoodFromLog,
  getDashboardStats,
} from '../controllers/trackerController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { logWaterSchema, logFoodSchema } from '../validators/tracker.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.get('/dashboard', getDashboardStats);

router.post('/water', validate(logWaterSchema), logWater);
router.get('/water/:date?', getWaterLog);
router.delete('/water/entry/:logId/:entryId', deleteWaterEntry);

router.post('/food', validate(logFoodSchema), logFood);
router.get('/food/:date?', getNutritionLog);
router.delete('/food/:logId/:mealId', removeFoodFromLog);

export default router;
