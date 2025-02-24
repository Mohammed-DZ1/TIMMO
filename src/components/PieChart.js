import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, title }) => {
    const { t } = useTranslation();

    // Modern color palette with gradients
    const colorPalette = [
        ['#3B82F6', '#1D4ED8'], // Blue gradient
        ['#10B981', '#047857'], // Green gradient
        ['#F59E0B', '#B45309'], // Yellow gradient
        ['#8B5CF6', '#5B21B6'], // Purple gradient
        ['#EC4899', '#BE185D'], // Pink gradient
        ['#06B6D4', '#0E7490'], // Cyan gradient
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const chartData = {
        labels: data.map(item => item.label),
        datasets: [{
            data: data.map(item => item.value),
            backgroundColor: colorPalette.map(([start]) => start),
            hoverBackgroundColor: colorPalette.map(([_, end]) => end),
            borderColor: '#ffffff',
            borderWidth: 2,
            borderRadius: 5,
            spacing: 2,
            hoverOffset: 15,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 20,
                    font: {
                        size: 13,
                        weight: '500',
                        family: "'Inter', sans-serif"
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                    generateLabels: (chart) => {
                        const datasets = chart.data.datasets;
                        return chart.data.labels.map((label, index) => {
                            const value = datasets[0].data[index];
                            const percentage = ((value / total) * 100).toFixed(1);
                            return {
                                text: `${label} (${percentage}%)`,
                                fillStyle: datasets[0].backgroundColor[index],
                                strokeStyle: datasets[0].backgroundColor[index],
                                lineWidth: 0,
                                hidden: false,
                                index: index
                            };
                        });
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(33, 33, 33, 0.9)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: '600',
                    family: "'Inter', sans-serif"
                },
                bodyFont: {
                    size: 13,
                    family: "'Inter', sans-serif"
                },
                bodySpacing: 6,
                usePointStyle: true,
                callbacks: {
                    label: (context) => {
                        const value = context.raw;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return ` ${context.label}: ${new Intl.NumberFormat('fr-DZ').format(value)} (${percentage}%)`;
                    }
                }
            }
        }
    };

    // Calculate center text values
    const totalValue = new Intl.NumberFormat('fr-DZ').format(total);

    return (
        <div className="relative w-full h-80 bg-white p-6 rounded-xl shadow-md">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-transparent rounded-xl" />
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{t(title)}</h3>
            <div className="relative h-full flex items-center">
                <div className="relative w-full h-full">
                    <Doughnut data={chartData} options={options} />
                    <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-sm text-gray-500">{t('total')}</div>
                        <div className="text-2xl font-bold text-gray-800">{totalValue}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PieChart;
