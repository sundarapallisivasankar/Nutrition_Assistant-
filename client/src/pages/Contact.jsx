import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNotification } from '../contexts/NotificationContext';
import { Mail, Send, Loader2, MessageSquare, User } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { motion } from 'framer-motion';

const validationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const Contact = () => {
  const { showNotification } = useNotification();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    // Simulate API delivery delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitting(false);
    
    showNotification('Feedback message delivered! Thank you.', 'success');
    reset();
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
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Contact Us</h2>
            <p className="text-sm text-slate-550 dark:text-slate-455">
              Submit your feedback, bug reports, or queries below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Name</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  {...register('name')}
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
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

            {/* Message Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Message</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none text-slate-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <textarea
                  rows="4"
                  {...register('message')}
                  placeholder="Tell us how we can help..."
                  className={`block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white ${
                    errors.message ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
              {errors.message && <p className="text-xs font-semibold text-red-500">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 py-3 text-sm font-semibold text-white shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all duration-200 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Feedback Message
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Contact;
