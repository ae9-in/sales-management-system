import React from 'react';
import { IndianRupee, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { parseISO, format } from 'date-fns';

const StatCard = ({ title, amount, change, isPositive, icon: Icon }) => (
  <div className="flex flex-col justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-700 rounded-lg">
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
      <h3 className="text-xl font-bold text-white mt-1">{amount}</h3>
    </div>
  </div>
);

const StatCards = ({ sales = [], employees = [], selectedDate = format(new Date(), "yyyy-MM-dd") }) => {
  const getSalesTotal = (filterFn) => {
    return sales
      .filter(s => s.status !== 'Pending')
      .filter(s => {
        try {
          const date = parseISO(s.date);
          return filterFn ? filterFn(date) : true;
        } catch {
          return false;
        }
      })
      .reduce((sum, s) => sum + (s.total || 0), 0);
  };

  // Compute live values from DB filtered by selectedDate
  const todayTotal = getSalesTotal((d) => d.toISOString().startsWith(selectedDate));
  const allTimeTotal = getSalesTotal(); // Full database total

  // Get count of unique customers from sales
  const uniqueCustomers = sales.length > 0 ? new Set(sales.map(s => s.customer || 'Walk-in')).size : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 mb-6">
      <StatCard title="Total Sales Today" amount={`₹${todayTotal.toLocaleString()}`} change={todayTotal > 0 ? "18.6%" : ""} isPositive={true} icon={ShoppingCart} />
      <StatCard title="Sales This Week" amount={`₹${allTimeTotal.toLocaleString()}`} change={allTimeTotal > 0 ? "22.4%" : ""} isPositive={true} icon={TrendingUp} />
      <StatCard title="Sales This Month" amount={`₹${allTimeTotal.toLocaleString()}`} change={allTimeTotal > 0 ? "16.3%" : ""} isPositive={true} icon={TrendingUp} />
      <StatCard title="Total Revenue" amount={`₹${allTimeTotal.toLocaleString()}`} change={allTimeTotal > 0 ? "14.8%" : ""} isPositive={true} icon={IndianRupee} />
      <StatCard title="Total Customers" amount={uniqueCustomers} change={uniqueCustomers > 0 ? "8 New" : ""} isPositive={true} icon={Users} />
      <StatCard title="Sales Executives" amount={employees.length} change={employees.length > 0 ? "Active" : ""} isPositive={true} icon={Users} />
    </div>
  );
};

export default StatCards;
