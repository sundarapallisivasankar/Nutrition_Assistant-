import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { Mail, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import AppLayout from '../layouts/AppLayout';

const schema = z.object({
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
});

const ForgotPassword = () => {
  const { showNotification } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [tokenGenerated, setTokenGenerated] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(false);
    try {
      setSubmitting(true);
      const response = await api.post('/auth/forgotpassword', { email: data.email });
      if (response.data.success) {
        showNotification('Reset token generated. Code printed on server console!', 'success');
        setTokenGenerated(response.data.resetToken);
      }
    } catch (error) {
      console.error(error);
      showNotification(error.response?.data?.message || 'Email not found in database.', 'error');
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
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Recover Password</h2>
            <p className="text-sm text-slate-550 dark:text-slate-455">
              Enter your email and we'll generate a secure password reset token.
            </p>
          </div>

          {!tokenGenerated ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    {...register('email')}
                    placeholder="name@example.com"
                    className={`block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white ${
                      errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs font-semibold text-red-500">{errors.email.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 transition-all duration-200 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin mr-2" /> Requesting...
                  </>
                ) : (
                  'Generate Reset Code'
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5 text-center"
            >
              <div className="mx-auto bg-emerald-500/10 text-emerald-600 p-3 rounded-full w-fit">
                <KeyRound className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-850 dark:text-slate-100">Reset Code Generated</h3>
              
              <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 font-mono text-xs select-all break-all select-none">
                {tokenGenerated}
              </div>
              
              <p className="text-xs text-slate-450">
                This code is also printed in the backend terminal console.
              </p>

              <Link
                to={`/reset-password/${tokenGenerated}`}
                className="w-full flex justify-center items-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 text-sm transition-colors"
              >
                Proceed to Reset Password
              </Link>
            </motion.div>
          )}

          {/* Footer Back Link */}
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ForgotPassword;
