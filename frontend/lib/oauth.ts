// OAuth service for Google authentication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Get Google OAuth URL
export const getGoogleAuthUrl = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/oauth/google/url`);
    const data = await response.json();
    
    if (data.success) {
      return data.authUrl;
    } else {
      throw new Error(data.error || 'Failed to get Google auth URL');
    }
  } catch (error) {
    console.error('Error getting Google auth URL:', error);
    throw error;
  }
};

// Verify JWT token
export const verifyToken = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/oauth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying token:', error);
    return {
      success: false,
      error: 'Failed to verify token'
    };
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<void> => {
  try {
    // Direct redirect to backend OAuth endpoint as specified
    window.location.href = "https://mini-crm-platform-tnsk.onrender.com/api/oauth/google";
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOut = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  return !!(token && user);
};
