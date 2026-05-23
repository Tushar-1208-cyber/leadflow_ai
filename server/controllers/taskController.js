const Task = require('../models/task');
const User = require('../models/user');
const Notification = require('../models/notification');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query = {};

    // Role-based visibility
    if (req.user.role === 'bda-employee') {
      query.assignedTo = req.user.id;
    } else if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email designation avatar')
      .sort('deadline');

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, deadline, priority } = req.body;

    if (!title || !assignedTo || !deadline) {
      return res.status(400).json({ success: false, message: 'Please provide title, assignee, and deadline' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      deadline,
      priority,
    });

    // Increment user tasksAssigned
    await User.findByIdAndUpdate(assignedTo, { $inc: { tasksAssigned: 1 } });

    // Notify assigned associate
    if (assignedTo.toString() !== req.user.id) {
      await Notification.create({
        recipient: assignedTo,
        message: `New Task: "${title}" has been assigned to you. Deadline: ${new Date(deadline).toLocaleDateString()}`,
        type: 'task-deadline',
      });
    }

    res.status(201).json({
      success: true,
      task,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Authorization checks
    if (req.user.role === 'bda-employee' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    const oldStatus = task.status;
    const { status, title, description, deadline, priority, assignedTo } = req.body;

    // Apply updates
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (deadline) task.deadline = deadline;
    if (priority) task.priority = priority;
    if (status) task.status = status;

    // Reassignment check
    if (assignedTo && assignedTo !== task.assignedTo.toString()) {
      // Decrement old user
      await User.findByIdAndUpdate(task.assignedTo, { $inc: { tasksAssigned: -1 } });
      // Increment new user
      await User.findByIdAndUpdate(assignedTo, { $inc: { tasksAssigned: 1 } });
      task.assignedTo = assignedTo;

      // Notify new BDA
      await Notification.create({
        recipient: assignedTo,
        message: `Task Assigned: "${task.title}" has been transferred to you.`,
        type: 'task-deadline',
      });
    }

    await task.save();

    // Adjust productivity score when task is completed
    if (status === 'Completed' && oldStatus !== 'Completed') {
      await User.findByIdAndUpdate(task.assignedTo, {
        $inc: { productivityScore: 2 }, // Complete tasks boosts productivity score
      });
      // Cap productivity score at 100
      const updatedUser = await User.findById(task.assignedTo);
      if (updatedUser.productivityScore > 100) {
        updatedUser.productivityScore = 100;
        await updatedUser.save();
      }
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Authorization checks
    if (req.user.role === 'bda-employee') {
      return res.status(403).json({ success: false, message: 'BDA employees cannot delete tasks' });
    }

    // Decrement tasksAssigned metric
    await User.findByIdAndUpdate(task.assignedTo, { $inc: { tasksAssigned: -1 } });

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
