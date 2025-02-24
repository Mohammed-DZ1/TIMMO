import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';  // Import unique ID generator
import ClientForm from '../components/ClientForm';
import ClientDetailsModal from '../components/ClientDetailsModal';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [visibilitySettings, setVisibilitySettings] = useState({
        showEditButton: true,
        showDeleteButton: true,
        showAddClientButton: true,
    });

    useEffect(() => {
        // Load visibility settings from localStorage on component mount
        const storedSettings = JSON.parse(localStorage.getItem('visibilitySettings'));
        if (storedSettings) {
            setVisibilitySettings(storedSettings);
        }
    }, []);

    // Function to add a new client
    const handleAddClient = (newClient) => {
        const clientWithId = { ...newClient, clientId: uuidv4() };  // Assign unique ID
        setClients([...clients, clientWithId]);
        setShowForm(false);  // Hide form after submission
    };

    // Function to save the edited client
    const handleSaveEditedClient = (updatedClient) => {
        setClients(clients.map((client) =>
            client.clientId === updatedClient.clientId ? updatedClient : client
        ));
        setShowForm(false);
        setIsEditing(false);
        setSelectedClient(null);
    };

    // Function to delete a client
    const handleDeleteClient = (clientId) => {
        setClients(clients.filter((client) => client.clientId !== clientId));
    };

    // Function to handle client click for popup details
    const handleClientClick = (client) => {
        setSelectedClient(client);
    };

    // Function to close the client details popup
    const handleCloseModal = () => {
        setSelectedClient(null);
    };

    // Function to start editing from the modal
    const handleEditFromModal = () => {
        setIsEditing(true);
        setShowForm(true);
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">Clients Management</h1>

            {visibilitySettings.showAddClientButton && (
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setIsEditing(false);
                        setSelectedClient(null);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
                >
                    {showForm ? 'Hide Form' : 'Add New Client'}
                </button>
            )}

            {/* Show the form for adding or editing */}
            {showForm && (
                <ClientForm
                    onSubmit={isEditing ? handleSaveEditedClient : handleAddClient}
                    client={selectedClient}
                    isEditing={isEditing}
                />
            )}

            <h2 className="text-2xl font-bold mt-6">Listed Clients</h2>
            <ul className="mt-4 space-y-4">
                {clients.length === 0 ? (
                    <p>No clients listed yet.</p>
                ) : (
                    clients.map((client) => (
                        <li
                            key={client.clientId}
                            className="border p-4 rounded shadow cursor-pointer hover:bg-gray-100"
                            onClick={() => handleClientClick(client)}  // Open client details
                        >
                            <p><strong>ID:</strong> {client.clientId}</p>
                            <h3 className="text-xl font-bold">{client.name}</h3>
                            <p><strong>Phone:</strong> {client.phoneNumber}</p>
                            <p><strong>Type:</strong> {client.clientType}</p>
                            <p><strong>Preferred Contact:</strong> {client.preferredContact}</p>

                            <div className="mt-2 flex space-x-2">
                                {visibilitySettings.showEditButton && (
                                    <button
                                        onClick={handleEditFromModal}
                                        className="bg-green-500 text-white px-2 py-1 rounded"
                                    >
                                        Edit
                                    </button>
                                )}
                                {visibilitySettings.showDeleteButton && (
                                    <button
                                        onClick={() => handleDeleteClient(client.clientId)}
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

            {selectedClient && (
                <ClientDetailsModal
                    client={selectedClient}
                    onClose={handleCloseModal}
                    onEdit={handleEditFromModal}
                    onDelete={handleDeleteClient}
                />
            )}
        </div>
    );
};

export default Clients;