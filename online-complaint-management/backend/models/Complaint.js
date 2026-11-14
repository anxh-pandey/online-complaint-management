const mongoose = require('mongoose');

const CATEGORIES = ['Infrastructure', 'Electricity', 'Water', 'Internet', 'Cleanliness', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORIES, message: 'Invalid category' },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },
    priority: {
      type: String,
      enum: { values: PRIORITIES, message: 'Invalid priority' },
      default: 'Medium',
    },
    image: {
      type: String, // relative URL such as /uploads/abc.png
      default: '',
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Invalid status' },
      default: 'Pending',
    },
    adminRemarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

complaintSchema.statics.CATEGORIES = CATEGORIES;
complaintSchema.statics.PRIORITIES = PRIORITIES;
complaintSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Complaint', complaintSchema);
