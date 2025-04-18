const MenuItem = require('../models/MenuItem');

const getMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({ stock: { $gt: 0 } }); // Show only in-stock items
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu', error: error.message });
  }
};

module.exports = { getMenu };
