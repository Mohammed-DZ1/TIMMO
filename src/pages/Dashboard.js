import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import TimeRangeSelector from '../components/TimeRangeSelector';
import KpiCard from '../components/KpiCard';
import { FiHome, FiUsers, FiTrendingUp, FiDollarSign, FiClock, FiPercent } from 'react-icons/fi';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';
import DateRangePicker from '../components/DateRangePicker';
import FilterDropdown from '../components/FilterDropdown';
import useAuth from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
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
            if (!user) return;

            try {
                setLoading(true);
                setError(null);

                const queryParams = new URLSearchParams({
                    startDate: dateRange.start?.toISOString() || '',
                    endDate: dateRange.end?.toISOString() || '',
                    filter: selectedFilter
                });

                const response = await fetch(`https://timmodashboard.netlify.app/.netlify/functions/getDashboardStats?${queryParams}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const data = await response.json();
                setDashboardData(data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [dateRange, selectedFilter, user]);

    const filterOptions = [
        { value: 'all', label: t('dashboard.filters.all') || 'All Properties' },
        { value: 'sale', label: t('dashboard.filters.sale') || 'For Sale' },
        { value: 'rent', label: t('dashboard.filters.rent') || 'For Rent' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                {t('dashboard.error.title') || 'Error Loading Dashboard'}
                            </h3>
                            <p className="mt-2 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                {t('No Data Available')}
                            </h3>
                            <p className="mt-2 text-sm text-yellow-700">
                                {t('No dashboard data is currently available.')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-secondary-900">
                    {t('dashboard.title') || 'Dashboard'}
                </h1>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard 
                    title={t('activeProperties')} 
                    value={dashboardData.activeProperties} 
                    icon={<FiHome />} 
                    color="bg-blue-600" 
                />
                <KpiCard 
                    title={t('totalAgents')} 
                    value={dashboardData.totalAgents} 
                    icon={<FiUsers />} 
                    color="bg-green-600" 
                />
                <KpiCard 
                    title={t('revenueGrowth')} 
                    value={dashboardData.revenueGrowth} 
                    icon={<FiTrendingUp />} 
                    color="bg-yellow-600" 
                />
                <KpiCard 
                    title={t('averagePrice')} 
                    value={dashboardData.averagePrice} 
                    icon={<FiDollarSign />} 
                    color="bg-purple-600" 
                />
                <KpiCard 
                    title={t('avgDaysOnMarket')} 
                    value={dashboardData.averageDaysOnMarket} 
                    icon={<FiClock />} 
                    color="bg-red-600" 
                />
                <KpiCard 
                    title={t('conversionRate')} 
                    value={dashboardData.conversionRate} 
                    icon={<FiPercent />} 
                    color="bg-indigo-600" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                {/* Agent Performance Chart */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('agentPerformance')}</h2>
                    <LineChart
                        data={dashboardData.agentPerformance}
                        title={t('agentPerformance')}
                    />
                </div>

                {/* Property Distribution Chart */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('propertyDistribution')}</h2>
                    <PieChart
                        data={dashboardData.propertyDistribution[selectedFilter === 'all' ? 'both' : selectedFilter === 'sale' ? 'forSale' : 'forRent']}
                        title={t('propertyDistribution')}
                    />
                </div>

                {/* Property Types Chart */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('propertyTypes')}</h2>
                    <PieChart
                        data={dashboardData.propertyTypes}
                        title={t('propertyTypes')}
                    />
                </div>

                {/* Top Performing Areas Chart */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{t('topPerformingAreas')}</h2>
                    <LineChart
                        data={dashboardData.topPerformingAreas}
                        title={t('topPerformingAreas')}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
