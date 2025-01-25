import axios from 'axios';

const api = axios.create({
  baseURL: 'http://15.229.249.223:3000',
  headers: {
    'Content-Type': 'application/json', 
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

