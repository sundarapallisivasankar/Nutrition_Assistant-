import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full py-6 mt-auto border-t border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
        <div>
          &copy; {new Date().getFullYear()} Nutrition Assistant. All rights reserved. Major Project Submission.
        </div>
        <div className="flex gap-6">
          <Link to="/about" className="hover:text-emerald-500 transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="hover:text-emerald-500 transition-colors">
            Contact
          </Link>
          <Link to="/privacy" className="hover:text-emerald-500 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
