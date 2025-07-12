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

const AdminDashboard = () => {
  const navigate = useNavigate();
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     navigate('/login');
  //   }
  // }, [navigate]);
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="templates" element={<ManageTemplates />} />
        <Route path="music" element={<ManageMusic />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="payments" element={<ManagePayments />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="settings" element={<WebAppSettings />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;