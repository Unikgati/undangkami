import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Homepage from '@/pages/Homepage';
import OrderForm from '@/pages/OrderForm';
import PreviewInvitation from '@/pages/PreviewInvitation';
import Payment from '@/pages/Payment';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/AdminDashboard';
import UserDashboard from '@/pages/UserDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/order/:templateId" element={<OrderForm />} />
          <Route path="/preview/:orderId" element={<PreviewInvitation />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;