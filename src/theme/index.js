import { colors } from './colors';

export const theme = {
    // Typography
    fontFamily: {
        sans: ['Montserrat', 'sans-serif'], // Elegant, modern font
        serif: ['Playfair Display', 'serif'], // Luxury accent font
    },
    
    // Component-specific styles
    components: {
        // Cards with subtle gold accents
        card: {
            base: 'bg-white rounded-xl shadow-lg border-t-4 border-primary-500 overflow-hidden',
            hover: 'transform hover:scale-[1.02] transition-all duration-300',
            dark: 'bg-secondary-500 border-primary-400',
        },
        
        // Buttons with gold gradients
        button: {
            primary: `
                bg-gradient-to-r from-primary-500 to-primary-600
                hover:from-primary-600 hover:to-primary-700
                text-white font-semibold
                rounded-lg px-4 py-2
                transform hover:-translate-y-0.5
                transition-all duration-300
                shadow-lg hover:shadow-xl
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            `,
            secondary: `
                bg-gradient-to-r from-secondary-500 to-secondary-600
                hover:from-secondary-600 hover:to-secondary-700
                text-white font-semibold
                rounded-lg px-4 py-2
                transform hover:-translate-y-0.5
                transition-all duration-300
                shadow-lg hover:shadow-xl
                focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2
            `,
        },
        
        // Input fields with gold accents
        input: {
            base: `
                block w-full px-4 py-2
                border border-border-DEFAULT
                rounded-lg
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                transition-all duration-300
            `,
            label: 'text-secondary-700 font-medium mb-1',
        },
        
        // Navigation with sophisticated styling
        nav: {
            link: `
                px-4 py-2
                text-secondary-700 hover:text-primary-500
                font-medium
                transition-colors duration-300
                border-b-2 border-transparent hover:border-primary-500
            `,
            active: 'text-primary-500 border-b-2 border-primary-500',
        },
        
        // Tables with elegant styling
        table: {
            header: 'bg-secondary-50 text-secondary-700 font-semibold',
            cell: 'px-6 py-4 whitespace-nowrap',
            row: 'hover:bg-primary-50 transition-colors duration-200',
        },
        
        // Modals with gold accents
        modal: {
            overlay: 'bg-secondary-900/75 backdrop-blur-sm',
            content: 'bg-white rounded-xl shadow-2xl border-t-4 border-primary-500',
            title: 'text-2xl font-serif font-bold text-secondary-900',
        },
        
        // Forms with consistent styling
        form: {
            group: 'space-y-2 mb-6',
            label: 'block text-sm font-medium text-secondary-700',
            error: 'text-sm text-status-error mt-1',
        },
        
        // Dashboard-specific components
        dashboard: {
            sidebar: 'bg-white border-r border-border-light',
            header: 'bg-white border-b border-border-light',
            content: 'bg-background-secondary',
        },
    },
    
    // Layout utilities
    layout: {
        maxWidth: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
        },
        container: 'mx-auto px-4 sm:px-6 lg:px-8',
        section: 'py-12 sm:py-16 lg:py-20',
    },
    
    // Animation presets
    animation: {
        hover: 'transform hover:-translate-y-1 transition-transform duration-300',
        fade: 'transition-opacity duration-300',
        slide: 'transition-transform duration-300',
    },
};

// Export individual theme parts for granular usage
export { colors };
