import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

const EmptyState = ({ title, description, actionText, onAction, icon: Icon = Sparkles }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/10 backdrop-blur-sm max-w-lg mx-auto py-16 transition-all duration-300">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 mb-6 glow-dot">
        <Icon size={26} />
      </div>
      <h3 className="text-base font-extrabold text-slate-950 dark:text-white tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Plus size={14} />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
