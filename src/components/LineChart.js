import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const LineChart = ({ data, title, xLabel, yLabel }) => {
    const chartData = {
        labels: data.map((item) => item.label), // X-axis labels (Months)
        datasets: data.map((dataset) => ({
            label: dataset.name, // Agent Name or Revenue Title
            data: dataset.values, // Y-axis data
            borderColor: dataset.color, // Different color for each line
            backgroundColor: dataset.color + '80', // Transparent fill color
            borderWidth: 3,
            tension: 0.4, // Curved line for smoother effect
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
        })),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 14, weight: 'bold' } } },
            tooltip: { enabled: true, backgroundColor: '#333', titleColor: '#fff' },
        },
        scales: {
            x: {
                title: { display: true, text: xLabel, font: { size: 14, weight: 'bold' } },
                ticks: { font: { size: 12 } },
            },
            y: {
                title: { display: true, text: yLabel, font: { size: 14, weight: 'bold' } },
                ticks: { font: { size: 12 } },
                grid: { color: 'rgba(200, 200, 200, 0.2)' },
            },
        },
    };

    return (
        <div className="w-full h-80 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2 text-center">{title}</h3>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default LineChart;
