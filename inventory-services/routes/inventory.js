const express = require('express');
const router = express.Router();
const MenuItem = require('../models/menuItem');

// Fetch available items from the menu
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find({ stock: { $gt: 0 } });  // Only items with stock
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Update inventory after an order
router.post('/update', async (req, res) => {
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
      menuItem.stock -= item.quantity;  // Reduce stock by quantity ordered
      await menuItem.save();  // Save the updated stock
      console.log(`Updated stock for ${menuItem.name}: ${menuItem.stock}`);
    }
    res.status(200).json({ message: 'Inventory updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

module.exports = router;
