import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { Settings as SettingsIcon, Bell, Loader2, Save, Moon, Sparkles } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

const Settings = () => {
  const { showNotification } = useNotification();
  const { darkMode, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(120);
  const [unitSystem, setUnitSystem] = useState('metric');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data.success) {
          const s = response.data.data;
          setNotifications(s.notifications);
          setReminderInterval(s.reminderInterval);
          setUnitSystem(s.unitSystem);
        }
      } catch (error) {
        console.error(error);
        showNotification('Failed to fetch settings.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [showNotification]);

  const handleSubmitSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.put('/settings', {
        notifications,
        reminderInterval: parseInt(reminderInterval),
        unitSystem,
      });

      if (response.data.success) {
        showNotification('Settings updated successfully!', 'success');
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to save settings.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Settings</h1>
          <p className="text-slate-555 dark:text-slate-400 text-sm mt-1">
            Configure application preferences, theme styles, reminders, and unit standards.
          </p>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-3xl bg-white/50 dark:bg-slate-900/40">
            <form onSubmit={handleSubmitSettings} className="space-y-6 text-xs font-semibold">
              
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-205/30 pb-3 text-sm">
                <SettingsIcon className="w-4.5 h-4.5 text-emerald-500" /> General Settings
              </h3>

              {/* Theme Settings */}
              <div className="flex justify-between items-center py-2">
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-slate-200">Dark Interface Style</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle light/dark appearance.</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`p-2 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                    darkMode ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              {/* Unit standard */}
              <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-slate-200">System Units</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Select standards for height/weight equations.</p>
                </div>
                <select
                  value={unitSystem}
                  onChange={(e) => setUnitSystem(e.target.value)}
                  className="block w-28 px-3 py-1.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg outline-none dark:text-white dark:bg-slate-900 text-[11px]"
                >
                  <option value="metric">Metric (kg/cm)</option>
                  <option value="imperial">Imperial (lbs/ft)</option>
                </select>
              </div>

              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-205/30 pb-3 pt-4 text-sm">
                <Bell className="w-4.5 h-4.5 text-blue-500" /> Notifications & Alerts
              </h3>

              {/* Toggle notifications */}
              <div className="flex justify-between items-center py-2">
                <div>
                  <h4 className="font-bold text-slate-855 dark:text-slate-200">Hydration Reminders</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Send alerts to drink water regularly.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-800 text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Reminder interval */}
              {notifications && (
                <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                  <div>
                    <h4 className="font-bold text-slate-855 dark:text-slate-200">Reminder Frequency</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Set notification periods (in minutes).</p>
                  </div>
                  <select
                    value={reminderInterval}
                    onChange={(e) => setReminderInterval(e.target.value)}
                    className="block w-28 px-3 py-1.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg outline-none dark:text-white dark:bg-slate-900 text-[11px]"
                  >
                    <option value="60">Every 1 Hour</option>
                    <option value="120">Every 2 Hours</option>
                    <option value="180">Every 3 Hours</option>
                    <option value="240">Every 4 Hours</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-semibold text-white shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save App Preferences
                  </>
                )}
              </button>

            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Settings;
