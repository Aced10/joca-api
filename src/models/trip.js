const mongoose = require("mongoose");

// Define the subdocument schema for start and end
const locationSchema = new mongoose.Schema(
  {
    time: {
      type: Number,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const point = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

// Define the main schema
const tripSchema = new mongoose.Schema({
  start: {
    type: locationSchema,
    required: true,
  },
  end: {
    type: locationSchema,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  overspeedsCount: {
    type: Number,
    required: true,
  },
  boundingBox: [point],
});

module.exports = mongoose.model("Trip", tripSchema);
