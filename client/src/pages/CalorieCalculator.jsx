import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Calculator, RefreshCw, CheckCircle2, Flame, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AppLayout from '../layouts/AppLayout';

const CalorieCalculator = () => {
  const { user, updateProfile } = useAuth();
  const { showNotification } = useNotification();

  const [age, setAge] = useState(user?.age || 25);
  const [gender, setGender] = useState(user?.gender || 'male');
  const [height, setHeight] = useState(user?.height || 170);
  const [weight, setWeight] = useState(user?.weight || 70);
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel || 'sedentary');

  const [bmr, setBmr] = useState(0);
  const [tdee, setTdee] = useState(0);
  const [goalsBreakdown, setGoalsBreakdown] = useState({});

  useEffect(() => {
    let calculatedBmr = 0;
    
    // Harris-Benedict formula
    if (gender === 'male') {
      calculatedBmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      calculatedBmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    const roundedBmr = Math.round(calculatedBmr);
    setBmr(roundedBmr);

    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };

    const multiplier = multipliers[activityLevel] || 1.2;
    const calculatedTdee = Math.round(roundedBmr * multiplier);
    setTdee(calculatedTdee);

    setGoalsBreakdown({
      maintain: calculatedTdee,
      mildLoss: calculatedTdee - 250,
      loss: calculatedTdee - 500,
      extremeLoss: calculatedTdee - 800,
      mildGain: calculatedTdee + 250,
      gain: calculatedTdee + 500,
    });
  }, [age, gender, height, weight, activityLevel]);

  const loadFromProfile = () => {
    if (user) {
      setAge(user.age || 25);
      setGender(user.gender || 'male');
      setHeight(user.height || 170);
      setWeight(user.weight || 70);
      setActivityLevel(user.activityLevel || 'sedentary');
    }
  };

  const handleApplyCalorieGoal = async (calories, goalKey) => {
    try {
      const result = await updateProfile({
        dailyCalorieGoal: calories,
        goal: goalKey,
      });

      if (result.success) {
        showNotification(`Daily target set to ${calories} kcal (${goalKey.replace('_', ' ')})!`, 'success');
      } else {
        showNotification(result.message || 'Failed to save target.', 'error');
      }
    } catch (error) {
      console.error(error);
      showNotification('An error occurred.', 'error');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Calorie Calculator</h1>
          <p className="text-slate-550 dark:text-slate-400 text-sm mt-1">
            Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inputs Panel (Left) */}
          <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-5 h-fit lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-200/40 pb-3">
              <Calculator className="w-5 h-5 text-emerald-500" /> Demographics & Stats
            </h3>

            {/* Gender Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                      gender === g ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-950 text-slate-650'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Age</span>
                  <span>{age} yrs</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Height</span>
                  <span>{height} cm</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Weight</span>
                  <span>{weight} kg</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="150"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Activity Level Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white dark:bg-slate-900"
              >
                <option value="sedentary">Sedentary (desk job)</option>
                <option value="lightly_active">Lightly Active (1-3 days exercise)</option>
                <option value="moderately_active">Moderately Active (3-5 days exercise)</option>
                <option value="very_active">Very Active (6-7 days intense sports)</option>
                <option value="extra_active">Extra Active (professional training)</option>
              </select>
            </div>

            {user && (
              <button
                type="button"
                onClick={loadFromProfile}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 font-semibold text-sm transition-colors text-slate-700 dark:text-slate-350 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Load Stats from Profile
              </button>
            )}
          </div>

          {/* Results Details Panel (Right) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TDEE Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Basal Metabolic Rate (BMR)</span>
                <p className="text-4xl font-extrabold text-slate-850 dark:text-white mt-2 select-none">
                  {bmr} <span className="text-sm font-normal text-slate-400">kcal/day</span>
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Energy needed at complete rest</span>
              </div>
              <div className="glass-panel p-6 rounded-3xl bg-emerald-500/5 border-emerald-500/20 text-center">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Total Energy Expenditure (TDEE)</span>
                <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 select-none">
                  {tdee} <span className="text-sm font-normal text-emerald-500">kcal/day</span>
                </p>
                <span className="text-[10px] text-emerald-500/80 mt-1 block">Maintenance calorie intake threshold</span>
              </div>
            </div>

            {/* Goals breakdowns */}
            <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-amber-500" /> Target Adjustments by Plan
              </h3>
              
              <div className="space-y-4">
                {[
                  { title: 'Weight Maintenance', desc: 'Maintain current body weight stably.', kcal: goalsBreakdown.maintain, key: 'maintain_weight', color: 'bg-blue-500' },
                  { title: 'Healthy Fat Loss', desc: 'Lose fat slowly (-0.5 kg/week).', kcal: goalsBreakdown.loss, key: 'lose_weight', color: 'bg-emerald-500' },
                  { title: 'Clean Muscle Gain', desc: 'Build mass while minimizing fat gain.', kcal: goalsBreakdown.mildGain, key: 'build_muscle', color: 'bg-teal-500' },
                  { title: 'Aggressive Bulking', desc: 'Gain weight quickly (+0.5 kg/week).', kcal: goalsBreakdown.gain, key: 'gain_weight', color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.key} className="p-4 rounded-2xl bg-white/80 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <span className="text-lg font-extrabold text-slate-800 dark:text-white">{item.kcal} kcal/day</span>
                      {user && (
                        <button
                          onClick={() => handleApplyCalorieGoal(item.kcal, item.key)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Select Goal
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default CalorieCalculator;
