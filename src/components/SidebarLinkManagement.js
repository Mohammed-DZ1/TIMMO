import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as icons from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

const SidebarLinkManagement = ({ userRole }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [links, setLinks] = useState([]);
    const [newLink, setNewLink] = useState({ path: '', label: '', icon: 'FaHome' });
    const [availableIcons, setAvailableIcons] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const response = await fetch('/.netlify/functions/getSidebarLinks', {
                    headers: {
                        'Authorization': `Bearer ${await user.getIdToken()}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch sidebar links');
                }
                
                const data = await response.json();
                setLinks(data || []);
            } catch (error) {
                console.error('Error fetching links:', error);
                setError(t('errorFetchingLinks'));
            }
        };

        // Load available icons
        setAvailableIcons(Object.keys(icons).filter(icon => icon.startsWith('Fa')));

        if (user) {
            fetchLinks();
        }
    }, [user, t]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLink(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLink = async () => {
        if (!newLink.path || !newLink.label || !newLink.icon) {
            setError(t('errorFillAllFields'));
            return;
        }

        if (links.some(link => link.path === newLink.path)) {
            setError(t('errorPathExists'));
            return;
        }

        try {
            const response = await fetch('/.netlify/functions/updateSidebarLinks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({
                    role: userRole,
                    action: 'add',
                    link: newLink
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add sidebar link');
            }

            const data = await response.json();
            setLinks(data.links);
            setNewLink({ path: '', label: '', icon: 'FaHome' });
            setError('');
        } catch (error) {
            console.error('Error adding link:', error);
            setError(t('errorAddingLink'));
        }
    };

    const handleDeleteLink = async (path) => {
        try {
            const response = await fetch('/.netlify/functions/updateSidebarLinks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({
                    role: userRole,
                    action: 'delete',
                    path
                })
            });

            if (!response.ok) {
                throw new Error('Failed to delete sidebar link');
            }

            const data = await response.json();
            setLinks(data.links);
            setError('');
        } catch (error) {
            console.error('Error deleting link:', error);
            setError(t('errorDeletingLink'));
        }
    };

    return (
        <div className="p-6 bg-white rounded shadow-md">
            <h3 className="text-2xl font-bold mb-4">{t('manageSidebarLinks', { role: userRole })}</h3>

            {/* Current Links */}
            <ul className="mb-4">
                {links.map((link, index) => {
                    const IconComponent = icons[link.icon] || icons['FaHome']; // Default icon fallback
                    return (
                        <li key={index} className="flex items-center justify-between p-2 border rounded mb-2">
                            <span className="flex items-center">
                                <IconComponent className="mr-2" />
                                {t(link.label)} ({link.path})
                            </span>
                            <button
                                onClick={() => handleDeleteLink(link.path)}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                {t('remove')}
                            </button>
                        </li>
                    );
                })}
            </ul>

            {/* Add New Link */}
            {(userRole === 'Super Admin' || userRole === 'Admin') && (
                <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">{t('addNewLink')}</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <input
                            type="text"
                            name="path"
                            placeholder={t('pathPlaceholder')}
                            value={newLink.path}
                            onChange={handleInputChange}
                            className="border p-2 rounded w-full"
                        />
                        <input
                            type="text"
                            name="label"
                            placeholder={t('labelPlaceholder')}
                            value={newLink.label}
                            onChange={handleInputChange}
                            className="border p-2 rounded w-full"
                        />

                        {/* Icon Selection Dropdown */}
                        <select
                            name="icon"
                            value={newLink.icon}
                            onChange={handleInputChange}
                            className="border p-2 rounded w-full"
                        >
                            {availableIcons.map((icon, i) => (
                                <option key={i} value={icon}>
                                    {icon}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleAddLink}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        {t('addLink')}
                    </button>
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
        </div>
    );
};

export default SidebarLinkManagement;
