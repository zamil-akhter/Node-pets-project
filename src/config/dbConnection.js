const mongoose = require("mongoose");
const { sendCatchError } = require("../utils/responseHandler");


const databaseConnection = async () => {
  const mongoUri = process.env.MONGO_URI;
  try {
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully");
  } catch (error) {
    return sendCatchError(res, error);
  }
};

module.exports = {
  databaseConnection,
};
