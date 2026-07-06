import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Apple,
  TrendingUp,
  Droplet,
  BookOpen,
  Heart,
  MessageSquare,
  Scale,
  Calculator,
  User,
  Settings,
  HelpCircle,
  Mail,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Meal Planner', path: '/meal-planner', icon: CalendarDays },
    { name: 'Daily Meal Tracker', path: '/tracker', icon: Apple },
    { name: 'Nutrition Stats', path: '/nutrition-stats', icon: TrendingUp },
    { name: 'Water Tracker', path: '/water-tracker', icon: Droplet },
    { name: 'Recipes', path: '/recipes', icon: BookOpen },
    { name: 'Favorite Recipes', path: '/favorites', icon: Heart },
    { name: 'AI Nutritionist', path: '/ai-assistant', icon: MessageSquare },
    { name: 'BMI Calculator', path: '/bmi-calculator', icon: Scale },
    { name: 'Calorie Calculator', path: '/calorie-calculator', icon: Calculator },
  ];

  const subItems = [
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'About Us', path: '/about', icon: HelpCircle },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500 pl-3 font-semibold shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
    }`;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between py-6 px-4">
      {/* Upper links */}
      <div className="space-y-6">
        <div className="flex items-center justify-between lg:justify-start px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation Menu
          </span>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.name} to={item.path} onClick={onClose} className={linkClass}>
              <item.icon className="w-5 h-5 opacity-80" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer links */}
      <div className="space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
        <span className="px-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          Support & Account
        </span>
        <nav className="flex flex-col gap-1">
          {subItems.map((item) => (
            <NavLink key={item.name} to={item.path} onClick={onClose} className={linkClass}>
              <item.icon className="w-4 h-4 opacity-70" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-35 w-64 transform bg-white dark:bg-slate-950 border-r border-slate-200/50 dark:border-slate-800/50 pt-16 lg:pt-0 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
