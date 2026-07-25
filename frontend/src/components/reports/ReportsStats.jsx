import React from 'react';
import { IndianRupee, ShoppingBag, Users, ShoppingCart, Clock } from 'lucide-react';

const StatCard = ({ title, amount, subtext, change, isPositive, icon: Icon, colorClass }) => (
  <div className="flex flex-col justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl">
    <div className="flex items-start justify-between mb-2">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div>
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <h3 className="text-xl font-bold text-white mb-1">{amount}</h3>
      <div className="flex items-center gap-2">
        {change && (
          <span className={`text-[10px] font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
        <span className="text-[10px] text-gray-500">{subtext}</span>
      </div>
    </div>
  </div>
);

const ReportsStats = ({ sales = [] }) => {
  const activeSales = sales.filter(s => s.status !== 'Pending');
  const totalRevenue = activeSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalSales = activeSales.length;
  const uniqueCustomers = new Set(activeSales.map(s => s.customer || 'Walk-in')).size;
  const avgOrderValue = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;
  const pendingAmount = sales.filter(s => s.status === 'Partial').reduce((sum, s) => sum + (s.total || 0), 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-6">
      <StatCard title="Total Revenue" amount={`₹${totalRevenue.toLocaleString()}`} subtext={totalRevenue > 0 ? "vs previous period" : "No sales recorded"} change={totalRevenue > 0 ? "12.4%" : ""} isPositive={true} icon={IndianRupee} colorClass="bg-blue-500/20 text-blue-400" />
      <StatCard title="Total Sales" amount={totalSales.toString()} subtext={totalSales > 0 ? "vs previous period" : "No sales recorded"} change={totalSales > 0 ? "8.1%" : ""} isPositive={true} icon={ShoppingBag} colorClass="bg-green-500/20 text-green-400" />
      <StatCard title="Total Customers" amount={uniqueCustomers.toString()} subtext={uniqueCustomers > 0 ? "vs previous period" : "No customers"} change={uniqueCustomers > 0 ? "5.3%" : ""} isPositive={true} icon={Users} colorClass="bg-purple-500/20 text-purple-400" />
      <StatCard title="Avg. Order Value" amount={`₹${avgOrderValue.toLocaleString()}`} subtext={avgOrderValue > 0 ? "vs previous period" : "No transactions"} change={avgOrderValue > 0 ? "4.2%" : ""} isPositive={true} icon={ShoppingCart} colorClass="bg-orange-500/20 text-orange-400" />
      <StatCard title="Pending Amount" amount={`₹${pendingAmount.toLocaleString()}`} subtext={pendingAmount > 0 ? "vs previous period" : "No pending amount"} change={pendingAmount > 0 ? "2.1%" : ""} isPositive={false} icon={Clock} colorClass="bg-red-500/20 text-red-400" />
    </div>
  );
};

export default ReportsStats;
