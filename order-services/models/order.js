const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  customerId: { type: Number, required: true },
  items: [
    {
      menuItemId: { type: Number, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, required: true, enum: ['pending', 'completed', 'cancelled'] },
});

module.exports = mongoose.model('Order', orderSchema);
