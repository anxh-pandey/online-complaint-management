const express = require('express');
const {
  getAllComplaints,
  updateComplaintStatus,
  getDashboard,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Every admin route requires a valid token AND the "admin" role
router.use(protect, authorize('admin'));

router.get('/complaints', getAllComplaints);
router.put('/complaints/:id/status', updateComplaintStatus);
router.get('/dashboard', getDashboard);

module.exports = router;
