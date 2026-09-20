const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type    : String,
    required: [true, 'Venue name is required'],
    trim    : true
  },
  description: {
    type    : String,
    required: [true, 'Description is required']
  },
  location: {
    type    : String,
    required: [true, 'Location is required'],
    trim    : true
  },
  capacity: {
    type    : Number,
    required: [true, 'Capacity is required'],
    min     : [1, 'Capacity must be at least 1']
  },
  pricePerHour: {
    type    : Number,
    required: [true, 'Price per hour is required'],
    min     : [0, 'Price cannot be negative']
  },
  amenities: [{ type: String, trim: true }],
  images   : [{ type: String }],
  status   : {
    type   : String,
    enum   : ['Active', 'Maintenance'],
    default: 'Active'
  }
}, { timestamps: true });

/* Compound text index for search */
venueSchema.index({ name: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Venue', venueSchema);
