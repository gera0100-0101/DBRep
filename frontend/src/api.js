import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productApi = {
  getAll: () => api.get('/products/'),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  create: (product) => api.post('/products/', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
  getImages: (productId) => api.get(`/products/${productId}/images`),
  addImage: (productId, imageData) => api.post(`/products/${productId}/images`, imageData),
  updateImage: (productId, imageId, imageData) => api.put(`/products/${productId}/images/${imageId}`, imageData),
  deleteImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
};

export const categoryApi = {
  getAll: () => api.get('/categories/'),
  create: (category) => api.post('/categories/', category),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const manufacturerApi = {
  getAll: () => api.get('/manufacturers/'),
  create: (manufacturer) => api.post('/manufacturers/', manufacturer),
  delete: (id) => api.delete(`/manufacturers/${id}`),
};

export const orderApi = {
  checkout: (checkoutData) => api.post('/orders/checkout', checkoutData),
  getAll: () => api.get('/orders/'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status?status=${status}`),
  assignCourier: (orderId, courierId) => api.put(`/orders/${orderId}/courier?courier_id=${courierId}`),
  getAdminOrders: () => api.get('/orders/admin/'),
};

export const workerApi = {
  getAll: () => api.get('/workers/'),
  getById: (id) => api.get(`/workers/${id}`),
  getCouriers: () => api.get('/workers/couriers/'),
  create: (worker) => api.post('/workers/', worker),
  update: (id, worker) => api.put(`/workers/${id}`, worker),
  delete: (id) => api.delete(`/workers/${id}`),
};

export default api;
