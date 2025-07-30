const mongoose = require("mongoose");


const connectDB = async () => {
  try {
    // Use local MongoDB instance
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/jpl`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
