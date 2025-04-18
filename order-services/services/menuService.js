const axios = require('axios');

const getMenuItems = async () => {
  try {
    const response = await axios.get('http://menu-service:3001/menu');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch menu items');
  }
};

module.exports = { getMenuItems };
