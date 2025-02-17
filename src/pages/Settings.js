import React, { useState, useEffect } from 'react';
import RoleManagementForm from '../components/RoleManagementForm';
import SidebarLinkManagement from '../components/SidebarLinkManagement';
import FormFieldManagement from '../components/FormFieldManagement';

const Settings = ({ userRole }) => {
    const [activeSection, setActiveSection] = useState('roleManagement');
    const [users, setUsers] = useState([]);
    const [sidebarLinks, setSidebarLinks] = useState([]);
    const [formFields, setFormFields] = useState([]);

    // Fetch data from the backend
   useEffect(() => {
    const fetchData = async () => {
        try {
            const userResponse = await fetch('https://timmodashboard.netlify.app/.netlify/functions/getUsers');
            const sidebarResponse = await fetch(`https://timmodashboard.netlify.app/.netlify/functions/getSidebarLinks?role=${userRole}`);
            const formFieldResponse = await fetch('https://timmodashboard.netlify.app/.netlify/functions/getFormFields');

            if (!userResponse.ok || !sidebarResponse.ok || !formFieldResponse.ok) {
                throw new Error('One or more API requests failed.');
            }

            const usersData = await userResponse.json();
            const sidebarData = await sidebarResponse.json();
            const formFieldsData = await formFieldResponse.json();

            setUsers(usersData);
            setSidebarLinks(sidebarData.links || []); // Ensure sidebarLinks is always an array
            setFormFields(formFieldsData.fields || []);
        } catch (error) {
            console.error('Error fetching settings data:', error);
        }
    };

    fetchData();
}, [userRole]);
    
    // Backend update functions
    const handleSaveUser = async (newUser) => {
        try {
            const response = await fetch('https://timmodashboard.netlify.app/.netlify/functions/updateUsers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([...users, newUser])
            });

            if (response.ok) {
                setUsers((prev) => [...prev, newUser]);
            } else {
                console.error('Failed to update users.');
            }
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleSidebarUpdate = async (updatedLinks) => {
        try {
            const response = await fetch('https://timmodashboard.netlify.app/.netlify/functions/updateSidebarLinks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedLinks)
            });

            if (response.ok) {
                setSidebarLinks(updatedLinks);
            } else {
                console.error('Failed to update sidebar links.');
            }
        } catch (error) {
            console.error('Error updating sidebar links:', error);
        }
    };

    const handleFormFieldUpdate = async (updatedFields) => {
        try {
            const response = await fetch('https://timmodashboard.netlify.app/.netlify/functions/updateFormFields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFields)
            });

            if (response.ok) {
                setFormFields(updatedFields);
            } else {
                console.error('Failed to update form fields.');
            }
        } catch (error) {
            console.error('Error updating form fields:', error);
        }
    };

    // Updated permissions structure (Fixing reduce issue)
    const permissionsChecklist = {
        sidebarLinks: sidebarLinks.length > 0 
            ? sidebarLinks.reduce((acc, link) => {
                acc[link.path] = false;
                return acc;
            }, {}) 
            : {
                "/": false,
                "/properties": false,
                "/clients": false,
                "/agents": false,
                "/settings": false
            }, // Default structure if empty

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
    };

    // Dynamic section rendering
    const renderSection = () => {
        switch (activeSection) {
            case 'roleManagement':
                return (
                    <RoleManagementForm
                        users={users}
                        onSaveUser={handleSaveUser}
                        permissions={permissionsChecklist}
                    />
                );
            case 'sidebar':
                return userRole === 'Super Admin' || userRole === 'Admin' ? (
                    <SidebarLinkManagement
                        sidebarLinks={sidebarLinks}
                        onSidebarUpdate={handleSidebarUpdate}
                        userRole={userRole}
                    />
                ) : (
                    <p className="text-red-500">Access Denied</p>
                );
            case 'formFields':
                return userRole === 'Super Admin' || userRole === 'Admin' ? (
                    <FormFieldManagement
                        formFields={formFields}
                        onFormFieldUpdate={handleFormFieldUpdate}
                    />
                ) : (
                    <p className="text-red-500">Access Denied</p>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">Settings - Manage Users, Sidebar, and Forms</h1>

            {/* Section Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    className={`px-4 py-2 rounded transition duration-200 ease-in-out focus:ring-2 ${
                        activeSection === 'roleManagement' 
                            ? 'bg-blue-500 text-white ring-blue-500' 
                            : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-300'
                    }`}
                    onClick={() => setActiveSection('roleManagement')}
                    aria-selected={activeSection === 'roleManagement'}
                >
                    Role Management
                </button>
                {userRole === 'Super Admin' || userRole === 'Admin' ? (
                    <>
                        <button
                            className={`px-4 py-2 rounded transition duration-200 ease-in-out focus:ring-2 ${
                                activeSection === 'sidebar' 
                                    ? 'bg-blue-500 text-white ring-blue-500' 
                                    : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-300'
                            }`}
                            onClick={() => setActiveSection('sidebar')}
                            aria-selected={activeSection === 'sidebar'}
                        >
                            Sidebar Management
                        </button>
                        <button
                            className={`px-4 py-2 rounded transition duration-200 ease-in-out focus:ring-2 ${
                                activeSection === 'formFields' 
                                    ? 'bg-blue-500 text-white ring-blue-500' 
                                    : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-300'
                            }`}
                            onClick={() => setActiveSection('formFields')}
                            aria-selected={activeSection === 'formFields'}
                        >
                            Form Field Management
                        </button>
                    </>
                ) : null}
            </div>

            {/* Dynamic Content */}
            <div>{renderSection()}</div>
        </div>
    );
};

export default Settings;
