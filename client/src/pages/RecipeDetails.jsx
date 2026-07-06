import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { Clock, Flame, Heart, ChevronLeft, Loader2, Play, Pause, RotateCcw, Check, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../layouts/AppLayout';

const RecipeDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // Checklist state
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());

  // Interactive Cooking Timer States
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(0);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await api.get(`/recipes/${id}`);
        if (response.data.success) {
          setRecipe(response.data.data);
          setIsFavorited(response.data.isFavorited);
          
          // Set timer to cookingTime * 60 seconds
          const secs = response.data.data.cookingTime * 60;
          setTimerSeconds(secs);
          setInitialSeconds(secs);
        }
      } catch (error) {
        console.error(error);
        showNotification('Recipe not found.', 'error');
        navigate('/recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id, showNotification, navigate]);

  // Timer Hook
  useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      showNotification('Timer completed! Enjoy your meal!', 'success');
      
      // Play a simple alert chime if available
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav');
        audio.play();
      } catch (err) {}
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, showNotification]);

  const handleToggleFavorite = async () => {
    try {
      const response = await api.post(`/recipes/favorite/${id}`);
      if (response.data.success) {
        setIsFavorited(response.data.isFavorited);
        showNotification(response.data.message, 'success');
      }
    } catch (error) {
      showNotification('Unable to bookmark recipe.', 'error');
    }
  };

  const handleToggleIngredient = (name) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(name)) {
      newChecked.delete(name);
    } else {
      newChecked.add(name);
    }
    setCheckedIngredients(newChecked);
  };

  const handleLogRecipeAsMeal = async (mealType) => {
    if (!recipe) return;
    try {
      const response = await api.post('/tracker/food', {
        name: recipe.title,
        calories: recipe.nutritionFacts.calories,
        protein: recipe.nutritionFacts.protein,
        carbs: recipe.nutritionFacts.carbs,
        fat: recipe.nutritionFacts.fat,
        servingCount: 1,
        mealType,
      });

      if (response.data.success) {
        showNotification(`Logged "${recipe.title}" as ${mealType}!`, 'success');
        navigate('/tracker');
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to log recipe as meal.', 'error');
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          to="/recipes"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to recipes
        </Link>

        {/* Hero Details block */}
        <div className="relative rounded-3xl overflow-hidden aspect-video max-h-[350px] bg-slate-100 dark:bg-slate-950">
          {recipe?.image ? (
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-350"><Loader2 className="w-8 h-8" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-4xl font-extrabold text-white">{recipe?.title}</h1>
                <p className="text-xs md:text-sm text-slate-300 max-w-xl">{recipe?.description}</p>
              </div>

              {user && (
                <button
                  onClick={handleToggleFavorite}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 transition-all active:scale-95"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Details and Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Recipe Info columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ingredients Checklist */}
            <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg border-b border-slate-205/30 pb-3 mb-4">
                Ingredients Checklist
              </h3>
              <div className="space-y-2.5">
                {recipe?.ingredients?.map((ing, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleIngredient(ing.name)}
                    className="w-full flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-left transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      checkedIngredients.has(ing.name)
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {checkedIngredients.has(ing.name) && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs ${
                      checkedIngredients.has(ing.name)
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-750 dark:text-slate-300'
                    }`}>
                      {ing.amount} {ing.unit} &bull; <span className="font-semibold">{ing.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction Steps */}
            <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg border-b border-slate-205/30 pb-3 mb-4">
                Step-by-step Instructions
              </h3>
              <ol className="space-y-4">
                {recipe?.instructions?.map((step, idx) => (
                  <li key={idx} className="flex gap-4 text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

          </div>

          {/* Right column sidebar */}
          <div className="space-y-6">
            
            {/* Interactive Kitchen Timer Widget */}
            <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 text-center space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Kitchen Timer</span>
              <p className="text-4xl font-mono font-extrabold text-slate-800 dark:text-white select-none">
                {formatTime(timerSeconds)}
              </p>
              
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setTimerActive((prev) => !prev)}
                  className={`p-2 rounded-xl text-white transition-colors cursor-pointer ${
                    timerActive ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSeconds(initialSeconds);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 text-slate-655 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Log Meal shortcut */}
            {user && (
              <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Log recipe as meal</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleLogRecipeAsMeal(type)}
                      className="py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold transition-all cursor-pointer capitalize"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition Table Facts */}
            <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40">
              <h3 className="font-bold text-slate-800 dark:text-white text-md border-b border-slate-205/30 pb-2 mb-3">
                Nutrition Summary
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-slate-500 font-medium">Calories</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{recipe?.nutritionFacts?.calories} kcal</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-slate-500 font-medium">Protein</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{recipe?.nutritionFacts?.protein}g</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-slate-500 font-medium">Carbohydrates</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{recipe?.nutritionFacts?.carbs}g</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-slate-500 font-medium">Fats</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{recipe?.nutritionFacts?.fat}g</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Fiber</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{recipe?.nutritionFacts?.fiber}g</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default RecipeDetails;
