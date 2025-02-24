import React from 'react';
import { useTranslation } from 'react-i18next';

const DateRangePicker = ({ startDate, endDate, onChange }) => {
    const { t } = useTranslation();

    const handleStartDateChange = (e) => {
        onChange({ start: new Date(e.target.value), end: endDate });
    };

    const handleEndDateChange = (e) => {
        onChange({ start: startDate, end: new Date(e.target.value) });
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={handleStartDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('startDate')}
            />
            <span className="text-gray-500">-</span>
            <input
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={handleEndDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('endDate')}
            />
        </div>
    );
};

export default DateRangePicker;
