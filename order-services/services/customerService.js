const axios = require('axios');

const getCustomer = async (customerId) => {
  try {
    const response = await axios.get(`http://customer-service:3005/customers/${customerId}`);
    return response.data;
  } catch (error) {
    throw new Error('Customer not found');
  }
};

const updateCustomerPoints = async (customerId, points) => {
  try {
    const response = await axios.post('http://customer-service:3005/customers/update-points', {
      customerId,
      points,
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update customer points');
  }
};

module.exports = { getCustomer, updateCustomerPoints };
