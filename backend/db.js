const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("Connected to DB");
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

module.exports = connectDb;
