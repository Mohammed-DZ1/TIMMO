import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'react-feather';

const KpiCard = ({ title, value, trend, icon: Icon, color = 'blue' }) => {
    const { t } = useTranslation();
    
    const colorVariants = {
        blue: {
            background: 'from-blue-500 to-blue-600',
            hover: 'hover:to-blue-700',
            iconBg: 'bg-blue-400/30',
            trendUp: 'text-blue-300',
            trendDown: 'text-blue-300',
            shadow: 'shadow-blue-500/20'
        },
        green: {
            background: 'from-emerald-500 to-emerald-600',
            hover: 'hover:to-emerald-700',
            iconBg: 'bg-emerald-400/30',
            trendUp: 'text-emerald-300',
            trendDown: 'text-emerald-300',
            shadow: 'shadow-emerald-500/20'
        },
        purple: {
            background: 'from-purple-500 to-purple-600',
            hover: 'hover:to-purple-700',
            iconBg: 'bg-purple-400/30',
            trendUp: 'text-purple-300',
            trendDown: 'text-purple-300',
            shadow: 'shadow-purple-500/20'
        },
        orange: {
            background: 'from-orange-500 to-orange-600',
            hover: 'hover:to-orange-700',
            iconBg: 'bg-orange-400/30',
            trendUp: 'text-orange-300',
            trendDown: 'text-orange-300',
            shadow: 'shadow-orange-500/20'
        }
    };

    const colors = colorVariants[color];

    return (
        <div className={`
            relative group cursor-pointer
            rounded-2xl overflow-hidden
            bg-gradient-to-br ${colors.background}
            shadow-lg ${colors.shadow}
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
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    {trend && (
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
                    {typeof value === 'number' 
                        ? new Intl.NumberFormat('fr-DZ').format(value)
                        : value
                    }
                </div>
            </div>
        </div>
    );
};

export default KpiCard;
