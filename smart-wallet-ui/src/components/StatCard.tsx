import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  data?: number[];
  delay?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, data = [30, 20, 25, 15, 30, 20, 10], delay = '0s' }) => {
  const isPositive = trend >= 0;
  
  // Simple sparkline generator
  const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${val}`).join(' ');

  return (
    <div 
      className="glass rounded-premium p-5 animate-fade-in transition-all duration-300 hover:bg-slate-900/80 group"
      style={{ animationDelay: delay }}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-brand-muted uppercase tracking-wider">{title}</span>
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-brand-accent' : 'text-brand-danger'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{isPositive ? '+' : ''}{trend}%</span>
        </div>
      </div>
      
      <div className="text-2xl font-bold text-brand-fg mb-4">{value}</div>
      
      <div className="h-10 w-full mt-auto">
        <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <path
            d={`M 0 35 Q 25 ${data[1]}, 50 ${data[3]} T 100 ${data[data.length-1]}`}
            fill="none"
            stroke={isPositive ? 'var(--accent)' : 'var(--danger)'}
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
      </div>
    </div>
  );
};

export default StatCard;
