const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: String,
  location: String,
  category: String,
  source: String,
  fetchedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Event", eventSchema);