const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 3005;

// Load environment variables from .env file
dotenv.config();

// MongoDB connection
const connectMongo = async () => {
  let retries = 5;
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cafe';  // Fallback for local testing

  while (retries > 0) {
    try {
      await mongoose.connect(mongoURI);
      console.log('Customer Service connected to MongoDB');
      break;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      retries--;
      if (retries === 0) {
        console.error('Failed to connect to MongoDB after multiple attempts');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 5000)); // Retry after 5 seconds
    }
  }
};

// Call the function to connect to MongoDB
connectMongo().catch(err => console.error("Critical MongoDB connection error", err));

// Middleware to parse JSON request bodies
app.use(express.json());

// Customer Schema
const customerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  loyaltyPoints: { type: Number, default: 0 },
});

const Customer = mongoose.model('Customer', customerSchema);

// Create a new customer
app.post('/customers', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const customerCount = await Customer.countDocuments();
    const customer = new Customer({ id: customerCount + 1, name, email });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Get a customer by ID
app.get('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ id: parseInt(req.params.id) });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Update customer loyalty points
app.post('/customers/update-points', async (req, res) => {
  const { customerId, points } = req.body;
  if (!customerId || points == null) {
    return res.status(400).json({ error: 'Customer ID and points are required' });
  }

  try {
    const customer = await Customer.findOne({ id: customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    customer.loyaltyPoints += points;
    await customer.save();
    console.log(`Updated loyalty points for customer ${customer.id}: ${customer.loyaltyPoints}`);
    res.status(200).json({ message: 'Loyalty points updated', loyaltyPoints: customer.loyaltyPoints });
  } catch (error) {
    console.error('Error updating loyalty points:', error);
    res.status(500).json({ error: 'Failed to update loyalty points' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Customer Service running on port ${port}`);
});
