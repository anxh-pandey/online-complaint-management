/**
 * Creates the FIRST admin account.
 *
 * Usage:  npm run seed:admin
 *
 * Credentials come from backend/.env (ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD).
 * Public registration can only create students, so this script (which needs
 * access to the server and its .env file) is the secure way to create an admin.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Please set MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env');
    process.exit(1);
  }
  if (ADMIN_PASSWORD.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  const email = ADMIN_EMAIL.toLowerCase().trim();
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role === 'admin') {
      console.log(`Admin already exists: ${email} (nothing changed)`);
    } else {
      existing.role = 'admin';
      await existing.save();
      console.log(`Existing user ${email} was promoted to admin`);
    }
  } else {
    await User.create({
      name: ADMIN_NAME || 'System Admin',
      email,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Admin created: ${email}`);
  }

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
