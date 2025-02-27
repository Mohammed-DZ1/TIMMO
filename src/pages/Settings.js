import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import RoleManagementForm from '../components/RoleManagementForm';
import SidebarLinkManagement from '../components/SidebarLinkManagement';
import FormFieldManagement from '../components/FormFieldManagement';

const Settings = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('roleManagement');
    const [users, setUsers] = useState([]);
    const [sidebarLinks, setSidebarLinks] = useState([]);
    const [formFields, setFormFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from the backend
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null);

                const [userResponse, sidebarResponse, formFieldResponse] = await Promise.all([
                    fetch('/.netlify/functions/getUsers', {
                        headers: {
                            'Authorization': `Bearer ${await user.getIdToken()}`
                        }
                    }),
                    fetch('/.netlify/functions/getSidebarLinks', {
                        headers: {
                            'Authorization': `Bearer ${await user.getIdToken()}`
                        }
                    }),
                    fetch('/.netlify/functions/getUserSettings', {
                        headers: {
                            'Authorization': `Bearer ${await user.getIdToken()}`
                        }
                    })
                ]);

                if (!userResponse.ok || !sidebarResponse.ok || !formFieldResponse.ok) {
                    throw new Error('One or more API requests failed');
                }

                const [usersData, sidebarData, formFieldsData] = await Promise.all([
                    userResponse.json(),
                    sidebarResponse.json(),
                    formFieldResponse.json()
                ]);

                setUsers(usersData);
                setSidebarLinks(sidebarData || []);
                setFormFields(formFieldsData.formFields || []);
            } catch (error) {
                console.error('Error fetching settings data:', error);
                setError(t('Failed to load settings'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, t]);

    const handleSaveUser = async (userData) => {
        if (!user) return;

        try {
            const response = await fetch('/.netlify/functions/addOrUpdateUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Failed to save user');
            }

            const updatedUser = await response.json();
            setUsers(prev => {
                const index = prev.findIndex(u => u.id === updatedUser.id);
                if (index >= 0) {
                    return [...prev.slice(0, index), updatedUser, ...prev.slice(index + 1)];
                }
                return [...prev, updatedUser];
            });
        } catch (error) {
            console.error('Error saving user:', error);
            throw new Error(t('Failed to save user'));
        }
    };

    const handleSaveSidebarLinks = async (links) => {
        if (!user) return;

        try {
            const response = await fetch('/.netlify/functions/updateSidebarLinks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({ links })
            });

            if (!response.ok) {
                throw new Error('Failed to save sidebar links');
            }

            const updatedLinks = await response.json();
            setSidebarLinks(updatedLinks);
        } catch (error) {
            console.error('Error saving sidebar links:', error);
            throw new Error(t('Failed to save sidebar links'));
        }
    };

    const handleSaveFormFields = async (fields) => {
        if (!user) return;

        try {
            const response = await fetch('/.netlify/functions/updateUserSettings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({ formFields: fields })
            });

            if (!response.ok) {
                throw new Error('Failed to save form fields');
            }

            const updatedFields = await response.json();
            setFormFields(updatedFields.formFields);
        } catch (error) {
            console.error('Error saving form fields:', error);
            throw new Error(t('Failed to save form fields'));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">{t('Settings')}</h1>

            <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex">
                        <button
                            onClick={() => setActiveSection('roleManagement')}
                            className={`py-4 px-6 ${
                                activeSection === 'roleManagement'
                                    ? 'border-b-2 border-primary-500 text-primary-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {t('Role Management')}
                        </button>
                        <button
                            onClick={() => setActiveSection('sidebarLinks')}
                            className={`py-4 px-6 ${
                                activeSection === 'sidebarLinks'
                                    ? 'border-b-2 border-primary-500 text-primary-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {t('Sidebar Links')}
                        </button>
                        <button
                            onClick={() => setActiveSection('formFields')}
                            className={`py-4 px-6 ${
                                activeSection === 'formFields'
                                    ? 'border-b-2 border-primary-500 text-primary-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {t('Form Fields')}
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeSection === 'roleManagement' && (
                        <RoleManagementForm
                            users={users}
                            onSave={handleSaveUser}
                        />
                    )}
                    {activeSection === 'sidebarLinks' && (
                        <SidebarLinkManagement
                            links={sidebarLinks}
                            onSave={handleSaveSidebarLinks}
                        />
                    )}
                    {activeSection === 'formFields' && (
                        <FormFieldManagement
                            fields={formFields}
                            onSave={handleSaveFormFields}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
