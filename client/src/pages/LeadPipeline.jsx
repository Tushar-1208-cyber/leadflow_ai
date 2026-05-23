import React, { useEffect, useState } from 'react';
import { axios } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, AlertTriangle, HelpCircle, DollarSign, User, Flame, FolderGit } from 'lucide-react';
import toast from 'react-hot-toast';

const KANBAN_COLUMNS = [
  { id: 'New', title: 'New Leads', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { id: 'Contacted', title: 'Contacted', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'Interested', title: 'Interested', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { id: 'Proposal Sent', title: 'Proposal Sent', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'Negotiation', title: 'Negotiation', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
  { id: 'Won', title: 'Closed Won', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { id: 'Lost', title: 'Closed Lost', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
];

const LeadPipeline = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const fetchLeads = async () => {
    try {
      const res = await axios.get('/leads');
      if (res.data.success) {
        setLeads(res.data.leads);
      }
    } catch (err) {
      toast.error('Failed to load lead pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // HTML5 Drag Handlers
  const handleDragStart = (e, leadId) => {
    setDraggingId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggingId;
    if (!leadId) return;

    // Find the lead in local state
    const leadToMove = leads.find((l) => l._id === leadId);
    if (!leadToMove) return;

    // If no status change, ignore
    if (leadToMove.status === targetStatus) {
      setDragOverColumn(null);
      return;
    }

    // Optimistic UI Update
    const originalLeads = [...leads];
    setLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, status: targetStatus } : l))
    );

    try {
      toast.loading('Updating pipeline...', { id: 'kanban-toast' });
      
      // Post change to server
      const res = await axios.put(`/leads/${leadId}`, { status: targetStatus });
      if (res.data.success) {
        toast.success(`Moved lead to ${targetStatus}!`, { id: 'kanban-toast' });
        // Update local state with fresh data from database
        setLeads((prev) =>
          prev.map((l) => (l._id === leadId ? res.data.lead : l))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unauthorized status change', { id: 'kanban-toast' });
      // Rollback to original state on error
      setLeads(originalLeads);
    } finally {
      setDragOverColumn(null);
      setDraggingId(null);
    }
  };

  // Organize leads by status columns
  const getLeadsByStatus = (status) => {
    return leads.filter((l) => l.status === status);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-44 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 h-[70vh]">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="bg-slate-200/50 dark:bg-slate-800/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Kanban Pipeline
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Drag and drop lead cards to change pipeline status. Metrics synchronize in real-time.
        </p>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 h-[75vh] items-stretch snap-x">
        {KANBAN_COLUMNS.map((col) => {
          const colLeads = getLeadsByStatus(col.id);
          const totalColAmount = colLeads.reduce((sum, l) => sum + (l.dealAmount || 0), 0);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragLeave={() => setDragOverColumn(null)}
              className={`flex-1 min-w-[280px] max-w-[340px] rounded-2xl border transition-all duration-200 flex flex-col snap-start bg-slate-100/40 dark:bg-slate-900/10 ${
                isOver
                  ? 'border-brand-500 bg-brand-500/5 shadow-lg'
                  : 'border-slate-200/50 dark:border-slate-800/20'
              }`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/20 flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${col.color}`}>
                    {col.title}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-200/40 dark:bg-slate-800/40 px-2 py-0.5 rounded-full">
                    {colLeads.length}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-0.5">
                  <DollarSign size={13} className="text-slate-400" />
                  {totalColAmount.toLocaleString()}
                </span>
              </div>

              {/* Column Card Body container */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3.5 kanban-scroll max-h-[60vh]">
                <AnimatePresence>
                  {colLeads.map((lead) => (
                    <motion.div
                      key={lead._id}
                      layout
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead._id)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 rounded-xl border glass-card shadow-sm cursor-grab active:cursor-grabbing border-slate-200/55 dark:border-slate-800/15 group hover:border-brand-400 dark:hover:border-brand-800 transition-all ${
                        draggingId === lead._id ? 'opacity-30 border-dashed scale-95' : ''
                      }`}
                    >
                      {/* Priority Badges */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[9px] font-extrabold text-slate-400 tracking-tight flex items-center gap-1">
                          <FolderGit size={10} />
                          {lead.industry}
                        </span>
                        
                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-0.5 ${
                          lead.priority === 'High' ? 'bg-rose-500/10 text-rose-500' :
                          lead.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {lead.priority === 'High' && <Flame size={8} />}
                          {lead.priority}
                        </span>
                      </div>

                      {/* Client Details */}
                      <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-650 dark:group-hover:text-brand-400 truncate">
                        {lead.companyName}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 truncate">
                        Attn: {lead.leadName}
                      </p>

                      {/* Footer: Amount & Assignee */}
                      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/10">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-300">
                          ${lead.dealAmount?.toLocaleString() || 0}
                        </span>
                        
                        {lead.assignedTo ? (
                          <div className="flex items-center gap-1.5" title={lead.assignedTo.name}>
                            <img
                              src={lead.assignedTo.avatar}
                              alt="Avatar"
                              className="h-5 w-5 rounded-full object-cover border border-slate-250 dark:border-slate-700"
                            />
                            <span className="text-[9px] font-bold text-slate-450 dark:text-slate-400 hidden sm:inline max-w-[60px] truncate">
                              {lead.assignedTo.name.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 italic">Unassigned</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {colLeads.length === 0 && (
                  <div className="h-28 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-center px-4">
                    <span className="text-[10px] text-slate-400 italic">Drag leads here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadPipeline;
