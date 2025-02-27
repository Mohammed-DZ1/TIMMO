import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

const SuperAdminProfile = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setEditData(prev => ({
                ...prev,
                name: user.displayName || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!editData.name.trim()) {
            toast.error(t('superAdmin.error.nameRequired'));
            return;
        }

        if (isEditing && (!editData.password || !editData.confirmPassword)) {
            toast.error(t('superAdmin.error.passwordRequired'));
            return;
        }

        if (editData.password !== editData.confirmPassword) {
            toast.error(t('superAdmin.error.passwordMismatch'));
            return;
        }

        try {
            setLoading(true);
            const token = await user.getIdToken();
            const response = await fetch('/.netlify/functions/createSuperAdmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editData.name,
                    email: user.email, // Email can't be changed as it's set in env
                    password: editData.password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            toast.success(t('superAdmin.success.profileUpdated'));
            setIsEditing(false);
            setEditData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error(t('superAdmin.error.logoutFailed'));
        }
    };

    return (
        <div className="p-8 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">
                {t('superAdmin.title')}
            </h1>

            <div className="space-y-6">
                {!isEditing ? (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <span className="font-semibold text-gray-700 w-24">
                                {t('superAdmin.fields.name')}:
                            </span>
                            <span>{user?.displayName}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="font-semibold text-gray-700 w-24">
                                {t('superAdmin.fields.email')}:
                            </span>
                            <span>{user?.email}</span>
                            <span className="text-sm text-gray-500 ml-2">
                                ({t('superAdmin.emailSetInEnv')})
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="font-semibold text-gray-700 w-24">
                                {t('superAdmin.fields.role')}:
                            </span>
                            <span className="text-primary-600 font-semibold">
                                {t('superAdmin.role')}
                            </span>
                        </div>

                        <div className="flex space-x-4 mt-8">
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600 transition-colors"
                            >
                                {t('superAdmin.buttons.edit')}
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
                            >
                                {t('superAdmin.buttons.logout')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('superAdmin.fields.name')}
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={editData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('superAdmin.fields.email')}
                            </label>
                            <input
                                type="email"
                                value={user?.email}
                                className="w-full px-4 py-2 border rounded-md bg-gray-100"
                                disabled
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                {t('superAdmin.emailSetInEnv')}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('superAdmin.fields.password')}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={editData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('superAdmin.fields.confirmPassword')}
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={editData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                                disabled={loading}
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? t('superAdmin.buttons.saving') : t('superAdmin.buttons.save')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                disabled={loading}
                            >
                                {t('superAdmin.buttons.cancel')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SuperAdminProfile;
