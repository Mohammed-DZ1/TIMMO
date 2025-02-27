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
import { useSettings } from '../hooks/useSettings';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { settings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [dashboardData, setDashboardData] = useState(null);

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

                const response = await fetch(`/.netlify/functions/getDashboardStats?${queryParams}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${await user.getIdToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(t('dashboard.error.fetchFailed') || 'Failed to fetch dashboard data');
                }

                const data = await response.json();
                setDashboardData(data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(t('dashboard.error.message', { error: err.message }) || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, dateRange.start, dateRange.end, selectedFilter, t]);

    const filterOptions = [
        { value: 'all', label: t('dashboard.filters.all') },
        { value: 'sale', label: t('dashboard.filters.sale') },
        { value: 'rent', label: t('dashboard.filters.rent') }
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
                                {t('dashboard.error.title')}
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
                                {t('dashboard.noData.title')}
                            </h3>
                            <p className="mt-2 text-sm text-yellow-700">
                                {t('dashboard.noData.message')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    {t('dashboard.title')}
                </h1>
                <div className="flex space-x-4">
                    <DateRangePicker 
                        value={dateRange} 
                        onChange={setDateRange}
                        startLabel={t('dashboard.dateRange.start')}
                        endLabel={t('dashboard.dateRange.end')}
                    />
                    <FilterDropdown
                        options={filterOptions}
                        value={selectedFilter}
                        onChange={setSelectedFilter}
                        label={t('dashboard.filters.label')}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settings?.kpiCards?.properties && (
                    <KpiCard
                        title={t('dashboard.kpis.activeProperties')}
                        value={dashboardData.activeProperties}
                        icon={FiHome}
                        color="gold"
                    />
                )}
                {settings?.kpiCards?.agents && (
                    <KpiCard
                        title={t('dashboard.kpis.totalAgents')}
                        value={dashboardData.totalAgents}
                        icon={FiUsers}
                        color="charcoal"
                    />
                )}
                {settings?.kpiCards?.revenue && (
                    <KpiCard
                        title={t('dashboard.kpis.revenueGrowth')}
                        value={dashboardData.revenueGrowth}
                        icon={FiTrendingUp}
                        color="success"
                        suffix="%"
                    />
                )}
                {settings?.kpiCards?.price && (
                    <KpiCard
                        title={t('dashboard.kpis.averagePrice')}
                        value={dashboardData.averagePrice}
                        icon={FiDollarSign}
                        color="gold"
                        prefix="$"
                    />
                )}
                {settings?.kpiCards?.daysOnMarket && (
                    <KpiCard
                        title={t('dashboard.kpis.daysOnMarket')}
                        value={dashboardData.averageDaysOnMarket}
                        icon={FiClock}
                        color="charcoal"
                        suffix={t('dashboard.kpis.days')}
                    />
                )}
                {settings?.kpiCards?.conversionRate && (
                    <KpiCard
                        title={t('dashboard.kpis.conversionRate')}
                        value={dashboardData.conversionRate}
                        icon={FiPercent}
                        color="success"
                        suffix="%"
                    />
                )}
            </div>

            {dashboardData.charts && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {settings?.charts?.revenue && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                {t('dashboard.charts.revenue')}
                            </h2>
                            <LineChart 
                                data={dashboardData.charts.monthlyRevenue}
                                xAxisLabel={t('dashboard.charts.xAxis.months')}
                                yAxisLabel={t('dashboard.charts.yAxis.revenue')}
                            />
                        </div>
                    )}
                    {settings?.charts?.propertyTypes && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                {t('dashboard.charts.properties')}
                            </h2>
                            <PieChart 
                                data={dashboardData.charts.propertyTypes}
                                label={t('dashboard.charts.propertyTypes')}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
