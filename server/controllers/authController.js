import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { ErrorResponse } from '../middleware/error.js';

// Helper to generate access token
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

// Helper to generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    // Create user default settings
    await Settings.create({
      user: user._id,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        goal: user.goal,
        activityLevel: user.activityLevel,
        dietPreference: user.dietPreference,
        medicalConditions: user.medicalConditions,
        foodAllergies: user.foodAllergies,
        dailyCalorieGoal: user.dailyCalorieGoal,
        dailyWaterGoal: user.dailyWaterGoal,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        goal: user.goal,
        activityLevel: user.activityLevel,
        dietPreference: user.dietPreference,
        medicalConditions: user.medicalConditions,
        foodAllergies: user.foodAllergies,
        dailyCalorieGoal: user.dailyCalorieGoal,
        dailyWaterGoal: user.dailyWaterGoal,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ErrorResponse('Refresh token is required', 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return next(new ErrorResponse('Invalid refresh token', 401));
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Rotate refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(new ErrorResponse('Invalid refresh token', 401));
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // List of allowed fields to update
    const fieldsToUpdate = [
      'name',
      'age',
      'gender',
      'height',
      'weight',
      'goal',
      'activityLevel',
      'dietPreference',
      'medicalConditions',
      'foodAllergies',
      'dailyCalorieGoal',
      'dailyWaterGoal',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // If profilePhoto was uploaded via multer middleware, update URL
    if (req.fileUrl) {
      user.profilePhoto = req.fileUrl;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Temporary storage for password reset tokens (in-memory for demo / testing simplicity)
const resetTokens = new Map();

// @desc    Forgot Password Request
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse('No user found with that email', 404));
    }

    // Generate secure random reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    // Store in-memory map (expires in 15 mins)
    resetTokens.set(resetToken, {
      userId: user._id,
      expiresAt: Date.now() + 15 * 60 * 1000
    });

    // Log to console for development visibility
    console.log(`[PASSWORD RESET DEV LOG] Token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Password reset token generated. Check server console for code.',
      resetToken, // Returned in JSON response for sandbox convenience
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/resetpassword/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const tokenData = resetTokens.get(token);

  if (!tokenData || tokenData.expiresAt < Date.now()) {
    return next(new ErrorResponse('Invalid or expired reset token', 400));
  }

  try {
    const user = await User.findById(tokenData.userId);

    if (!user) {
      return next(new ErrorResponse('User not found', 440));
    }

    // Update password (pre-save hook hashes it automatically)
    user.password = password;
    await user.save();

    // Invalidate the reset token
    resetTokens.delete(token);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now login.',
    });
  } catch (error) {
    next(error);
  }
};
