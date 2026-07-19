import React from 'react';
import { Users, Award, TrendingUp, ShoppingBag } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="flex flex-col justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-gray-300" />
      </div>
    </div>
    <div>
      <p className="text-xs text-gray-400">{title}</p>
      <h3 className="text-xl font-bold text-white mt-1">{value}</h3>
    </div>
  </div>
);

const CustomersStats = ({ customersList = [] }) => {
  const totalVal = customersList.reduce((sum, c) => sum + c.spend, 0);
  const activeCount = customersList.length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard title="Total Customers" value={activeCount} icon={Users} color="bg-blue-500/10 text-blue-400" />
      <StatCard title="Active Accounts" value={activeCount} icon={Award} color="bg-green-500/10 text-green-400" />
      <StatCard title="Total Client Sales" value={`₹${totalVal.toLocaleString()}`} icon={TrendingUp} color="bg-yellow-500/10 text-yellow-400" />
      <StatCard title="Average Lifetime Value" value={activeCount > 0 ? `₹${Math.round(totalVal / activeCount).toLocaleString()}` : '₹0'} icon={ShoppingBag} color="bg-red-500/10 text-red-400" />
    </div>
  );
};

export default CustomersStats;
