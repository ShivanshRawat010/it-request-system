const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const createUser = async (username, password, role = 'user') => {
  try {
    await connectDB();

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('User already exists:', username);
      process.exit(0);
    }

    const user = new User({ username, role });
    await user.setPassword(password);
    await user.save();

    console.log('User created successfully:', username);
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err);
    process.exit(1);
  }
};

// Example usage: node createUser.js username password role
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node createUser.js <username> <password> [role]');
  process.exit(1);
}

const [username, password, role] = args;
createUser(username, password, role);
