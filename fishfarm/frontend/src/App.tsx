import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { PondProfile } from './pages/PondProfile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { FishPage } from './pages/dashboard/FishPage';
import { FeedingPage } from './pages/dashboard/FeedingPage';
import { WaterPage } from './pages/dashboard/WaterPage';
import { FinancialsPage } from './pages/dashboard/FinancialsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster position="top-right" 
            toastOptions={{
              className: 'bg-slate-800 text-white border border-slate-700',
              success: { iconTheme: { primary: '#0ea5e9', secondary: '#1e293b' } },
            }} 
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="pond" element={<PondProfile />} />
              <Route path="fish" element={<FishPage />} />
              <Route path="feeding" element={<FeedingPage />} />
              <Route path="water" element={<WaterPage />} />
              <Route path="financials" element={<FinancialsPage />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
