const Order = require('../models/order');
const { getCustomer, updateCustomerPoints } = require('../services/customerService');
const { getMenuItems } = require('../services/menuService');
const { updateInventory } = require('../services/inventoryService');

const createOrder = async (req, res) => {
  const { customerId, items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items' });
  }

  try {
    if (customerId) {
      const customer = await getCustomer(customerId);
      if (!customer) {
        return res.status(400).json({ error: 'Customer not found' });
      }
    }

    const menuItems = await getMenuItems();
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
      orderItems.push({ menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: item.quantity });
      total += menuItem.price * item.quantity;
    }

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
    await updateInventory(items);

    // Update customer loyalty points
    if (customerId) {
      await updateCustomerPoints(customerId, Math.floor(total));
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const getOrder = async (req, res) => {
  const order = await Order.findOne({ id: parseInt(req.params.id) });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
};

module.exports = { createOrder, getOrder };
