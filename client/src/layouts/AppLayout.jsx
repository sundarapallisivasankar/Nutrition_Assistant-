import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';

const AppLayout = ({ children, hideSidebar = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // If user is not logged in, or we explicitly ask to hide sidebar (like on Landing / Login pages)
  const shouldShowSidebar = isAuthenticated && !hideSidebar;

  return (
    <div className="flex min-h-screen flex-col bg-slate-55 dark:bg-slate-950 transition-colors duration-300">
      <Navbar onMenuClick={() => setSidebarOpen(prev => !prev)} />
      
      <div className="flex flex-1 relative">
        {shouldShowSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto min-h-[calc(100vh-10rem)]">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AppLayout;
