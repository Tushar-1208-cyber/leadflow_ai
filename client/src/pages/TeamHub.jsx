import React, { useEffect, useState } from 'react';
import { axios } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard } from '../components/Loader';
import Modal from '../components/Modal';
import {
  Users,
  Plus,
  Trash2,
  TrendingUp,
  Award,
  Briefcase,
  DollarSign,
  UserCheck,
  RefreshCw,
  Mail,
  Shield,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TeamHub = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add Member form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123', // Demo default
    role: 'bda-employee',
    designation: 'Business Development Associate',
  });

  const fetchTeam = async () => {
    try {
      const res = await axios.get('/team');
      if (res.data.success) {
        setTeam(res.data.team);
      }
    } catch (err) {
      toast.error('Failed to load team directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/team', formData);
      if (res.data.success) {
        toast.success(`Account created for ${formData.name}!`);
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: 'password123',
          role: 'bda-employee',
          designation: 'Business Development Associate',
        });
        fetchTeam();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add team member');
    }
  };

  const handleRemoveMember = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the BDA team? All active leads will be set to unassigned.`)) {
      try {
        const res = await axios.delete(`/team/${id}`);
        if (res.data.success) {
          toast.success(`${name} has been removed.`);
          fetchTeam();
        }
      } catch (err) {
        toast.error('Only Admins are authorized to remove staff accounts');
      }
    }
  };

  const handleRecalculate = async (id, name) => {
    try {
      toast.loading(`Recalculating score for ${name}...`, { id: 'calc-toast' });
      const res = await axios.put(`/team/${id}/recalculate`);
      if (res.data.success) {
        toast.success(`Recalculated! ${name} productivity index is now ${res.data.member.productivityScore}%!`, { id: 'calc-toast' });
        fetchTeam();
      }
    } catch (err) {
      toast.error('Failed to update scores', { id: 'calc-toast' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header sections */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Team Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Oversee BDA activities, inspect deals won, and recalculate productivity scores.
          </p>
        </div>

        {user && user.role !== 'bda-employee' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <UserPlus size={14} />
            Register Staff
          </button>
        )}
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <div
              key={member._id}
              className="rounded-2xl border border-slate-200/50 dark:border-slate-800/15 p-6 glass-card shadow-sm space-y-5 flex flex-col justify-between group glass-card-hover"
            >
              {/* Profile Card Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <img
                    src={member.avatar}
                    alt="Avatar"
                    className="h-12 w-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-850 shrink-0"
                  />
                  <div>
                    <h3 className="text-xs font-black text-slate-950 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {member.name}
                    </h3>
                    <p className="text-[10px] text-slate-450 mt-0.5">{member.designation}</p>
                    <span className={`inline-block text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border mt-2 ${
                      member.role === 'admin' ? 'bg-rose-500/10 text-rose-500 border-rose-500/10' :
                      member.role === 'team-leader' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' : 'bg-brand-500/10 text-brand-500 border-brand-500/10'
                    }`}>
                      {member.role.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* System actions */}
                <div className="flex items-center gap-1">
                  {user && user.role !== 'bda-employee' && (
                    <button
                      onClick={() => handleRecalculate(member._id, member.name)}
                      className="p-1 text-slate-400 hover:text-brand-500 rounded hover:bg-brand-500/5 cursor-pointer"
                      title="Recalculate BDA stats from database"
                    >
                      <RefreshCw size={13} />
                    </button>
                  )}
                  {user && user.role === 'admin' && member._id !== user.id && (
                    <button
                      onClick={() => handleRemoveMember(member._id, member.name)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-500/5 cursor-pointer"
                      title="Deactivate staff account"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Performance Score */}
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-850/10 pt-3">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                  <span>Productivity Score</span>
                  <span className="text-brand-650 dark:text-brand-400">{member.productivityScore}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      member.productivityScore >= 80 ? 'bg-green-500 animate-pulse' :
                      member.productivityScore >= 60 ? 'bg-brand-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${member.productivityScore}%` }}
                  />
                </div>
              </div>

              {/* Counters Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-extrabold border-t border-slate-100 dark:border-slate-850/10 pt-4 mt-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-tight">Active</span>
                  <span className="text-slate-900 dark:text-white flex items-center justify-center gap-0.5">
                    <Briefcase size={10} className="text-slate-400" /> {member.activeLeads}
                  </span>
                </div>
                <div className="space-y-1 border-x border-slate-100 dark:border-slate-850/10">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-tight">Closed</span>
                  <span className="text-green-500 flex items-center justify-center gap-0.5">
                    <Award size={10} /> {member.dealsClosed}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-tight">Revenue</span>
                  <span className="text-slate-900 dark:text-white truncate block text-[10px] flex items-center justify-center gap-0.5">
                    <DollarSign size={9} className="text-slate-400" />
                    {member.revenueGenerated >= 1000 ? `${Math.round(member.revenueGenerated/1000)}K` : member.revenueGenerated}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Registration Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Team Associate">
        <form onSubmit={handleAddMember} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Tushar Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="bda@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Set Password</label>
              <input
                type="password"
                required
                placeholder="password123"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-750 dark:text-slate-350 cursor-pointer"
              >
                <option value="bda-employee">BDA Employee</option>
                <option value="team-leader">Team Leader</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Official Designation</label>
            <input
              type="text"
              required
              placeholder="e.g. Heavy Steel Division BDA"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer mt-4"
          >
            Create Staff Account
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TeamHub;
