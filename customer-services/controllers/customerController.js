const Customer = require('../models/customerModel');

// Create a new customer
const createCustomer = async (req, res) => {
  try {
    const { name, email } = req.body;
    const customerCount = await Customer.countDocuments();
    const customer = new Customer({ id: customerCount + 1, name, email });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ id: parseInt(req.params.id) });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// Update loyalty points for a customer
const updateLoyaltyPoints = async (req, res) => {
  try {
    const { customerId, points } = req.body;
    if (!customerId || points == null) {
      return res.status(400).json({ error: 'Customer ID and points required' });
    }

    const customer = await Customer.findOne({ id: customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    customer.loyaltyPoints += points;
    await customer.save();
    res.status(200).json({ message: 'Loyalty points updated', loyaltyPoints: customer.loyaltyPoints });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update loyalty points' });
  }
};

module.exports = {
  createCustomer,
  getCustomerById,
  updateLoyaltyPoints,
};
