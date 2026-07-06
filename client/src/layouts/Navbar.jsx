import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, LogOut, User, Settings, Shield, Menu, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b bg-white/70 dark:bg-slate-950/70 border-slate-200/50 dark:border-slate-800/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Brand Logo + Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              NutriAssist
            </span>
          </Link>
        </div>

        {/* Center/Right Nav: Theme Toggle + User Dropdown */}
        <div className="flex items-center gap-4">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              {/* Profile Bubble Button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex items-center justify-center">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    {/* Click-away backdrop */}
                    <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-40 p-1 divide-y divide-slate-100 dark:divide-slate-850"
                    >
                      {/* User Summary */}
                      <div className="px-4 py-3">
                        <p className="text-xs text-slate-400 dark:text-slate-500">Signed in as</p>
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                      </div>

                      {/* Options */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-750 dark:text-slate-350 hover:bg-slate-55 dark:hover:bg-slate-800 hover:text-slate-900 rounded-xl"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          My Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-750 dark:text-slate-350 hover:bg-slate-55 dark:hover:bg-slate-800 hover:text-slate-900 rounded-xl"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Settings
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-500 hover:shadow-emerald-500/20 active:scale-95 transition-all duration-200"
              >
                Sign up
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};

export default Navbar;
