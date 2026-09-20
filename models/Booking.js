const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  venueId: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : 'Venue',
    required: [true, 'Venue is required']
  },
  organiserId: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : 'User',
    required: [true, 'Organiser is required']
  },
  eventName: {
    type    : String,
    required: [true, 'Event name is required'],
    trim    : true
  },
  startTime: {
    type    : Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type    : Date,
    required: [true, 'End time is required']
  },
  totalAmount: {
    type    : Number,
    required: true,
    min     : [0, 'Amount cannot be negative']
  },
  paymentStatus: {
    type   : String,
    enum   : ['Pending', 'Paid'],
    default: 'Pending'
  },
  bookingStatus: {
    type   : String,
    enum   : ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

/* Validate endTime > startTime before save */
bookingSchema.pre('save', function () {
  if (this.endTime <= this.startTime) {
    throw new Error('End time must be after start time');
  }
});

/* Compound index to speed up overlap queries */
bookingSchema.index({ venueId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
