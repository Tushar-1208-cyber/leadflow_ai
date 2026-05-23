import React, { useEffect, useState } from 'react';
import { useAuth, axios } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Sun, Moon, Menu, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 45s for fresh BDA alerts
      const interval = setInterval(fetchNotifications, 45000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      const res = await axios.put(`/notifications/${id}`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await axios.put('/notifications/read/all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read.');
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <header className="fixed top-0 right-0 z-10 h-16 glass-card border-b border-slate-200/50 dark:border-slate-800/30 flex items-center justify-between px-6 transition-all duration-300 ease-in-out"
      style={{ left: sidebarOpen ? '256px' : '80px' }}
    >
      {/* Sidebar Toggle Hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <Menu size={18} />
        </button>
        <span className="hidden md:inline text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-200/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 capitalize">
          Role: {user?.role?.replace('-', ' ') || 'Guest'}
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 transition-all duration-200 cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Icon Tray */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 transition-all duration-200 cursor-pointer relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-600 text-[10px] text-white flex items-center justify-center font-extrabold shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/60 shadow-2xl z-40 py-2.5 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/30">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Recent Activities</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Notification Body Container */}
              <div className="max-h-64 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkRead(n._id)}
                      className={`flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/20 hover:bg-slate-200/20 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${
                        !n.isRead ? 'bg-brand-500/5 dark:bg-brand-500/5' : ''
                      }`}
                    >
                      <div>
                        <p className="text-xs text-slate-800 dark:text-slate-300 pr-4 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!n.isRead && (
                        <div className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Separator */}
        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

        {/* User Card Widget */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block capitalize leading-none mt-0.5">
                {user.designation}
              </span>
            </div>
            <img
              src={user.avatar}
              alt="Profile"
              className="h-9 w-9 rounded-full object-cover border border-slate-200/50 dark:border-slate-800/50 hover:ring-2 hover:ring-brand-400 transition-all duration-200"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
