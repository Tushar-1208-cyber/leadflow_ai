import React, { useEffect, useState } from 'react';
import { axios } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { SkeletonTable } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import {
  Table as TableIcon,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MessageSquare,
  History,
  Calendar,
  DollarSign,
  Briefcase,
  Layers,
  Phone,
  Mail,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

const LeadsTable = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Active items
  const [activeLead, setActiveLead] = useState(null);
  const [activeLeadComments, setActiveLeadComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    leadName: '',
    companyName: '',
    industry: '',
    email: '',
    phone: '',
    status: 'New',
    priority: 'Medium',
    dealAmount: 0,
    notes: '',
  });

  const [teamMembers, setTeamMembers] = useState([]);

  // Fetch leads
  const fetchLeads = async () => {
    try {
      const res = await axios.get('/leads', {
        params: {
          search,
          status: statusFilter,
          priority: priorityFilter,
        },
      });
      if (res.data.success) {
        setLeads(res.data.leads);
      }
    } catch (err) {
      toast.error('Failed to load leads list');
    } finally {
      setLoading(false);
    }
  };

  // Fetch BDA team lists for assignment select (only for leaders/admins)
  const fetchTeam = async () => {
    try {
      const res = await axios.get('/team');
      if (res.data.success) {
        setTeamMembers(res.data.team);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    if (user && user.role !== 'bda-employee') {
      fetchTeam();
    }
  }, [user]);

  // Lead CRUD operations
  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/leads', formData);
      if (res.data.success) {
        toast.success('Lead created successfully!');
        setIsCreateModalOpen(false);
        resetForm();
        fetchLeads();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    }
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/leads/${activeLead._id}`, formData);
      if (res.data.success) {
        toast.success('Lead updated successfully!');
        setIsEditModalOpen(false);
        resetForm();
        fetchLeads();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this lead?')) {
      try {
        const res = await axios.delete(`/leads/${id}`);
        if (res.data.success) {
          toast.success('Lead deleted successfully.');
          fetchLeads();
        }
      } catch (err) {
        toast.error('Failed to delete lead.');
      }
    }
  };

  // Comments & Interaction Logs
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(`/leads/${activeLead._id}/comments`, { text: newComment });
      if (res.data.success) {
        setActiveLeadComments((prev) => [res.data.comment, ...prev]);
        setNewComment('');
        toast.success('Comment added.');
      }
    } catch (err) {
      toast.error('Could not post comment.');
    }
  };

  // Open Details Modal with history & populated comments
  const handleOpenDetails = async (lead) => {
    setActiveLead(lead);
    try {
      const res = await axios.get(`/leads/${lead._id}`);
      if (res.data.success) {
        setActiveLeadComments(res.data.comments || []);
      }
    } catch (err) {
      console.error(err.message);
    }
    setIsDetailsModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setActiveLead(lead);
    setFormData({
      leadName: lead.leadName,
      companyName: lead.companyName,
      industry: lead.industry,
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status,
      priority: lead.priority,
      dealAmount: lead.dealAmount || 0,
      notes: lead.notes || '',
      assignedTo: lead.assignedTo?._id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      leadName: '',
      companyName: '',
      industry: '',
      email: '',
      phone: '',
      status: 'New',
      priority: 'Medium',
      dealAmount: 0,
      notes: '',
      assignedTo: '',
    });
    setActiveLead(null);
  };

  // CSV Exporter Handler
  const handleCSVExport = () => {
    const url = `${axios.defaults.baseURL}/leads/export/csv`;
    // Create direct anchor element download trigger
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV export initiated.');
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Leads Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyze, filter, register, and coordinate discussion threads for all clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCSVExport}
            className="btn-glass text-xs py-2.5"
            title="Download pipeline CSV data"
          >
            <Download size={14} />
            Export CSV
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Plus size={14} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Grid search inputs & filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/40 dark:bg-slate-900/10 p-4 border border-slate-200/50 dark:border-slate-800/15 rounded-2xl backdrop-blur-sm shadow-sm">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by lead contact or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-brand-500 text-slate-850 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-450">
            <Layers size={14} />
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-brand-500 text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-450">
            <Filter size={14} />
          </span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-brand-500 text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Leads Grid or Table List */}
      {loading ? (
        <SkeletonTable />
      ) : leads.length === 0 ? (
        <EmptyState
          title="No Leads Found"
          description="We couldn't find any clients matching those search filters in the database."
          actionText="Add New Lead"
          onAction={handleOpenCreate}
          icon={TableIcon}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/15 shadow-sm bg-white dark:bg-slate-900/10 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/20 bg-slate-50 dark:bg-slate-950/20 text-[10px] font-black uppercase text-slate-450 tracking-wider">
                  <th className="px-6 py-4">Client / Company</th>
                  <th className="px-6 py-4">Industry</th>
                  <th className="px-6 py-4">Deal Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Assigned BDA</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/10 text-xs font-semibold text-slate-800 dark:text-slate-300">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-200/20 dark:hover:bg-slate-800/25 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="font-extrabold text-slate-950 dark:text-white">{lead.companyName}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{lead.leadName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 capitalize">{lead.industry}</td>
                    <td className="px-6 py-4 font-extrabold">${lead.dealAmount?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        lead.status === 'Won' ? 'bg-green-500/10 text-green-500 border-green-500/10' :
                        lead.status === 'Lost' ? 'bg-rose-500/10 text-rose-500 border-rose-500/10' :
                        lead.status === 'Negotiation' ? 'bg-violet-500/10 text-violet-500 border-violet-500/10' :
                        lead.status === 'Proposal Sent' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' : 'bg-brand-500/10 text-brand-500 border-brand-500/10'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        lead.priority === 'High' ? 'bg-rose-500/10 text-rose-500' :
                        lead.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={lead.assignedTo.avatar}
                            alt="Avatar"
                            className="h-5 w-5 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                          />
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400">
                            {lead.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] italic text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => handleOpenDetails(lead)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 transition-colors cursor-pointer"
                          title="View lead discussion & history logs"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-brand-650 dark:text-brand-450 transition-colors cursor-pointer"
                          title="Edit lead specifications"
                        >
                          <Edit2 size={13} />
                        </button>
                        {user && user.role !== 'bda-employee' && (
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                            title="Delete Lead record"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Creation Dialog Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Sales Lead">
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Company Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Piping"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Lead Attn Contact</label>
              <input
                type="text"
                required
                placeholder="e.g. Dave Miller"
                value={formData.leadName}
                onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Industry Sector</label>
              <input
                type="text"
                placeholder="e.g. Metallurgy"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Deal Volume ($)</label>
              <input
                type="number"
                placeholder="Amount in USD"
                value={formData.dealAmount}
                onChange={(e) => setFormData({ ...formData, dealAmount: Number(e.target.value) })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Email</label>
              <input
                type="email"
                placeholder="buyer@client.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-700 dark:text-slate-350 cursor-pointer"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            {user && user.role !== 'bda-employee' && (
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Assign Associate</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-700 dark:text-slate-350 cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.filter(t => t.role === 'bda-employee').map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.designation})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Meeting Notes / Detail Context</label>
            <textarea
              rows={3}
              placeholder="Initial lead brief context..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer mt-4"
          >
            Create Lead Record
          </button>
        </form>
      </Modal>

      {/* CRUD Edit Dialog Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Lead: ${activeLead?.companyName}`}>
        <form onSubmit={handleUpdateLead} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Company Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Lead Attn Contact</label>
              <input
                type="text"
                required
                value={formData.leadName}
                onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Industry Sector</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Deal Volume ($)</label>
              <input
                type="number"
                value={formData.dealAmount}
                onChange={(e) => setFormData({ ...formData, dealAmount: Number(e.target.value) })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-700 dark:text-slate-350 cursor-pointer"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Pipeline Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-700 dark:text-slate-350 cursor-pointer"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          {user && user.role !== 'bda-employee' && (
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Assign Associate</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-700 dark:text-slate-350 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {teamMembers.filter(t => t.role === 'bda-employee').map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.designation})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Meeting Notes / Detail Context</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer mt-4"
          >
            Update Lead Record
          </button>
        </form>
      </Modal>

      {/* DEEP DETAILED VIEW DIALOG MODAL (With Discussions & History Logs) */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`Lead Profile: ${activeLead?.companyName}`}>
        <div className="space-y-6 text-xs font-semibold leading-relaxed">
          {/* Main Info Row */}
          <div className="grid grid-cols-2 gap-4 border-b border-slate-200/50 dark:border-slate-850/20 pb-4">
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block">Contact Details</span>
              <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">{activeLead?.leadName}</h4>
              <p className="text-slate-500 dark:text-slate-400 capitalize">{activeLead?.industry} Specialist</p>
              <div className="flex flex-col gap-1.5 mt-2.5 text-slate-500">
                <span className="flex items-center gap-2"><Phone size={12} /> {activeLead?.phone || 'No phone logged'}</span>
                <span className="flex items-center gap-2"><Mail size={12} /> {activeLead?.email || 'No email logged'}</span>
              </div>
            </div>
            <div className="space-y-2 border-l border-slate-100 dark:border-slate-850/10 pl-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block">Deal Summary</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-950 dark:text-white">${activeLead?.dealAmount?.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">USD</span>
              </div>
              <p className="text-slate-500 mt-1 flex items-center gap-1.5">
                <Layers size={12} /> Pipeline Stage: 
                <span className="font-extrabold text-brand-600 dark:text-brand-400">{activeLead?.status}</span>
              </p>
              {activeLead?.assignedTo && (
                <div className="flex items-center gap-2 mt-3 pt-2">
                  <img src={activeLead.assignedTo.avatar} alt="Avatar" className="h-6 w-6 rounded-full object-cover" />
                  <div>
                    <h5 className="font-extrabold text-[10px] text-slate-900 dark:text-white leading-none">{activeLead.assignedTo.name}</h5>
                    <span className="text-[8px] text-slate-400">{activeLead.assignedTo.designation}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Brief */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><Briefcase size={12} /> Account Notes</span>
            <p className="p-3 bg-slate-200/30 dark:bg-slate-950/20 border border-slate-200/30 dark:border-slate-850/10 rounded-xl text-slate-600 dark:text-slate-400 italic">
              {activeLead?.notes || 'No briefing added to this lead.'}
            </p>
          </div>

          {/* Discussions Comments thread */}
          <div className="space-y-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><MessageSquare size={12} /> BDA Collaboration Thread ({activeLeadComments.length})</span>
            
            {/* Comment input form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Type a team update or comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send size={12} />
              </button>
            </form>

            {/* Comment Thread List */}
            <div className="space-y-3 max-h-40 overflow-y-auto mt-2 pr-1.5">
              {activeLeadComments.map((comment) => (
                <div key={comment._id} className="flex gap-3 items-start p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/10 bg-slate-200/10 dark:bg-slate-950/10">
                  <img src={comment.author?.avatar} alt="Author" className="h-6 w-6 rounded-full object-cover shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[10px] text-slate-900 dark:text-white">{comment.author?.name}</span>
                      <span className="text-[8px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-650 dark:text-slate-400 mt-1 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History Auditing logs */}
          <div className="space-y-3 pt-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><History size={12} /> Pipeline Audits ({activeLead?.history?.length})</span>
            <div className="space-y-2 max-h-32 overflow-y-auto pl-2">
              {activeLead?.history?.slice().reverse().map((h, i) => (
                <div key={i} className="flex gap-3 border-l border-slate-200 dark:border-slate-800 pl-3.5 relative">
                  <div className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-brand-400 dark:bg-brand-500 shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-[10px] text-slate-800 dark:text-slate-350">{h.action}</h5>
                    <span className="text-[8px] text-slate-400 block mt-0.5">Logged by {h.performedBy} on {new Date(h.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadsTable;
