const User = require('../models/user');
const Lead = require('../models/lead');

// @desc    Get all team members
// @route   GET /api/team
// @access  Private
exports.getTeamMembers = async (req, res) => {
  try {
    const team = await User.find({}).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: team.length,
      team,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add a team member
// @route   POST /api/team
// @access  Private/Admin
exports.addTeamMember = async (req, res) => {
  try {
    const { name, email, password, role, designation, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'bda-employee',
      designation: designation || 'Business Development Associate',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop',
    });

    newUser.password = undefined;

    res.status(201).json({
      success: true,
      member: newUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Remove a team member
// @route   DELETE /api/team/:id
// @access  Private/Admin
exports.removeTeamMember = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Reassign all their active leads to null
    await Lead.updateMany({ assignedTo: user._id }, { assignedTo: null });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team member removed successfully, assigned leads set to unassigned',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update team member metrics manually (or recalculate)
// @route   PUT /api/team/:id/recalculate
// @access  Private/Admin
exports.recalculateMetrics = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Dynamic metrics compilation
    const activeLeads = await Lead.countDocuments({ assignedTo: user._id, status: { $nin: ['Won', 'Lost'] } });
    const dealsClosed = await Lead.countDocuments({ assignedTo: user._id, status: 'Won' });

    const wonLeads = await Lead.find({ assignedTo: user._id, status: 'Won' });
    const revenueGenerated = wonLeads.reduce((acc, lead) => acc + (lead.dealAmount || 0), 0);

    user.activeLeads = activeLeads;
    user.dealsClosed = dealsClosed;
    user.revenueGenerated = revenueGenerated;

    // Recalculate productivity score:
    // Formula: (Deals Closed * 10) + (Active Leads * 2) + base (60), capped at 100
    const score = Math.min(60 + (dealsClosed * 8) + (activeLeads * 1), 100);
    user.productivityScore = isNaN(score) ? 75 : score;

    await user.save();

    res.status(200).json({
      success: true,
      member: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
