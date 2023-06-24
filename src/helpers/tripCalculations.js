const axios = require("axios");

const calculateDistance = async (originLat, originLon, destLat, destLon) => {
  const url = `${process.env.GOOGLE_API_URL}distancematrix/json?origins=${originLat},${originLon}&destinations=${destLat},${destLon}&key=${process.env.GOOGLE_API_KEY}`;
  try {
    const response = await axios.get(url);
    const distanceText = response.data.rows[0].elements[0].distance.text;
    const distance = distanceText.split(" ");
    if (distance.length < 1) return 0;
    return distance[1] === "km" ? Number(distance[0]): Number(distance[0])/1000;
  } catch (error) {
    console.error("Error calculating distance:", error);
    throw error;
  }
};
const getAddressFromCoordinates = async (lat, lon) => {
  try {
    const response = await axios.get(
      `${process.env.GOOGLE_API_URL}geocode/json?latlng=${lat},${lon}&key=${process.env.GOOGLE_API_KEY}`
    );
    if (response.data && response.data.results.length > 0) {
      const address = response.data.results[0].formatted_address;
      return address;
    } else {
      console.log("No results found.");
      return null;
    }
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
};

const getBoundingBox = (points) => {
  if (points.length === 0) {
    return null;
  }

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLon = points[0].lon;
  let maxLon = points[0].lon;

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    if (point.lat < minLat) {
      minLat = point.lat;
    }
    if (point.lat > maxLat) {
      maxLat = point.lat;
    }
    if (point.lon < minLon) {
      minLon = point.lon;
    }
    if (point.lon > maxLon) {
      maxLon = point.lon;
    }
  }

  return {
    minLat,
    maxLat,
    minLon,
    maxLon,
  };
};

module.exports = {
  calculateDistance,
  getAddressFromCoordinates,
  getBoundingBox,
};
