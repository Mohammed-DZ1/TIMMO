import React from 'react';
import KpiCard from '../components/KpiCard';
import { FiHome, FiUsers, FiTrendingUp } from 'react-icons/fi';

const Dashboard = () => (
    <div>
        <h1 className="text-4xl font-bold mb-10">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <KpiCard title="Active Properties" value="120" icon={<FiHome />} color="bg-blue-500" />
            <KpiCard title="Total Agents" value="45" icon={<FiUsers />} color="bg-green-500" />
            <KpiCard title="Revenue Growth" value="$250,000" icon={<FiTrendingUp />} color="bg-yellow-500" />
        </div>
    </div>
);

export default Dashboard;