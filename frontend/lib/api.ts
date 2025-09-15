import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

// Rate limiting protection
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
let retryCount = 0;
const MAX_RETRIES = 3;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token and rate limiting
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Rate limiting protection
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${delay}ms before request`);
      return new Promise((resolve) => {
        setTimeout(() => {
          lastRequestTime = Date.now();
          resolve(config);
        }, delay);
      });
    }
    
    lastRequestTime = now;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      // Handle rate limiting with retry
      retryCount++;
      if (retryCount <= MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`🚫 Rate limit exceeded. Retrying in ${delay}ms (attempt ${retryCount}/${MAX_RETRIES})`);
        
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Retry the original request
            api.request(error.config).then(resolve).catch(reject);
          }, delay);
        });
      } else {
        console.error('🚫 Rate limit exceeded. Max retries reached.');
        alert('Too many requests. Please wait a few minutes and try again.');
        retryCount = 0; // Reset retry count
      }
    } else if (error.code === 'ECONNABORTED') {
      // Handle timeout
      console.error('⏰ Request timeout. Please check your connection.');
      alert('Request timeout. Please check your connection and try again.');
    }
    return Promise.reject(error);
  }
);

export default api;
