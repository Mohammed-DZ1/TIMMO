import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import PropertyForm from '../components/PropertyForm';
import PropertyDetailsModal from '../components/PropertyDetailsModal';
import { useSettings } from '../hooks/useSettings';

const Properties = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { settings } = useSettings();
    const [properties, setProperties] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProperties = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/.netlify/functions/getProperties', {
                    headers: {
                        'Authorization': `Bearer ${await user.getIdToken()}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch properties');
                }

                const data = await response.json();
                setProperties(data);
            } catch (error) {
                console.error('Error fetching properties:', error);
                setError(t('Failed to load properties'));
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [user, t]);

    const handleAddProperty = async (propertyData) => {
        if (!user) return;

        try {
            setError(null);
            const response = await fetch('/.netlify/functions/saveProperty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify(propertyData)
            });

            if (!response.ok) {
                throw new Error('Failed to add property');
            }

            const newProperty = await response.json();
            setProperties(prev => [...prev, newProperty]);
            setShowForm(false);
        } catch (error) {
            console.error('Error adding property:', error);
            setError(t('Failed to add property'));
        }
    };

    const handleSaveEditedProperty = async (updatedProperty) => {
        if (!user) return;

        try {
            setError(null);
            const response = await fetch('/.netlify/functions/saveProperty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify(updatedProperty)
            });

            if (!response.ok) {
                throw new Error('Failed to update property');
            }

            const savedProperty = await response.json();
            setProperties(prev => prev.map(property => 
                property.id === savedProperty.id ? savedProperty : property
            ));
            setShowForm(false);
            setIsEditing(false);
            setSelectedProperty(null);
        } catch (error) {
            console.error('Error updating property:', error);
            setError(t('Failed to update property'));
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        if (!user) return;

        try {
            setError(null);
            const response = await fetch('/.netlify/functions/deleteProperty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({ propertyId })
            });

            if (!response.ok) {
                throw new Error('Failed to delete property');
            }

            setProperties(prev => prev.filter(property => property.id !== propertyId));
            setSelectedProperty(null);
        } catch (error) {
            console.error('Error deleting property:', error);
            setError(t('Failed to delete property'));
        }
    };

    const handlePropertyClick = (property) => {
        setSelectedProperty(property);
    };

    const handleCloseModal = () => {
        setSelectedProperty(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">{t('Properties')}</h1>
                {settings?.buttons?.addProperty && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        {t('Add New Property')}
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <div
                        key={property.id}
                        onClick={() => handlePropertyClick(property)}
                        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    >
                        {property.images && property.images.length > 0 && (
                            <img
                                src={property.images[0]}
                                alt={property.title}
                                className="w-full h-48 object-cover rounded-t-lg mb-4"
                            />
                        )}
                        <h3 className="text-lg font-medium text-gray-900">{property.title}</h3>
                        <p className="text-sm text-gray-500">{property.location}</p>
                        <p className="text-lg font-semibold text-primary-600">{property.price}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{property.bedrooms} {t('Beds')}</span>
                            <span>{property.bathrooms} {t('Baths')}</span>
                            <span>{property.area} {t('sqft')}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <PropertyForm
                    onSubmit={isEditing ? handleSaveEditedProperty : handleAddProperty}
                    onCancel={() => {
                        setShowForm(false);
                        setIsEditing(false);
                        setSelectedProperty(null);
                    }}
                    initialData={isEditing ? selectedProperty : null}
                />
            )}

            {selectedProperty && !showForm && (
                <PropertyDetailsModal
                    property={selectedProperty}
                    onClose={handleCloseModal}
                    onEdit={() => {
                        setIsEditing(true);
                        setShowForm(true);
                    }}
                    onDelete={handleDeleteProperty}
                    canEdit={settings?.buttons?.editProperty}
                    canDelete={settings?.buttons?.deleteProperty}
                />
            )}
        </div>
    );
};

export default Properties;
