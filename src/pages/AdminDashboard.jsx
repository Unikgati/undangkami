import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminOverview from '@/components/admin/AdminOverview';
import ManageTemplates from '@/components/admin/ManageTemplates';
import ManageMusic from '@/components/admin/ManageMusic';
import ManageOrders from '@/components/admin/ManageOrders';
import ManagePayments from '@/components/admin/ManagePayments';
import ManageUsers from '@/components/admin/ManageUsers';
import WebAppSettings from '@/components/admin/WebAppSettings';
import TemplateBuilder from '@/components/admin/TemplateBuilder';
import RoleRoute from './RoleRoute';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  // Redirect jika belum login
  useEffect(() => {
    if (!role) {
      navigate('/login');
    } else if (role === 'designer' && window.location.pathname === '/admin') {
      navigate('/admin/templates', { replace: true });
    }
  }, [role, navigate]);
  return (
    <AdminLayout>
      <Routes>
        {role === 'admin' && <Route path="/" element={<AdminOverview />} />}
        {(role === 'admin' || role === 'designer') && <Route path="templates" element={<ManageTemplates />} />}
        {(role === 'admin' || role === 'designer') && <Route path="templates/builder" element={<TemplateBuilder />} />}
        <Route path="music" element={
          <RoleRoute allowedRoles={['admin']}>
            <ManageMusic />
          </RoleRoute>
        } />
        <Route path="orders" element={
          <RoleRoute allowedRoles={['admin', 'cs']}>
            <ManageOrders />
          </RoleRoute>
        } />
        <Route path="payments" element={
          <RoleRoute allowedRoles={['admin']}>
            <ManagePayments />
          </RoleRoute>
        } />
        <Route path="users" element={
          <RoleRoute allowedRoles={['admin']}>
            <ManageUsers />
          </RoleRoute>
        } />
        <Route path="settings" element={
          <RoleRoute allowedRoles={['admin']}>
            <WebAppSettings />
          </RoleRoute>
        } />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;