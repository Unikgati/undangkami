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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  // Redirect jika belum login
  useEffect(() => {
    if (!role) navigate('/login');
  }, [role, navigate]);
  return (
    <AdminLayout>
      <Routes>
        {role === 'admin' && <Route path="/" element={<AdminOverview />} />}
        {(role === 'admin' || role === 'designer') && <Route path="templates" element={<ManageTemplates />} />}
        {(role === 'admin' || role === 'designer') && <Route path="templates/builder" element={<TemplateBuilder />} />}
        {role === 'admin' && <Route path="music" element={<ManageMusic />} />}
        {(role === 'admin' || role === 'cs') && <Route path="orders" element={<ManageOrders />} />}
        {role === 'admin' && <Route path="payments" element={<ManagePayments />} />}
        {role === 'admin' && <Route path="users" element={<ManageUsers />} />}
        {role === 'admin' && <Route path="settings" element={<WebAppSettings />} />}
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;