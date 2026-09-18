const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (!err.status) {
      console.error(`Network or unexpected error calling ${endpoint}:`, err);
    }
    throw err;
  }
};

export const api = {
  // Products
  getProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (productData) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),
  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),
  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  // Orders & Checkout
  createOrder: (orderPayload) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    }),
  getOrder: (id) => request(`/orders/${id}`),
  cancelOrder: (id) =>
    request(`/orders/${id}/cancel`, {
      method: 'POST',
    }),

  // Payments
  simulatePayment: (paymentPayload) =>
    request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentPayload),
    }),
  getPayments: (orderId) => request(`/payments/${orderId}`),

  // Reservations
  getReservation: (orderId) => request(`/reservations/${orderId}`),
};
