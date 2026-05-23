const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  exportCSV,
  addComment,
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // Ensure all lead routes are protected by default

router.get('/export/csv', exportCSV);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(authorize('admin', 'team-leader'), deleteLead);

router.route('/:id/comments')
  .post(addComment);

module.exports = router;
