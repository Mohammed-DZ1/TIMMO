import React, { useState, useEffect } from 'react';

const defaultSettings = {
    showEditButton: true,
    showDeleteButton: true,
    showAddPropertyButton: true,
    showAddClientButton: true,
};

const VisibilitySettings = ({ onSave }) => {
    const [visibility, setVisibility] = useState(
        JSON.parse(localStorage.getItem('visibilitySettings')) || defaultSettings
    );

    useEffect(() => {
        localStorage.setItem('visibilitySettings', JSON.stringify(visibility));
    }, [visibility]);

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setVisibility((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleSave = () => {
        onSave(visibility);
        alert('Visibility settings saved successfully!');
    };

    return (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Visibility Settings</h2>

            <div className="mb-4">
                <input
                    type="checkbox"
                    id="showEditButton"
                    name="showEditButton"
                    checked={visibility.showEditButton}
                    onChange={handleChange}
                />
                <label htmlFor="showEditButton" className="ml-2 text-gray-700">Show Edit Button</label>
            </div>

            <div className="mb-4">
                <input
                    type="checkbox"
                    id="showDeleteButton"
                    name="showDeleteButton"
                    checked={visibility.showDeleteButton}
                    onChange={handleChange}
                />
                <label htmlFor="showDeleteButton" className="ml-2 text-gray-700">Show Delete Button</label>
            </div>

            <div className="mb-4">
                <input
                    type="checkbox"
                    id="showAddPropertyButton"
                    name="showAddPropertyButton"
                    checked={visibility.showAddPropertyButton}
                    onChange={handleChange}
                />
                <label htmlFor="showAddPropertyButton" className="ml-2 text-gray-700">Show Add Property Button</label>
            </div>

            <div className="mb-4">
                <input
                    type="checkbox"
                    id="showAddClientButton"
                    name="showAddClientButton"
                    checked={visibility.showAddClientButton}
                    onChange={handleChange}
                />
                <label htmlFor="showAddClientButton" className="ml-2 text-gray-700">Show Add Client Button</label>
            </div>

            <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded">
                Save Settings
            </button>
        </div>
    );
};

export default VisibilitySettings;