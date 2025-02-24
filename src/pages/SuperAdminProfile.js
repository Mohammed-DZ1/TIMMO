import React, { useState } from 'react';

const SuperAdminProfile = ({ user, onUpdateProfile, onLogout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: user.name, email: user.email, password: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: value });
    };

    const handleSave = () => {
        if (editData.password.trim() === '') {
            alert('Password cannot be empty.');
            return;
        }
        onUpdateProfile(editData);
        setIsEditing(false);
    };

    return (
        <div className="p-8 bg-white rounded shadow-md max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6">Super Admin Profile</h1>

            {!isEditing ? (
                <div>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> Super Admin</p>

                    <div className="mt-4 flex space-x-4">
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Edit Profile
                        </button>
                        <button 
                            onClick={onLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={editData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">New Password</label>
                        <input
                            type="password"
                            name="password"
                            value={editData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mt-4 flex space-x-4">
                        <button 
                            onClick={handleSave}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Save Changes
                        </button>
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminProfile;