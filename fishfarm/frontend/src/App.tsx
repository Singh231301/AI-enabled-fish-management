import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { OfflineIndicator } from './components/layout/OfflineIndicator';
import { PWAInstallPrompt } from './components/layout/PWAInstallPrompt';
import { GlobalSearch } from './components/layout/GlobalSearch';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { PondProfile } from './pages/PondProfile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { FeedingPage } from './pages/feeding/FeedingPage';
import { FishPage } from './pages/dashboard/FishPage';
import { WaterPage } from './pages/dashboard/WaterPage';
import { FinancialsPage } from './pages/dashboard/FinancialsPage';
import { InventoryPage } from './pages/dashboard/InventoryPage';
import { TasksPage } from './pages/dashboard/TasksPage';
import { AIChatPage } from './pages/dashboard/AIChatPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import SettingsPage from './pages/dashboard/SettingsPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Toaster position="top-right" 
              toastOptions={{
                className: 'bg-slate-800 text-white border border-slate-700',
                success: { iconTheme: { primary: '#0ea5e9', secondary: '#1e293b' } },
              }} 
            />
            <OfflineIndicator />
            <PWAInstallPrompt />
            <GlobalSearch />
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
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="ai" element={<AIChatPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
