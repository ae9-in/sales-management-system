import React from 'react';
import { IndianRupee, TrendingUp, Users, ShoppingCart, TrendingDown } from 'lucide-react';
import { parseISO, format } from 'date-fns';

const StatCard = ({ title, amount, change, isPositive, icon: Icon, accent = "emerald" }) => (
  <div className="glass-stat-card p-5 flex flex-col justify-between hover-lift">
    {/* Top Row: Icon + Badge */}
    <div className="flex items-start justify-between mb-4">
      <div className="glass-icon p-2.5">
        <Icon className="w-5 h-5 text-emerald-700" />
      </div>
      {change && (
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1
          ${isPositive
            ? 'text-emerald-700 bg-emerald-100/80 border border-emerald-200/60'
            : 'text-red-600 bg-red-50 border border-red-200/60'
          }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive && !change.startsWith('+') ? '+' : ''}{change}
        </span>
      )}
    </div>

    {/* Bottom Row: Label + Value */}
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 leading-none tracking-tight">{amount}</h3>
    </div>

    {/* Bottom accent bar */}
    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400/0 via-emerald-400/40 to-emerald-400/0 rounded-b-xl" />
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

  const todayTotal = getSalesTotal((d) => d.toISOString().startsWith(selectedDate));
  const allTimeTotal = getSalesTotal();
  const uniqueCustomers = sales.length > 0 ? new Set(sales.map(s => s.customer || 'Walk-in')).size : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 mb-6">
      <StatCard title="Total Sales Today" amount={`₹${todayTotal.toLocaleString()}`} change={todayTotal > 0 ? "18.6%" : ""} isPositive={true} icon={ShoppingCart} />
      <StatCard title="Sales This Week" amount={`₹${allTimeTotal.toLocaleString()}`} change={allTimeTotal > 0 ? "22.4%" : ""} isPositive={true} icon={TrendingUp} />
      <StatCard title="Sales This Month" amount={`₹${allTimeTotal.toLocaleString()}`} change={allTimeTotal > 0 ? "16.3%" : ""} isPositive={true} icon={TrendingUp} />
      <StatCard title="Total Revenue" amount={`₹${allTimeTotal.toLocaleString()}`} change={allTimeTotal > 0 ? "14.8%" : ""} isPositive={true} icon={IndianRupee} />
      <StatCard title="Total Customers" amount={uniqueCustomers} change={uniqueCustomers > 0 ? `${uniqueCustomers} New` : ""} isPositive={true} icon={Users} />
      <StatCard title="Sales Executives" amount={employees.length} change={employees.length > 0 ? "Active" : ""} isPositive={true} icon={Users} />
    </div>
  );
};

export default StatCards;



