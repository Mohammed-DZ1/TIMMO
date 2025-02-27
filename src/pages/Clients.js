import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import ClientForm from '../components/ClientForm';
import ClientDetailsModal from '../components/ClientDetailsModal';
import { useSettings } from '../hooks/useSettings';

const Clients = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { settings } = useSettings();
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/.netlify/functions/getClients', {
                    headers: {
                        'Authorization': `Bearer ${await user.getIdToken()}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch clients');
                }

                const data = await response.json();
                setClients(data);
            } catch (error) {
                console.error('Error fetching clients:', error);
                setError(t('Failed to load clients'));
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, [user, t]);

    const handleAddClient = async (clientData) => {
        if (!user) return;

        try {
            setError(null);
            const response = await fetch('/.netlify/functions/saveClient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify(clientData)
            });

            if (!response.ok) {
                throw new Error('Failed to add client');
            }

            const newClient = await response.json();
            setClients(prev => [...prev, newClient]);
            setShowForm(false);
        } catch (error) {
            console.error('Error adding client:', error);
            setError(t('Failed to add client'));
        }
    };

    const handleSaveEditedClient = async (updatedClient) => {
        if (!user) return;

        try {
            setError(null);
            const response = await fetch('/.netlify/functions/saveClient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify(updatedClient)
            });

            if (!response.ok) {
                throw new Error('Failed to update client');
            }

            const savedClient = await response.json();
            setClients(prev => prev.map(client => 
                client.id === savedClient.id ? savedClient : client
            ));
            setShowForm(false);
            setIsEditing(false);
            setSelectedClient(null);
        } catch (error) {
            console.error('Error updating client:', error);
            setError(t('Failed to update client'));
        }
    };

    const handleDeleteClient = async (clientId) => {
        if (!user) return;

        try {
            setError(null);
            const response = await fetch('/.netlify/functions/deleteClient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({ clientId })
            });

            if (!response.ok) {
                throw new Error('Failed to delete client');
            }

            setClients(prev => prev.filter(client => client.id !== clientId));
            setSelectedClient(null);
        } catch (error) {
            console.error('Error deleting client:', error);
            setError(t('Failed to delete client'));
        }
    };

    const handleClientClick = (client) => {
        setSelectedClient(client);
    };

    const handleCloseModal = () => {
        setSelectedClient(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">{t('Clients')}</h1>
                {settings?.buttons?.addClient && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        {t('Add New Client')}
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <div
                        key={client.id}
                        onClick={() => handleClientClick(client)}
                        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    >
                        <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                        <p className="text-sm text-gray-500">{client.phone}</p>
                        {client.propertyInterest && (
                            <p className="text-sm text-gray-500">{t('Interested in')}: {client.propertyInterest}</p>
                        )}
                    </div>
                ))}
            </div>

            {showForm && (
                <ClientForm
                    onSubmit={isEditing ? handleSaveEditedClient : handleAddClient}
                    onCancel={() => {
                        setShowForm(false);
                        setIsEditing(false);
                        setSelectedClient(null);
                    }}
                    initialData={isEditing ? selectedClient : null}
                />
            )}

            {selectedClient && !showForm && (
                <ClientDetailsModal
                    client={selectedClient}
                    onClose={handleCloseModal}
                    onEdit={() => {
                        setIsEditing(true);
                        setShowForm(true);
                    }}
                    onDelete={handleDeleteClient}
                    canEdit={settings?.buttons?.editClient}
                    canDelete={settings?.buttons?.deleteClient}
                />
            )}
        </div>
    );
};

export default Clients;
