import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check for user info in local storage
  const user = localStorage.getItem('user');

  // If user info exists, render the children components (protected routes content)
  // Otherwise, redirect to the login page
  return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
