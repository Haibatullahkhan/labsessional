const mongoose = require('mongoose');
require('dotenv').config();

const connectMongo = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      console.log("Attempting to connect to MongoDB...");
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Menu Service connected to MongoDB Atlas');
      break;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      retries--;
      if (retries === 0) throw error;
      console.log(`Retrying... Attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectMongo;
