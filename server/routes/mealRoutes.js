import express from 'express';
import {
  getPlannedMeals,
  createPlannedMeal,
  deletePlannedMeal,
} from '../controllers/mealController.js';
import { protect } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getPlannedMeals);
router.post('/', uploadImage('image'), createPlannedMeal);
router.delete('/:id', deletePlannedMeal);

export default router;
