const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Create a new customer
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  const customerCount = await Customer.countDocuments();
  const customer = new Customer({ id: customerCount + 1, name, email });
  await customer.save();
  res.status(201).json(customer);
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  const customer = await Customer.findOne({ id: parseInt(req.params.id) });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

// Update loyalty points
router.post('/update-points', async (req, res) => {
  const { customerId, points } = req.body;
  if (!customerId || points == null) {
    return res.status(400).json({ error: 'Customer ID and points required' });
  }

  try {
    const customer = await Customer.findOne({ id: customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    customer.loyaltyPoints += points;
    await customer.save();
    console.log(`Updated loyalty points for customer ${customer.id}: ${customer.loyaltyPoints}`);
    res.status(200).json({ message: 'Loyalty points updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update loyalty points' });
  }
});

module.exports = router;
