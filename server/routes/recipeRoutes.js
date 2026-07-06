import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  getFavorites,
} from '../controllers/recipeController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadImage } from '../middleware/upload.js';
import { recipeSchema, updateRecipeSchema } from '../validators/recipe.js';

const router = express.Router();

router.get('/', getRecipes);
router.get('/my/favorites', protect, getFavorites);
router.get('/:id', getRecipeById);

// Recipe CRUD with picture upload support
router.post('/', protect, uploadImage('image'), validate(recipeSchema), createRecipe);
router.put('/:id', protect, uploadImage('image'), validate(updateRecipeSchema), updateRecipe);
router.delete('/:id', protect, deleteRecipe);

router.post('/favorite/:id', protect, toggleFavorite);

export default router;
