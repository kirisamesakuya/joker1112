import React from 'react';
import { DashboardStats } from '../types';

interface DashboardHeaderProps {
  stats: DashboardStats;
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ stats, currentFilter, onFilterChange }) => {
  const filters = ['全部', '已完成', '生成中', '失败'];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
      <div className="grid grid-cols-4 gap-2 mb-4">
        <StatItem label="总计" value={stats.total} color="text-gray-900" />
        <StatItem label="已完成" value={stats.completed} color="text-green-600" />
        <StatItem label="生成中" value={stats.processing} color="text-blue-600" />
        <StatItem label="失败" value={stats.failed} color="text-red-600" />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              currentFilter === filter 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="text-center">
    <div className={`text-lg font-bold ${color}`}>{value}</div>
    <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
  </div>
);