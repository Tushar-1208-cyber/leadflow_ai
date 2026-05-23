import React, { useEffect, useState } from 'react';
import { axios } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import {
  Calendar,
  Plus,
  CheckCircle,
  Clock,
  User,
  Flame,
  AlertCircle,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TasksCalendar = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Field parameters
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
    priority: 'Medium',
  });

  const [teamMembers, setTeamMembers] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/tasks');
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      toast.error('Failed to load task schedules');
    } finally {
      setLoading(false);
    }
  };

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
    fetchTasks();
    if (user && user.role !== 'bda-employee') {
      fetchTeam();
    }
  }, [user]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // If BDA Employee, they assign to themselves automatically
      const taskPayload = {
        ...formData,
        assignedTo: user.role === 'bda-employee' ? user.id : formData.assignedTo,
      };

      if (!taskPayload.assignedTo) {
        return toast.error('Please assign a BDA employee');
      }

      const res = await axios.post('/tasks', taskPayload);
      if (res.data.success) {
        toast.success('Task created and BDA alerted!');
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          assignedTo: '',
          deadline: '',
          priority: 'Medium',
        });
        fetchTasks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule task');
    }
  };

  const handleToggleComplete = async (task) => {
    if (task.status === 'Completed') return; // Cannot un-complete for demo score stability

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: 'Completed' } : t))
    );

    try {
      const res = await axios.put(`/tasks/${task._id}`, { status: 'Completed' });
      if (res.data.success) {
        toast.success('Task completed! Productivity score boosted!');
        fetchTasks(); // Reload fresh user scores
      }
    } catch (err) {
      toast.error('Failed to update task');
      // Rollback
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        const res = await axios.delete(`/tasks/${id}`);
        if (res.data.success) {
          toast.success('Task deleted.');
          fetchTasks();
        }
      } catch (err) {
        toast.error('Failed to delete task.');
      }
    }
  };

  // Helper checking if deadline has passed
  const isOverdue = (task) => {
    return task.status === 'Pending' && new Date(task.deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header sections */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tasks & Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track follow-ups, BDA calls, contract review dates, and keep pipeline metrics clean.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              assignedTo: user.role === 'bda-employee' ? user.id : '',
              deadline: '',
              priority: 'Medium',
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Plus size={14} />
          Create Task
        </button>
      </div>

      {/* Main Task Lanes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="All Caught Up!"
          description="You don't have any pending follow-ups or tasks scheduled right now."
          actionText="Create New Task"
          onAction={() => setIsModalOpen(true)}
          icon={ListTodo}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. HIGH PRIORITY LANE */}
          <div className="p-5 rounded-2xl border border-rose-500/10 dark:border-rose-500/5 bg-slate-100/30 dark:bg-slate-900/10 flex flex-col gap-4">
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Flame size={12} /> High Priority
              </span>
              <span className="text-[10px] font-black text-slate-400">
                {tasks.filter((t) => t.priority === 'High').length} items
              </span>
            </div>

            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {tasks.filter((t) => t.priority === 'High').map((task) => (
                <TaskCard key={task._id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} isOverdue={isOverdue(task)} showDelete={user.role !== 'bda-employee'} />
              ))}
            </div>
          </div>

          {/* 2. MEDIUM PRIORITY LANE */}
          <div className="p-5 rounded-2xl border border-amber-500/10 dark:border-amber-500/5 bg-slate-100/30 dark:bg-slate-900/10 flex flex-col gap-4">
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Clock size={12} /> Medium Priority
              </span>
              <span className="text-[10px] font-black text-slate-400">
                {tasks.filter((t) => t.priority === 'Medium').length} items
              </span>
            </div>

            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {tasks.filter((t) => t.priority === 'Medium').map((task) => (
                <TaskCard key={task._id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} isOverdue={isOverdue(task)} showDelete={user.role !== 'bda-employee'} />
              ))}
            </div>
          </div>

          {/* 3. LOW PRIORITY LANE */}
          <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/15 bg-slate-100/30 dark:bg-slate-900/10 flex flex-col gap-4">
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-200/40 border border-slate-200/30 px-2.5 py-1 rounded-md">
                Low Priority
              </span>
              <span className="text-[10px] font-black text-slate-400">
                {tasks.filter((t) => t.priority === 'Low').length} items
              </span>
            </div>

            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {tasks.filter((t) => t.priority === 'Low').map((task) => (
                <TaskCard key={task._id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} isOverdue={isOverdue(task)} showDelete={user.role !== 'bda-employee'} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Creation schedule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule BDA Task">
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule call with Apex Metal"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Context Description</label>
            <textarea
              rows={3}
              placeholder="Detail task instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Due Date</label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-700 dark:text-slate-350 cursor-pointer"
              />
            </div>
            
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
          </div>

          {user && user.role !== 'bda-employee' && (
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Assign Associate</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-slate-700 dark:text-slate-350 cursor-pointer"
              >
                <option value="">Choose Employee</option>
                {teamMembers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name} ({t.designation})</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer mt-4"
          >
            Confirm Schedule
          </button>
        </form>
      </Modal>
    </div>
  );
};

// Reusable Inner Task Card
const TaskCard = ({ task, onToggle, onDelete, isOverdue, showDelete }) => {
  return (
    <div className={`p-4 rounded-xl border glass-card shadow-sm space-y-3 relative group transition-all duration-200 hover:border-brand-400 dark:hover:border-brand-800 ${
      task.status === 'Completed' ? 'opacity-60 bg-slate-50/80 dark:bg-slate-900/5 border-slate-200/20' : ''
    }`}>
      {/* Top details */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-2.5 items-start">
          <button
            onClick={() => onToggle(task)}
            disabled={task.status === 'Completed'}
            className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
              task.status === 'Completed'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-slate-300 dark:border-slate-700 hover:border-brand-500 cursor-pointer'
            }`}
          >
            {task.status === 'Completed' && <CheckCircle2 size={12} />}
          </button>
          
          <div className="space-y-1">
            <h4 className={`text-xs font-black text-slate-900 dark:text-white leading-relaxed ${
              task.status === 'Completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}>
              {task.title}
            </h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 pr-4 leading-normal">{task.description}</p>
          </div>
        </div>

        {showDelete && (
          <button
            onClick={() => onDelete(task._id)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/10 text-rose-500 rounded border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/10 transition-all cursor-pointer shrink-0 absolute top-3 right-3"
          >
            <CheckCircle size={10} className="hidden" />
            <span className="text-[8px] font-bold block select-none">Delete</span>
          </button>
        )}
      </div>

      {/* Footer assignee & deadline */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/10">
        <span className={`text-[9px] font-bold flex items-center gap-1.5 ${
          isOverdue ? 'text-rose-500 font-extrabold' : 'text-slate-400'
        }`}>
          <Calendar size={10} />
          {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          {isOverdue && (
            <span className="text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-extrabold flex items-center gap-0.5">
              <AlertCircle size={8} /> Overdue
            </span>
          )}
        </span>

        {task.assignedTo && (
          <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignedTo.name}`}>
            <img src={task.assignedTo.avatar} alt="Avatar" className="h-4.5 w-4.5 rounded-full object-cover border border-slate-200 dark:border-slate-800" />
            <span className="text-[9px] text-slate-455 truncate max-w-[65px]">{task.assignedTo.name.split(' ')[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksCalendar;
