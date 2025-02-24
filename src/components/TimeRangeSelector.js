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
        <div className="inline-flex bg-white/5 backdrop-blur-sm rounded-xl p-1 shadow-lg">
            {options.map((option) => (
                <Button3D
                    key={option.value}
                    variant={value === option.value ? 'primary' : 'secondary'}
                    size="sm"
                    icon={option.icon}
                    onClick={() => onChange(option.value)}
                    className="mx-0.5"
                >
                    {option.label}
                </Button3D>
            ))}
        </div>
    );
};

export default TimeRangeSelector;
