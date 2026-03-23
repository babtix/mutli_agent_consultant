import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AppLayout } from './components/layout/AppLayout';
import { AgentsList } from './pages/AgentsList';
import { Conversations } from './pages/Conversations';
import { Settings } from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-12 bg-indigo-500/20 rounded-full mx-auto" />
          <p className="text-indigo-400 text-sm font-medium">Authenticating session...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Area Layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agents" element={<AgentsList />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e1e2d',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#1e1e2d',
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};
