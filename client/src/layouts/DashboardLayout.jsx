import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Spinner } from '../components/Loader';

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return <Spinner />;
  }

  // Guard router check
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen w-screen flex bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300">
      {/* 1. Responsive Sidebar Panel */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* 2. Primary Layout content */}
      <div
        className="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ease-in-out"
        style={{ paddingLeft: sidebarOpen ? '256px' : '80px' }}
      >
        {/* Top Navbar */}
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Scrollable Viewport Outlet */}
        <main className="flex-1 p-6 md:p-8 mt-16 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
