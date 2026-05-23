import React from 'react';

// Spinner loader for full screen checks
export const Spinner = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-bold text-lg shadow-md flex items-center justify-center animate-bounce glow-dot">
          LF
        </div>
        <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-1/2 bg-brand-500 rounded-full animate-infinite-slide" />
        </div>
        <span className="text-xs text-slate-400 font-semibold tracking-wider animate-pulse">Loading LeadFlow AI...</span>
      </div>
      
      {/* Custom inline animation in stylesheet */}
      <style>{`
        @keyframes infinite-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-infinite-slide {
          animation: infinite-slide 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

// Shimmer block loader for dashboard layouts
export const SkeletonCard = () => {
  return (
    <div className="p-6 rounded-2xl glass-card border border-slate-200/50 dark:border-slate-850/20 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-7 w-16 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="h-3.5 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
};

// Larger grid content placeholder
export const SkeletonTable = () => {
  return (
    <div className="glass-card border border-slate-200/50 dark:border-slate-850/20 rounded-2xl p-6 shadow-sm animate-pulse space-y-5">
      <div className="flex justify-between">
        <div className="h-8 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="flex gap-4 border-b border-slate-100 dark:border-slate-800/10 pb-4">
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="h-5 w-1/4 bg-slate-200 dark:bg-slate-800 rounded self-center" />
            <div className="h-5 w-1/6 bg-slate-200 dark:bg-slate-800 rounded self-center" />
            <div className="h-5 w-1/5 bg-slate-200 dark:bg-slate-800 rounded self-center" />
            <div className="h-5 w-12 bg-slate-300 dark:bg-slate-700 rounded ml-auto self-center" />
          </div>
        ))}
      </div>
    </div>
  );
};
