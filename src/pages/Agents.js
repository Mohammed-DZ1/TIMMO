import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';  // Import unique ID generator
import AgentForm from '../components/AgentForm';
import AgentDetailsModal from '../components/AgentDetailsModal';

const Agents = () => {
    const [agents, setAgents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [visibilitySettings, setVisibilitySettings] = useState({
        showEditButton: true,
        showDeleteButton: true,
        showAddAgentButton: true,
    });

    useEffect(() => {
        const storedSettings = JSON.parse(localStorage.getItem('visibilitySettings')) || visibilitySettings;
        setVisibilitySettings(storedSettings);
    }, []);

    // Function to add a new agent
    const handleAddAgent = (newAgent) => {
        const agentWithId = { ...newAgent, agentId: uuidv4() };  // Assign unique ID
        setAgents([...agents, agentWithId]);
        setShowForm(false);
    };

    // Function to save the edited agent
    const handleSaveEditedAgent = (updatedAgent) => {
        setAgents(agents.map((agent) =>
            agent.agentId === updatedAgent.agentId ? updatedAgent : agent
        ));
        setShowForm(false);
        setIsEditing(false);
        setSelectedAgent(null);
    };

    // Function to delete an agent
    const handleDeleteAgent = (agentId) => {
        setAgents(agents.filter((agent) => agent.agentId !== agentId));
    };

    // Function to handle agent click for popup details
    const handleAgentClick = (agent) => {
        setSelectedAgent(agent);
    };

    // Function to close the agent details popup
    const handleCloseModal = () => {
        setSelectedAgent(null);
    };

    // Function to start editing from the modal
    const handleEditFromModal = () => {
        setIsEditing(true);
        setShowForm(true);
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">Agents Management</h1>

            {/* Conditionally show Add New Agent button */}
            {visibilitySettings.showAddAgentButton && (
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setIsEditing(false);
                        setSelectedAgent(null);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
                >
                    {showForm ? 'Hide Form' : 'Add New Agent'}
                </button>
            )}

            {/* Show the form for adding or editing */}
            {showForm && (
                <AgentForm
                    onSubmit={isEditing ? handleSaveEditedAgent : handleAddAgent}
                    agent={selectedAgent}
                    isEditing={isEditing}
                />
            )}

            <h2 className="text-2xl font-bold mt-6">Listed Agents</h2>
            <ul className="mt-4 space-y-4">
                {agents.length === 0 ? (
                    <p>No agents listed yet.</p>
                ) : (
                    agents.map((agent) => (
                        <li
                            key={agent.agentId}
                            className="border p-4 rounded shadow cursor-pointer hover:bg-gray-100 flex items-center space-x-4"
                            onClick={() => handleAgentClick(agent)}  // Open agent details
                        >
                            {agent.profilePicture && (
                                <img
                                    src={URL.createObjectURL(agent.profilePicture)}
                                    alt={`${agent.agentName}'s Profile`}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            )}
                            <div>
                                <p><strong>ID:</strong> {agent.agentId}</p>
                                <h3 className="text-xl font-bold">{agent.agentName}</h3>
                                <p><strong>Phone:</strong> {agent.phoneNumber}</p>
                                <p><strong>Email:</strong> {agent.email || 'N/A'}</p>
                                <p><strong>Type:</strong> {agent.typeOfAgent}</p>
                            </div>

                            <div className="ml-auto space-x-2">
                                {/* Conditionally show Edit Button */}
                                {visibilitySettings.showEditButton && (
                                    <button
                                        onClick={handleEditFromModal}
                                        className="bg-green-500 text-white px-2 py-1 rounded"
                                    >
                                        Edit
                                    </button>
                                )}

                                {/* Conditionally show Delete Button */}
                                {visibilitySettings.showDeleteButton && (
                                    <button
                                        onClick={() => handleDeleteAgent(agent.agentId)}
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </li>
                    ))
                )}
            </ul>

            {selectedAgent && (
                <AgentDetailsModal
                    agent={selectedAgent}
                    onClose={handleCloseModal}
                    onEdit={handleEditFromModal}
                    onDelete={handleDeleteAgent}  // Correctly handle delete
                />
            )}
        </div>
    );
};

export default Agents;