// Import the necessary modules and functions
const tripModel = require("../models/trip");

// Import the function to be tested
const { createTrip, foundTrips } = require("../entities/tripsEntity");

// Mocked trips data
const mockedTrips = [
  { _id: "trip1", start: { time: 100 }, end: { time: 200 } },
  { _id: "trip2", start: { time: 300 }, end: { time: 400 } },
];

// Mocked dependencies
jest.mock("../models/trip", () => ({
  create: jest.fn().mockResolvedValueOnce({
    // Mocked created trip data
    _id: "mockedTripId",
    start: {
      time: 100,
      lat: 10.1234,
      lon: 20.5678,
      address: "Mocked Start Address",
    },
    end: {
      time: 200,
      lat: 30.9876,
      lon: 40.5432,
      address: "Mocked End Address",
    },
    distance: 50,
    duration: 100,
    overspeedsCount: 2,
    boundingBox: [
      { lat: 10.1234, lon: 40.5432 },
      { lat: 10.1234, lon: 20.5678 },
      { lat: 30.9876, lon: 20.5678 },
      { lat: 30.9876, lon: 40.5432 },
    ],
  }),
  find: jest.fn().mockReturnValue({
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([
      { _id: "trip1", start: { time: 100 }, end: { time: 200 } },
      { _id: "trip2", start: { time: 300 }, end: { time: 400 } },
    ]),
  }),
}));

// Mocked helper functions
jest.mock("../helpers/tripCalculations", () => ({
  validateReadings: jest.fn(),
  sortRoute: jest.fn().mockImplementation((readings) => {
    // Simulate sorting the readings array
    return readings.sort((a, b) => a.time - b.time);
  }),
  getAddressFromCoordinates: jest
    .fn()
    .mockResolvedValueOnce("Mocked End Address")
    .mockResolvedValueOnce("Mocked Start Address"),
  calculateDistance: jest.fn().mockResolvedValueOnce(50),
  calculateOverSpeed: jest.fn().mockReturnValueOnce(2),
  getBoundingBox: jest.fn().mockReturnValueOnce({
    minLat: 10.1234,
    maxLat: 30.9876,
    minLon: 20.5678,
    maxLon: 40.5432,
  }),
}));

// Unit test for createTrip function
describe("createTrip", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.resetModules();
  });

  test("should create a trip successfully", async () => {
    // Mocked readings data
    const readings = [
      {
        time: 100,
        location: { lat: 10.1234, lon: 20.5678 },
        speed: 60,
        speedLimit: 50,
      },
      {
        time: 120,
        location: { lat: 15.1254, lon: 22.6789 },
        speed: 60,
        speedLimit: 65,
      },
      {
        time: 150,
        location: { lat: 15.4321, lon: 25.6789 },
        speed: 70,
        speedLimit: 65,
      },
      {
        time: 180,
        location: { lat: 17.4321, lon: 26.6789 },
        speed: 70,
        speedLimit: 60,
      },
      {
        time: 200,
        location: { lat: 30.9876, lon: 40.5432 },
        speed: 80,
        speedLimit: 100,
      },
    ];

    const expectedResponse = {
      code: 200,
      message: "Trip created success!",
      data: {
        _id: "mockedTripId",
        start: {
          time: 100,
          lat: 10.1234,
          lon: 20.5678,
          address: "Mocked Start Address",
        },
        end: {
          time: 200,
          lat: 30.9876,
          lon: 40.5432,
          address: "Mocked End Address",
        },
        distance: 50,
        duration: 100,
        overspeedsCount: 2,
        boundingBox: [
          { lat: 10.1234, lon: 40.5432 },
          { lat: 10.1234, lon: 20.5678 },
          { lat: 30.9876, lon: 20.5678 },
          { lat: 30.9876, lon: 40.5432 },
        ],
      },
    };

    // Call the createTrip function
    const result = await createTrip(readings);

    // Assertions
    expect(result).toEqual(expectedResponse);
    expect(tripModel.create).toHaveBeenCalledTimes(1);
  });

  test("should throw an error if readings are not provided", async () => {
    const readings = null;

    const expectedResponse = {
      code: 422,
      message: "Readings is required!",
    };

    // Call the function to be tested
    const result = await createTrip(readings);

    expect(result).toEqual(expectedResponse);
  });

  test("should throw an error if readings is not an array", async () => {
    const readings = "not an array";

    const expectedResponse = {
      code: 422,
      message: "The readings must be an array with at least five positions!",
    };

    // Call the function to be tested
    const result = await createTrip(readings);

    expect(result).toEqual(expectedResponse);
  });

  test("should throw an error if a reading object does not have a time property", async () => {
    const readings = [
      { lat: 10.1234, lon: 20.5678, speed: 50, speedLimit: 60 },
      { lat: 30.9876, lon: 40.5432, speed: 70, speedLimit: 80 },
      { lat: 50.4321, lon: 60.8765, speed: 90, speedLimit: 100 },
      { lat: 70.6543, lon: 80.1234, speed: 110, speedLimit: 120 },
      { lat: 90.8765, lon: 100.4321, speed: 130, speedLimit: 140 },
    ];

    const expectedResponse = {
      code: 422,
      message: "Every reading needs to have a time property!",
    };

    // Call the function to be tested
    const result = await createTrip(readings);

    expect(result).toEqual(expectedResponse);
  });
});

describe("foundTrips", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should find trips successfully", async () => {
    // Mocked query parameters
    const query = {
      limit: 10,
      offset: 0,
    };

    // Expected response
    const expectedResponse = {
      code: 200,
      message: "Trips found success!",
      data: mockedTrips,
    };

    // Call the foundTrips function
    const result = await foundTrips(query);

    // Assertions
    expect(result).toEqual(expectedResponse);
    expect(tripModel.find).toHaveBeenCalledTimes(1);
    expect(tripModel.find).toHaveBeenCalledWith({});
    expect(tripModel.find().skip).toHaveBeenCalledWith(0);
    expect(tripModel.find().limit).toHaveBeenCalledWith(10);
    expect(tripModel.find().exec).toHaveBeenCalledTimes(1);
  });

  test("should find trips successfully with all filters", async () => {
    // Mocked query parameters
    const query = {
      limit: 10,
      offset: 0,
      start_gte: 20,
      start_lte: 50,
      distance_gte: 10,
    };

    // Expected response
    const expectedResponse = {
      code: 200,
      message: "Trips found success!",
      data: mockedTrips,
    };

    // Call the foundTrips function
    const result = await foundTrips(query);

    // Assertions
    expect(result).toEqual(expectedResponse);
    expect(tripModel.find).toHaveBeenCalledTimes(1);
    expect(tripModel.find).toHaveBeenCalledWith({
      distance: {
        $gte: 10,
      },
      start: {
        time: {
          $gte: 20,
          $lte: 50,
        },
      },
    });
    expect(tripModel.find().skip).toHaveBeenCalledWith(0);
    expect(tripModel.find().limit).toHaveBeenCalledWith(10);
    expect(tripModel.find().exec).toHaveBeenCalledTimes(1);
  });

  test("should find trips successfully with start_gte filter", async () => {
    // Mocked query parameters
    const query = {
      limit: 10,
      offset: 0,
      start_gte: 20,
    };

    // Expected response
    const expectedResponse = {
      code: 200,
      message: "Trips found success!",
      data: mockedTrips,
    };

    // Call the foundTrips function
    const result = await foundTrips(query);

    // Assertions
    expect(result).toEqual(expectedResponse);
    expect(tripModel.find).toHaveBeenCalledTimes(1);
    expect(tripModel.find).toHaveBeenCalledWith({
      start: {
        time: {
          $gte: 20,
        },
      },
    });
    expect(tripModel.find().skip).toHaveBeenCalledWith(0);
    expect(tripModel.find().limit).toHaveBeenCalledWith(10);
    expect(tripModel.find().exec).toHaveBeenCalledTimes(1);
  });

  test("should find trips successfully with start_lte filter", async () => {
    // Mocked query parameters
    const query = {
      limit: 10,
      offset: 0,
      start_lte: 50,
    };

    // Expected response
    const expectedResponse = {
      code: 200,
      message: "Trips found success!",
      data: mockedTrips,
    };

    // Call the foundTrips function
    const result = await foundTrips(query);

    // Assertions
    expect(result).toEqual(expectedResponse);
    expect(tripModel.find).toHaveBeenCalledTimes(1);
    expect(tripModel.find).toHaveBeenCalledWith({
      start: {
        time: {
          $lte: 50,
        },
      },
    });
    expect(tripModel.find().skip).toHaveBeenCalledWith(0);
    expect(tripModel.find().limit).toHaveBeenCalledWith(10);
    expect(tripModel.find().exec).toHaveBeenCalledTimes(1);
  });

  test("should handle error when finding trips", async () => {
    // Mocked query parameters
    const query = {
      limit: 10,
      offset: 0,
    };

    // Mock the tripModel.find method to throw an error
    tripModel.find.mockRejectedValueOnce(new Error("Database error"));

    // Expected response
    const expectedResponse = {
      code: 500,
      message: "Database error",
    };

    // Call the foundTrips function
    const result = await foundTrips(query);

    // Assertions
    expect(result.code).toEqual(500);
    expect(tripModel.find).toHaveBeenCalledTimes(1);
    expect(tripModel.find).toHaveBeenCalledWith({});
  });
});
