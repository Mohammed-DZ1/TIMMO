import React from 'react';

const KpiCard = ({ title, value, icon, color }) => (
    <div className="bg-white shadow-md p-4 rounded-md flex items-center">
        <div className={`p-3 rounded-full ${color} text-white mr-4`}>{icon}</div>
        <div>
            <h2 className="text-sm font-medium text-gray-600">{title}</h2>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

export default KpiCard;
