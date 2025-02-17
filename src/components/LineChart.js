import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const LineChart = ({ data, title, xLabel, yLabel }) => {
    const chartData = {
        labels: data.map(item => item.label),
        datasets: data.map(agent => ({
            label: agent.name,
            data: agent.values,
            fill: false,
            borderColor: agent.color || `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
            tension: 0.4,
        })),
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: title,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: xLabel,
                },
            },
            y: {
                title: {
                    display: true,
                    text: yLabel,
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="relative bg-white p-4 shadow-lg rounded-md">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default LineChart;
