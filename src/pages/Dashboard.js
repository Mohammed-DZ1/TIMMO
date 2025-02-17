import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import KpiCard from '../components/KpiCard';
import { FiHome, FiUsers, FiTrendingUp } from 'react-icons/fi';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';

const Dashboard = () => {
    const { t } = useTranslation();
    const [dashboardData, setDashboardData] = useState({
        activeProperties: 0,
        totalAgents: 0,
        revenueGrowth: 0,
        agentPerformance: [],
        revenueHistory: [],
        propertyDistribution: { forSale: [], forRent: [], both: [] },
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('https://timmodashboard.netlify.app/.netlify/functions/getDashboardStats');
                const data = await response.json();
                setDashboardData(data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div>
            <h1 className="text-4xl font-bold mb-10">{t('dashboard')}</h1>

            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <KpiCard title={t('activeProperties')} value={dashboardData.activeProperties} icon={<FiHome />} color="bg-blue-600" />
                <KpiCard title={t('totalAgents')} value={dashboardData.totalAgents} icon={<FiUsers />} color="bg-green-600" />
                <KpiCard title={t('revenueGrowth')} value={`${dashboardData.revenueGrowth} DZD`} icon={<FiTrendingUp />} color="bg-yellow-600" />
            </div>

            {/* KPI Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                {/* Agent Performance Chart */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('agentPerformance')}</h2>
                    <LineChart
                        data={dashboardData.agentPerformance}
                        title={t('agentPerformance')}
                        xLabel={t('months')}
                        yLabel={t('closedDeals')}
                    />
                </div>

                {/* Revenue Growth Chart */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('revenueGrowthOverTime')}</h2>
                    <LineChart
                        data={dashboardData.revenueHistory}
                        title={t('revenueGrowth')}
                        xLabel={t('months')}
                        yLabel={t('revenue')}
                    />
                </div>
            </div>

            {/* Property Distribution Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('propertiesForSale')}</h2>
                    <PieChart data={dashboardData.propertyDistribution.forSale} title={t('propertiesForSale')} />
                </div>

                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('propertiesForRent')}</h2>
                    <PieChart data={dashboardData.propertyDistribution.forRent} title={t('propertiesForRent')} />
                </div>

                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('propertiesBoth')}</h2>
                    <PieChart data={dashboardData.propertyDistribution.both} title={t('propertiesBoth')} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
