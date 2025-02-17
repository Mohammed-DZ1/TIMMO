import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, title }) => {
    const chartData = {
        labels: data.map((item) => item.label), // Property Types
        datasets: [
            {
                data: data.map((item) => item.value), // Number of properties
                backgroundColor: ['#4CAF50', '#FFC107', '#FF5733', '#3498DB', '#9B59B6'], // Colors for each slice
                hoverOffset: 10,
                borderWidth: 2,
                borderColor: '#fff',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { font: { size: 14 } } },
            tooltip: { enabled: true, backgroundColor: '#444', titleColor: '#fff' },
        },
    };

    return (
        <div className="w-full h-80 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2 text-center">{title}</h3>
            <Pie data={chartData} options={options} />
        </div>
    );
};

export default PieChart;
