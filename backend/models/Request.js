const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  name: String,
  employeeCode: String,
  designation: String,
  department: String,
  location: String,
  specialAllowance:String,
  item: String,
  reason: String,
  email: String,
  address: String,
  contactNumber:String,
  alternateContactNumber: String,
  requestedBy: { type: String, enum: ['self', 'behalf'], required: true },

  hodEmail: { type: String, required: true },

  username: { type: String, required: false },

  status: {
    hr: { type: String, default: "pending" },
    hod: { type: String, default: "pending" },
    ed: { type: String, default: "pending" },
    ithod: { type: String, default: "pending" },
    it: { type: String, default: "pending" },
  },

  comments: {
    hr: { type: String, default: "" },
    hod: { type: String, default: "" },
    ithod: { type: String, default: "" }
  },
 
  // ... other fields ...
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Request", requestSchema);
