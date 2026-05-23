import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  KanbanSquare,
  Table,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'team-leader', 'bda-employee'],
    },
    {
      path: '/pipeline',
      name: 'Kanban Board',
      icon: KanbanSquare,
      roles: ['admin', 'team-leader', 'bda-employee'],
    },
    {
      path: '/leads',
      name: 'Leads Directory',
      icon: Table,
      roles: ['admin', 'team-leader', 'bda-employee'],
    },
    {
      path: '/tasks',
      name: 'Tasks & Calendar',
      icon: Calendar,
      roles: ['admin', 'team-leader', 'bda-employee'],
    },
    {
      path: '/team',
      name: 'Team Hub',
      icon: Users,
      roles: ['admin', 'team-leader'],
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: Settings,
      roles: ['admin', 'team-leader', 'bda-employee'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside
      className={`fixed top-0 left-0 z-20 h-screen transition-all duration-300 ease-in-out border-r glass-card flex flex-col justify-between ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div>
        {/* Top Header Logo */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-slate-200/50 dark:border-slate-800/30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-bold text-lg shadow-md glow-dot">
              LF
            </div>
            {isOpen && (
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent truncate">
                LeadFlow <span className="text-brand-500 font-medium">AI</span>
              </span>
            )}
          </div>
          {isOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon size={20} className="shrink-0 transition-transform group-hover:scale-105" />
                {isOpen ? (
                  <span className="truncate">{item.name}</span>
                ) : (
                  <span className="absolute left-16 scale-0 rounded bg-slate-900 px-2.5 py-1.5 text-xs text-white group-hover:scale-100 shadow-md font-medium transition-all duration-150 z-30">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/30">
        {!isOpen && (
          <button
            onClick={toggleSidebar}
            className="w-full flex justify-center py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        )}
        
        {isOpen && user && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-200/20 dark:bg-slate-800/20 border border-slate-200/30 dark:border-slate-800/10 mb-2">
            <img src={user.avatar} alt="Avatar" className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
              <p className="text-[10px] text-slate-500 truncate capitalize">{user.role.replace('-', ' ')}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer ${
            isOpen ? '' : 'justify-center'
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
