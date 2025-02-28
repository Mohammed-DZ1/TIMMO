import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import useAuth from './useAuth';

export const useSettings = () => {
    const { user, loading: authLoading } = useAuth();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSettings = useCallback(async () => {
        if (!user || authLoading) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get('/.netlify/functions/getUserSettings', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (response.status === 200) {
                setSettings(response.data);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to load settings';
            setError(errorMessage);
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    }, [user, authLoading]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = async (newSettings) => {
        if (!user) return;

        try {
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.post(
                '/.netlify/functions/updateUserSettings',
                newSettings,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                }
            );

            if (response.status === 200) {
                setSettings(prev => ({ ...prev, ...response.data.settings }));
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update settings';
            setError(errorMessage);
            console.error('Failed to update settings:', error);
            return false;
        }
    };

    return {
        settings,
        loading: loading || authLoading,
        error,
        updateSettings
    };
};

export default useSettings;
