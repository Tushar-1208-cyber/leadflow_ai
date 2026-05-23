import React, { useEffect, useState } from 'react';
import { axios } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard, SkeletonTable } from '../components/Loader';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Award,
  Sparkles,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable />
      </div>
    );
  }

  const stats = data?.stats;
  const recentActivities = data?.recentActivities || [];
  const aiInsights = data?.aiInsights || [];
  const monthlySales = data?.monthlySales || [];
  const funnelData = data?.funnelData || [];
  const teamRankings = data?.teamRankings || [];

  // Curated color grid for funnel bars
  const colors = ['#6ca1d3', '#4782c0', '#3568a3', '#2c5485', '#27476f', '#4ade80', '#f87171'];

  return (
    <div className="space-y-6">
      {/* 1. Header welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-bold text-slate-700 dark:text-slate-350">{user?.name}</span>. Here is your team's sales momentum today.
          </p>
        </div>
        
        {/* Productivity Score Card (BDA Specific) */}
        {user?.role === 'bda-employee' && (
          <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl border border-brand-500/10 dark:border-brand-500/5 bg-brand-500/5 dark:bg-brand-500/5 backdrop-blur-sm">
            <span className="text-[10px] font-extrabold uppercase text-brand-600 dark:text-brand-400 tracking-wider">
              Productivity score
            </span>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-16 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${user?.productivityScore || 75}%` }}
                />
              </div>
              <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                {user?.productivityScore || 75}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Counter Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active leads */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200/50 shadow-sm flex items-center justify-between group glass-card-hover">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-450 dark:text-slate-400 tracking-wider block">
              Active Pipeline Leads
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats?.activeLeads || 0}
              </span>
              <span className="text-[10px] text-slate-500">out of {stats?.totalLeads || 0} total</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 glow-dot">
            <Briefcase size={20} />
          </div>
        </div>

        {/* Won deals */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200/50 shadow-sm flex items-center justify-between group glass-card-hover">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-450 dark:text-slate-400 tracking-wider block">
              Closed Won Deals
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats?.wonLeadsCount || 0}
              </span>
              <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5">
                <CheckCircle size={10} /> Success
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
        </div>

        {/* Total revenue */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200/50 shadow-sm flex items-center justify-between group glass-card-hover">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-450 dark:text-slate-400 tracking-wider block">
              Revenue Generated
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white truncate max-w-[140px]">
                ${stats?.totalRevenue?.toLocaleString() || 0}
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Conversion rate */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200/50 shadow-sm flex items-center justify-between group glass-card-hover">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-450 dark:text-slate-400 tracking-wider block">
              BDA Conversion Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats?.conversionRate || 0}%
              </span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                stats?.conversionRate > 50 ? 'text-green-500' : 'text-amber-500'
              }`}>
                <TrendingUp size={10} /> Optimized
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* 3. AI Insights Widget */}
      <div className="p-6 rounded-2xl border border-brand-500/10 dark:border-brand-500/5 bg-brand-500/5 dark:bg-brand-500/5 shadow-inner">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg bg-brand-500/20 text-brand-500 flex items-center justify-center glow-dot shrink-0">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <h3 className="text-xs font-black text-brand-600 dark:text-brand-400 tracking-tight uppercase">
            LeadFlow AI Sales Insights
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/45 dark:border-slate-800/20 flex gap-3.5 items-start">
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                insight.type === 'opportunity' ? 'bg-green-500/10 text-green-500' :
                insight.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                insight.type === 'critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-brand-500/10 text-brand-500'
              }`}>
                {insight.type === 'warning' || insight.type === 'critical' ? <AlertTriangle size={14} /> : <Sparkles size={14} />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{insight.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Chart Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sales Growth line chart */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200/50 shadow-sm lg:col-span-3 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white tracking-tight">
              Monthly Sales Growth
            </h3>
            <p className="text-[10px] text-slate-500">Cumulative revenue curves across BDA pipelines</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4782c0" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4782c0" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.2)"/>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4782c0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel pipeline stage bars */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200/50 shadow-sm lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white tracking-tight">
              Sales Pipeline Funnel
            </h3>
            <p className="text-[10px] text-slate-500">Volumetric lead distribution by pipeline states</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.1)"/>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(value, name, props) => [`${value} leads ($${props.payload.amount.toLocaleString()})`, 'Leads']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Bottom Rows: Team Performers & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance tracking lists (Only for team leader & admins) */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200/50 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white tracking-tight">
              Top Sales Performers
            </h3>
            <p className="text-[10px] text-slate-500">Productivity ranking of BDA associates</p>
          </div>
          
          <div className="space-y-4 mt-2">
            {teamRankings.map((member, index) => (
              <div key={member._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/10 bg-white/30 dark:bg-slate-900/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-400 w-4">#{index + 1}</span>
                  <img src={member.avatar} alt="Avatar" className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-800" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{member.name}</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">Won: {member.dealsClosed} | Revenue: ${member.revenueGenerated.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[9px] font-extrabold uppercase text-slate-450 tracking-wider">Productivity</span>
                  <span className={`text-xs font-black ${
                    member.productivityScore >= 80 ? 'text-green-500' :
                    member.productivityScore >= 60 ? 'text-brand-500' : 'text-amber-500'
                  }`}>
                    {member.productivityScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Workspace activity timeline */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200/50 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white tracking-tight">
              Recent Activity Feed
            </h3>
            <p className="text-[10px] text-slate-500">Real-time collaborative updates across channels</p>
          </div>
          
          <div className="space-y-4 relative mt-2 pl-3">
            {/* Thread line */}
            <div className="absolute left-[23px] top-4 bottom-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

            {recentActivities.map((act) => (
              <div key={act._id} className="flex gap-4 relative">
                <img
                  src={act.performedBy?.avatar}
                  alt="User"
                  className="h-6 w-6 rounded-full object-cover border border-slate-200 dark:border-slate-800 z-10 shrink-0 mt-0.5"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-300">
                    {act.action}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{act.details}</p>
                  <span className="text-[8px] text-slate-400 block mt-1 flex items-center gap-1">
                    <Clock size={8} /> {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
