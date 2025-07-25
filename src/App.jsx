import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Homepage from '@/pages/Homepage';
import GuestForm from '@/pages/GuestForm';
import OrderForm from '@/pages/OrderForm';
import PreviewInvitation from '@/pages/PreviewInvitation';
import Payment from '@/pages/Payment';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/AdminDashboard';
import UserDashboard from '@/pages/UserDashboard';
import PreviewPage from '@/pages/PreviewPage'; // Pastikan file ini ada
import InvitationView from '@/pages/InvitationView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/order/:templateId" element={<OrderForm />} />
          {/* Penting: letakkan preview template di atas preview order */}
          <Route path="/preview/:templateId" element={<PreviewPage />} />
          <Route path="/preview/:orderId" element={<PreviewInvitation />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/inv/:slug" element={<InvitationView />} />
          <Route path="/tamu" element={<GuestForm />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;