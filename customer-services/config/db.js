const mongoose = require('mongoose');

const connectMongo = async (mongoURI) => {
  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Customer Service connected to MongoDB');
      break;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectMongo;
