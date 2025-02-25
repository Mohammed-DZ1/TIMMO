import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
const AuthLayout = () => (
    <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-8 md:p-6 bg-gray-100 overflow-auto">
            <Outlet />
        </div>
    </div>
);

function App() {
    const { t } = useTranslation();

    return (
        <div className="app-container">
            <LanguageSelector />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<PrivateRoute />}>
                    <Route element={<AuthLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="properties" element={<Properties />} />
                        <Route path="clients" element={<Clients />} />
                        <Route path="agents" element={<Agents />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;
