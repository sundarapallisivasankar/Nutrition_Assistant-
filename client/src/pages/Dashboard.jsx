import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import {
  Flame,
  Droplet,
  Scale,
  Calendar,
  Sparkles,
  Plus,
  Loader2,
  ChevronRight,
  TrendingUp,
  Apple
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import AppLayout from '../layouts/AppLayout';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/tracker/dashboard');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Dashboard fetch failed:', error);
        showNotification('Failed to retrieve daily logs.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [showNotification]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-20rem)]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Assembling dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { today, nutritionGoal, bmi, todayMeals, weeklyProgress, recommendations, recentActivities } = data || {};

  // Percent completions
  const caloriePercent = Math.min(Math.round((today?.calories / nutritionGoal?.calories) * 100) || 0, 100);
  const waterPercent = Math.min(Math.round((today?.water / nutritionGoal?.water) * 100) || 0, 100);
  const proteinPercent = Math.min(Math.round((today?.protein / nutritionGoal?.protein) * 100) || 0, 100);

  // Line Chart Config for Weekly Progress
  const chartData = {
    labels: weeklyProgress?.map((w) => w.dayName) || [],
    datasets: [
      {
        label: 'Calories (kcal)',
        data: weeklyProgress?.map((w) => w.calories) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Water (ml)',
        data: weeklyProgress?.map((w) => w.water) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(156, 163, 175, 0.9)',
          font: { family: 'Inter', size: 11 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(156, 163, 175, 0.9)' },
      },
      y: {
        position: 'left',
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { color: 'rgba(156, 163, 175, 0.9)' },
      },
      y1: {
        position: 'right',
        grid: { display: false },
        ticks: { color: 'rgba(156, 163, 175, 0.9)' },
      },
    },
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
              Hello, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Here is your wellness summaries and macro logs for today.
            </p>
          </div>
          <div className="inline-flex gap-2">
            <Link
              to="/tracker"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Meal
            </Link>
            <Link
              to="/water-tracker"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
            >
              <Droplet className="w-4 h-4 text-blue-500" /> Log Water
            </Link>
          </div>
        </div>

        {/* Central Metric Ring Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Calorie Card */}
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between bg-white/50 dark:bg-slate-900/40">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-500">
                <Flame className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500">Calories</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
                {today?.calories} <span className="text-xs font-normal text-slate-400">/ {nutritionGoal?.calories} kcal</span>
              </p>
              <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${caloriePercent}%` }} />
              </div>
              <span className="text-xs text-slate-400 font-medium">{caloriePercent}% daily goal reached</span>
            </div>
            
            {/* Visual Ring */}
            <div className="w-16 h-16 rounded-full relative flex items-center justify-center bg-amber-500/10 text-amber-500">
              <Flame className="w-8 h-8" />
            </div>
          </div>

          {/* Water Intake Card */}
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between bg-white/50 dark:bg-slate-900/40">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-500">
                <Droplet className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500">Hydration</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
                {today?.water} <span className="text-xs font-normal text-slate-400">/ {nutritionGoal?.water} ml</span>
              </p>
              <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${waterPercent}%` }} />
              </div>
              <span className="text-xs text-slate-400 font-medium">{waterPercent}% daily goal reached</span>
            </div>
            
            <div className="w-16 h-16 rounded-full relative flex items-center justify-center bg-blue-500/10 text-blue-500">
              <Droplet className="w-8 h-8" />
            </div>
          </div>

          {/* BMI Info Card */}
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between bg-white/50 dark:bg-slate-900/40">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-500">
                <Scale className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500">Body Mass Index</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
                {bmi?.score || 'N/A'} <span className="text-xs font-normal text-slate-400">({bmi?.category})</span>
              </p>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                {bmi?.category === 'Normal' ? 'Healthy Range' : 'Attention needed'}
              </span>
              <span className="text-xs text-slate-400 block font-medium">calculated from latest profile stats</span>
            </div>

            <div className="w-16 h-16 rounded-full relative flex items-center justify-center bg-emerald-500/10 text-emerald-500">
              <Scale className="w-8 h-8" />
            </div>
          </div>

        </div>

        {/* Charts & Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Progress Chart Grid Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Chart Area */}
            <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-lg">Weekly Analytics</h3>
                </div>
                <span className="text-xs text-slate-400">Last 7 Days</span>
              </div>
              
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Today's Meals logged */}
            <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                  <Apple className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-lg">Today's Meals</h3>
                </div>
                <Link
                  to="/tracker"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center hover:underline"
                >
                  Manage logs <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {todayMeals?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">No meals logged for today yet.</p>
                  <Link
                    to="/tracker"
                    className="mt-3 inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
                  >
                    Add custom food +
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-60 overflow-y-auto pr-1">
                  {todayMeals.map((meal) => (
                    <div key={meal._id} className="py-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm">{meal.name}</h4>
                        <span className="text-xs text-slate-400 capitalize">
                          {meal.mealType} &bull; {meal.servingCount} serving ({meal.servingSize * meal.servingCount} {meal.servingUnit})
                        </span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {Math.round(meal.calories * meal.servingCount)} kcal
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Recommendations + Feed */}
          <div className="space-y-6">
            
            {/* AI Advisor Box */}
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-white/50 to-teal-500/10 dark:from-emerald-950/20 dark:via-slate-900/40 dark:to-teal-950/20 border-emerald-500/20">
              <div className="flex items-center gap-2 mb-4 text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <h3 className="font-extrabold text-md uppercase tracking-wider">AI Nutritionist Tips</h3>
              </div>
              
              <ul className="space-y-3">
                {recommendations?.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed list-disc list-inside">
                    {rec}
                  </li>
                ))}
              </ul>
              
              <Link
                to="/ai-assistant"
                className="mt-6 w-full flex justify-center items-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 text-xs shadow-md transition-colors"
              >
                Chat with Assistant
              </Link>
            </div>

            {/* Recent Activities feed */}
            <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Recent Activities</h3>
              
              <div className="space-y-4">
                {recentActivities?.map((act) => (
                  <div key={act.id} className="flex gap-3 items-start text-xs">
                    <div className={`p-1.5 rounded-lg text-white mt-0.5 shrink-0 ${
                      act.type === 'water' ? 'bg-blue-500' :
                      act.type === 'food' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}>
                      {act.type === 'water' ? <Droplet className="w-3.5 h-3.5" /> :
                       act.type === 'food' ? <Apple className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-350 leading-normal font-medium">
                        {act.message}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
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

export default Dashboard;
