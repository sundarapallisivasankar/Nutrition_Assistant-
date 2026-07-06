import React from 'react';
import { HelpCircle, Layers, ShieldCheck, HeartPulse } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <AppLayout hideSidebar={true}>
      <div className="space-y-8 max-w-4xl mx-auto py-6">
        {/* Banner */}
        <div className="text-center space-y-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-full text-emerald-600 w-fit mx-auto">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white">About Nutrition Assistant</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
            A premium full-stack MERN major college project focusing on scientific macro logs and beautiful glassmorphism.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-3">
            <Layers className="w-6 h-6 text-emerald-500" />
            <h3 className="font-bold text-slate-850 dark:text-slate-205 text-sm">MVC Architecture</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Decoupled frontend client (React + Vite) communicating with a secure Node/Express API, persisted on MongoDB Atlas cluster.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-3">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <h3 className="font-bold text-slate-855 dark:text-slate-205 text-sm">Safety Protocols</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Equipped with Helmet headers, Express Rate-Limit filters, JWT token rotations, and Zod validator parameters.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-3">
            <HelpCircle className="w-6 h-6 text-purple-500" />
            <h3 className="font-bold text-slate-855 dark:text-slate-205 text-sm">Clean Seeding</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Comes with an automated seeder populated with standard calorie foods and healthy cooking recipes to test features immediately.
            </p>
          </div>
        </div>

        {/* Project Credits */}
        <div className="glass-panel p-8 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Project Scope</h2>
          <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
            This project serves as a major college computer science dissertation demonstrating contemporary full-stack engineering, responsive mobile-first UI paradigms, API abstraction layers, secure authentication handling, and high-performance charts rendering.
          </p>
          <div className="flex flex-wrap gap-2 pt-2 text-[10px] font-bold text-slate-400 uppercase">
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-950/40">React 19</span>
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-950/40">Tailwind v4</span>
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-950/40">Express.js</span>
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-950/40">MongoDB</span>
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-950/40">Framer Motion</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default About;
