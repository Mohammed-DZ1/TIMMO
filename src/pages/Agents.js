import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import AgentForm from '../components/AgentForm';
import AgentDetailsModal from '../components/AgentDetailsModal';
import { useSettings } from '../hooks/useSettings';

const Agents = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { settings } = useSettings();
    const [agents, setAgents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAgents = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/.netlify/functions/getAgents', {
                    headers: {
                        'Authorization': `Bearer ${await user.getIdToken()}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch agents');
                }

                const data = await response.json();
                setAgents(data);
            } catch (error) {
                console.error('Error fetching agents:', error);
                setError(t('Failed to load agents'));
            } finally {
                setLoading(false);
            }
        };

        fetchAgents();
    }, [user, t]);

    const handleAddAgent = async (agentData) => {
        if (!user) return;

        try {
            setError(null);
            const response = await fetch('/.netlify/functions/saveAgent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify(agentData)
            });

            if (!response.ok) {
                throw new Error('Failed to add agent');
            }

            const newAgent = await response.json();
            setAgents(prev => [...prev, newAgent]);
            setShowForm(false);
        } catch (error) {
            console.error('Error adding agent:', error);
            setError(t('Failed to add agent'));
        }
    };

    const handleSaveEditedAgent = async (updatedAgent) => {
        if (!user) return;

        try {
            setError(null);
            const response = await fetch('/.netlify/functions/saveAgent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify(updatedAgent)
            });

            if (!response.ok) {
                throw new Error('Failed to update agent');
            }

            const savedAgent = await response.json();
            setAgents(prev => prev.map(agent => 
                agent.id === savedAgent.id ? savedAgent : agent
            ));
            setShowForm(false);
            setIsEditing(false);
            setSelectedAgent(null);
        } catch (error) {
            console.error('Error updating agent:', error);
            setError(t('Failed to update agent'));
        }
    };

    const handleDeleteAgent = async (agentId) => {
        if (!user) return;

        try {
            setError(null);
            const response = await fetch('/.netlify/functions/deleteAgent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({ agentId })
            });

            if (!response.ok) {
                throw new Error('Failed to delete agent');
            }

            setAgents(prev => prev.filter(agent => agent.id !== agentId));
            setSelectedAgent(null);
        } catch (error) {
            console.error('Error deleting agent:', error);
            setError(t('Failed to delete agent'));
        }
    };

    const handleAgentClick = (agent) => {
        setSelectedAgent(agent);
    };

    const handleCloseModal = () => {
        setSelectedAgent(null);
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
                <h1 className="text-2xl font-semibold text-gray-900">{t('Agents')}</h1>
                {settings?.buttons?.addAgent && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        {t('Add New Agent')}
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                    <div
                        key={agent.id}
                        onClick={() => handleAgentClick(agent)}
                        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    >
                        <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                        <p className="text-sm text-gray-500">{agent.email}</p>
                        <p className="text-sm text-gray-500">{agent.phone}</p>
                    </div>
                ))}
            </div>

            {showForm && (
                <AgentForm
                    onSubmit={isEditing ? handleSaveEditedAgent : handleAddAgent}
                    onCancel={() => {
                        setShowForm(false);
                        setIsEditing(false);
                        setSelectedAgent(null);
                    }}
                    initialData={isEditing ? selectedAgent : null}
                />
            )}

            {selectedAgent && !showForm && (
                <AgentDetailsModal
                    agent={selectedAgent}
                    onClose={handleCloseModal}
                    onEdit={() => {
                        setIsEditing(true);
                        setShowForm(true);
                    }}
                    onDelete={handleDeleteAgent}
                    canEdit={settings?.buttons?.editAgent}
                    canDelete={settings?.buttons?.deleteAgent}
                />
            )}
        </div>
    );
};

export default Agents;
