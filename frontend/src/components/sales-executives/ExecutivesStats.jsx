import React from 'react';
import { Users, TrendingUp, DollarSign, Award } from 'lucide-react';

const StatCard = ({ title, value, change, isPositive, icon: Icon, colorClass }) => (
  <div className="flex flex-col justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      {change && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
          {isPositive ? '+' : ''}{change}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs text-gray-400">{title}</p>
      <h3 className="text-xl font-bold text-white mt-1">{value}</h3>
    </div>
  </div>
);

const ExecutivesStats = ({ employees = [], sales = [] }) => {
  const totalRev = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const activeCount = employees.length;
  const totalSalaries = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard title="Total Executives" value={employees.length} change="2 New" isPositive={true} icon={Users} colorClass="bg-blue-500/10 text-blue-400" />
      <StatCard title="Active Executives" value={activeCount} change="100%" isPositive={true} icon={Award} colorClass="bg-green-500/10 text-green-400" />
      <StatCard title="Team Revenue" value={`₹${totalRev.toLocaleString()}`} change="15.8%" isPositive={true} icon={TrendingUp} colorClass="bg-yellow-500/10 text-yellow-400" />
      <StatCard title="Base Expense" value={`₹${totalSalaries.toLocaleString()}`} change="Salaries" isPositive={true} icon={DollarSign} colorClass="bg-red-500/10 text-red-400" />
    </div>
  );
};

export default ExecutivesStats;
