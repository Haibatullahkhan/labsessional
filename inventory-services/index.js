const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 3004;

// Load environment variables
dotenv.config();

app.use(express.json());

// MongoDB connection
const connectMongo = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      // Use environment variable for MongoDB URI
      await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Inventory Service connected to MongoDB');
      break;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000));  // Wait before retry
    }
  }
};
connectMongo().catch(console.error);

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// Routes

// Get all available menu items
app.get('/inventory', async (req, res) => {
  try {
    const items = await MenuItem.find({ stock: { $gt: 0 } });  // Only show items with stock
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Update inventory after an order
app.post('/inventory/update', async (req, res) => {
  const { items } = req.body;  // Expected body: [{ menuItemId, quantity }]
  
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items' });
  }

  try {
    for (const item of items) {
      const menuItem = await MenuItem.findOne({ id: item.menuItemId });
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      }
      if (menuItem.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${menuItem.name}` });
      }
      menuItem.stock -= item.quantity;  // Reduce stock based on order quantity
      await menuItem.save();  // Save the updated stock
      console.log(`Updated stock for ${menuItem.name}: ${menuItem.stock}`);
    }
    res.status(200).json({ message: 'Inventory updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

app.listen(port, () => {
  console.log(`Inventory Service running on port ${port}`);
});
