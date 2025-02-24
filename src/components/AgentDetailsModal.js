import React, { useState, useEffect } from 'react';

const AgentDetailModal = ({ agent, onClose, onEdit, onDelete, userRole }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...agent });
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [visibilitySettings, setVisibilitySettings] = useState({});

    useEffect(() => {
        // Load visibility settings from localStorage
        const savedSettings = JSON.parse(localStorage.getItem('visibilitySettings'));
        if (savedSettings) {
            setVisibilitySettings(savedSettings);
        }
    }, []);

    const canShowEditButton = visibilitySettings[userRole]?.showEditButton;
    const canShowDeleteButton = visibilitySettings[userRole]?.showDeleteButton;

    const correctEmail = 'admin@example.com';  // Replace with actual admin email
    const correctPassword = 'admin123';        // Replace with actual admin password

    const handleSave = () => {
        onEdit(editData);
        setIsEditing(false);  // Exit edit mode after saving
    };

    const handleDeleteConfirmation = () => {
        if (emailInput === correctEmail && passwordInput === correctPassword) {
            onDelete(agent.agentId);
            alert('Agent successfully deleted.');
            setShowConfirmDelete(false);
            onClose();  // Close the modal after successful deletion
        } else {
            alert('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()}  // Prevent closing when clicking inside
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                >
                    &#10005;
                </button>

                {!isEditing ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Agent Details</h2>
                        {agent.profilePicture && (
                            <img
                                src={
                                    typeof agent.profilePicture === 'string'
                                        ? agent.profilePicture
                                        : URL.createObjectURL(agent.profilePicture)
                                }
                                alt={`${agent.agentName}'s Profile`}
                                className="w-24 h-24 rounded-full object-cover mb-4"
                            />
                        )}
                        <p><strong>ID:</strong> {agent.agentId}</p>
                        <p><strong>Name:</strong> {agent.agentName}</p>
                        <p><strong>Phone:</strong> {agent.phoneNumber}</p>
                        <p><strong>Email:</strong> {agent.email || 'N/A'}</p>
                        <p><strong>Type:</strong> {agent.typeOfAgent}</p>
                        <p><strong>Region:</strong> {agent.region}</p>
                        <p><strong>Status:</strong> {agent.activeStatus ? 'Active' : 'Inactive'}</p>
                        <p><strong>Notes:</strong> {agent.notes || 'No additional notes'}</p>

                        <div className="mt-4 flex justify-end space-x-2">
                            {canShowEditButton && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-green-500 text-white p-2 rounded"
                                >
                                    Edit
                                </button>
                            )}
                            {canShowDeleteButton && (
                                <button
                                    onClick={() => setShowConfirmDelete(true)}
                                    className="bg-red-500 text-white p-2 rounded"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Edit form */}
                        <h2 className="text-2xl font-bold mb-4">Edit Agent</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700">Name</label>
                            <input
                                type="text"
                                value={editData.agentName}
                                onChange={(e) => setEditData({ ...editData, agentName: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Phone Number</label>
                            <input
                                type="text"
                                value={editData.phoneNumber}
                                onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
                            Save Changes
                        </button>
                    </div>
                )}

                {/* Delete confirmation modal */}
                {showConfirmDelete && (
                    <div className="mt-4 p-4 bg-gray-100 rounded shadow-md">
                        <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
                        <p>Please enter the admin email and password to confirm deletion:</p>
                        <input
                            type="email"
                            placeholder="Email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full p-2 border rounded mt-2"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full p-2 border rounded mt-2"
                            required
                        />
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={handleDeleteConfirmation}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="bg-gray-300 p-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentDetailModal;