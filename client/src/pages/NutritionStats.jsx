import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { TrendingUp, Flame, Droplet, Award, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import AppLayout from '../layouts/AppLayout';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const NutritionStats = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('daily'); // daily | weekly | monthly

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/tracker/dashboard');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error(error);
        showNotification('Failed to retrieve statistics.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showNotification]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </AppLayout>
    );
  }

  const { today, nutritionGoal, weeklyProgress } = data || {};

  // Percent conversions
  const proteinPercent = Math.min(Math.round((today?.protein / nutritionGoal?.protein) * 100) || 0, 100);
  const carbsPercent = Math.min(Math.round((today?.carbs / nutritionGoal?.carbs) * 100) || 0, 100);
  const fatPercent = Math.min(Math.round((today?.fat / nutritionGoal?.fat) * 100) || 0, 100);

  // Weekly bar chart config
  const barChartData = {
    labels: weeklyProgress?.map((w) => w.dayName) || [],
    datasets: [
      {
        label: 'Consumed (kcal)',
        data: weeklyProgress?.map((w) => w.calories) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.65)',
        borderColor: '#10b981',
        borderRadius: 8,
      },
      {
        label: 'Target Limit (kcal)',
        data: weeklyProgress?.map(() => nutritionGoal?.calories) || [],
        type: 'line',
        borderColor: '#ef4444',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointStyle: 'none',
        pointRadius: 0,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'rgba(156, 163, 175, 0.9)' },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'rgba(156, 163, 175, 0.9)' } },
      y: { grid: { color: 'rgba(156, 163, 175, 0.1)' }, ticks: { color: 'rgba(156, 163, 175, 0.9)' } },
    },
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Nutrition Stats</h1>
            <p className="text-slate-550 dark:text-slate-400 text-sm mt-1">
              Analyze your daily macronutrient balances and weekly energy trends.
            </p>
          </div>

          {/* Tabs Selector */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1">
            {['daily', 'weekly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-455 hover:text-slate-600'
                }`}
              >
                {tab} View
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'daily' ? (
          /* Daily View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* Macros Ring breakdown */}
            <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-6">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-200/40 pb-3">
                <BarChart3 className="w-5 h-5 text-emerald-500" /> Daily Macronutrients
              </h3>
              
              <div className="space-y-4">
                {/* Protein Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Protein</span>
                    <span className="text-slate-500">{today?.protein}g / {nutritionGoal?.protein}g</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${proteinPercent}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 block">{proteinPercent}% of daily goal met</span>
                </div>

                {/* Carbohydrates Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Carbohydrates</span>
                    <span className="text-slate-500">{today?.carbs}g / {nutritionGoal?.carbs}g</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-3 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${carbsPercent}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 block">{carbsPercent}% of daily goal met</span>
                </div>

                {/* Fats Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Fats</span>
                    <span className="text-slate-500">{today?.fat}g / {nutritionGoal?.fat}g</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-3 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${fatPercent}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 block">{fatPercent}% of daily goal met</span>
                </div>
              </div>
            </div>

            {/* Daily Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 text-center flex flex-col justify-center">
                <Flame className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Energy Consumed</span>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{today?.calories} kcal</p>
                <span className="text-[10px] text-slate-400 mt-1">Goal: {nutritionGoal?.calories} kcal</span>
              </div>
              <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 text-center flex flex-col justify-center">
                <Droplet className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Water Logged</span>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{today?.water} ml</p>
                <span className="text-[10px] text-slate-400 mt-1">Goal: {nutritionGoal?.water} ml</span>
              </div>
            </div>
          </div>
        ) : (
          /* Weekly View */
          <div className="space-y-6 animate-fadeIn">
            {/* Weekly Calorie consumption chart */}
            <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5 text-emerald-500" /> Weekly Caloric Balances
                </h3>
                <span className="text-xs text-slate-400">Calories vs. Goal</span>
              </div>
              
              <div className="h-72">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>

            {/* Performance message */}
            <div className="glass-panel p-6 rounded-3xl bg-emerald-500/5 border-emerald-500/20 flex items-start gap-3">
              <Award className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-800 dark:text-emerald-450 text-sm">Weekly Goal Progress Summary</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-normal mt-1">
                  You are consistently meeting your targets! Try to maintain high protein levels during weekend rest periods to optimize muscle synthesis.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NutritionStats;
