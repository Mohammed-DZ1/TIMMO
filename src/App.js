import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Clients from './pages/Clients';
import Agents from './pages/Agents';
import Settings from './pages/Settings';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import LanguageSelector from './components/LanguageSelector';
import './i18n';

// Layout component for the authenticated pages
const AuthLayout = () => {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 p-8 md:p-6 bg-gray-100 overflow-auto">
                <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="properties" element={<Properties />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="agents" element={<Agents />} />
                    <Route path="settings" element={<Settings />} />
                </Routes>
            </div>
        </div>
    );
};

function App() {
    const { t } = useTranslation();
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-secondary-500">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <LanguageSelector />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={
                    <PrivateRoute>
                        <AuthLayout />
                    </PrivateRoute>
                } />
            </Routes>
        </div>
    );
}

export default App;
