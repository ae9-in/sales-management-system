import React from 'react';
import { ShoppingBag, Award, TrendingUp, ShieldAlert } from 'lucide-react';

const StatCard = ({ title, value, change, isPositive, icon: Icon, color }) => (
  <div className="flex flex-col justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-gray-300" />
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

const SalesHistoryStats = ({ sales = [] }) => {
  const totalRev = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const avgOrder = sales.length > 0 ? Math.round(totalRev / sales.length) : 0;
  const pendingPayments = sales
    .filter(s => s.status !== 'Paid')
    .reduce((sum, s) => sum + (s.total || 0), 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard 
        title="Total Revenue" 
        value={`₹${totalRev.toLocaleString()}`} 
        change={sales.length > 0 ? "Live" : null} 
        isPositive={true} 
        icon={TrendingUp} 
        color="bg-blue-500/10 text-blue-400" 
      />
      <StatCard 
        title="Total Transactions" 
        value={sales.length} 
        change={sales.length > 0 ? "Live" : null} 
        isPositive={true} 
        icon={ShoppingBag} 
        color="bg-green-500/10 text-green-400" 
      />
      <StatCard 
        title="Avg. Order Value" 
        value={`₹${avgOrder.toLocaleString()}`} 
        change={sales.length > 0 ? "Live" : null} 
        isPositive={true} 
        icon={Award} 
        color="bg-yellow-500/10 text-yellow-400" 
      />
      <StatCard 
        title="Pending Payments" 
        value={`₹${pendingPayments.toLocaleString()}`} 
        change={pendingPayments > 0 ? "Action Required" : null} 
        isPositive={false} 
        icon={ShieldAlert} 
        color="bg-red-500/10 text-red-400" 
      />
    </div>
  );
};

export default SalesHistoryStats;
