import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, BookOpen, Apple, Trash2, Loader2, Plus } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Curation Form state
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');
  const [foodFat, setFoodFat] = useState('');
  const [curatingFood, setCuratingFood] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      const usersRes = await api.get('/admin/users');

      if (statsRes.data.success && usersRes.data.success) {
        setStats(statsRes.data.data);
        setUsersList(usersRes.data.data);
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to retrieve admin details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This will erase all of their logs, settings, and food details permanently!')) return;

    try {
      const response = await api.delete(`/admin/users/${id}`);
      if (response.data.success) {
        setUsersList((prev) => prev.filter((u) => u._id !== id));
        showNotification('User deleted and data purged successfully.', 'success');
        
        // Refresh overview stats
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to delete user.', 'error');
    }
  };

  const handleCreateFood = async (e) => {
    e.preventDefault();
    if (!foodName || !foodCalories) return;

    setCuratingFood(true);
    try {
      const response = await api.post('/admin/foods', {
        name: foodName,
        calories: parseFloat(foodCalories),
        protein: parseFloat(foodProtein || 0),
        carbs: parseFloat(foodCarbs || 0),
        fat: parseFloat(foodFat || 0),
      });

      if (response.data.success) {
        showNotification('New system food catalog entry created!', 'success');
        setFoodName('');
        setFoodCalories('');
        setFoodProtein('');
        setFoodCarbs('');
        setFoodFat('');
        
        // Refresh overview stats
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to create system food item.', 'error');
    } finally {
      setCuratingFood(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="font-extrabold text-lg text-slate-800 dark:text-white">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-1">You must be logged in as an administrator to access this panel.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-555 dark:text-slate-400 text-sm mt-1">
              Curate standard food catalogs, view platform statistics, and manage member profiles.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {/* Overview Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between bg-white/50 dark:bg-slate-900/40">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase block">Platform Users</span>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats?.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-emerald-500 opacity-60" />
              </div>
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between bg-white/50 dark:bg-slate-900/40">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase block">Active Logs Today</span>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats?.activeLogsToday}</p>
                </div>
                <Apple className="w-8 h-8 text-amber-500 opacity-60" />
              </div>
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between bg-white/50 dark:bg-slate-900/40">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase block">Recipes Total</span>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats?.totalRecipes}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500 opacity-60" />
              </div>
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between bg-white/50 dark:bg-slate-900/40">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase block">System Foods</span>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats?.totalFoods}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-500 opacity-60" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User management list (Left) */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-4 h-fit">
                <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-205/30 pb-3">
                  Manage Users Accounts
                </h3>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-96 overflow-y-auto pr-1">
                  {usersList.length === 0 ? (
                    <p className="text-center py-6 text-slate-400 text-xs">No registered users on platform.</p>
                  ) : (
                    usersList.map((usr) => (
                      <div key={usr._id} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <h4 className="font-bold text-slate-850 dark:text-slate-200">{usr.name}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {usr.email} &bull; Joined {new Date(usr.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteUser(usr._id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-500 text-red-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Curate standard food catalog item (Right) */}
              <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-205/30 pb-3">
                  Curate System Food Catalog
                </h3>

                <form onSubmit={handleCreateFood} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-slate-500">Food Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Avocado (Plain)"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-500">Calories (per 100g)</label>
                      <input
                        type="number"
                        placeholder="kcal"
                        value={foodCalories}
                        onChange={(e) => setFoodCalories(e.target.value)}
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500">Protein (g)</label>
                      <input
                        type="number"
                        placeholder="g"
                        value={foodProtein}
                        onChange={(e) => setFoodProtein(e.target.value)}
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-500">Carbs (g)</label>
                      <input
                        type="number"
                        placeholder="g"
                        value={foodCarbs}
                        onChange={(e) => setFoodCarbs(e.target.value)}
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500">Fat (g)</label>
                      <input
                        type="number"
                        placeholder="g"
                        value={foodFat}
                        onChange={(e) => setFoodFat(e.target.value)}
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={curatingFood || !foodName || !foodCalories}
                    className="w-full mt-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {curatingFood ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Food Item
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
