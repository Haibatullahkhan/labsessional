const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectMongo = require('./config/db'); // Move db logic to config/db.js

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

// MongoDB connection
connectMongo().catch(console.error);

// Order Schema
const orderSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  customerId: { type: Number, required: true },
  items: [
    { menuItemId: Number, name: String, price: Number, quantity: Number }
  ],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
});

const Order = mongoose.model('Order', orderSchema);

// Function to create a new order
const createOrder = async (req, res) => {
  const { customerId, items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid items' });
  }

  try {
    // Validate customer if provided
    if (customerId) {
      const customerResponse = await axios.get(`http://customer-service:3005/customers/${customerId}`);
      if (!customerResponse.data) {
        return res.status(400).json({ error: 'Customer not found' });
      }
    }

    // Fetch menu items from Menu Service
    const menuResponse = await axios.get('http://menu-service:3001/menu');
    const menuItems = menuResponse.data;

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      }
      if (menuItem.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${menuItem.name}` });
      }
      orderItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
      total += menuItem.price * item.quantity;
    }

    // Generate a unique order ID (simple logic, you might want a better approach)
    const orderCount = await Order.countDocuments();
    const order = new Order({
      id: orderCount + 1,
      customerId,
      items: orderItems,
      total,
      status: 'pending',
    });
    await order.save();

    // Update inventory
    await axios.post('http://inventory-service:3004/inventory/update', { items });

    // Update loyalty points if customer exists
    if (customerId) {
      await axios.post('http://customer-service:3005/customers/update-points', {
        customerId,
        points: Math.floor(total),
      });
    }

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Function to get order by ID
const getOrder = async (req, res) => {
  const order = await Order.findOne({ id: parseInt(req.params.id) });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
};

// Routes
app.post('/orders', createOrder);
app.get('/orders/:id', getOrder);

// Start the server
app.listen(port, () => {
  console.log(`Order Service running on port ${port}`);
});
