// Models
const tripModel = require("../models/trip");

// Utils
const {
  calculateDistance,
  getAddressFromCoordinates,
  getBoundingBox,
} = require("../helpers/tripCalculations");

const foundTrips = async (query) => {
  const { limit, offset } = query;
  const queryConditions = createTripsQuery(query);
  try {
    const trips = await tripModel
      .find(queryConditions)
      .skip(offset ?? 0)
      .limit(limit ?? 20)
      .exec();
    return {
      code: 200,
      message: "Trips found success!",
      data: trips,
    };
  } catch (error) {
    return {
      code: 500,
      message: error.message,
    };
  }
};
const createTrip = async (readings) => {
  try {
    validateReadings(readings);
    const readingsSort = sortRoute(readings);
    const start = {
      time: readingsSort[0]?.time,
      lat: readingsSort[0]?.location?.lat,
      lon: readingsSort[0]?.location?.lon,
    };
    start.address = await getAddressFromCoordinates(start.lat, start.lon);
    const end = {
      time: readingsSort[readingsSort.length - 1]?.time,
      lat: readingsSort[readingsSort.length - 1]?.location?.lat,
      lon: readingsSort[readingsSort.length - 1]?.location?.lon,
    };
    end.address = await getAddressFromCoordinates(end.lat, end.lon);
    const distance = await calculateDistance(
      start.lat,
      start.lon,
      end.lat,
      end.lon
    );
    const duration = end.time - start.time;
    const overspeedsCount = calculateOverSpeed(readingsSort);
    const boundingBoxPoints = getBoundingBox(
      readingsSort.map((reading) => reading.location)
    );
    const boundingBox = [
      {
        lat: boundingBoxPoints.minLat,
        lon: boundingBoxPoints.maxLon,
      },
      {
        lat: boundingBoxPoints.minLat,
        lon: boundingBoxPoints.minLon,
      },
      {
        lat: boundingBoxPoints.maxLat,
        lon: boundingBoxPoints.minLon,
      },
      {
        lat: boundingBoxPoints.maxLat,
        lon: boundingBoxPoints.maxLon,
      },
    ];
    const newRide = await tripModel.create({
      start,
      end,
      distance,
      duration,
      overspeedsCount,
      boundingBox,
    });
    return {
      code: 200,
      message: "Trip created success!",
      data: newRide,
    };
  } catch (error) {
    return {
      code: error.name === "Error" ? 422 : 500,
      message: error.message,
    };
  }
};

const validateReadings = (readings) => {
  if (!readings) throw new Error("Readings is required!");
  if (!Array.isArray(readings) || readings.length < 5)
    throw new Error(
      "The readings must be an array with at least five positions!"
    );
  if (!readings.every((reading) => reading.hasOwnProperty("time")))
    throw new Error("Every reading needs to have a time property!");
  return true;
};

const sortRoute = (readings) => {
  return readings.sort((a, b) => a.time - b.time);
};

const calculateOverSpeed = (readings) => {
  let overSpeed = false;
  let count = 0;
  readings.forEach((point) => {
    if (!overSpeed && point.speed >= point.speedLimit) {
      count++;
      overSpeed = true;
    } else {
      overSpeed = false;
    }
  });
  return count;
};

const createTripsQuery = (queryObject) => {
  const { start_gte, start_lte, distance_gte } = queryObject;
  const query = {};
  if (!!distance_gte)
    query.distance = {
      $gte: Number(distance_gte),
    };
  if (!!start_gte && !start_lte)
    query.start = {
      time: {
        $gte: Number(start_gte),
      },
    };
  if (!start_gte && !!start_lte)
    query.start = {
      time: {
        $lte: Number(start_lte),
      },
    };
  if (!!start_gte && !!start_lte)
    query.start = {
      time: {
        $gte: Number(start_gte),
        $lte: Number(start_lte),
      },
    };
  return query;
};

module.exports = {
  createTrip,
  foundTrips,
};
