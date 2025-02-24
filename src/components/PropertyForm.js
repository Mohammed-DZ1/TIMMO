import React, { useState, useEffect } from 'react';

const PropertyForm = ({ onSubmit }) => {
    const [visibleFields, setVisibleFields] = useState({});
    const [propertyData, setPropertyData] = useState({
        propertyId: '',
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

    useEffect(() => {
        const visibilitySettings = JSON.parse(localStorage.getItem('visibilitySettings')) || {};
        setVisibleFields(visibilitySettings['PropertyForm'] || {});
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPropertyData({ ...propertyData, [name]: value });
    };

    const handleMediaChange = (e) => {
        setPropertyData({ ...propertyData, media: Array.from(e.target.files) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(propertyData);

        // Clear form
        setPropertyData({
            propertyId: '',
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

        alert('Property added successfully!');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Add New Property</h2>

            {visibleFields.title && (
                <div className="mb-4">
                    <label className="block text-gray-700">Title/Name</label>
                    <input
                        type="text"
                        name="title"
                        value={propertyData.title}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
            )}

            {visibleFields.type && (
                <div className="mb-4">
                    <label className="block text-gray-700">Type</label>
                    <select
                        name="type"
                        value={propertyData.type}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                    </select>
                </div>
            )}

            {visibleFields.category && (
                <div className="mb-4">
                    <label className="block text-gray-700">Category</label>
                    <select
                        name="category"
                        value={propertyData.category}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="For Sale">For Sale</option>
                        <option value="For Rent">For Rent</option>
                        <option value="Both">Both</option>
                    </select>
                </div>
            )}

            {visibleFields.price && (
                <div className="mb-4">
                    <label className="block text-gray-700">Price</label>
                    <input
                        type="number"
                        name="price"
                        value={propertyData.price}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
            )}

            {visibleFields.location && (
                <div className="mb-4">
                    <label className="block text-gray-700">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={propertyData.location}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
            )}

            {visibleFields.status && (
                <div className="mb-4">
                    <label className="block text-gray-700">Status</label>
                    <select
                        name="status"
                        value={propertyData.status}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Available">Available</option>
                        <option value="Sold">Sold</option>
                        <option value="Rented">Rented</option>
                    </select>
                </div>
            )}

            {visibleFields.floorArea && (
                <div className="mb-4">
                    <label className="block text-gray-700">Floor Area (m² or sq. ft)</label>
                    <input
                        type="number"
                        name="floorArea"
                        value={propertyData.floorArea}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
            )}

            {visibleFields.bedrooms && (
                <div className="mb-4">
                    <label className="block text-gray-700">Number of Bedrooms</label>
                    <input
                        type="number"
                        name="bedrooms"
                        value={propertyData.bedrooms}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
            )}

            {visibleFields.bathrooms && (
                <div className="mb-4">
                    <label className="block text-gray-700">Number of Bathrooms</label>
                    <input
                        type="number"
                        name="bathrooms"
                        value={propertyData.bathrooms}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
            )}

            {visibleFields.yearBuilt && (
                <div className="mb-4">
                    <label className="block text-gray-700">Year Built or Renovated</label>
                    <input
                        type="number"
                        name="yearBuilt"
                        value={propertyData.yearBuilt}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
            )}

            {visibleFields.amenities && (
                <div className="mb-4">
                    <label className="block text-gray-700">Amenities</label>
                    <input
                        type="text"
                        name="amenities"
                        value={propertyData.amenities}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="E.g., Pool, Gym, Parking"
                    />
                </div>
            )}

            {visibleFields.media && (
                <div className="mb-4">
                    <label className="block text-gray-700">Media (Images/Videos)</label>
                    <input
                        type="file"
                        name="media"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleMediaChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
            )}

            {visibleFields.description && (
                <div className="mb-4">
                    <label className="block text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={propertyData.description}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        rows="4"
                    />
                </div>
            )}

            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Submit Property
            </button>
        </form>
    );
};

export default PropertyForm;