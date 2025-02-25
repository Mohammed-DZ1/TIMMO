import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
    const { t } = useTranslation();

    return (
        <Router>
            <div className="app-container">
                <LanguageSelector />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                        <Route index element={<Dashboard />} />
                        <Route path="properties" element={<Properties />} />
                        <Route path="clients" element={<Clients />} />
                        <Route path="agents" element={<Agents />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

// Separate Layout component for better organization
function Layout() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 p-8 md:p-6 bg-gray-100 overflow-auto">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
