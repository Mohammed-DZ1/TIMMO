import React from 'react';
import { useTranslation } from 'react-i18next';
import Button3D from './Button3D';
import { Clock, Calendar } from 'react-feather';

const TimeRangeSelector = ({ value, onChange }) => {
    const { t } = useTranslation();

    const options = [
        { value: 'day', label: t('daily'), icon: Clock },
        { value: 'month', label: t('monthly'), icon: Calendar },
        { value: 'year', label: t('yearly'), icon: Calendar }
    ];

    return (
        <div className="flex gap-2">
            {options.map(option => (
                <Button3D
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    variant={value === option.value ? 'primary' : 'secondary'}
                    className="flex items-center gap-2"
                >
                    <option.icon size={16} />
                    {option.label}
                </Button3D>
            ))}
        </div>
    );
};

export default TimeRangeSelector;
