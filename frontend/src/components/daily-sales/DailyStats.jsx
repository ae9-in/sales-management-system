import React from 'react';
import { IndianRupee, TrendingUp, Users, ShoppingCart } from 'lucide-react';

const StatCard = ({ title, amount, change, isPositive, icon: Icon }) => (
  <div className="flex flex-col justify-between p-4 bg-white border border-gray-200 rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      {change && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
          {isPositive ? '+' : ''}{change}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs text-gray-500">{title}</p>
      <h3 className="text-xl font-bold text-gray-900 mt-1">{amount}</h3>
    </div>
  </div>
);

const DailyStats = ({ sales = [] }) => {
  const total = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalQty = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
  
  // Calculate unique customer count
  const uniqueCustomers = new Set(sales.map(s => s.customer || 'Walk-in')).size;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard title="Total Revenue" amount={`₹${total.toLocaleString()}`} change={total > 0 ? "15.4%" : ""} isPositive={true} icon={IndianRupee} />
      <StatCard title="Total Orders" amount={sales.length} change={sales.length > 0 ? "8.2%" : ""} isPositive={true} icon={ShoppingCart} />
      <StatCard title="Total Quantity" amount={totalQty} change={totalQty > 0 ? "12.5%" : ""} isPositive={true} icon={TrendingUp} />
      <StatCard title="Total Customers" amount={uniqueCustomers} change={uniqueCustomers > 0 ? "3 New" : ""} isPositive={true} icon={Users} />
    </div>
  );
};

export default DailyStats;



