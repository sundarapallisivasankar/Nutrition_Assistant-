import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { Apple, Plus, Trash2, Calendar, Search, Loader2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../layouts/AppLayout';

const DailyTracker = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState(null);

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Modal State for adding food
  const [activeMealType, setActiveMealType] = useState(null); // 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Add properties
  const [selectedFood, setSelectedFood] = useState(null);
  const [servingCount, setServingCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Custom food fields
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  const fetchNutritionLog = async (date) => {
    setLoading(true);
    try {
      const response = await api.get(`/tracker/food/${date}`);
      if (response.data.success) {
        setLog(response.data.data);
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to retrieve daily food logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionLog(selectedDate);
  }, [selectedDate]);

  // Handle food search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      
      setSearching(true);
      try {
        const response = await api.get(`/foods?search=${searchQuery}`);
        if (response.data.success) {
          setSearchResults(response.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setServingCount(1);
  };

  const handleLogFoodSubmit = async (e) => {
    e.preventDefault();
    if (!activeMealType) return;

    let payload = {
      mealType: activeMealType,
      date: selectedDate,
    };

    if (isCustomMode) {
      if (!customName || !customCalories) {
        showNotification('Name and calories are required.', 'warning');
        return;
      }
      payload = {
        ...payload,
        name: customName,
        calories: parseFloat(customCalories),
        protein: parseFloat(customProtein || 0),
        carbs: parseFloat(customCarbs || 0),
        fat: parseFloat(customFat || 0),
        servingCount: parseFloat(servingCount),
      };
    } else {
      if (!selectedFood) return;
      payload = {
        ...payload,
        name: selectedFood.name,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        servingSize: selectedFood.servingSize,
        servingUnit: selectedFood.servingUnit,
        servingCount: parseFloat(servingCount),
        foodId: selectedFood._id,
      };
    }

    setSubmitting(true);
    try {
      const response = await api.post('/tracker/food', payload);
      if (response.data.success) {
        setLog(response.data.data);
        showNotification('Food item logged successfully!', 'success');
        closeModal();
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to log food.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFood = async (mealId) => {
    try {
      const response = await api.delete(`/tracker/food/${log._id}/${mealId}`);
      if (response.data.success) {
        setLog(response.data.data);
        showNotification('Food item removed.', 'info');
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to remove logged food.', 'error');
    }
  };

  const closeModal = () => {
    setActiveMealType(null);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    setIsCustomMode(false);
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
  };

  // Group logged foods by mealType
  const getFoodsByMealType = (type) => {
    return log?.meals?.filter((m) => m.mealType === type) || [];
  };

  const calculateMealTypeCalories = (type) => {
    const meals = getFoodsByMealType(type);
    return Math.round(meals.reduce((total, m) => total + m.calories * m.servingCount, 0));
  };

  const totalCalories = log?.totalNutrition?.calories || 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Daily Meal Tracker</h1>
            <p className="text-slate-550 dark:text-slate-400 text-sm mt-1">
              Add meals eaten throughout the day to compute macronutrient breakdowns.
            </p>
          </div>

          <div className="relative flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-slate-655 text-sm font-semibold shadow-sm">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none dark:text-white text-xs select-none"
            />
          </div>
        </div>

        {/* Aggregate Calorie summary */}
        <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Calories Today</span>
            <p className="text-4xl font-extrabold text-slate-850 dark:text-white mt-1">
              {totalCalories} <span className="text-sm font-normal text-slate-400">kcal</span>
            </p>
          </div>

          <div className="flex gap-4">
            <div className="text-center bg-white/80 dark:bg-slate-950/40 border border-slate-200/40 p-3.5 rounded-2xl min-w-[90px]">
              <span className="text-[10px] text-slate-400 block font-bold">Protein</span>
              <span className="text-sm font-extrabold text-slate-750 dark:text-slate-200">{log?.totalNutrition?.protein || 0}g</span>
            </div>
            <div className="text-center bg-white/80 dark:bg-slate-950/40 border border-slate-200/40 p-3.5 rounded-2xl min-w-[90px]">
              <span className="text-[10px] text-slate-400 block font-bold">Carbs</span>
              <span className="text-sm font-extrabold text-slate-750 dark:text-slate-200">{log?.totalNutrition?.carbs || 0}g</span>
            </div>
            <div className="text-center bg-white/80 dark:bg-slate-950/40 border border-slate-200/40 p-3.5 rounded-2xl min-w-[90px]">
              <span className="text-[10px] text-slate-400 block font-bold">Fat</span>
              <span className="text-sm font-extrabold text-slate-750 dark:text-slate-200">{log?.totalNutrition?.fat || 0}g</span>
            </div>
          </div>
        </div>

        {/* Meal sections rendering */}
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
              const items = getFoodsByMealType(type);
              const mealCal = calculateMealTypeCalories(type);

              return (
                <div key={type} className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-200/40 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Apple className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-extrabold text-slate-800 dark:text-white capitalize">{type}</h3>
                      </div>
                      <span className="font-bold text-slate-750 dark:text-slate-200 text-sm">{mealCal} kcal</span>
                    </div>

                    {items.length === 0 ? (
                      <p className="text-xs text-slate-450 dark:text-slate-500 py-4 italic text-center">
                        No food items logged for {type}.
                      </p>
                    ) : (
                      <div className="space-y-3 pr-1 max-h-40 overflow-y-auto">
                        {items.map((item) => (
                          <div key={item._id} className="flex justify-between items-center py-1">
                            <div>
                              <h4 className="font-bold text-slate-850 dark:text-slate-250 text-sm leading-tight">{item.name}</h4>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.servingCount} serving ({item.servingSize * item.servingCount} {item.servingUnit}) &bull; P: {item.protein * item.servingCount}g, C: {item.carbs * item.servingCount}g, F: {item.fat * item.servingCount}g
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                {Math.round(item.calories * item.servingCount)} kcal
                              </span>
                              <button
                                onClick={() => handleDeleteFood(item._id)}
                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveMealType(type)}
                    className="mt-4 w-full flex items-center justify-center gap-1 py-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-500 dark:text-slate-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Food to {type}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Food Modal Dialogue */}
        <AnimatePresence>
          {activeMealType && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-45 bg-slate-950/40 backdrop-blur-sm" onClick={closeModal} />
              
              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="fixed inset-x-4 top-10 md:top-24 md:mx-auto max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 p-6 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-200/40 pb-3">
                  <h3 className="font-extrabold text-slate-850 dark:text-white capitalize">
                    Add Food to {activeMealType}
                  </h3>
                  <button onClick={closeModal} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="w-5 h-5 text-slate-450" />
                  </button>
                </div>

                {/* Search / Custom Tab Selector */}
                <div className="flex border-b border-slate-100 dark:border-slate-850 p-0.5 bg-slate-100 dark:bg-slate-950 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      !isCustomMode ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Search Catalog
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      isCustomMode ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Custom Food Entry
                  </button>
                </div>

                {!isCustomMode ? (
                  // Search mode
                  <div className="space-y-4">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search standard items (e.g. apple, egg)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-white"
                      />
                    </div>

                    {/* Results list */}
                    <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-100 dark:border-slate-850 p-2 rounded-2xl">
                      {searching && (
                        <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-500" /></div>
                      )}
                      {!searching && searchResults.length === 0 && searchQuery && (
                        <p className="text-center text-xs text-slate-400 py-4">No foods found matching query.</p>
                      )}
                      {!searching && searchResults.length === 0 && !searchQuery && (
                        <p className="text-center text-xs text-slate-400 py-4">Type a query to search database catalog.</p>
                      )}
                      {searchResults.map((food) => (
                        <button
                          key={food._id}
                          type="button"
                          onClick={() => handleSelectFood(food)}
                          className={`w-full flex justify-between items-center px-4 py-2.5 rounded-xl border transition-all text-left text-xs ${
                            selectedFood?._id === food._id
                              ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10'
                              : 'border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-750 dark:text-slate-200">{food.name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {food.servingSize}{food.servingUnit} serving &bull; P: {food.protein}g, C: {food.carbs}g, F: {food.fat}g
                            </span>
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{food.calories} kcal</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Custom input mode
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Food Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Grandma's Meatloaf"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="block w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Calories</label>
                        <input
                          type="number"
                          placeholder="kcal"
                          value={customCalories}
                          onChange={(e) => setCustomCalories(e.target.value)}
                          className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Protein (g)</label>
                        <input
                          type="number"
                          placeholder="g"
                          value={customProtein}
                          onChange={(e) => setCustomProtein(e.target.value)}
                          className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Carbs (g)</label>
                        <input
                          type="number"
                          placeholder="g"
                          value={customCarbs}
                          onChange={(e) => setCustomCarbs(e.target.value)}
                          className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Fat (g)</label>
                        <input
                          type="number"
                          placeholder="g"
                          value={customFat}
                          onChange={(e) => setCustomFat(e.target.value)}
                          className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Serving counter */}
                <form onSubmit={handleLogFoodSubmit} className="space-y-4 pt-2 border-t border-slate-200/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase">Serving Count</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={servingCount}
                        onChange={(e) => setServingCount(parseFloat(e.target.value) || 1)}
                        className="w-20 text-center px-2 py-1.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-bold dark:text-white"
                      />
                      <span className="text-xs text-slate-450">servings</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || (!isCustomMode && !selectedFood)}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Logging item...
                      </>
                    ) : (
                      'Confirm Log Food'
                    )}
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </AppLayout>
  );
};

export default DailyTracker;
