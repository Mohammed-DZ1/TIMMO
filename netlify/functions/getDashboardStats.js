const dataStore = {
    activeProperties: 120,
    totalAgents: 45,
    revenueGrowth: 250000, // Total revenue in DZD
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
    }
};

exports.handler = async () => {
    try {
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(dataStore),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: "Error fetching dashboard data", error: error.message }),
        };
    }
};
