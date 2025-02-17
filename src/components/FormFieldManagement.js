import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import translation hook

const FormFieldManager = ({ formFields, onFormFieldUpdate }) => {
    const { t } = useTranslation(); // Hook for translations
    const [newField, setNewField] = useState({ name: '', type: 'text', label: '' });

    const handleAddField = () => {
        if (!newField.name || !newField.label) {
            alert(t('errorFillAllFields')); // Use translated error message
            return;
        }

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
            <h3 className="text-lg font-bold mb-2">{t('manageFormFields')}</h3>

            <input
                type="text"
                placeholder={t('fieldName')}
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                className="border p-2 rounded mr-2"
            />
            <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                className="border p-2 rounded mr-2"
            >
                <option value="text">{t('textField')}</option>
                <option value="number">{t('numberField')}</option>
                <option value="checkbox">{t('checkboxField')}</option>
                <option value="date">{t('dateField')}</option>
            </select>
            <input
                type="text"
                placeholder={t('fieldLabel')}
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                className="border p-2 rounded mr-2"
            />
            <button onClick={handleAddField} className="bg-green-500 text-white p-2 rounded">
                {t('addField')}
            </button>

            <ul className="mt-4">
                {formFields.map((field, index) => (
                    <li key={index} className="flex justify-between border p-2 rounded mb-2">
                        <span>
                            {t(field.label)} ({field.name} - {t(field.type)})
                        </span>
                        <button
                            onClick={() => handleRemoveField(index)}
                            className="bg-red-500 text-white p-1 rounded"
                        >
                            {t('remove')}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FormFieldManager;
