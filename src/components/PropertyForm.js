import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import api from '../services/api';

const PropertyForm = ({ onSubmit, withCommission = false, clientOwned = false, clientId = null }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [propertyData, setPropertyData] = useState({
        propertyId: uuidv4(),
        title: '',
        type: 'apartment',
        category: 'sale',
        price: '',
        location: '',
        status: 'available',
        floorArea: '',
        bedrooms: '',
        bathrooms: '',
        yearBuilt: '',
        amenities: [],
        description: '',
        ownership: clientOwned ? 'CLIENT' : 'AGENCY',
        clientId: clientId,
        commission: withCommission ? {
            type: 'PERCENTAGE',
            value: ''
        } : null,
        media: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('commission.')) {
            const field = name.split('.')[1];
            setPropertyData(prev => ({
                ...prev,
                commission: {
                    ...prev.commission,
                    [field]: value
                }
            }));
        } else {
            setPropertyData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAmenitiesChange = (e) => {
        const { checked, value } = e.target;
        setPropertyData(prev => ({
            ...prev,
            amenities: checked 
                ? [...prev.amenities, value]
                : prev.amenities.filter(amenity => amenity !== value)
        }));
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        setPropertyData(prev => ({
            ...prev,
            media: [...prev.media, ...files]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);

            // If this is part of a client form, just pass the data up
            if (clientOwned) {
                onSubmit(propertyData);
                return;
            }

            // Otherwise, save directly to backend
            try {
                console.log('Sending property data:', propertyData);
                const response = await api.post('saveProperty', propertyData);
                console.log('Property save response:', response);
                onSubmit && onSubmit(response.data);
            } catch (error) {
                console.error('Detailed error:', error.response || error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to save property';
                setError(errorMessage);
            }

        } catch (err) {
            console.error('Error saving property:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={propertyData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                        name="type"
                        value={propertyData.type}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                    >
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="villa">Villa</option>
                        <option value="office">Office</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        name="category"
                        value={propertyData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                    >
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                        type="number"
                        name="price"
                        value={propertyData.price}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={propertyData.location}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        name="status"
                        value={propertyData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                    >
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Floor Area (m²)</label>
                    <input
                        type="number"
                        name="floorArea"
                        value={propertyData.floorArea}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                    <input
                        type="number"
                        name="bedrooms"
                        value={propertyData.bedrooms}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                    <input
                        type="number"
                        name="bathrooms"
                        value={propertyData.bathrooms}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Year Built</label>
                    <input
                        type="number"
                        name="yearBuilt"
                        value={propertyData.yearBuilt}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Amenities</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    {['Parking', 'Pool', 'Garden', 'Security', 'Gym', 'Elevator'].map(amenity => (
                        <label key={amenity} className="inline-flex items-center">
                            <input
                                type="checkbox"
                                value={amenity.toLowerCase()}
                                checked={propertyData.amenities.includes(amenity.toLowerCase())}
                                onChange={handleAmenitiesChange}
                                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                            />
                            <span className="ml-2">{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    name="description"
                    value={propertyData.description}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
            </div>

            {withCommission && (
                <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Commission Details</h4>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Commission Type</label>
                            <select
                                name="commission.type"
                                value={propertyData.commission.type}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="PERCENTAGE">Percentage</option>
                                <option value="FIXED">Fixed Amount</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {propertyData.commission.type === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount'}
                            </label>
                            <input
                                type="number"
                                name="commission.value"
                                value={propertyData.commission.value}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Property Images</label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMediaChange}
                    className="mt-1 block w-full"
                />
            </div>

            {!clientOwned && (
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Property'}
                    </button>
                </div>
            )}
        </form>
    );
};

export default PropertyForm;
