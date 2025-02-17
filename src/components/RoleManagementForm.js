import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';  // For generating unique IDs

const RoleManagementForm = ({ currentUserRole }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Agent');  // Default role
    const [sidebarLinks, setSidebarLinks] = useState([]);
    const [permissions, setPermissions] = useState({
        sidebarLinks: {},
        buttons: {
            addUser: false,
            editUser: false,
            deleteUser: false,
            addProperty: false,
            editProperty: false,
            deleteProperty: false,
            addClient: false,
            editClient: false,
            deleteClient: false
        },
        forms: {
            clientForm: false,
            agentForm: false,
            propertyForm: false
        }
    });

    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);

    // Fetch users and sidebar links from the backend on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('https://timmodashboard.netlify.app/.netlify/functions/getUsers');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const fetchSidebarLinks = async () => {
            try {
                const response = await fetch('https://timmodashboard.netlify.app/.netlify/functions/getSidebarLinks');
                const data = await response.json();
                const sidebarPermissions = data.links.reduce((acc, link) => {
                    acc[link.path] = false;  // Default to false
                    return acc;
                }, {});
                setSidebarLinks(data.links);
                setPermissions(prev => ({ ...prev, sidebarLinks: sidebarPermissions }));
            } catch (error) {
                console.error('Error fetching sidebar links:', error);
            }
        };

        fetchUsers();
        fetchSidebarLinks();
    }, []);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            setError('All fields are required.');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email.');
            return;
        }

        if (role === 'Super Admin' && currentUserRole !== 'Super Admin') {
            setError('Only Super Admins can add other Super Admins.');
            return;
        }

        const newUser = {
            id: uuidv4(),
            name,
            email,
            password,
            role,
            permissions
        };

        try {
            const response = await fetch('https://timmodashboard.netlify.app/.netlify/functions/addOrUpdateUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (response.ok) {
                const updatedUsers = await response.json();
                setUsers(updatedUsers);  // Update the list after successful addition
                setError('');  // Clear errors
                resetForm();  // Reset the form
            } else {
                setError('Failed to add user. Please try again.');
            }
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRole('Agent');
        setPermissions({
            sidebarLinks: sidebarLinks.reduce((acc, link) => {
                acc[link.path] = false;  // Reset all sidebar permissions
                return acc;
            }, {}),
            buttons: {
                addUser: false,
                editUser: false,
                deleteUser: false,
                addProperty: false,
                editProperty: false,
                deleteProperty: false,
                addClient: false,
                editClient: false,
                deleteClient: false
            },
            forms: {
                clientForm: false,
                agentForm: false,
                propertyForm: false
            }
        });
    };

    const handlePermissionChange = (category, key) => {
        setPermissions((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key],
            }
        }));
    };

    return (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Add or Manage Users</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Agent">Agent</option>
                    </select>
                </div>

                {/* Sidebar Links Permissions */}
                <div className="mb-4">
                    <h3 className="font-semibold">Sidebar Links</h3>
                    {sidebarLinks.map((link) => (
                        <div key={link.path} className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                checked={permissions.sidebarLinks[link.path]}
                                onChange={() => handlePermissionChange('sidebarLinks', link.path)}
                                id={`sidebar-${link.path}`}
                            />
                            <label htmlFor={`sidebar-${link.path}`} className="ml-2 capitalize">
                                {link.label}
                            </label>
                        </div>
                    ))}
                </div>

                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    Add User
                </button>
            </form>
        </div>
    );
};

export default RoleManagementForm;
