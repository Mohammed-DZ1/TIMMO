const dataStore = {
    activeProperties: 120,
    totalAgents: 45,
    revenueGrowth: 250000,
    averagePrice: 15000000,
    averageDaysOnMarket: 45,
    conversionRate: 68,
    agentPerformance: [
        { name: "Agent A", values: [10, 12, 8, 14, 9, 15], label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], color: "#4CAF50" },
        { name: "Agent B", values: [8, 9, 11, 10, 12, 13], label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], color: "#FFC107" },
        { name: "Agent C", values: [12, 10, 9, 13, 14, 11], label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], color: "#FF5733" },
    ],
    revenueHistory: [
        { name: "Revenue", values: [50000, 60000, 55000, 70000, 65000, 75000], label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], color: "#3498DB" }
    ],
    propertyDistribution: {
        forSale: [
            { label: "Apartments", value: 30 },
            { label: "Villas", value: 15 },
            { label: "Offices", value: 10 },
        ],
        forRent: [
            { label: "Apartments", value: 40 },
            { label: "Villas", value: 12 },
            { label: "Offices", value: 8 },
        ],
        both: [
            { label: "Apartments", value: 10 },
            { label: "Villas", value: 5 },
            { label: "Offices", value: 3 },
        ],
    },
    propertyTypes: [
        { label: "Apartments", value: 80 },
        { label: "Villas", value: 32 },
        { label: "Offices", value: 21 },
        { label: "Land", value: 15 },
        { label: "Commercial", value: 25 }
    ],
    topPerformingAreas: [
        { name: "Hydra", values: [12, 15, 14, 18, 16, 20], label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], color: "#8E44AD" },
        { name: "Dely Ibrahim", values: [10, 12, 11, 14, 15, 16], label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], color: "#2ECC71" },
        { name: "Bab Ezzouar", values: [8, 10, 12, 11, 13, 14], label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], color: "#E74C3C" }
    ]
};

const filterDataByDateRange = (data, startDate, endDate) => {
    if (!startDate || !endDate) return data;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    const filterTimeSeriesData = (series) => {
        return series.map(item => ({
            ...item,
            values: item.values.slice(-monthDiff),
            label: item.label.slice(-monthDiff)
        }));
    };

    return {
        ...data,
        agentPerformance: filterTimeSeriesData(data.agentPerformance),
        revenueHistory: filterTimeSeriesData(data.revenueHistory),
        topPerformingAreas: filterTimeSeriesData(data.topPerformingAreas)
    };
};

const filterDataByType = (data, filter) => {
    if (filter === 'all') return data;

    const filterKey = filter === 'sale' ? 'forSale' : 'forRent';
    const filteredDistribution = {
        [filterKey]: data.propertyDistribution[filterKey]
    };

    return {
        ...data,
        activeProperties: data.propertyDistribution[filterKey].reduce((sum, item) => sum + item.value, 0),
        propertyDistribution: filteredDistribution
    };
};

exports.handler = async (event) => {
    try {
        const { startDate, endDate, filter } = event.queryStringParameters || {};
        
        let filteredData = { ...dataStore };
        
        // Apply date range filter
        if (startDate && endDate) {
            filteredData = filterDataByDateRange(filteredData, startDate, endDate);
        }
        
        // Apply property type filter
        if (filter) {
            filteredData = filterDataByType(filteredData, filter);
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filteredData),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "Error fetching dashboard data", error: error.message }),
        };
    }
};
