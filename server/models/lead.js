const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const LeadSchema = new mongoose.Schema(
  {
    leadName: {
      type: String,
      required: [true, 'Please add a lead contact name'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true,
    },
    industry: {
      type: String,
      default: 'Manufacturing',
      trim: true,
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Interested', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
      default: 'New',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    dealAmount: {
      type: Number,
      default: 0,
    },
    history: [HistorySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lead', LeadSchema);
