import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadImage } from '../middleware/upload.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/auth.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// Profile photo upload + stats update
router.put('/profile', protect, uploadImage('profilePhoto'), validate(updateProfileSchema), updateProfile);

router.post('/forgotpassword', validate(forgotPasswordSchema), forgotPassword);
router.post('/resetpassword/:token', validate(resetPasswordSchema), resetPassword);

export default router;
