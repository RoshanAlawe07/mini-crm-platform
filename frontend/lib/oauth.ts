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

// Sign out - clears cookie via backend
export const signOut = async (): Promise<void> => {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Call backend logout endpoint to clear cookie
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Clear any local storage (fallback)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home page
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect even if logout fails
    window.location.href = '/';
  }
};

// Get current user - now requires API call to verify cookie-based auth
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        // Store user in localStorage for quick access (optional)
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
      }
    }
    
    // Clear localStorage if auth fails
    localStorage.removeItem('user');
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    localStorage.removeItem('user');
    return null;
  }
};

// Check if user is authenticated - now requires API call
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Sync version for backward compatibility (uses localStorage)
export const isAuthenticatedSync = (): boolean => {
  const user = localStorage.getItem('user');
  return !!user;
};
