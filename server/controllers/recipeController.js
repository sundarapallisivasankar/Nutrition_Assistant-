import Recipe from '../models/Recipe.js';
import Favorite from '../models/Favorite.js';
import { ErrorResponse } from '../middleware/error.js';

// @desc    Get all recipes (search, filter, paginate)
// @route   GET /api/recipes
// @access  Public
export const getRecipes = async (req, res, next) => {
  const { search, mealType, maxTime, maxCalories, page = 1, limit = 9 } = req.query;

  try {
    const query = {};

    // 1. Full text search or regex search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Meal type filter (via instructions/description tags or we could filter ingredients, let's filter description/title for standard meal types if we want, or match it. We'll search description or check if there is a meal tag)
    if (mealType) {
      query.description = { $regex: mealType, $options: 'i' };
    }

    // 3. Max cooking time filter
    if (maxTime) {
      query.cookingTime = { $lte: parseInt(maxTime) };
    }

    // 4. Max calories filter
    if (maxCalories) {
      query['nutritionFacts.calories'] = { $lte: parseInt(maxCalories) };
    }

    // Pagination configuration
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Recipe.countDocuments(query);
    const recipes = await Recipe.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: recipes.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: recipes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recipe details
// @route   GET /api/recipes/:id
// @access  Public
export const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return next(new ErrorResponse('Recipe not found', 404));
    }

    // Check if user is authenticated and has favorited this recipe
    let isFavorited = false;
    if (req.headers.authorization) {
      // Decode JWT token safely if exists
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const fav = await Favorite.findOne({ user: decoded.id, recipe: recipe._id });
        if (fav) isFavorited = true;
      } catch (err) {
        // Continue if token verify fails, it's just public details
      }
    }

    res.status(200).json({
      success: true,
      data: recipe,
      isFavorited,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create custom recipe
// @route   POST /api/recipes
// @access  Private
export const createRecipe = async (req, res, next) => {
  try {
    const recipeData = { ...req.body };
    recipeData.creator = req.user.id;

    // Handle parsed lists if sent as JSON strings or raw arrays
    if (typeof recipeData.ingredients === 'string') {
      recipeData.ingredients = JSON.parse(recipeData.ingredients);
    }
    if (typeof recipeData.instructions === 'string') {
      recipeData.instructions = JSON.parse(recipeData.instructions);
    }
    if (typeof recipeData.nutritionFacts === 'string') {
      recipeData.nutritionFacts = JSON.parse(recipeData.nutritionFacts);
    }

    // Check if image uploaded via Multer
    if (req.fileUrl) {
      recipeData.image = req.fileUrl;
    }

    // Mark as system recipe if user is admin
    if (req.user.role === 'admin') {
      recipeData.isSystemRecipe = true;
      recipeData.creator = null; // System owned
    }

    const recipe = await Recipe.create(recipeData);

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recipe details
// @route   PUT /api/recipes/:id
// @access  Private
export const updateRecipe = async (req, res, next) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return next(new ErrorResponse('Recipe not found', 404));
    }

    // Make sure recipe creator is the user (or admin)
    if (recipe.creator && recipe.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to edit this recipe', 403));
    }

    const recipeData = { ...req.body };

    // Parse structures if uploaded as form-data string
    if (typeof recipeData.ingredients === 'string') {
      recipeData.ingredients = JSON.parse(recipeData.ingredients);
    }
    if (typeof recipeData.instructions === 'string') {
      recipeData.instructions = JSON.parse(recipeData.instructions);
    }
    if (typeof recipeData.nutritionFacts === 'string') {
      recipeData.nutritionFacts = JSON.parse(recipeData.nutritionFacts);
    }

    if (req.fileUrl) {
      recipeData.image = req.fileUrl;
    }

    recipe = await Recipe.findByIdAndUpdate(req.params.id, recipeData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully',
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom recipe
// @route   DELETE /api/recipes/:id
// @access  Private
export const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return next(new ErrorResponse('Recipe not found', 404));
    }

    // Make sure creator is user, or user is admin
    if (recipe.creator && recipe.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this recipe', 403));
    }

    await recipe.deleteOne();
    // Also clean up favorites linked to this recipe
    await Favorite.deleteMany({ recipe: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Recipe favorite status
// @route   POST /api/recipes/favorite/:id
// @access  Private
export const toggleFavorite = async (req, res, next) => {
  const recipeId = req.params.id;

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return next(new ErrorResponse('Recipe not found', 404));
    }

    const alreadyFavorited = await Favorite.findOne({
      user: req.user.id,
      recipe: recipeId,
    });

    if (alreadyFavorited) {
      await alreadyFavorited.deleteOne();
      res.status(200).json({
        success: true,
        message: 'Recipe removed from favorites',
        isFavorited: false,
      });
    } else {
      await Favorite.create({
        user: req.user.id,
        recipe: recipeId,
      });
      res.status(200).json({
        success: true,
        message: 'Recipe added to favorites',
        isFavorited: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user favorite recipes
// @route   GET /api/recipes/my/favorites
// @access  Private
export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).populate('recipe');
    
    // Extract populated recipe objects
    const recipes = favorites
      .filter((fav) => fav.recipe !== null)
      .map((fav) => fav.recipe);

    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes,
    });
  } catch (error) {
    next(error);
  }
};
