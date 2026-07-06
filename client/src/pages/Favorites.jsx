import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { Heart, Loader2, BookOpen, Clock, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

const Favorites = () => {
  const { showNotification } = useNotification();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/recipes/my/favorites');
      if (response.data.success) {
        setRecipes(response.data.data);
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to fetch bookmarked recipes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await api.post(`/recipes/favorite/${id}`);
      if (response.data.success && !response.data.isFavorited) {
        setRecipes((prev) => prev.filter((r) => r._id !== id));
        showNotification('Recipe removed from bookmarks.', 'info');
      }
    } catch (error) {
      showNotification('Could not remove bookmark.', 'error');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Favorite Recipes</h1>
          <p className="text-slate-555 dark:text-slate-400 text-sm mt-1">
            Browse through healthy meal ideas you have previously bookmarked.
          </p>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl p-8 bg-white/50 dark:bg-slate-900/40">
            <Heart className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">No Bookmarks Yet</h3>
            <p className="text-slate-550 text-sm mt-1">
              Go to the <Link to="/recipes" className="text-emerald-500 hover:underline font-semibold">Recipe Explorer</Link> to bookmark meals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {recipes.map((recipe) => (
              <Link
                key={recipe._id}
                to={`/recipes/${recipe._id}`}
                className="glass-panel rounded-2xl overflow-hidden hover:shadow-lg transition-shadow bg-white/50 dark:bg-slate-900/40 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-350"><BookOpen className="w-8 h-8" /></div>
                    )}
                    <button
                      onClick={(e) => handleRemoveFavorite(recipe._id, e)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-md leading-snug group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {recipe.title}
                    </h3>
                    <p className="text-xs text-slate-550 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-950/20">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {recipe.cookingTime} mins</span>
                  <span className="flex items-center gap-0.5"><Flame className="w-3.5 h-3.5 text-amber-500" /> {recipe.nutritionFacts.calories} kcal</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Favorites;
