import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const ClientDetailsModal = ({ client, onClose, onEdit, onDelete, userRole }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...client });
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [visibilitySettings, setVisibilitySettings] = useState({});

    useEffect(() => {
        const fetchVisibilitySettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'visibilitySettings'); // Firestore document path
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setVisibilitySettings(docSnap.data());
                }
            } catch (error) {
                console.error('Error fetching visibility settings:', error);
            }
        };
        
        fetchVisibilitySettings();
    }, []);

    const canShowEditButton = visibilitySettings[userRole]?.showEditButton;
    const canShowDeleteButton = visibilitySettings[userRole]?.showDeleteButton;

    const correctEmail = 'admin@example.com';  // Replace with actual admin email
    const correctPassword = 'admin123';        // Replace with actual admin password

    const handleSave = () => {
        onEdit(editData);
        setIsEditing(false);
    };

    const handleDeleteConfirmation = () => {
        if (emailInput === correctEmail && passwordInput === correctPassword) {
            onDelete(client.clientId);
            alert('Client successfully deleted.');
            setShowConfirmDelete(false);
            onClose();  // Close the modal after successful deletion
        } else {
            alert('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">&#10005;</button>

                {!isEditing ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Client Details</h2>
                        <p><strong>ID:</strong> {client.clientId}</p>
                        <p><strong>Name:</strong> {client.name}</p>
                        <p><strong>Phone:</strong> {client.phoneNumber}</p>
                        <p><strong>Type:</strong> {client.clientType}</p>
                        <p><strong>Source:</strong> {client.source}</p>
                        <p><strong>Preferred Contact:</strong> {client.preferredContact}</p>

                        {(client.clientType === 'Seller' || client.clientType === 'Renter') && client.property && (
                            <p><strong>Property ID:</strong> {client.property.propertyId}</p>
                        )}

                        <div className="mt-4 flex justify-end space-x-2">
                            {canShowEditButton && (
                                <button onClick={() => setIsEditing(true)} className="bg-green-500 text-white p-2 rounded">Edit</button>
                            )}
                            {canShowDeleteButton && (
                                <button onClick={() => setShowConfirmDelete(true)} className="bg-red-500 text-white p-2 rounded">Delete</button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Edit Client</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700">Name</label>
                            <input type="text" name="name" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full p-2 border rounded" required />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Phone Number</label>
                            <input type="text" name="phoneNumber" value={editData.phoneNumber} onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })} className="w-full p-2 border rounded" required />
                        </div>

                        <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded">Save Changes</button>
                    </div>
                )}

                {showConfirmDelete && (
                    <div className="mt-4 p-4 bg-gray-100 rounded shadow-md">
                        <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
                        <p>Please enter the admin email and password to confirm deletion:</p>
                        <input type="email" placeholder="Email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full p-2 border rounded mt-2" required />
                        <input type="password" placeholder="Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full p-2 border rounded mt-2" required />
                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={handleDeleteConfirmation} className="bg-red-500 text-white p-2 rounded">Confirm</button>
                            <button onClick={() => setShowConfirmDelete(false)} className="bg-gray-300 p-2 rounded">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientDetailsModal;
