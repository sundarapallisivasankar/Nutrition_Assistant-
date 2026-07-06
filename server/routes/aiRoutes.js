import express from 'express';
import { getAIChatResponse } from '../services/gemini.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @desc    Query the AI Nutrition Assistant
// @route   POST /api/ai/chat
// @access  Private
router.post('/chat', async (req, res, next) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    const reply = await getAIChatResponse(message, history || []);

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
