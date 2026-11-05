import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agroguide_token');
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unhandled auth errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (error.config && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('agroguide_token');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  loginOTP: (otpData) => api.post('/auth/login', otpData),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  updateFarm: (farmData) => api.put('/auth/farm', farmData),
  getFarmHistory: () => api.get('/auth/farm/history'),
  addFarmHistory: (data) => api.post('/auth/farm/history', data),
  deleteFarmHistory: (id) => api.delete(`/auth/farm/history/${id}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, new_password) => api.post('/auth/reset-password', { token, new_password }),
};

// Crops Endpoints
export const cropsAPI = {
  getAll: (params) => api.get('/crops', { params }),
  getCategories: () => api.get('/crops/categories'),
  getById: (id) => api.get(`/crops/${id}`),
  create: (data) => api.post('/crops', data),
  update: (id, data) => api.put(`/crops/${id}`, data),
  delete: (id) => api.delete(`/crops/${id}`),
};

// Recommendation Endpoints
export const recommendationAPI = {
  generate: (params) => api.post('/recommendations', params),
  getHistory: () => api.get('/recommendations/history'),
};

// Weather Endpoints
export const weatherAPI = {
  getWeather: (location = 'Palakkad') => api.get('/weather', { params: { location } }),
};

// Market Prices Endpoints
export const marketAPI = {
  getPrices: (params) => api.get('/market-prices', { params }),
  getLiveAgmarknet: (params) => api.get('/market-prices/agmarknet/live', { params }),
  syncAgmarknet: () => api.post('/market-prices/sync-agmarknet'),
};

// Pest & Disease Endpoints
export const pestAPI = {
  getPests: (params) => api.get('/pests', { params }),
  getDiseases: (params) => api.get('/diseases', { params }),
  getSamples: () => api.get('/pest-detection/samples'),
  scan: (data) => api.post('/pest-detection/scan', data),
  validateAndPredict: (data) => api.post('/pest-detection/validate-and-predict', data),
  getHistory: () => api.get('/pest-detection/history'),
  createPest: (data) => api.post('/pests', data),
  createDisease: (data) => api.post('/diseases', data),
};


// Farm-to-market delivery endpoints
export const deliveryAPI = {
  getQuote: (data) => api.post('/delivery/quote', data),
  createOrder: (data) => api.post('/delivery/orders', data),
  getOrders: () => api.get('/delivery/orders'),
  getOrder: (id) => api.get(`/delivery/orders/${id}`),
  getGatePass: (id) => api.get(`/delivery/orders/${id}/gate-pass`),
  payOrder: (id, paymentData) => api.post(`/delivery/orders/${id}/pay`, paymentData),
};

// Assistant / Chat Endpoints
export const chatAPI = {
  sendMessage: (data) => api.post('/chat', data),
};

// Community Forum Endpoints
export const communityAPI = {
  getPosts: (params) => api.get('/community/posts', { params }),
  getPost: (id) => api.get(`/community/posts/${id}`),
  createPost: (data) => api.post('/community/posts', data),
  toggleLike: (id) => api.post(`/community/posts/${id}/like`),
  addComment: (postId, data) => api.post(`/community/posts/${postId}/comments`, data),
  deletePost: (id) => api.delete(`/community/posts/${id}`),
};

// Professionals & Expert Support Endpoints
export const professionalsAPI = {
  getAll: (params) => api.get('/professionals', { params }),
  createSupportRequest: (data) => api.post('/support-requests', data),
  getMyRequests: () => api.get('/support-requests/my'),
  respondSupportRequest: (id, data) => api.put(`/support-requests/${id}/respond`, data),
  updateSupportRequestStatus: (id, status) => api.put(`/support-requests/${id}/status`, null, { params: { status_str: status } }),
};


// Notifications Endpoints
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Admin Endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, null, { params: { is_active: isActive } }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, null, { params: { role } }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createMarketPrice: (data) => api.post('/admin/market-prices', data),
  updateMarketPrice: (id, data) => api.put(`/admin/market-prices/${id}`, data),
  deleteMarketPrice: (id) => api.delete(`/admin/market-prices/${id}`),
};

export default api;
