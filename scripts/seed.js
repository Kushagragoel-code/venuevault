/**
 * scripts/seed.js
 * Populates the database with:
 *   - 1 Admin user
 *   - 1 Organiser user
 *   - 6 Sample venues
 *   - 2 Sample bookings
 *
 * Run: node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Venue    = require('../models/Venue');
const Booking  = require('../models/Booking');

const VENUES = [
  {
    name        : 'The Grand Conference Hall',
    description : 'An expansive, state-of-the-art conference hall spanning 5,000 sq ft with floor-to-ceiling windows offering panoramic city views. Perfect for corporate summits, product launches, and large-scale seminars. Fitted with a modular partition system to accommodate smaller breakout sessions.',
    location    : 'Connaught Place, New Delhi',
    capacity    : 500,
    pricePerHour: 8000,
    amenities   : ['WiFi', 'AV Equipment', 'Stage', 'Projector', 'Air Conditioning', 'Parking', 'Catering'],
    images      : ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
                   'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=900&q=80'],
    status      : 'Active'
  },
  {
    name        : 'Skyline Rooftop Terrace',
    description : 'A breathtaking open-air rooftop venue perched 30 floors above the city skyline. Ideal for cocktail parties, product reveals, and intimate corporate dinners under the stars. Equipped with elegant string lighting, modular lounge furniture, and a full outdoor bar.',
    location    : 'Bandra Kurla Complex, Mumbai',
    capacity    : 200,
    pricePerHour: 5500,
    amenities   : ['Outdoor Space', 'Bar', 'Scenic View', 'WiFi', 'Ambient Lighting', 'Parking'],
    images      : ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80'],
    status      : 'Active'
  },
  {
    name        : 'Crystal Ballroom',
    description : 'A timeless ballroom adorned with hand-crafted crystal chandeliers and Italian marble floors. Accommodates up to 350 guests in a theatre-style setup or 200 for a gala dinner. Features a dedicated bridal suite, raised dais, and professional in-house audio-visual technicians.',
    location    : 'Park Street, Kolkata',
    capacity    : 350,
    pricePerHour: 7000,
    amenities   : ['AV Equipment', 'Stage', 'Catering', 'Bridal Suite', 'Air Conditioning', 'Parking', 'WiFi'],
    images      : ['https://images.unsplash.com/photo-1478147427282-58a87a433b2a?w=900&q=80'],
    status      : 'Active'
  },
  {
    name        : 'Serenity Garden Pavilion',
    description : 'A lush 2-acre garden estate with a covered pavilion and open-air lawns. Surrounded by manicured hedges and water features, this venue is perfect for weddings, cultural festivals, and outdoor exhibitions. Includes a dedicated catering kitchen and premium sanitation facilities.',
    location    : 'Whitefield, Bengaluru',
    capacity    : 600,
    pricePerHour: 6000,
    amenities   : ['Outdoor Space', 'Garden', 'Catering', 'Parking', 'Ambient Lighting', 'Stage'],
    images      : ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80'],
    status      : 'Active'
  },
  {
    name        : 'Executive Boardroom Suite',
    description : 'A premium executive boardroom designed for high-stakes meetings, strategy sessions, and confidential negotiations. Seats 20 executives in ergonomic leather chairs around a solid mahogany table. Equipped with enterprise-grade AV, HDMI connectivity, and premium concierge service.',
    location    : 'Nariman Point, Mumbai',
    capacity    : 20,
    pricePerHour: 3500,
    amenities   : ['WiFi', 'AV Equipment', 'Projector', 'Air Conditioning', 'Catering', 'Concierge'],
    images      : ['https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80'],
    status      : 'Active'
  },
  {
    name        : 'Heritage Amphitheatre',
    description : 'An open-air amphitheatre set within a 19th-century heritage property. Natural stone seating for up to 400 guests, a grand proscenium stage, and exceptional acoustics make it ideal for theatrical performances, music concerts, and cultural events. Available for evening events.',
    location    : 'Lodi Colony, New Delhi',
    capacity    : 400,
    pricePerHour: 9000,
    amenities   : ['Stage', 'Outdoor Space', 'AV Equipment', 'Ambient Lighting', 'Parking', 'Backstage Area'],
    images      : ['https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=900&q=80'],
    status      : 'Maintenance'
  }
];

async function seed() {
  try {
    const uri = (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<username>'))
      ? 'mongodb://127.0.0.1:27017/venuevault'
      : process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    /* ─ Clear existing data ─ */
    await Promise.all([User.deleteMany({}), Venue.deleteMany({}), Booking.deleteMany({})]);
    console.log('🗑  Cleared existing data');

    /* ─ Create users ─ */
    const adminUser = await User.create({
      name    : 'Admin User',
      email   : 'admin@venuevault.com',
      password: 'Admin@123',
      role    : 'Admin'
    });
    const organiserUser = await User.create({
      name    : 'Alex Organiser',
      email   : 'organiser@venuevault.com',
      password: 'Organiser@123',
      role    : 'Organiser'
    });
    console.log('👤 Users created:', adminUser.email, organiserUser.email);

    /* ─ Create venues ─ */
    const venues = await Venue.insertMany(VENUES);
    console.log(`🏛  ${venues.length} venues created`);

    /* ─ Create sample bookings ─ */
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    tomorrow.setHours(10, 0, 0, 0);

    const endTomorrow = new Date(tomorrow);
    endTomorrow.setHours(14, 0, 0, 0);

    await Booking.create({
      venueId      : venues[0]._id,
      organiserId  : organiserUser._id,
      eventName    : 'Annual Sales Summit 2026',
      startTime    : tomorrow,
      endTime      : endTomorrow,
      totalAmount  : 4 * venues[0].pricePerHour,
      paymentStatus: 'Pending',
      bookingStatus: 'Pending',
      notes        : 'Requires stage setup and 200 banquet chairs.'
    });

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 10);
    nextWeek.setHours(18, 0, 0, 0);
    const endNextWeek = new Date(nextWeek);
    endNextWeek.setHours(22, 0, 0, 0);

    await Booking.create({
      venueId      : venues[1]._id,
      organiserId  : organiserUser._id,
      eventName    : 'Product Launch Cocktail Evening',
      startTime    : nextWeek,
      endTime      : endNextWeek,
      totalAmount  : 4 * venues[1].pricePerHour,
      paymentStatus: 'Paid',
      bookingStatus: 'Approved',
      notes        : 'Outdoor setup with branded backdrop.'
    });
    console.log('📋 2 sample bookings created');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Seed complete!');
    console.log('   Admin     → admin@venuevault.com / Admin@123');
    console.log('   Organiser → organiser@venuevault.com / Organiser@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
