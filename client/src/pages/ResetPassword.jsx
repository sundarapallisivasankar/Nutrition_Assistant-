import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AppLayout from '../layouts/AppLayout';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const { token } = useParams();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.post(`/auth/resetpassword/${token}`, { password: data.password });
      if (response.data.success) {
        showNotification('Password updated successfully!', 'success');
        setSuccess(true);
      }
    } catch (error) {
      console.error(error);
      showNotification(error.response?.data?.message || 'Failed to reset password. The code might have expired.', 'error');
    } finally {
      setSubmitting(false);
    }
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
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Reset Password</h2>
            <p className="text-sm text-slate-550 dark:text-slate-455">
              Enter your new credentials below.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className={`block w-full pl-11 pr-10 py-3 bg-white/50 dark:bg-slate-950/40 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white ${
                      errors.password ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-250 transition-colors"
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
                    {...register('confirmPassword')}
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
                className="w-full flex justify-center items-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 transition-all duration-200 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin mr-2" /> Resetting...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 text-center"
            >
              <div className="mx-auto bg-emerald-500/10 text-emerald-600 p-3 rounded-full w-fit">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-850 dark:text-slate-100">Password Changed</h3>
              <p className="text-sm text-slate-500">
                Your credentials have been successfully updated. You can now use your new password.
              </p>
              <Link
                to="/login"
                className="w-full flex justify-center items-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 text-sm transition-colors block"
              >
                Go to Login
              </Link>
            </motion.div>
          )}

          {/* Footer Back Link */}
          {!success && (
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ResetPassword;
