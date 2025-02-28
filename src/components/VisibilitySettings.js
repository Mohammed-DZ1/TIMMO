import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const defaultSettings = {
    showEditButton: true,
    showDeleteButton: true,
    showAddPropertyButton: true,
    showAddClientButton: true,
};

const VisibilitySettings = ({ onSave }) => {
    const [visibility, setVisibility] = useState(defaultSettings);

    useEffect(() => {
        const fetchVisibilitySettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'visibilitySettings');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setVisibility(docSnap.data());
                }
            } catch (error) {
                console.error('Error fetching visibility settings:', error);
            }
        };
        
        fetchVisibilitySettings();
    }, []);

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setVisibility((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleSave = async () => {
        try {
            const docRef = doc(db, 'settings', 'visibilitySettings');
            await setDoc(docRef, visibility);
            onSave(visibility);
            alert('Visibility settings saved successfully!');
        } catch (error) {
            console.error('Error saving visibility settings:', error);
        }
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
