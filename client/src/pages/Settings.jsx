import React, { useState } from 'react';
import { useAuth, axios } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User,
  Lock,
  Sun,
  Moon,
  Bell,
  Save,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUserState } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  // Profile details form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password details form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference details form state
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [followupAlerts, setFollowupAlerts] = useState(true);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/auth/updatedetails', { name, email, avatar });
      if (res.data.success) {
        updateUserState(res.data.user);
        toast.success('Profile details updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update details');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      const res = await axios.put('/auth/updatepassword', { currentPassword, newPassword });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    toast.success('Notification preferences updated!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize profile variables, manage credentials, and toggle premium dark themes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold leading-relaxed">
        {/* 1. EDIT PROFILE DETAILS */}
        <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/15 glass-card shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <User size={16} className="text-brand-500" /> Account Profile
          </h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Avatar Image URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white text-[10px] font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Save size={14} /> Save Details
            </button>
          </form>
        </div>

        {/* 2. CHANGE PASSWORD */}
        <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/15 glass-card shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock size={16} className="text-brand-500" /> Security Credentials
          </h3>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Save size={14} /> Update Password
            </button>
          </form>
        </div>

        {/* 3. VISUAL DISPLAY SELECTOR */}
        <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/15 glass-card shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun size={16} className="text-brand-500" /> UI Customization
          </h3>
          
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-850/10 bg-white/30 dark:bg-slate-950/10">
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white">Persistent Dark Theme</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Toggle sleek SaaS productivity aesthetics</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-250 cursor-pointer border ${
                  darkMode ? 'bg-brand-500 border-brand-600' : 'bg-slate-200 border-slate-350'
                }`}
              >
                <div
                  className={`h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-250 flex items-center justify-center text-slate-650 ${
                    darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                >
                  {darkMode ? <Moon size={10} /> : <Sun size={10} />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 4. NOTIFICATION SETTINGS */}
        <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/15 glass-card shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={16} className="text-brand-500" /> Workspace Preferences
          </h3>
          
          <form onSubmit={handleSavePreferences} className="space-y-4 pt-2">
            <div className="space-y-3.5">
              <label className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 dark:border-slate-850/10 bg-white/30 dark:bg-slate-950/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taskAlerts}
                  onChange={(e) => setTaskAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-650 focus:ring-brand-500 cursor-pointer shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white leading-none">High-Priority Task Deadlines</h4>
                  <p className="text-[9px] text-slate-400 mt-1 leading-none">Send alarms for impending follow-ups</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 dark:border-slate-850/10 bg-white/30 dark:bg-slate-950/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={followupAlerts}
                  onChange={(e) => setFollowupAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-650 focus:ring-brand-500 cursor-pointer shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white leading-none">Automated Reassignments</h4>
                  <p className="text-[9px] text-slate-400 mt-1 leading-none">Alert tray when leads are reassigned</p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <CheckCircle size={14} /> Update Preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
