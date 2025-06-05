import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, logout the user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout')
};

// Employee services
export const employeeService = {
  getAllEmployees: () => api.get('/employees'),
  getEmployee: (id) => api.get(`/employees/${id}`),
  createEmployee: (employeeData) => api.post('/employees', employeeData),
  updateEmployee: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),
  resetEmployeePassword: (id, newPassword) => api.put(`/employees/${id}/reset-password`, { newPassword })
};

// Document services
export const documentService = {
  getAllDocuments: () => api.get('/documents'),
  getDocument: (id) => api.get(`/documents/${id}`),
  uploadDocument: (formData) => api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  updateDocumentStatus: (id, status) => api.put(`/documents/${id}/verify`, { status }),
  verifyDocument: (id, status) => api.put(`/documents/${id}/verify`, { status }),
  deleteDocument: (id) => api.delete(`/documents/${id}`)
};

// Location services
export const locationService = {
  getAllLocations: () => api.get('/locations'),
  getLocation: (id) => api.get(`/locations/${id}`),
  checkIn: (locationData) => api.post('/locations/checkin', locationData),
  checkOut: (id) => api.put(`/locations/${id}/checkout`),
  deleteLocation: (id) => api.delete(`/locations/${id}`),
  updateLiveLocation: (id, locationData) => api.put(`/locations/${id}/live-update`, locationData)
};

// Help Center services
export const helpCenterService = {
  getAllTickets: (params) => api.get('/help-center', { params }),
  getTicket: (id) => api.get(`/help-center/${id}`),
  createTicket: (ticketData) => api.post('/help-center', ticketData),
  replyToTicket: (id, replyData) => api.put(`/help-center/${id}/reply`, replyData),
  updateTicketStatus: (id, statusData) => api.put(`/help-center/${id}/status`, statusData),
  deleteTicket: (id) => api.delete(`/help-center/${id}`),
  getStats: () => api.get('/help-center/stats')
};

// Payment Records services
export const paymentRecordsService = {
  getAllRecords: (params) => api.get('/payment-records', { params }),
  getRecord: (id) => api.get(`/payment-records/${id}`),
  createRecord: (recordData) => api.post('/payment-records', recordData),
  updateRecord: (id, recordData) => api.put(`/payment-records/${id}`, recordData),
  updatePaymentStatus: (id, statusData) => api.put(`/payment-records/${id}`, statusData),
  deleteRecord: (id) => api.delete(`/payment-records/${id}`),
  getStats: () => api.get('/payment-records/stats'),
  getMyPaymentSummary: () => api.get('/payment-records/my-summary')
};

export default api;
