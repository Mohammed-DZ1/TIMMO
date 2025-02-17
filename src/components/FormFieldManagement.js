import React, { useState } from 'react';

const FormFieldManager = ({ formFields, onFormFieldUpdate }) => {
    const [newField, setNewField] = useState({ name: '', type: 'text', label: '' });

    const handleAddField = () => {
        const updatedFields = [...formFields, newField];
        onFormFieldUpdate(updatedFields);
        setNewField({ name: '', type: 'text', label: '' });  // Reset form
    };

    const handleRemoveField = (index) => {
        const updatedFields = formFields.filter((_, i) => i !== index);
        onFormFieldUpdate(updatedFields);
    };

    return (
        <div>
            <h3 className="text-lg font-bold mb-2">Add or Remove Form Fields</h3>
            <input
                type="text"
                placeholder="Field Name"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                className="border p-2 rounded mr-2"
            />
            <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                className="border p-2 rounded mr-2"
            >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="checkbox">Checkbox</option>
                <option value="date">Date</option>
            </select>
            <input
                type="text"
                placeholder="Label"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                className="border p-2 rounded mr-2"
            />
            <button onClick={handleAddField} className="bg-green-500 text-white p-2 rounded">
                Add Field
            </button>

            <ul className="mt-4">
                {formFields.map((field, index) => (
                    <li key={index} className="flex justify-between border p-2 rounded mb-2">
                        <span>
                            {field.label} ({field.name} - {field.type})
                        </span>
                        <button
                            onClick={() => handleRemoveField(index)}
                            className="bg-red-500 text-white p-1 rounded"
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FormFieldManager;