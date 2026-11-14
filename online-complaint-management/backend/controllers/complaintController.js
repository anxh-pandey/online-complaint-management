const Complaint = require('../models/Complaint');
const { removeImage } = require('../middleware/upload');
const { escapeRegex, HttpError } = require('../utils/helpers');

const EDITABLE_FIELDS = ['title', 'description', 'category', 'location', 'priority'];

// Pick only allowed fields from the request body (prevents users from setting status/remarks/user)
const pickFields = (body) =>
  EDITABLE_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});

// POST /api/complaints  (user) - multipart/form-data, optional "image" file
const createComplaint = async (req, res, next) => {
  try {
    const data = pickFields(req.body);
    const complaint = new Complaint({
      ...data,
      user: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });
    await complaint.save();
    res.status(201).json({ complaint });
  } catch (err) {
    if (req.file) removeImage(`/uploads/${req.file.filename}`); // don't keep orphan files
    next(err);
  }
};

// GET /api/complaints  (user) - only the logged-in user's complaints
// Query: search, status, category, priority
const getMyComplaints = async (req, res, next) => {
  try {
    const { search, status, category, priority } = req.query;
    const filter = { user: req.user._id };

    if (search) filter.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};

// GET /api/complaints/stats  (user) - counts for the student dashboard cards
const getMyStats = async (req, res, next) => {
  try {
    const rows = await Complaint.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byStatus = Object.fromEntries(rows.map((r) => [r._id, r.count]));
    const total = rows.reduce((sum, r) => sum + r.count, 0);

    res.json({
      stats: {
        total,
        pending: byStatus['Pending'] || 0,
        inProgress: byStatus['In Progress'] || 0,
        resolved: byStatus['Resolved'] || 0,
        rejected: byStatus['Rejected'] || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/complaints/:id  (owner or admin)
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');
    if (!complaint) throw new HttpError(404, 'Complaint not found');

    const isOwner = complaint.user._id.equals(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      // Same message as "not found" so students cannot probe other users' complaint IDs
      throw new HttpError(404, 'Complaint not found');
    }
    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};

// PUT /api/complaints/:id  (owner only, and only while the complaint is still Pending)
const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, user: req.user._id });
    if (!complaint) throw new HttpError(404, 'Complaint not found');
    if (complaint.status !== 'Pending') {
      throw new HttpError(400, 'Only pending complaints can be edited');
    }

    Object.assign(complaint, pickFields(req.body));

    const oldImage = complaint.image;
    if (req.file) complaint.image = `/uploads/${req.file.filename}`;
    else if (req.body.removeImage === 'true') complaint.image = '';

    await complaint.save();
    if (oldImage && oldImage !== complaint.image) removeImage(oldImage);

    res.json({ complaint });
  } catch (err) {
    if (req.file) removeImage(`/uploads/${req.file.filename}`);
    next(err);
  }
};

// DELETE /api/complaints/:id
//  - student: only own complaint AND only if still Pending
//  - admin: any complaint (e.g. inappropriate content)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new HttpError(404, 'Complaint not found');

    if (req.user.role !== 'admin') {
      if (!complaint.user.equals(req.user._id)) throw new HttpError(404, 'Complaint not found');
      if (complaint.status !== 'Pending') {
        throw new HttpError(400, 'Only pending complaints can be deleted');
      }
    }

    await complaint.deleteOne();
    removeImage(complaint.image);
    res.json({ message: 'Complaint deleted successfully', id: complaint._id });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getMyStats,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
};
