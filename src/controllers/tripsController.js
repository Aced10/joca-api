const { createTrip, foundTrips } = require("../entities/tripsEntity");

const getTrips = async (req, res) => {
  const { code, message, data } = await foundTrips(req.query);
  res.status(code).json({ message, data });
};

const postTrip = async (req, res) => {
  const { readings } = req.body;
  const { code, message, data } = await createTrip(readings);
  res.status(code).json({ message: message, data });
};

module.exports = {
  getTrips,
  postTrip,
};
