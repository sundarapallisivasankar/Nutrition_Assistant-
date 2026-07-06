import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { CalendarDays, Plus, Trash2, Loader2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../layouts/AppLayout';

const MealPlanner = () => {
  const { showNotification } = useNotification();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealTime, setMealTime] = useState('breakfast');
  const [submitting, setSubmitting] = useState(false);

  const fetchMeals = async () => {
    try {
      const response = await api.get('/meals');
      if (response.data.success) {
        setMeals(response.data.data);
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to fetch planned meals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!name || !calories) {
      showNotification('Name and Calories are required.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/meals', {
        name,
        calories: parseFloat(calories),
        protein: parseFloat(protein || 0),
        carbs: parseFloat(carbs || 0),
        fat: parseFloat(fat || 0),
        mealTime,
      });

      if (response.data.success) {
        setMeals((prev) => [response.data.data, ...prev]);
        showNotification('Meal template added to plan!', 'success');
        closeModal();
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to add meal template.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      const response = await api.delete(`/meals/${id}`);
      if (response.data.success) {
        setMeals((prev) => prev.filter((m) => m._id !== id));
        showNotification('Planned meal item removed', 'info');
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to remove planned meal.', 'error');
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setMealTime('breakfast');
  };

  // Filter planned templates by type
  const filterMealsByTime = (time) => {
    return meals.filter((m) => m.mealTime === time);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Meal Planner</h1>
            <p className="text-slate-555 dark:text-slate-400 text-sm mt-1">
              Design scheduled meal templates for different times of day.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Planned Item
          </button>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['breakfast', 'lunch', 'dinner', 'snack'].map((time) => {
              const items = filterMealsByTime(time);
              const totalKcal = Math.round(items.reduce((sum, item) => sum + item.calories, 0));

              return (
                <div key={time} className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-200/40 pb-3 mb-4">
                      <h3 className="font-extrabold text-slate-800 dark:text-white capitalize">{time}</h3>
                      <span className="text-xs font-bold text-slate-455">{totalKcal} kcal</span>
                    </div>

                    {items.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 py-8 italic text-center">
                        No planned templates.
                      </p>
                    ) : (
                      <div className="space-y-4 pr-1 max-h-60 overflow-y-auto">
                        {items.map((item) => (
                          <div key={item._id} className="p-3 bg-white/80 dark:bg-slate-950/40 border border-slate-200/40 rounded-xl relative group">
                            <h4 className="font-bold text-slate-800 dark:text-slate-250 text-xs truncate pr-6">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold">
                              {item.calories} kcal &bull; P:{item.protein}g, C:{item.carbs}g, F:{item.fat}g
                            </p>
                            <button
                              onClick={() => handleDeleteMeal(item._id)}
                              className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500/70 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Planned Meal templates insertion Modal */}
        <AnimatePresence>
          {modalOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-45 bg-slate-950/40 backdrop-blur-sm" onClick={closeModal} />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="fixed inset-x-4 top-10 md:top-24 md:mx-auto max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 p-6 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-200/40 pb-3">
                  <h3 className="font-extrabold text-slate-850 dark:text-white">
                    Add Planned Meal Template
                  </h3>
                  <button onClick={closeModal} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="w-5 h-5 text-slate-455" />
                  </button>
                </div>

                <form onSubmit={handleAddMeal} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-slate-500">Meal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Scrambled Eggs with Avocado"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500">Meal Time Slot</label>
                    <select
                      value={mealTime}
                      onChange={(e) => setMealTime(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white dark:bg-slate-900"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase">Calories</label>
                      <input
                        type="number"
                        placeholder="kcal"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase">Protein (g)</label>
                      <input
                        type="number"
                        placeholder="g"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase">Carbs (g)</label>
                      <input
                        type="number"
                        placeholder="g"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase">Fat (g)</label>
                      <input
                        type="number"
                        placeholder="g"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Add Item'}
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

export default MealPlanner;
