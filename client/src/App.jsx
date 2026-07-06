import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import BmiCalculator from './pages/BmiCalculator';
import CalorieCalculator from './pages/CalorieCalculator';
import MealPlanner from './pages/MealPlanner';
import DailyTracker from './pages/DailyTracker';
import NutritionStats from './pages/NutritionStats';
import WaterTracker from './pages/WaterTracker';
import RecipeExplorer from './pages/RecipeExplorer';
import RecipeDetails from './pages/RecipeDetails';
import Favorites from './pages/Favorites';
import AiAssistant from './pages/AiAssistant';
import Settings from './pages/Settings';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Recipes Browsing (Public, but favorite requires auth) */}
              <Route path="/recipes" element={<RecipeExplorer />} />
              <Route path="/recipes/:id" element={<RecipeDetails />} />

              {/* Private Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bmi-calculator"
                element={
                  <ProtectedRoute>
                    <BmiCalculator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calorie-calculator"
                element={
                  <ProtectedRoute>
                    <CalorieCalculator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meal-planner"
                element={
                  <ProtectedRoute>
                    <MealPlanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tracker"
                element={
                  <ProtectedRoute>
                    <DailyTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nutrition-stats"
                element={
                  <ProtectedRoute>
                    <NutritionStats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/water-tracker"
                element={
                  <ProtectedRoute>
                    <WaterTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute>
                    <AiAssistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Admin Panel (Admin Role Required) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
