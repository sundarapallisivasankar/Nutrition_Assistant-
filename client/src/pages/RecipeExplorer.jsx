import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { BookOpen, Search, Clock, Flame, Heart, ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../layouts/AppLayout';

const RecipeExplorer = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/recipes', {
        params: {
          search: search || undefined,
          mealType: mealType || undefined,
          maxTime: maxTime || undefined,
          page,
          limit: 9,
        },
      });

      if (response.data.success) {
        setRecipes(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to fetch recipes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const response = await api.get('/recipes/my/favorites');
      if (response.data.success) {
        const favIds = response.data.data.map((r) => r._id);
        setFavorites(new Set(favIds));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Trigger search on options changing
  useEffect(() => {
    fetchRecipes();
  }, [mealType, maxTime, page]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecipes();
  };

  const handleToggleFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await api.post(`/recipes/favorite/${id}`);
      if (response.data.success) {
        const newFavs = new Set(favorites);
        if (response.data.isFavorited) {
          newFavs.add(id);
          showNotification('Recipe bookmarked!', 'success');
        } else {
          newFavs.delete(id);
          showNotification('Recipe removed from bookmarks.', 'info');
        }
        setFavorites(newFavs);
      }
    } catch (error) {
      console.error(error);
      showNotification('Could not update bookmarks.', 'error');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Recipe Explorer</h1>
            <p className="text-slate-555 dark:text-slate-400 text-sm mt-1">
              Browse healthy meal ideas with instructions and detailed macronutrient facts.
            </p>
          </div>
          {user?.role === 'admin' && (
            <Link
              to="/recipes/new"
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Recipe
            </Link>
          )}
        </div>

        {/* Filters and search Form */}
        <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search recipe titles, descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Filter parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-250/20">
            {/* Meal type select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => {
                  setMealType(e.target.value);
                  setPage(1);
                }}
                className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs dark:text-white dark:bg-slate-900"
              >
                <option value="">All Categories</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snacks</option>
              </select>
            </div>

            {/* Prep Time selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Max Prep Time ({maxTime || 'Any'} mins)</label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={maxTime || 60}
                onChange={(e) => {
                  setMaxTime(e.target.value);
                  setPage(1);
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:bg-slate-800 mt-2"
              />
            </div>

            {/* Clear filters */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setMealType('');
                  setMaxTime('');
                  setPage(1);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 font-bold text-xs text-slate-500 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">No Recipes Found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or keywords query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe._id}
                to={`/recipes/${recipe._id}`}
                className="glass-panel rounded-2xl overflow-hidden hover:shadow-lg transition-shadow bg-white/50 dark:bg-slate-900/40 flex flex-col justify-between group"
              >
                <div>
                  {/* Recipe Image with bookmark button */}
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen className="w-8 h-8" /></div>
                    )}
                    
                    {user && (
                      <button
                        onClick={(e) => handleToggleFavorite(recipe._id, e)}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md text-slate-655 hover:text-red-500 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(recipe._id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Text details */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-md leading-snug group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {recipe.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-950/20">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {recipe.cookingTime} mins</span>
                  <span className="flex items-center gap-0.5"><Flame className="w-3.5 h-3.5 text-amber-500" /> {recipe.nutritionFacts.calories} kcal</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination navigation */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <span className="flex items-center px-3 text-xs font-bold text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default RecipeExplorer;
