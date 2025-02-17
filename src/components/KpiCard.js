import React from 'react';
import { useTranslation } from 'react-i18next';

const KpiCard = ({ title, value, icon, color }) => {
    const { t } = useTranslation(); // Hook for translations

    // Format number values dynamically for better readability
    const formatNumber = (num) => {
        return new Intl.NumberFormat().format(num);
    };

    return (
        <div className="bg-white shadow-lg p-6 rounded-lg flex items-center hover:shadow-xl transition-all duration-300">
            <div className={`p-4 rounded-full ${color} text-white mr-6 text-xl`}>
                {icon}
            </div>
            <div>
                <h2 className="text-sm font-semibold text-gray-500">{t(title)}</h2>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(value)}</p>
            </div>
        </div>
    );
};

export default KpiCard;
