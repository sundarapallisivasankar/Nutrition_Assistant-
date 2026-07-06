import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Shield, Sparkles, Flame, Droplet, BookOpen, ChevronRight, Check } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const features = [
    {
      title: 'Precision Macro Tracking',
      desc: 'Log meals from a catalog of standard foods or submit your own custom dishes. Track protein, fats, and carbs in real-time.',
      icon: Flame,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Hydration Assistant',
      desc: 'Log water cups throughout the day. Watch a responsive virtual bottle fill up dynamically as you reach your hydration goals.',
      icon: Droplet,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'AI Nutrition Chatbot',
      desc: 'Ask our virtual counselor for meal planning suggestions, ingredient swaps, weight loss tips, or custom recipes.',
      icon: Sparkles,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Calculators & Logs',
      desc: 'Compute your BMI, BMR, TDEE, and access dedicated target logs for weight loss, maintenance, or bulking muscle.',
      icon: Activity,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <AppLayout hideSidebar={true}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" /> Smart Nutrition Planning
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
              Unlock Your Ultimate <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                Health & Vitality
              </span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0">
              NutriAssist is your premium personal companion for diet logs, calorie targets, hydration, curated recipes, and personalized AI meal coaching.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold px-6 py-3.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-200"
              >
                Get Started Free <ChevronRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold px-6 py-3.5 text-slate-755 dark:text-slate-350 active:scale-95 transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Right Image/Mockup Column */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-md lg:max-w-none relative flex justify-center"
          >
            {/* Visual Glass Box Mocking Dashboard */}
            <div className="w-full max-w-md aspect-square rounded-3xl glass-panel p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between border-slate-200/40 bg-white/40 dark:bg-slate-950/40">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full filter blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/20 rounded-full filter blur-3xl" />

              <div className="flex justify-between items-center z-10 border-b border-slate-200/30 pb-4">
                <span className="font-bold text-slate-800 dark:text-slate-200">Daily Balance</span>
                <span className="text-xs text-slate-400 font-mono">TODAY</span>
              </div>

              {/* Mock Ring */}
              <div className="my-6 flex justify-center items-center relative z-10">
                <div className="w-44 h-44 rounded-full border-12 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-12 border-emerald-500 border-t-transparent border-r-transparent rotate-45" />
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-white">1,540</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Calories Left</span>
                </div>
              </div>

              {/* Macros pills */}
              <div className="grid grid-cols-3 gap-2 z-10">
                <div className="glass-panel p-2.5 rounded-xl text-center bg-white/80 dark:bg-slate-900/80">
                  <span className="text-xs text-slate-400 block">Protein</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">92g / 130g</span>
                </div>
                <div className="glass-panel p-2.5 rounded-xl text-center bg-white/80 dark:bg-slate-900/80">
                  <span className="text-xs text-slate-400 block">Carbs</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">180g / 220g</span>
                </div>
                <div className="glass-panel p-2.5 rounded-xl text-center bg-white/80 dark:bg-slate-900/80">
                  <span className="text-xs text-slate-400 block">Fat</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">45g / 65g</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 border-t border-slate-200/50 dark:border-slate-850">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Designed for Clean Living
          </h2>
          <p className="text-slate-650 dark:text-slate-400 mt-2 text-md">
            All the features you need to master your lifestyle habits in a single premium digital tracker.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feat) => (
            <motion.div
              key={feat.title}
              variants={itemVariants}
              className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-shadow bg-white/50 dark:bg-slate-900/40"
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-xl w-fit ${feat.bg} ${feat.color}`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{feat.title}</h3>
                <p className="text-sm text-slate-550 dark:text-slate-400">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Proof/Value Props */}
      <section className="py-12 bg-emerald-500/5 dark:bg-emerald-950/10 rounded-3xl border border-emerald-500/10 p-8 sm:p-12 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
              Why use NutriAssist?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3">
              We focus on clean, high-performance designs, data security, and intelligent insights to support your personal goals.
            </p>
            
            <ul className="space-y-3 mt-6">
              {[
                'Interactive calculators (BMI, TDEE, and weight plans)',
                'Auto-seeds standard foods with accurate macros info',
                'Advanced chatbot context retention for tailored plans',
                'Full support for dark mode and mobile response parameters'
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-350">
                  <div className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-0.5 rounded-full mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center">
            <div className="glass-panel p-6 rounded-2xl w-full max-w-sm flex flex-col gap-4 bg-white/80 dark:bg-slate-900/80">
              <div className="flex gap-1 text-amber-500 font-bold text-lg">★★★★★</div>
              <p className="text-sm text-slate-600 dark:text-slate-350 italic">
                "NutriAssist is amazing! The animated water bottle tracker makes it fun to log water, and the AI nutritionist helped me find plant-based lunch alternatives."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-emerald-600 text-sm">
                  MD
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">Marcus Davis</h4>
                  <span className="text-xs text-slate-400">Fitness Enthusiast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Landing;
