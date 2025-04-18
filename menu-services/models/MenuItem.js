const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  itemId: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
