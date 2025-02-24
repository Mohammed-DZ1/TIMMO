import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'react-feather';

const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'ar', name: 'العربية', flag: '🇩🇿' }
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Language Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative
                    inline-flex items-center
                    px-4 py-2
                    rounded-xl
                    bg-gradient-to-br from-gray-100 to-gray-200
                    hover:to-gray-300
                    text-gray-700
                    shadow-lg shadow-gray-200/20
                    hover:shadow-xl hover:shadow-gray-300/40
                    transition-all duration-300
                    transform hover:-translate-y-0.5
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                    before:content-['']
                    before:absolute before:inset-0
                    before:bg-gradient-to-br before:from-white/10 before:to-transparent
                    before:rounded-xl
                `}
            >
                <Globe className="w-5 h-5 mr-2" />
                <span className="font-medium">{currentLanguage.flag} {currentLanguage.name}</span>
                <ChevronDown 
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
                
                {/* 3D Lighting effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-12 transform translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={`
                    absolute z-50 mt-2 w-48
                    bg-white rounded-xl
                    shadow-xl shadow-gray-200/20
                    transform origin-top
                    transition-all duration-200
                    border border-gray-100
                    overflow-hidden
                    ${i18n.language === 'ar' ? 'right-0' : 'left-0'}
                `}>
                    <div className="py-2">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                onClick={() => handleLanguageChange(language.code)}
                                className={`
                                    w-full px-4 py-2
                                    inline-flex items-center
                                    text-left text-sm
                                    hover:bg-gray-50
                                    transition-colors duration-150
                                    ${language.code === i18n.language ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                                `}
                            >
                                <span className="text-xl mr-2">{language.flag}</span>
                                <span className="font-medium">{language.name}</span>
                                {language.code === i18n.language && (
                                    <span className="ml-auto text-blue-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
