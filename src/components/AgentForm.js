import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AgentForm = ({ onSubmit, userRole }) => {
    const [agentData, setAgentData] = useState({
        agentId: uuidv4(),
        agentName: '',
        phoneNumber: '',
        email: '',
        typeOfAgent: 'Inside',
        yearsOfExperience: '',
        region: '',
        activeStatus: true,
        profilePicture: null,
        notes: '',
    });

    const [visibleFields, setVisibleFields] = useState({
        agentName: true,
        phoneNumber: true,
        email: true,
        typeOfAgent: true,
        yearsOfExperience: true,
        region: true,
        activeStatus: true,
        profilePicture: true,
        notes: true,
    });

    useEffect(() => {
        const visibilitySettings = JSON.parse(localStorage.getItem('visibilitySettings')) || {};
        setVisibleFields(visibilitySettings['AgentForm'] || visibleFields);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAgentData({
            ...agentData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFileChange = (e) => {
        setAgentData({ ...agentData, profilePicture: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (visibleFields.profilePicture && !agentData.profilePicture) {
            alert('Please upload a profile picture.');
            return;
        }

        onSubmit(agentData);
        setAgentData({
            agentId: uuidv4(),
            agentName: '',
            phoneNumber: '',
            email: '',
            typeOfAgent: 'Inside',
            yearsOfExperience: '',
            region: '',
            activeStatus: true,
            profilePicture: null,
            notes: '',
        });

        alert('Agent added successfully!');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full md:w-3/4 lg:w-1/2 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Agent</h2>

            {visibleFields.agentName && (
                <div className="mb-4">
                    <label className="block text-gray-700">Agent Name</label>
                    <input
                        type="text"
                        name="agentName"
                        value={agentData.agentName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
            )}

            {visibleFields.phoneNumber && (
                <div className="mb-4">
                    <label className="block text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={agentData.phoneNumber}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
            )}

            {visibleFields.email && (
                <div className="mb-4">
                    <label className="block text-gray-700">Email (Optional)</label>
                    <input
                        type="email"
                        name="email"
                        value={agentData.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
            )}

            {visibleFields.typeOfAgent && (
                <div className="mb-4">
                    <label className="block text-gray-700">Type of Agent</label>
                    <select
                        name="typeOfAgent"
                        value={agentData.typeOfAgent}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Inside">Inside</option>
                        <option value="Field">Field</option>
                    </select>
                </div>
            )}

            {visibleFields.yearsOfExperience && (
                <div className="mb-4">
                    <label className="block text-gray-700">Years of Experience</label>
                    <input
                        type="number"
                        name="yearsOfExperience"
                        value={agentData.yearsOfExperience}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
            )}

            {visibleFields.region && (
                <div className="mb-4">
                    <label className="block text-gray-700">Region Covered</label>
                    <input
                        type="text"
                        name="region"
                        value={agentData.region}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
            )}

            {visibleFields.activeStatus && (
                <div className="mb-4">
                    <label className="block text-gray-700">Active Status</label>
                    <input
                        type="checkbox"
                        name="activeStatus"
                        checked={agentData.activeStatus}
                        onChange={handleChange}
                        className="ml-2"
                    />{' '}
                    Active
                </div>
            )}

            {visibleFields.profilePicture && (
                <div className="mb-4">
                    <label className="block text-gray-700">Profile Picture</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
            )}

            {visibleFields.notes && (
                <div className="mb-4">
                    <label className="block text-gray-700">Notes</label>
                    <textarea
                        name="notes"
                        value={agentData.notes}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        rows="4"
                    />
                </div>
            )}

            <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
                Submit Agent
            </button>
        </form>
    );
};

export default AgentForm;