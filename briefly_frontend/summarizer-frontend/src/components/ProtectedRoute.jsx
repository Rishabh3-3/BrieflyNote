import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, isValidToken} from '../utils/tokenUtils'; // Utility to get token from localStorage

const ProtectedRoute = ({ children }) => {
  const token = getToken(); // Get token from localStorage

  // If no token exists, redirect to login
  if (!token || !isValidToken) {
    localStorage.removeItem("token");
    return <Navigate to="/" />;
  }
  return children; // Return the children if authenticated
};

export default ProtectedRoute;
