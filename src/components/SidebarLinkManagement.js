import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import translation hook
import * as icons from 'react-icons/fa'; // Import all icons dynamically

const SidebarLinkManagement = ({ userRole }) => {
    const { t } = useTranslation(); // Hook for translations
    const [links, setLinks] = useState([]);
    const [newLink, setNewLink] = useState({ path: '', label: '', icon: 'FaHome' });
    const [availableIcons, setAvailableIcons] = useState([]);

    // Fetch existing sidebar links from the backend on mount
    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const response = await fetch('https://timmodashboard.netlify.app/.netlify/functions/getSidebarLinks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ role: userRole })
                });
                const data = await response.json();
                setLinks(data.links || []);
            } catch (error) {
                console.error('Error fetching links:', error);
            }
        };

        fetchLinks();

        // Load available icons dynamically from react-icons
        setAvailableIcons(Object.keys(icons).filter((icon) => icon.startsWith('Fa')));
    }, [userRole]);

    // Handle input changes for new link
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLink((prev) => ({ ...prev, [name]: value }));
    };

    // Add a new sidebar link
    const handleAddLink = async () => {
        if (!newLink.path || !newLink.label || !newLink.icon) {
            alert(t('errorFillAllFields')); // Use translation for error message
            return;
        }

        // Prevent duplicate paths
        if (links.some(link => link.path === newLink.path)) {
            alert(t('errorPathExists')); // Use translation for duplicate error
            return;
        }

        const updatedLinks = [...links, newLink];
        setLinks(updatedLinks);  // Update locally

        try {
            await fetch('https://timmodashboard.netlify.app/.netlify/functions/updateSidebarLinks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: userRole, updatedLinks })
            });
        } catch (error) {
            console.error('Error updating sidebar links:', error);
        }

        // Clear input fields
        setNewLink({ path: '', label: '', icon: 'FaHome' });
    };

    // Remove a link from the list
    const handleRemoveLink = async (index) => {
        const updatedLinks = links.filter((_, i) => i !== index);
        setLinks(updatedLinks);

        try {
            await fetch('https://timmodashboard.netlify.app/.netlify/functions/updateSidebarLinks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: userRole, updatedLinks })
            });
        } catch (error) {
            console.error('Error updating sidebar links:', error);
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
                                onClick={() => handleRemoveLink(index)}
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
        </div>
    );
};

export default SidebarLinkManagement;
