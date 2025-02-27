import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import useAuth from '../hooks/useAuth';

const RoleManagementForm = ({ currentUserRole }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Agent');
    const [sidebarLinks, setSidebarLinks] = useState([]);
    const [permissions, setPermissions] = useState({
        sidebarLinks: {},
        buttons: {
            addUser: false,
            editUser: false,
            deleteUser: false,
            addProperty: false,
            editProperty: false,
            deleteProperty: false,
            addClient: false,
            editClient: false,
            deleteClient: false
        },
        forms: {
            clientForm: false,
            agentForm: false,
            propertyForm: false
        }
    });

    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);

    // Fetch users and sidebar links from the backend on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/.netlify/functions/getUsers', {
                    headers: {
                        'Authorization': `Bearer ${await user.getIdToken()}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch users');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError(t('errorFetchingUsers'));
            }
        };

        const fetchSidebarLinks = async () => {
            try {
                const response = await fetch('/.netlify/functions/getSidebarLinks', {
                    headers: {
                        'Authorization': `Bearer ${await user.getIdToken()}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch sidebar links');
                const data = await response.json();
                setSidebarLinks(data);
                
                // Initialize sidebar permissions
                const sidebarPermissions = data.reduce((acc, link) => {
                    acc[link.path] = false;
                    return acc;
                }, {});
                setPermissions(prev => ({
                    ...prev,
                    sidebarLinks: sidebarPermissions
                }));
            } catch (error) {
                console.error('Error fetching sidebar links:', error);
                setError(t('errorFetchingSidebarLinks'));
            }
        };

        if (user) {
            fetchUsers();
            fetchSidebarLinks();
        }
    }, [user, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/.netlify/functions/addOrUpdateUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({
                    id: uuidv4(),
                    name,
                    email,
                    password,
                    role,
                    permissions
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create/update user');
            }

            // Reset form
            setName('');
            setEmail('');
            setPassword('');
            setRole('Agent');
            setPermissions({
                sidebarLinks: {},
                buttons: {
                    addUser: false,
                    editUser: false,
                    deleteUser: false,
                    addProperty: false,
                    editProperty: false,
                    deleteProperty: false,
                    addClient: false,
                    editClient: false,
                    deleteClient: false
                },
                forms: {
                    clientForm: false,
                    agentForm: false,
                    propertyForm: false
                }
            });

            // Refresh users list
            const updatedUsersResponse = await fetch('/.netlify/functions/getUsers', {
                headers: {
                    'Authorization': `Bearer ${await user.getIdToken()}`
                }
            });
            const updatedUsers = await updatedUsersResponse.json();
            setUsers(updatedUsers);
        } catch (error) {
            console.error('Error creating/updating user:', error);
            setError(t('errorCreatingUser'));
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handlePermissionChange = (category, key) => {
        setPermissions((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key],
            }
        }));
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">{t('roleManagement')}</h2>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">{t('name')}</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">{t('email')}</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">{t('password')}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">{t('role')}</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Super Admin">{t('superAdmin')}</option>
                        <option value="Admin">{t('admin')}</option>
                        <option value="Agent">{t('agent')}</option>
                    </select>
                </div>

                {/* Sidebar Links Permissions */}
                <div className="mb-4">
                    <h3 className="font-semibold">{t('sidebarLinks')}</h3>
                    {sidebarLinks.map((link) => (
                        <div key={link.path} className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                checked={permissions.sidebarLinks[link.path]}
                                onChange={() => handlePermissionChange('sidebarLinks', link.path)}
                                id={`sidebar-${link.path}`}
                            />
                            <label htmlFor={`sidebar-${link.path}`} className="ml-2 capitalize">
                                {t(link.label)}
                            </label>
                        </div>
                    ))}
                </div>

                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    {t('addUser')}
                </button>
            </form>
        </div>
    );
};

export default RoleManagementForm;
