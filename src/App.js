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
import LanguageSelector from './components/LanguageSelector';
import './i18n';

const MainLayout = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm">
                    <div className="px-4 py-4">
                        <LanguageSelector />
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="properties" element={<Properties />} />
                        <Route path="clients" element={<Clients />} />
                        <Route path="agents" element={<Agents />} />
                        <Route path="settings" element={<Settings />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

const App = () => {
    const { loading, user } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-secondary-500">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={
                user ? <Navigate to="/" replace /> : <Login />
            } />
            <Route path="/*" element={<MainLayout />} />
        </Routes>
    );
};

export default App;
