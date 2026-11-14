const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { escapeRegex, HttpError } = require('../utils/helpers');

// GET /api/admin/complaints
// Query: search (complaint title OR user name/email), category, status, priority, page, limit
const getAllComplaints = async (req, res, next) => {
  try {
    const { search, category, status, priority } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      const matchingUsers = await User.find({ $or: [{ name: regex }, { email: regex }] }).select('_id');
      filter.$or = [{ title: regex }, { user: { $in: matchingUsers.map((u) => u._id) } }];
    }

    const [total, complaints] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({ complaints, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/complaints/:id/status
// Body: { status, adminRemarks }
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!Complaint.STATUSES.includes(status)) {
      throw new HttpError(400, `Status must be one of: ${Complaint.STATUSES.join(', ')}`);
    }
    if (adminRemarks !== undefined && typeof adminRemarks !== 'string') {
      throw new HttpError(400, 'Remarks must be text');
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new HttpError(404, 'Complaint not found');

    complaint.status = status;
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;
    await complaint.save();
    await complaint.populate('user', 'name email');

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, statusRows, categoryRows, recent] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Complaint.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
    ]);

    const byStatus = Object.fromEntries(statusRows.map((r) => [r._id, r.count]));
    const totalComplaints = statusRows.reduce((sum, r) => sum + r.count, 0);

    res.json({
      stats: {
        totalUsers,
        totalComplaints,
        pending: byStatus['Pending'] || 0,
        inProgress: byStatus['In Progress'] || 0,
        resolved: byStatus['Resolved'] || 0,
        rejected: byStatus['Rejected'] || 0,
      },
      byCategory: Object.fromEntries(categoryRows.map((r) => [r._id, r.count])),
      recentComplaints: recent,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllComplaints, updateComplaintStatus, getDashboard };
