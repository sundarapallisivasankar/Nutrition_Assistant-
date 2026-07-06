import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

const NotFound = () => {
  return (
    <AppLayout hideSidebar={true}>
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="bg-red-500/10 p-4 rounded-full text-red-500 mb-6 animate-bounce">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-extrabold text-slate-800 dark:text-white leading-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-450 mt-2 max-w-sm">
          The page you are looking for does not exist or has been relocated.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Safety
        </Link>
      </div>
    </AppLayout>
  );
};

export default NotFound;
