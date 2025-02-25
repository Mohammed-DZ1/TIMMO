import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'react-feather';

const KpiCard = ({ title, value, trend, icon: Icon, color = 'gold', prefix = '', suffix = '' }) => {
    const { t } = useTranslation();
    
    const colorVariants = {
        gold: {
            background: 'from-primary-500 to-primary-600',
            hover: 'hover:to-primary-700',
            iconBg: 'bg-primary-400/30',
            trendUp: 'text-primary-300',
            trendDown: 'text-primary-300',
            shadow: 'shadow-gold'
        },
        charcoal: {
            background: 'from-secondary-500 to-secondary-600',
            hover: 'hover:to-secondary-700',
            iconBg: 'bg-secondary-400/30',
            trendUp: 'text-secondary-300',
            trendDown: 'text-secondary-300',
            shadow: 'shadow-lg'
        },
        success: {
            background: 'from-status-success to-status-success/90',
            hover: 'hover:to-status-success/80',
            iconBg: 'bg-status-success/30',
            trendUp: 'text-white/80',
            trendDown: 'text-white/80',
            shadow: 'shadow-lg'
        },
        warning: {
            background: 'from-status-warning to-status-warning/90',
            hover: 'hover:to-status-warning/80',
            iconBg: 'bg-status-warning/30',
            trendUp: 'text-white/80',
            trendDown: 'text-white/80',
            shadow: 'shadow-lg'
        }
    };

    // Default to gold if color variant doesn't exist
    const colors = colorVariants[color] || colorVariants.gold;

    return (
        <div className={`
            relative group cursor-pointer
            rounded-2xl overflow-hidden
            bg-gradient-to-br ${colors.background}
            ${colors.shadow}
            transition-all duration-300 ease-out
            hover:shadow-xl hover:scale-[1.02] ${colors.hover}
            before:content-['']
            before:absolute before:inset-0
            before:bg-gradient-to-br before:from-white/10 before:to-transparent
            before:rounded-2xl
        `}>
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* 3D lighting effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-12 transform translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colors.iconBg}`}>
                        {Icon && <Icon className="w-6 h-6 text-white" />}
                    </div>
                    {trend !== undefined && (
                        <div className="flex items-center space-x-1">
                            {trend > 0 ? (
                                <TrendingUp className={`w-5 h-5 ${colors.trendUp}`} />
                            ) : (
                                <TrendingDown className={`w-5 h-5 ${colors.trendDown}`} />
                            )}
                            <span className={`text-sm font-medium ${trend > 0 ? colors.trendUp : colors.trendDown}`}>
                                {Math.abs(trend)}%
                            </span>
                        </div>
                    )}
                </div>
                
                <h3 className="text-lg font-medium text-white/80 mb-1">
                    {t(title)}
                </h3>
                
                <div className="text-2xl font-bold text-white">
                    {prefix}
                    {typeof value === 'number' 
                        ? new Intl.NumberFormat('fr-DZ').format(value)
                        : value
                    }
                    {suffix}
                </div>
            </div>
        </div>
    );
};

export default KpiCard;
