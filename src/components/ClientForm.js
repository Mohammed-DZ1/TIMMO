import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';  // Generate unique IDs

const ClientForm = ({ onSubmit }) => {
    const [visibleFields, setVisibleFields] = useState({});
    const [clientData, setClientData] = useState({
        clientId: uuidv4(),  // Auto-generated client ID
        name: '',
        phoneNumber: '',
        clientType: 'Seller',  // Default to Seller
        source: 'Facebook',
        preferredContact: 'Phone',
    });

    const [propertyData, setPropertyData] = useState({
        propertyId: uuidv4(),  // Auto-generated property ID
        title: '',
        type: 'Residential',
        category: 'For Sale',
        price: '',
        location: '',
        status: 'Available',
        floorArea: '',
        bedrooms: '',
        bathrooms: '',
        yearBuilt: '',
        amenities: '',
        media: [],
        description: '',
    });

    const [showPropertyForm, setShowPropertyForm] = useState(true);  // Default to show for owners

    useEffect(() => {
        const visibilitySettings = JSON.parse(localStorage.getItem('visibilitySettings')) || {};
        setVisibleFields(visibilitySettings['ClientForm'] || {});
    }, []);

    // Handle client form changes
    const handleClientChange = (e) => {
        const { name, value } = e.target;
        setClientData({ ...clientData, [name]: value });

        // Toggle property form visibility based on client type
        if (name === 'clientType') {
            setShowPropertyForm(value === 'Seller' || value === 'Renter');
        }
    };

    // Handle property form changes
    const handlePropertyChange = (e) => {
        const { name, value } = e.target;
        setPropertyData({ ...propertyData, [name]: value });
    };

    // Handle file input for media
    const handleMediaChange = (e) => {
        setPropertyData({ ...propertyData, media: Array.from(e.target.files) });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const combinedData = {
            ...clientData,
            property: showPropertyForm ? { ...propertyData, ownerId: clientData.clientId } : null,  // Link client and property by ID
        };

        onSubmit(combinedData);

        // Reset forms after submission
        setClientData({
            clientId: uuidv4(),
            name: '',
            phoneNumber: '',
            clientType: 'Seller',
            source: 'Facebook',
            preferredContact: 'Phone',
        });

        setPropertyData({
            propertyId: uuidv4(),
            title: '',
            type: 'Residential',
            category: 'For Sale',
            price: '',
            location: '',
            status: 'Available',
            floorArea: '',
            bedrooms: '',
            bathrooms: '',
            yearBuilt: '',
            amenities: '',
            media: [],
            description: '',
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Add New Client</h2>

            {visibleFields.name && (
                <div className="mb-4">
                    <label className="block text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={clientData.name}
                        onChange={handleClientChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
            )}

            {visibleFields.phoneNumber && (
                <div className="mb-4">
                    <label className="block text-gray-700">Phone Number</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={clientData.phoneNumber}
                        onChange={handleClientChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
            )}

            {visibleFields.clientType && (
                <div className="mb-4">
                    <label className="block text-gray-700">Client Type</label>
                    <select
                        name="clientType"
                        value={clientData.clientType}
                        onChange={handleClientChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Seller">Seller (Owner)</option>
                        <option value="Renter">Renter (Owner)</option>
                        <option value="Buyer">Buyer (Property Seeker)</option>
                        <option value="Tenant">Tenant (Property Seeker)</option>
                    </select>
                </div>
            )}

            {visibleFields.source && (
                <div className="mb-4">
                    <label className="block text-gray-700">Source of Client</label>
                    <select
                        name="source"
                        value={clientData.source}
                        onChange={handleClientChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Facebook">Facebook</option>
                        <option value="Agent">Agent</option>
                        <option value="Business Card">Business Card</option>
                        <option value="Collaborators">Collaborators</option>
                        <option value="Phone Calls">Phone Calls</option>
                    </select>
                </div>
            )}

            {visibleFields.preferredContact && (
                <div className="mb-4">
                    <label className="block text-gray-700">Preferred Contact</label>
                    <select
                        name="preferredContact"
                        value={clientData.preferredContact}
                        onChange={handleClientChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Phone">Phone</option>
                        <option value="WhatsApp">WhatsApp</option>
                    </select>
                </div>
            )}

            {/* Property Form (conditionally rendered) */}
            {showPropertyForm && (
                <div className="mt-6">
                    <h3 className="text-xl font-bold mb-2">Property Details</h3>

                    {visibleFields.title && (
                        <div className="mb-4">
                            <label className="block text-gray-700">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={propertyData.title}
                                onChange={handlePropertyChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    )}

                    {/* Other property fields go here following the same logic */}
                </div>
            )}

            <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4">
                Submit Client and Property
            </button>
        </form>
    );
};

export default ClientForm;