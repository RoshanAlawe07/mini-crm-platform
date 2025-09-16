// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
                     process.env.BACKEND_URL || 
                     'https://mini-crm-platform-tnsk.onrender.com';

console.log('API_BASE_URL configured as:', API_BASE_URL);

export default {
  API_BASE_URL,
  // Add other configuration here if needed
};
