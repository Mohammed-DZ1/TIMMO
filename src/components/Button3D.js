import React from 'react';

const Button3D = ({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md',
    icon: Icon,
    className = '',
    disabled = false 
}) => {
    const baseStyles = `
        relative
        inline-flex items-center justify-center
        font-medium tracking-wide
        rounded-xl
        transition-all duration-300
        transform hover:-translate-y-0.5 active:translate-y-0
        focus:outline-none focus:ring-2 focus:ring-offset-2
    `;

    const variants = {
        primary: `
            bg-gradient-to-br from-blue-500 to-blue-600
            hover:to-blue-700
            text-white
            shadow-lg shadow-blue-500/20
            hover:shadow-xl hover:shadow-blue-500/40
            focus:ring-blue-500
            before:content-['']
            before:absolute before:inset-0
            before:bg-gradient-to-br before:from-white/10 before:to-transparent
            before:rounded-xl
        `,
        secondary: `
            bg-gradient-to-br from-gray-100 to-gray-200
            hover:to-gray-300
            text-gray-700
            shadow-lg shadow-gray-200/20
            hover:shadow-xl hover:shadow-gray-300/40
            focus:ring-gray-400
            before:content-['']
            before:absolute before:inset-0
            before:bg-gradient-to-br before:from-white/10 before:to-transparent
            before:rounded-xl
        `,
        success: `
            bg-gradient-to-br from-emerald-500 to-emerald-600
            hover:to-emerald-700
            text-white
            shadow-lg shadow-emerald-500/20
            hover:shadow-xl hover:shadow-emerald-500/40
            focus:ring-emerald-500
            before:content-['']
            before:absolute before:inset-0
            before:bg-gradient-to-br before:from-white/10 before:to-transparent
            before:rounded-xl
        `,
        danger: `
            bg-gradient-to-br from-red-500 to-red-600
            hover:to-red-700
            text-white
            shadow-lg shadow-red-500/20
            hover:shadow-xl hover:shadow-red-500/40
            focus:ring-red-500
            before:content-['']
            before:absolute before:inset-0
            before:bg-gradient-to-br before:from-white/10 before:to-transparent
            before:rounded-xl
        `
    };

    const sizes = {
        sm: 'text-sm px-3 py-1.5 space-x-1.5',
        md: 'text-base px-4 py-2 space-x-2',
        lg: 'text-lg px-6 py-2.5 space-x-2.5'
    };

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${disabledStyles}
                ${className}
            `}
        >
            {Icon && <Icon className={`w-${size === 'sm' ? '4' : size === 'md' ? '5' : '6'} h-${size === 'sm' ? '4' : size === 'md' ? '5' : '6'}`} />}
            <span className="relative">{children}</span>
            
            {/* 3D Lighting effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-12 transform translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
    );
};

export default Button3D;
