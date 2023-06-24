const express = require("express");
const router = express.Router();
const { getTrips, postTrip } = require("../controllers/tripsController");

// GET trips
router.get("/", getTrips);

// ADD a new trip
router.post("/", postTrip);

module.exports = router;
