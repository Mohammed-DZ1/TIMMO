import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useTranslation } from 'react-i18next';
import TimeRangeSelector from './TimeRangeSelector';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(...registerables, zoomPlugin);

const LineChart = ({ data, title }) => {
    const { t } = useTranslation();
    const chartRef = useRef(null);
    const [timeRange, setTimeRange] = useState('month');
    const [selectedDatasets, setSelectedDatasets] = useState(data.map(d => d.name));
    const [isZoomed, setIsZoomed] = useState(false);

    // Create gradient
    const createGradient = (ctx, color) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, `${color}40`);
        gradient.addColorStop(1, `${color}00`);
        return gradient;
    };

    // Aggregate data based on time range
    const aggregateData = (rawData, range) => {
        const aggregated = [...rawData];
        if (range === 'year') {
            // Group by year
            aggregated.forEach(dataset => {
                const yearlyData = {};
                dataset.label.forEach((label, index) => {
                    const year = label.split('-')[0];
                    if (!yearlyData[year]) {
                        yearlyData[year] = [];
                    }
                    yearlyData[year].push(dataset.values[index]);
                });
                
                dataset.label = Object.keys(yearlyData);
                dataset.values = Object.values(yearlyData).map(vals => 
                    vals.reduce((sum, val) => sum + val, 0) / vals.length
                );
            });
        }
        // For 'month' and 'day', use data as is
        return aggregated;
    };

    useEffect(() => {
        const chart = chartRef.current;
        if (chart) {
            const chartData = chart.data.datasets;
            const ctx = chart.ctx;
            
            chartData.forEach(dataset => {
                const gradient = createGradient(ctx, dataset.borderColor);
                dataset.backgroundColor = gradient;
            });
            
            chart.update();
        }
    }, [data, timeRange]);

    const aggregatedData = aggregateData(data, timeRange);

    const chartData = {
        labels: aggregatedData[0]?.label || [],
        datasets: aggregatedData
            .filter(dataset => selectedDatasets.includes(dataset.name))
            .map(dataset => ({
                label: dataset.name,
                data: dataset.values,
                borderColor: dataset.color,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: dataset.color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: dataset.color,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3,
            })),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                        modifierKey: 'ctrl',
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'xy',
                },
                pan: {
                    enabled: true,
                    mode: 'xy',
                    modifierKey: 'shift',
                }
            },
            legend: {
                position: 'top',
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
                        return datasets.map((dataset, index) => ({
                            text: dataset.label,
                            fillStyle: dataset.borderColor,
                            strokeStyle: dataset.borderColor,
                            lineWidth: 0,
                            hidden: !selectedDatasets.includes(dataset.label),
                            index: index
                        }));
                    }
                },
                onClick: (e, legendItem, legend) => {
                    const index = legendItem.index;
                    const datasetName = data[index].name;
                    setSelectedDatasets(prev => 
                        prev.includes(datasetName)
                            ? prev.filter(name => name !== datasetName)
                            : [...prev, datasetName]
                    );
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
                boxPadding: 6,
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: ${new Intl.NumberFormat('fr-DZ').format(value)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    color: '#666',
                    padding: 10
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    color: '#666',
                    padding: 10,
                    callback: function(value) {
                        return new Intl.NumberFormat('fr-DZ').format(value);
                    }
                }
            }
        },
        elements: {
            line: {
                borderJoinStyle: 'round'
            }
        }
    };

    const handleResetZoom = () => {
        const chart = chartRef.current;
        if (chart) {
            chart.resetZoom();
            setIsZoomed(false);
        }
    };

    return (
        <div className="relative w-full h-80 bg-white p-6 rounded-xl shadow-md">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-transparent rounded-xl" />
            <div className="relative">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">{t(title)}</h3>
                    <div className="flex items-center space-x-4">
                        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
                        {isZoomed && (
                            <button
                                onClick={handleResetZoom}
                                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
                            >
                                {t('resetZoom')}
                            </button>
                        )}
                    </div>
                </div>
                <div className="relative h-64">
                    <Line 
                        ref={chartRef} 
                        data={chartData} 
                        options={options}
                        onZoom={() => setIsZoomed(true)}
                        onResetZoom={() => setIsZoomed(false)}
                    />
                </div>
            </div>
            <div className="absolute bottom-2 left-6 right-6">
                <div className="text-xs text-gray-500 text-center">
                    {t('zoomTip')}
                </div>
            </div>
        </div>
    );
};

export default LineChart;
