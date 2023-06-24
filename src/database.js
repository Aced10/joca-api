const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose.connect(
  `${process.env.MONGO_DB_SERVER}/${process.env.MONGO_DB_NAME}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected DB successfully");
});

module.exports = db;
