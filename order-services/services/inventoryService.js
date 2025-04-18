const axios = require('axios');

const updateInventory = async (items) => {
  try {
    await axios.post('http://inventory-service:3004/inventory/update', { items });
  } catch (error) {
    throw new Error('Failed to update inventory');
  }
};

module.exports = { updateInventory };
