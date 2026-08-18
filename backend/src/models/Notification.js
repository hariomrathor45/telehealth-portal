const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['APPOINTMENT', 'CONSULTATION', 'VERIFICATION', 'PRIORITY', 'SYSTEM'],
    default: 'SYSTEM',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  relatedEntityType: {
    type: String,
    enum: ['appointment', 'consultation', 'doctor', 'patient', null],
    default: null,
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  readAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
