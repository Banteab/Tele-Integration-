import axios from "axios";
import { API_CONFIG, API_ENDPOINTS, getApiKeyHeaders } from "../config/api";

// Create API client
const apiClient = axios.create({
  baseURL: API_CONFIG.baseUrl,
  headers: {
    "Content-Type": "application/json",
    ...getApiKeyHeaders(),
  },
  withCredentials: false,
});

/**
 * Generate guest token for unauthenticated access
 * Note: The Menahariya API backend handles token generation
 * for proxy endpoints, so this is mainly for backward compatibility
 */
export const generateGuestToken = async () => {
  try {
    // Check if token already exists
    const existingToken = localStorage.getItem(API_CONFIG.guestTokenKey);
    if (existingToken) {
      return existingToken;
    }

    // Guest tokens are now handled automatically by the backend
    // when calling proxy endpoints. This function is kept for compatibility.
    console.log("Guest token generation is handled automatically by backend");
    
    // Return a placeholder to indicate backend will handle it
    const placeholderToken = "BACKEND_MANAGED";
    localStorage.setItem(API_CONFIG.guestTokenKey, placeholderToken);
    return placeholderToken;
  } catch (error) {
    console.error("Failed to generate guest token:", error);
    return null;
  }
};

/**
 * Register a new user
 */
export const register = async (phoneNumber, password) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.auth.register, {
      phoneNumber,
      password,
    });

    if (response.data?.token) {
      localStorage.setItem(API_CONFIG.authTokenKey, response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Failed to register:", error);
    throw error;
  }
};

/**
 * Login user
 */
export const login = async (phoneNumber, password) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.auth.login, {
      phoneNumber,
      password,
    });

    if (response.data?.token) {
      localStorage.setItem(API_CONFIG.authTokenKey, response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Failed to login:", error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem(API_CONFIG.authTokenKey);
  localStorage.removeItem(API_CONFIG.guestTokenKey);
};

/**
 * Get current auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem(API_CONFIG.authTokenKey);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};
