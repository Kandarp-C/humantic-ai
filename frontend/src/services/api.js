import axios from 'axios';
import * as mockData from './mockData';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('humantic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and Fallback to Mock Data
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If unauthorized, clear token and redirect (optional, handled by AuthContext usually)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('humantic_token');
      // window.location.href = '/login'; 
    }

    // MOCK DATA FALLBACK LOGIC
    // In a real project, you'd check if (process.env.NODE_ENV === 'development') 
    // or if the error is a connection error (e.g. backend not running)
    const { config } = error;
    
    if (!config || !error.response) {
      console.warn(`Backend not reachable. Falling back to mock data for: ${config.url}`);
      
      if (config.url === '/api/findings' && config.method === 'get') {
        return { data: mockData.mockFindings, status: 200 };
      }
      if (config.url === '/api/research' && config.method === 'get') {
        return { data: mockData.mockTopics, status: 200 };
      }
      if (config.url === '/api/pins' && config.method === 'get') {
        return { data: mockData.mockPins, status: 200 };
      }
      
      // Add more fallbacks as needed
    }

    return Promise.reject(error);
  }
);

export default api;
