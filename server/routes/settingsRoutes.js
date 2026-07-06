import express from 'express';
import Settings from '../models/Settings.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id });

    if (!settings) {
      settings = await Settings.create({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
router.put('/', async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id });

    if (!settings) {
      settings = new Settings({ user: req.user.id });
    }

    const { darkMode, notifications, reminderInterval, unitSystem } = req.body;

    if (darkMode !== undefined) settings.darkMode = darkMode;
    if (notifications !== undefined) settings.notifications = notifications;
    if (reminderInterval !== undefined) settings.reminderInterval = reminderInterval;
    if (unitSystem !== undefined) settings.unitSystem = unitSystem;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
