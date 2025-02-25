import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TimeRangeSelector from '../components/TimeRangeSelector';
import KpiCard from '../components/KpiCard';
import { FiHome, FiUsers, FiTrendingUp, FiDollarSign, FiClock, FiPercent } from 'react-icons/fi';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';
import DateRangePicker from '../components/DateRangePicker';
import FilterDropdown from '../components/FilterDropdown';
import { auth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = auth;
    const { settings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [dashboardData, setDashboardData] = useState({
        activeProperties: 0,
        totalAgents: 0,
        revenueGrowth: 0,
        averagePrice: 0,
        averageDaysOnMarket: 0,
        conversionRate: 0,
        agentPerformance: [],
        revenueHistory: [],
        propertyDistribution: { forSale: [], forRent: [], both: [] },
        propertyTypes: [],
        topPerformingAreas: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const queryParams = new URLSearchParams({
                    startDate: dateRange.start?.toISOString() || '',
                    endDate: dateRange.end?.toISOString() || '',
                    filter: selectedFilter
                });

                const response = await fetch(`https://timmodashboard.netlify.app/.netlify/functions/getDashboardStats?${queryParams}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const data = await response.json();
                setDashboardData(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [dateRange, selectedFilter, user]);

    const filterOptions = [
        { value: 'all', label: t('allProperties') },
        { value: 'sale', label: t('forSale') },
        { value: 'rent', label: t('forRent') }
    ];

    if (error) {
        return (
            <div className="p-6 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p className="font-bold">{t('error')}</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-bold">{t('dashboard')}</h1>
                <div className="flex gap-4">
                    <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onChange={setDateRange}
                    />
                    <FilterDropdown
                        options={filterOptions}
                        value={selectedFilter}
                        onChange={setSelectedFilter}
                    />
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard 
                    title={t('activeProperties')} 
                    value={loading ? '-' : dashboardData.activeProperties} 
                    icon={<FiHome />} 
                    color="bg-blue-600" 
                />
                <KpiCard 
                    title={t('totalAgents')} 
                    value={loading ? '-' : dashboardData.totalAgents} 
                    icon={<FiUsers />} 
                    color="bg-green-600" 
                />
                <KpiCard 
                    title={t('revenueGrowth')} 
                    value={loading ? '-' : dashboardData.revenueGrowth} 
                    icon={<FiTrendingUp />} 
                    color="bg-yellow-600" 
                />
                <KpiCard 
                    title={t('averagePrice')} 
                    value={loading ? '-' : dashboardData.averagePrice} 
                    icon={<FiDollarSign />} 
                    color="bg-purple-600" 
                />
                <KpiCard 
                    title={t('avgDaysOnMarket')} 
                    value={loading ? '-' : dashboardData.averageDaysOnMarket} 
                    icon={<FiClock />} 
                    color="bg-red-600" 
                />
                <KpiCard 
                    title={t('conversionRate')} 
                    value={loading ? '-' : dashboardData.conversionRate} 
                    icon={<FiPercent />} 
                    color="bg-indigo-600" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                {/* Agent Performance Chart */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('agentPerformance')}</h2>
                    {loading ? (
                        <div className="h-80 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <LineChart
                            data={dashboardData.agentPerformance}
                            title={t('agentPerformance')}
                        />
                    )}
                </div>

                {/* Property Distribution Chart */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('propertyDistribution')}</h2>
                    {loading ? (
                        <div className="h-80 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <PieChart
                            data={dashboardData.propertyDistribution[selectedFilter === 'all' ? 'both' : selectedFilter === 'sale' ? 'forSale' : 'forRent']}
                            title={t('propertyDistribution')}
                        />
                    )}
                </div>

                {/* Property Types Chart */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('propertyTypes')}</h2>
                    {loading ? (
                        <div className="h-80 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <PieChart
                            data={dashboardData.propertyTypes}
                            title={t('propertyTypes')}
                        />
                    )}
                </div>

                {/* Top Performing Areas Chart */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('topPerformingAreas')}</h2>
                    {loading ? (
                        <div className="h-80 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <LineChart
                            data={dashboardData.topPerformingAreas}
                            title={t('topPerformingAreas')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
