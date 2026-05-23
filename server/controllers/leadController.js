const Lead = require('../models/lead');
const User = require('../models/user');
const Activity = require('../models/activity');
const Notification = require('../models/notification');
const Comment = require('../models/comment');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
exports.getLeads = async (req, res) => {
  try {
    let query = {};

    // Role-based visibility
    if (req.user.role === 'bda-employee') {
      query.assignedTo = req.user.id;
    }

    // Search filter (searches by leadName or companyName)
    if (req.query.search) {
      query.$or = [
        { leadName: { $regex: req.query.search, $options: 'i' } },
        { companyName: { $regex: req.query.search, $options: 'i' } },
        { industry: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Priority filter
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Assigned BDA filter (only applicable to Admin or Team Leader)
    if (req.query.assignedTo && req.user.role !== 'bda-employee') {
      query.assignedTo = req.query.assignedTo;
    }

    // Sorting
    let sortBy = '-createdAt';
    if (req.query.sort) {
      sortBy = req.query.sort;
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email designation avatar')
      .sort(sortBy);

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email designation avatar');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Visibility Check
    if (req.user.role === 'bda-employee' && lead.assignedTo && lead.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this lead' });
    }

    const comments = await Comment.find({ leadId: lead._id })
      .populate('author', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      lead,
      comments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
exports.createLead = async (req, res) => {
  try {
    // If BDA employee creates, they can only assign to themselves (or auto-assign to themselves)
    if (req.user.role === 'bda-employee') {
      req.body.assignedTo = req.user.id;
    }

    const lead = new Lead(req.body);

    // Initial history milestone
    lead.history.push({
      action: 'Lead Created',
      performedBy: req.user.name,
    });

    await lead.save();

    // Increment assigned user active leads
    if (lead.assignedTo) {
      await User.findByIdAndUpdate(lead.assignedTo, { $inc: { activeLeads: 1 } });
    }

    // Log Activity
    await Activity.create({
      action: 'Lead Created',
      details: `${req.user.name} created lead for ${lead.companyName} (${lead.leadName})`,
      performedBy: req.user.id,
      leadId: lead._id,
    });

    // Notify assigned employee if not the creator
    if (lead.assignedTo && lead.assignedTo.toString() !== req.user.id) {
      await Notification.create({
        recipient: lead.assignedTo,
        message: `New Lead Assigned: ${lead.companyName} has been assigned to you.`,
        type: 'assignment',
      });
    }

    res.status(201).json({
      success: true,
      lead,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Auth validation
    if (req.user.role === 'bda-employee' && lead.assignedTo && lead.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this lead' });
    }

    const oldStatus = lead.status;
    const oldAssignee = lead.assignedTo ? lead.assignedTo.toString() : null;
    const oldDealAmount = lead.dealAmount || 0;

    // Extract updates
    const updates = req.body;

    // Track status, assignment, or amount changes for history and analytics
    let historyEntries = [];

    if (updates.status && updates.status !== oldStatus) {
      historyEntries.push({
        action: `Status updated from ${oldStatus} to ${updates.status}`,
        performedBy: req.user.name,
      });

      // Synchronize BDA Metrics when Deal Wins or Fails
      if (lead.assignedTo) {
        // Handle transitioning into a closed state
        if (updates.status === 'Won') {
          await User.findByIdAndUpdate(lead.assignedTo, {
            $inc: { dealsClosed: 1, revenueGenerated: updates.dealAmount || lead.dealAmount || 0, activeLeads: -1 },
          });
        } else if (updates.status === 'Lost') {
          await User.findByIdAndUpdate(lead.assignedTo, {
            $inc: { activeLeads: -1 },
          });
        }

        // Handle transitioning OUT of a closed state (re-opening)
        if (oldStatus === 'Won') {
          await User.findByIdAndUpdate(lead.assignedTo, {
            $inc: { dealsClosed: -1, revenueGenerated: -oldDealAmount, activeLeads: 1 },
          });
        } else if (oldStatus === 'Lost') {
          await User.findByIdAndUpdate(lead.assignedTo, {
            $inc: { activeLeads: 1 },
          });
        }
      }
    }

    // Check Assignee reassignment
    if (updates.assignedTo !== undefined && updates.assignedTo !== oldAssignee) {
      historyEntries.push({
        action: `Lead reassigned`,
        performedBy: req.user.name,
      });

      // Decrement old assignee activeLeads
      if (oldAssignee) {
        await User.findByIdAndUpdate(oldAssignee, { $inc: { activeLeads: -1 } });
      }

      // Increment new assignee activeLeads
      if (updates.assignedTo) {
        await User.findByIdAndUpdate(updates.assignedTo, { $inc: { activeLeads: 1 } });

        // Notify new BDA
        await Notification.create({
          recipient: updates.assignedTo,
          message: `Lead Assigned: Lead for ${lead.companyName} has been assigned to you.`,
          type: 'assignment',
        });
      }
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (key !== 'history') {
        lead[key] = updates[key];
      }
    });

    // Add new history milestones
    historyEntries.forEach((entry) => lead.history.push(entry));

    await lead.save();

    // Log global activity
    await Activity.create({
      action: 'Lead Updated',
      details: `${req.user.name} updated lead ${lead.companyName} (${lead.status})`,
      performedBy: req.user.id,
      leadId: lead._id,
    });

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Auth check
    if (req.user.role === 'bda-employee') {
      return res.status(403).json({ success: false, message: 'BDA employees cannot delete leads' });
    }

    // Decrement assignee active leads metric
    if (lead.assignedTo && lead.status !== 'Won' && lead.status !== 'Lost') {
      await User.findByIdAndUpdate(lead.assignedTo, { $inc: { activeLeads: -1 } });
    }

    await lead.deleteOne();

    // Log Activity
    await Activity.create({
      action: 'Lead Deleted',
      details: `${req.user.name} deleted lead ${lead.companyName}`,
      performedBy: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Export leads to CSV format
// @route   GET /api/leads/export/csv
// @access  Private
exports.exportCSV = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'bda-employee') {
      query.assignedTo = req.user.id;
    }

    const leads = await Lead.find(query).populate('assignedTo', 'name');

    // Create CSV header
    let csvContent = 'Lead Name,Company Name,Industry,Email,Phone,Status,Priority,Deal Amount,Assigned Employee,Created At\n';

    // Populate CSV rows
    leads.forEach((lead) => {
      const name = lead.leadName.replace(/"/g, '""');
      const company = lead.companyName.replace(/"/g, '""');
      const industry = lead.industry.replace(/"/g, '""');
      const email = lead.email || '';
      const phone = lead.phone || '';
      const status = lead.status;
      const priority = lead.priority;
      const dealAmount = lead.dealAmount || 0;
      const bdaName = lead.assignedTo ? lead.assignedTo.name.replace(/"/g, '""') : 'Unassigned';
      const date = lead.createdAt.toISOString();

      csvContent += `"${name}","${company}","${industry}","${email}","${phone}","${status}","${priority}",${dealAmount},"${bdaName}","${date}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=leads_export_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add comment to a lead
// @route   POST /api/leads/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Please provide comment text' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const comment = await Comment.create({
      leadId: req.params.id,
      author: req.user.id,
      text,
    });

    const populatedComment = await comment.populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      comment: populatedComment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
