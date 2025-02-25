import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import PropertyForm from './PropertyForm';

const ClientForm = ({ onSubmit, initialType = null }) => {
    const [clientType, setClientType] = useState(initialType);
    const [clientData, setClientData] = useState({
        clientId: uuidv4(),
        name: '',
        phoneNumber: '',
        email: '',
        type: '',  // OWNER or SEEKER
        role: '',  // SELLER, RENTER, BUYER, or TENANT
        source: 'Direct',
        preferredContact: 'Phone',
        preferences: {},  // For SEEKER type
    });

    const [showPropertyForm, setShowPropertyForm] = useState(false);

    const handleClientTypeSelect = (type, role) => {
        setClientType(type);
        setClientData(prev => ({
            ...prev,
            type,
            role,
            preferences: type === 'SEEKER' ? {
                propertyType: '',
                priceRange: { min: '', max: '' },
                location: '',
                bedrooms: '',
                bathrooms: '',
                amenities: []
            } : {}
        }));
        setShowPropertyForm(type === 'OWNER');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClientData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePropertySubmit = (propertyData) => {
        // Combine client and property data
        const combinedData = {
            ...clientData,
            property: propertyData
        };
        onSubmit(combinedData);
    };

    if (!clientType) {
        return (
            <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Select Client Type</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                        onClick={() => handleClientTypeSelect('OWNER', 'SELLER')}
                        className="relative border rounded-lg p-4 flex flex-col items-center hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <span className="text-lg font-medium">Property Owner</span>
                        <span className="text-sm text-gray-500">Selling or Renting Out Property</span>
                    </button>
                    <button
                        onClick={() => handleClientTypeSelect('SEEKER', 'BUYER')}
                        className="relative border rounded-lg p-4 flex flex-col items-center hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <span className="text-lg font-medium">Property Seeker</span>
                        <span className="text-sm text-gray-500">Looking to Buy or Rent</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Client Information</h2>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={clientData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={clientData.phoneNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={clientData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            name="role"
                            value={clientData.role}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            {clientType === 'OWNER' ? (
                                <>
                                    <option value="SELLER">Seller</option>
                                    <option value="RENTER">Renter</option>
                                </>
                            ) : (
                                <>
                                    <option value="BUYER">Buyer</option>
                                    <option value="TENANT">Tenant</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                {clientType === 'SEEKER' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Property Preferences</h3>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                                <select
                                    name="preferences.propertyType"
                                    value={clientData.preferences.propertyType}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Select Type</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                    <option value="office">Office</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <input
                                    type="text"
                                    name="preferences.location"
                                    value={clientData.preferences.location}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Min Price</label>
                                <input
                                    type="number"
                                    name="preferences.priceRange.min"
                                    value={clientData.preferences.priceRange.min}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Max Price</label>
                                <input
                                    type="number"
                                    name="preferences.priceRange.max"
                                    value={clientData.preferences.priceRange.max}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showPropertyForm && (
                <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Property Information</h3>
                    <PropertyForm 
                        onSubmit={handlePropertySubmit}
                        withCommission={true}
                        clientOwned={true}
                        clientId={clientData.clientId}
                    />
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => onSubmit(clientData)}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Save Client
                </button>
            </div>
        </div>
    );
};

export default ClientForm;
