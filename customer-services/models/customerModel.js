const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  email: String,
  loyaltyPoints: { type: Number, default: 0 },
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
