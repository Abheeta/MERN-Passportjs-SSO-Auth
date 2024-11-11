/**
 * @file UserContext.jsx
 * @description Context provider for managing user authentication state
 * @requires React
 */

import { createContext, useEffect, useState, useContext } from "react";

// Create context with default value
export const UserContext = createContext();

/**
 * API endpoints configuration
 * Using environment variables for backend URLs
 */
const API_ENDPOINTS = {
  ACCOUNT: `${import.meta.env.VITE_BACKEND_URL}/account`,
  LOGOUT: `${import.meta.env.VITE_BACKEND_URL}/logout`
};

/**
 * Default request options for API calls
 */
const REQUEST_OPTIONS = {
  credentials: 'include'
};

/**
 * CurrentUserProvider Component
 * Manages user authentication state and provides methods for user management
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context Provider wrapper
 */
export const CurrentUserProvider = ({ children }) => {
  // User state management
  const [currentUser, setCurrentUser] = useState({
    loggedIn: null,
  });

  /**
   * Fetches current user data from the backend
   * @async
   * @returns {Promise<void>}
   */
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        API_ENDPOINTS.ACCOUNT, 
        REQUEST_OPTIONS
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const userData = await response.json();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setCurrentUser({ loggedIn: false });
    }
  };

  /**
   * Logs out the current user
   * @async
   * @returns {Promise<void>}
   */
  const logoutCurrentUser = async () => {
    try {
      const response = await fetch(
        API_ENDPOINTS.LOGOUT, 
        REQUEST_OPTIONS
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Logout successful:', result);
      
      // Reset user state
      setCurrentUser({
        loggedIn: null,
      });
      
      // Redirect to home page
      window.location.href = '/home/apps';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchCurrentUser();
    console.log("Initializing user data");
  }, []);

  // Debug logging - consider removing in production
  if (process.env.NODE_ENV === 'development') {
    console.log('Current user state:', JSON.stringify(currentUser));
  }

  return (
    <UserContext.Provider 
      value={{ 
        currentUser, 
        fetchCurrentUser, 
        logoutCurrentUser 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

/**
 * Custom hook for accessing user context
 * @returns {Object} User context value
 * @throws {Error} If used outside of UserContext.Provider
 */
export const useCurrentUser = () => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }
  
  return context;
};