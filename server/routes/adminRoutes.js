import express from 'express';
import {
  getAdminStats,
  getUsers,
  deleteUser,
  createSystemFood,
  updateSystemFood,
  deleteSystemFood,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { foodItemSchema } from '../validators/tracker.js';

const router = express.Router();

// Enforce protect and admin status across all routes
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

router.post('/foods', validate(foodItemSchema), createSystemFood);
router.put('/foods/:id', validate(foodItemSchema.partial()), updateSystemFood);
router.delete('/foods/:id', deleteSystemFood);

export default router;
