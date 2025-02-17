import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const PieChart = ({ data, title }) => {
    const chartData = {
        labels: data.map(item => item.label),
        datasets: [
            {
                data: data.map(item => item.value),
                backgroundColor: data.map(item => item.color),
                hoverOffset: 5,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: title,
            },
        },
    };

    return (
        <div className="relative bg-white p-4 shadow-lg rounded-md">
            <Pie data={chartData} options={options} />
        </div>
    );
};

export default PieChart;
