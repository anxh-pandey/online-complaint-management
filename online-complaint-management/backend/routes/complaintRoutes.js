const express = require('express');
const {
  createComplaint,
  getMyComplaints,
  getMyStats,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorize('user'), upload.single('image'), createComplaint)
  .get(authorize('user'), getMyComplaints);

// must be declared before "/:id"
router.get('/stats', authorize('user'), getMyStats);

router
  .route('/:id')
  .get(getComplaintById) // owner or admin (checked in controller)
  .put(authorize('user'), upload.single('image'), updateComplaint)
  .delete(deleteComplaint); // owner (pending only) or admin (checked in controller)

module.exports = router;
