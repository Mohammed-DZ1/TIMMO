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
            const response = await axios.get('/.netlify/functions/getUserSettings', {
                withCredentials: true,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (response.status === 200) {
                setSettings(response.data);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to load settings');
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
            const response = await axios.post(
                '/.netlify/functions/updateUserSettings',
                newSettings,
                {
                    withCredentials: true,
                    headers: {
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
            setError(error.response?.data?.message || 'Failed to update settings');
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
