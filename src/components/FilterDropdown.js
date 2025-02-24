import React from 'react';

const FilterDropdown = ({ options, value, onChange }) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default FilterDropdown;
