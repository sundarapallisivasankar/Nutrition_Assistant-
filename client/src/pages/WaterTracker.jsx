import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { Droplet, Plus, Trash2, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../layouts/AppLayout';

const WaterTracker = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState(null);
  
  const [customAmount, setCustomAmount] = useState('');
  const [logging, setLogging] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchWaterLog = async (date) => {
    setLoading(true);
    try {
      const response = await api.get(`/tracker/water/${date}`);
      if (response.data.success) {
        setLog(response.data.data);
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to retrieve water logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterLog(selectedDate);
  }, [selectedDate]);

  const handleAddWater = async (amount) => {
    if (!amount || amount <= 0) return;
    
    setLogging(true);
    try {
      const response = await api.post('/tracker/water', {
        amount: parseInt(amount),
        date: selectedDate,
      });

      if (response.data.success) {
        setLog(response.data.data);
        showNotification(`Logged ${amount}ml of water!`, 'success');
        setCustomAmount('');
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to log water.', 'error');
    } finally {
      setLogging(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const response = await api.delete(`/tracker/water/entry/${log._id}/${entryId}`);
      if (response.data.success) {
        setLog(response.data.data);
        showNotification('Water entry removed', 'info');
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to remove entry.', 'error');
    }
  };

  const amountToday = log?.amount || 0;
  const goalToday = log?.goal || 2500;
  const progressPercent = Math.min(Math.round((amountToday / goalToday) * 100), 100);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Water Intake Tracker</h1>
            <p className="text-slate-550 dark:text-slate-400 text-sm mt-1">
              Log daily water consumptions, schedule reminders, and watch your hydration goal fill.
            </p>
          </div>
          
          {/* Date Selector */}
          <div className="relative flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-slate-650 text-sm font-semibold shadow-sm">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none dark:text-white text-xs select-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Visual Animated Bottle Container */}
            <div className="glass-panel p-8 rounded-3xl bg-white/50 dark:bg-slate-900/40 flex flex-col items-center justify-center min-h-[350px]">
              {/* Bottle Shape */}
              <div className="relative w-44 h-72 border-6 border-slate-350 dark:border-slate-800 rounded-t-3xl rounded-b-[40px] overflow-hidden shadow-inner bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-end">
                {/* Cap neck indicator */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-4 border-b-6 border-slate-350 dark:border-slate-800" />
                
                {/* Fluid layer height based on progressPercent */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="w-full bg-blue-500/80 relative transition-all duration-300"
                >
                  {/* CSS Waves overlay */}
                  <div className="absolute left-1/2 -top-12 w-[350px] h-[350px] rounded-[42%] bg-blue-400/90 water-wave" />
                  <div className="absolute left-1/2 -top-10 w-[360px] h-[360px] rounded-[40%] bg-blue-500/50 water-wave opacity-50 animation-delay-2000" />
                </motion.div>

                {/* Percentage text overlay inside bottle */}
                <div className="absolute inset-0 flex items-center justify-center flex-col z-10 pointer-events-none select-none">
                  <span className="text-4xl font-extrabold text-slate-800 dark:text-white drop-shadow">
                    {progressPercent}%
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {amountToday}ml / {goalToday}ml
                  </span>
                </div>
              </div>
            </div>

            {/* Controls and Logs List */}
            <div className="space-y-6">
              {/* Log Controls Card */}
              <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-6">
                <h3 className="font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                  <Droplet className="w-5 h-5 text-blue-500" /> Quick Add Water
                </h3>

                {/* Grid pre-set buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {[250, 500, 750].map((ml) => (
                    <button
                      key={ml}
                      disabled={logging}
                      onClick={() => handleAddWater(ml)}
                      className="py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      +{ml}ml
                    </button>
                  ))}
                </div>

                {/* Custom Add Water input */}
                <div className="space-y-2 pt-2 border-t border-slate-200/40">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Custom Amount (ml)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 350"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm dark:text-white"
                    />
                    <button
                      onClick={() => handleAddWater(customAmount)}
                      disabled={logging || !customAmount}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Today's Log entries list */}
              <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Hydration History</h3>

                {log?.entries?.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-sm">No water entries logged for this date.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-48 overflow-y-auto pr-1">
                    <AnimatePresence>
                      {log?.entries?.map((entry) => (
                        <motion.div
                          key={entry._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="py-2.5 flex justify-between items-center text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Droplet className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="font-bold text-slate-750 dark:text-slate-200">{entry.amount}ml</span>
                            <span className="text-xs text-slate-400">
                              at {new Date(entry.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteEntry(entry._id)}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500/70 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WaterTracker;
