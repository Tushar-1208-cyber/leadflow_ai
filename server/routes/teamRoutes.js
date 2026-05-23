const express = require('express');
const router = express.Router();
const {
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  recalculateMetrics,
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // Secure team endpoints

router.route('/')
  .get(getTeamMembers)
  .post(authorize('admin', 'team-leader'), addTeamMember);

router.route('/:id')
  .delete(authorize('admin'), removeTeamMember);

router.route('/:id/recalculate')
  .put(authorize('admin', 'team-leader'), recalculateMetrics);

module.exports = router;
