import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleRoute = ({ allowedRoles, children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !allowedRoles.includes(user.role)) {
    // Jika designer, redirect ke /admin/templates
    if (user && user.role === 'designer') {
      return <Navigate to="/admin/templates" replace />;
    }
    // Jika bukan designer, redirect ke /admin
    return <Navigate to="/admin" replace />;
  }
  return children;
};

export default RoleRoute;
