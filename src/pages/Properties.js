import React, { useState, useEffect } from 'react';
import PropertyForm from '../components/PropertyForm';
import PropertyDetailsModal from '../components/PropertyDetailsModal';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [visibilitySettings, setVisibilitySettings] = useState({
        showEditButton: true,
        showDeleteButton: true,
        showAddPropertyButton: true,
    });

    useEffect(() => {
        // Load visibility settings from localStorage on component mount
        const storedSettings = JSON.parse(localStorage.getItem('visibilitySettings'));
        if (storedSettings) {
            setVisibilitySettings(storedSettings);
        }
    }, []);

    // Function to add a new property
    const handleAddProperty = (newProperty) => {
        setProperties([...properties, newProperty]);
        setShowForm(false);
    };

    // Function to save the edited property
    const handleSaveEditedProperty = (updatedProperty) => {
        setProperties(properties.map((property) =>
            property.propertyId === updatedProperty.propertyId ? updatedProperty : property
        ));
        setShowForm(false);
        setIsEditing(false);
        setSelectedProperty(null);
    };

    // Function to handle property click for popup details
    const handlePropertyClick = (property) => {
        setSelectedProperty(property);
    };

    // Function to close the property details popup
    const handleCloseModal = () => {
        setSelectedProperty(null);
    };

    // Function to start editing from the modal
    const handleEditFromModal = () => {
        setIsEditing(true);
        setShowForm(true);
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">Properties Management</h1>

            {visibilitySettings.showAddPropertyButton && (
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setIsEditing(false);
                        setSelectedProperty(null);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
                >
                    {showForm ? 'Hide Form' : 'Add New Property'}
                </button>
            )}

            {/* Show the form for adding or editing */}
            {showForm && (
                <PropertyForm
                    onSubmit={isEditing ? handleSaveEditedProperty : handleAddProperty}
                    property={selectedProperty}
                    isEditing={isEditing}
                />
            )}

            <h2 className="text-2xl font-bold mt-6">Listed Properties</h2>
            <ul className="mt-4 space-y-4">
                {properties.length === 0 ? (
                    <p>No properties listed yet.</p>
                ) : (
                    properties.map((property, index) => (
                        <li
                            key={index}
                            className="border p-4 rounded shadow cursor-pointer hover:bg-gray-100"
                            onClick={() => handlePropertyClick(property)}  // Open property details
                        >
                            <h3 className="text-xl font-bold">{property.title}</h3>
                            <p><strong>Location:</strong> {property.location}</p>
                            <p><strong>Price:</strong> ${property.price}</p>
                            <p><strong>Status:</strong> {property.status}</p>

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
                                        onClick={() =>
                                            setProperties(properties.filter((p) => p.propertyId !== property.propertyId))
                                        }
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

            {selectedProperty && (
                <PropertyDetailsModal
                    property={selectedProperty}
                    onClose={handleCloseModal}
                    onEdit={handleEditFromModal}  // Handle edit from the modal
                />
            )}
        </div>
    );
};

export default Properties;