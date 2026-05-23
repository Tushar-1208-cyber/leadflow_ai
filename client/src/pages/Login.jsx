import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Briefcase, Shield, Sun, Moon } from 'lucide-react';

const Login = () => {
  const { login, register } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('bda-employee');
  const [designation, setDesignation] = useState('Business Development Associate');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLoginTab) {
      await login(email, password);
    } else {
      await register({
        name,
        email,
        password,
        role,
        designation,
        avatar: role === 'admin' 
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&fit=crop'
          : role === 'team-leader'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&fit=crop'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop'
      });
    }
    setSubmitting(false);
  };

  // Demo Login Quick-Fill
  const handleQuickFill = (demoType) => {
    setPassword('password123');
    if (demoType === 'admin') {
      setEmail('admin@leadflow.com');
    } else if (demoType === 'leader') {
      setEmail('leader@leadflow.com');
    } else {
      setEmail('bda@leadflow.com');
    }
    setIsLoginTab(true);
  };

  return (
    <div className="min-y-screen flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-4 overflow-y-auto transition-colors duration-300 relative">
      {/* Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Background Decorative Neon Gradients */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-brand-500/10 blur-[100px] shrink-0" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-brand-600/10 blur-[100px] shrink-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-8 shadow-2xl glass-card relative z-10"
      >
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-extrabold text-xl shadow-md glow-dot mb-4">
            LF
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to <span className="bg-gradient-to-r from-brand-500 to-brand-400 bg-clip-text text-transparent">LeadFlow AI</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manufacturing Sales Workflow Management Platform
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex rounded-xl bg-slate-200/40 dark:bg-slate-900/60 p-1 mb-6 border border-slate-200/30 dark:border-slate-800/10">
          <button
            onClick={() => setIsLoginTab(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isLoginTab
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginTab(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isLoginTab
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Request Access
          </button>
        </div>

        {/* Access Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <>
              {/* Name */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block mb-1.5 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 rounded-xl text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Roles */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block mb-1.5 ml-1">
                    System Role
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <Shield size={16} />
                    </span>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 rounded-xl text-xs text-slate-800 dark:text-slate-350 outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value="bda-employee" className="dark:bg-slate-900">BDA Employee</option>
                      <option value="team-leader" className="dark:bg-slate-900">Team Leader</option>
                      <option value="admin" className="dark:bg-slate-900">Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block mb-1.5 ml-1">
                    Designation
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <Briefcase size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sales BDA"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 rounded-xl text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 rounded-xl text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 rounded-xl text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 mt-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : isLoginTab ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        {/* Demo Fast-Login Helpers */}
        {isLoginTab && (
          <div className="mt-8 border-t border-slate-200/50 dark:border-slate-800/30 pt-6">
            <h4 className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3 text-center">
              Recruiter Demo Shortcuts (1-Click)
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickFill('bda')}
                className="flex-1 py-2 rounded-xl bg-slate-200/30 hover:bg-brand-500/10 text-slate-700 dark:text-slate-300 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/30 hover:border-brand-500/30 text-[10px] font-bold transition-all cursor-pointer"
              >
                Senior BDA
              </button>
              <button
                onClick={() => handleQuickFill('leader')}
                className="flex-1 py-2 rounded-xl bg-slate-200/30 hover:bg-brand-500/10 text-slate-700 dark:text-slate-300 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/30 hover:border-brand-500/30 text-[10px] font-bold transition-all cursor-pointer"
              >
                Team Leader
              </button>
              <button
                onClick={() => handleQuickFill('admin')}
                className="flex-1 py-2 rounded-xl bg-slate-200/30 hover:bg-brand-500/10 text-slate-700 dark:text-slate-300 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/30 hover:border-brand-500/30 text-[10px] font-bold transition-all cursor-pointer"
              >
                Manager/Admin
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
