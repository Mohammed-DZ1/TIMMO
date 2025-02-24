import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AgentProfile = ({ agents }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const agent = agents.find((agent) => agent.agentId === id);

    if (!agent) {
        return <p>Agent not found.</p>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <button onClick={() => navigate(-1)} className="text-blue-500 mb-4">← Back</button>
            <div className="flex items-center space-x-4">
                {agent.profilePicture && (
                    <img
                        src={agent.profilePicture}
                        alt={`${agent.agentName}'s Profile`}
                        className="w-24 h-24 rounded-full object-cover"
                    />
                )}
                <div>
                    <h2 className="text-2xl font-bold">{agent.agentName}</h2>
                    <p>Phone: {agent.phoneNumber}</p>
                    <p>Email: {agent.email || 'N/A'}</p>
                    <p>Type: {agent.typeOfAgent} Agent</p>
                    <p>Years of Experience: {agent.yearsOfExperience || 'N/A'}</p>
                    <p>Region: {agent.region}</p>
                    <p>Status: {agent.activeStatus ? 'Active' : 'Inactive'}</p>
                    <p>Notes: {agent.notes || 'No additional notes'}</p>
                </div>
            </div>
        </div>
    );
};

export default AgentProfile;