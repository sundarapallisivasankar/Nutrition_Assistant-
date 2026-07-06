import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Lock, Mail, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AppLayout from '../layouts/AppLayout';

const registerValidation = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Register = () => {
  const { register: signup } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerValidation),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    const result = await signup(data.name, data.email, data.password);
    
    if (result.success) {
      showNotification('Account created successfully! Welcome aboard.', 'success');
      navigate('/dashboard');
    } else {
      showNotification(result.message || 'Registration failed. Please try again.', 'error');
    }
    setSubmitting(false);
  };

  return (
    <AppLayout hideSidebar={true}>
      <div className="flex flex-1 items-center justify-center py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-xl bg-white/70 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-800/50"
        >
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Create Account</h2>
            <p className="text-sm text-slate-550 dark:text-slate-455">
              Start your fitness and nutrition tracker journey.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  {...formRegister('name')}
                  placeholder="John Doe"
                  className={`block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white ${
                    errors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs font-semibold text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  {...formRegister('email')}
                  placeholder="name@example.com"
                  className={`block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white ${
                    errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs font-semibold text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password (Min 6 chars)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...formRegister('password')}
                  placeholder="••••••••"
                  className={`block w-full pl-11 pr-10 py-3 bg-white/50 dark:bg-slate-950/40 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white ${
                    errors.password ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-semibold text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  {...formRegister('confirmPassword')}
                  placeholder="••••••••"
                  className={`block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-semibold text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all duration-200 mt-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin mr-2" /> Creating account...
                </>
              ) : (
                <>
                  Register <ArrowRight className="w-4.5 h-4.5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Footer Router Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-500 dark:text-slate-450">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Register;
