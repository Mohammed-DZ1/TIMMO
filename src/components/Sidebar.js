import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import Logo from '../images/logo1.png';
import * as icons from 'react-icons/fa';

const defaultLinks = [
    {
        path: '/',
        label: 'dashboard',
        icon: 'FaHome'
    },
    {
        path: '/properties',
        label: 'properties',
        icon: 'FaBuilding'
    },
    {
        path: '/clients',
        label: 'clients',
        icon: 'FaUsers'
    },
    {
        path: '/agents',
        label: 'agents',
        icon: 'FaUserTie'
    },
    {
        path: '/settings',
        label: 'settings',
        icon: 'FaCog'
    }
];

const Sidebar = () => {
    const { t } = useTranslation();
    const { logout, user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    const [links, setLinks] = useState(defaultLinks);
    const navigate = useNavigate();

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
                if (data && Array.isArray(data.links)) {
                    setLinks(data.links);
                } else {
                    console.warn('Using default links - received:', data);
                    setLinks(defaultLinks);
                }
            } catch (error) {
                console.error('Error fetching sidebar links:', error);
                setLinks(defaultLinks);
            }
        };

        fetchLinks();
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div
            className={`bg-secondary-900 text-white h-screen transition-all duration-300 ${
                isHovered ? 'w-64' : 'w-20'
            } flex flex-col items-center`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Logo Section */}
            <div className="mt-6 mb-8">
                <img src={Logo} alt="TIMMO" className="w-12 h-12" />
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 w-full">
                <ul className="space-y-2 px-2">
                    {links.map((link) => {
                        const IconComponent = icons[link.icon];
                        return (
                            <li key={link.path}>
                                <NavLink
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                                            isActive
                                                ? 'bg-primary-500 text-white'
                                                : 'text-gray-300 hover:bg-secondary-800 hover:text-white'
                                        }`
                                    }
                                >
                                    {IconComponent && <IconComponent className="w-5 h-5" />}
                                    {isHovered && (
                                        <span className="ml-4 text-sm font-medium">
                                            {t(link.label)}
                                        </span>
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full px-4 py-3 mb-6 flex items-center text-gray-300 hover:text-white hover:bg-red-600 transition-colors duration-200"
            >
                <FaSignOutAlt className="w-5 h-5" />
                {isHovered && (
                    <span className="ml-4 text-sm font-medium">
                        {t('logout')}
                    </span>
                )}
            </button>
        </div>
    );
};

export default Sidebar;
