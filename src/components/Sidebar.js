import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';

const defaultLinks = [
    { to: '/', label: 'Dashboard', icon: '🏠' },
    { to: '/properties', label: 'Properties', icon: '🏢' },
    { to: '/clients', label: 'Clients', icon: '👥' },
    { to: '/agents', label: 'Agents', icon: '👔' },
    { to: '/settings', label: 'Settings', icon: '⚙️' }
];

const Sidebar = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const location = useLocation();
    const [links, setLinks] = useState(defaultLinks);
    const [error, setError] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const fetchLinks = async () => {
            if (!user) {
                setLinks(defaultLinks);
                return;
            }

            try {
                const response = await fetch('https://timmodashboard.netlify.app/.netlify/functions/getSidebarLinks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ role: user.role || 'user' })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch sidebar links');
                }

                const data = await response.json();
                if (Array.isArray(data.links)) {
                    setLinks(data.links);
                } else {
                    setLinks(defaultLinks);
                }
            } catch (err) {
                console.error('Error fetching sidebar links:', err);
                setError(err.message);
                setLinks(defaultLinks);
            }
        };

        fetchLinks();
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <aside className={`bg-gray-800 text-white h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h1 className={`font-bold ${isCollapsed ? 'text-lg' : 'text-xl'}`}>
                    {isCollapsed ? 'TI' : 'TIMMO'}
                </h1>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded hover:bg-gray-700 transition-colors"
                >
                    {isCollapsed ? '→' : '←'}
                </button>
            </div>

            {error && (
                <div className="p-4 text-sm text-red-400 bg-red-900/20">
                    {error}
                </div>
            )}

            <nav className="mt-6">
                <ul className="space-y-2">
                    {links.map((link, index) => (
                        <li key={index}>
                            <Link
                                to={link.to}
                                className={`flex items-center px-4 py-3 transition-colors ${
                                    location.pathname === link.to
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <span className="text-xl">{link.icon}</span>
                                {!isCollapsed && (
                                    <span className="ml-3">{t(link.label)}</span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                    <span>🚪</span>
                    {!isCollapsed && <span className="ml-2">{t('Logout')}</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
