import React from 'react';
import { parseISO, format } from 'date-fns';

const DashboardSummary = ({ sales = [], selectedDate = format(new Date(), "yyyy-MM-dd") }) => {
  // Filter sales matching selectedDate
  const filteredSales = sales.filter(s => {
    try {
      return parseISO(s.date).toISOString().startsWith(selectedDate);
    } catch {
      return false;
    }
  });

  const totalSalesVal = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const avgOrderVal = filteredSales.length > 0 ? Math.round(totalSalesVal / filteredSales.length) : 0;
  
  // Unique customer count
  const uniqueCustomers = new Set(filteredSales.map(s => s.customer || 'Walk-in')).size;

  // Pending payments (non-Paid)
  const pendingPayments = filteredSales
    .filter(s => s.status !== 'Paid')
    .reduce((sum, s) => sum + (s.total || 0), 0);

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl h-[300px] flex flex-col">
      <h3 className="font-semibold text-gray-100 text-sm mb-4">Today's Summary</h3>
      <div className="flex-1 flex flex-col justify-around">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Total Sales</span>
          <span className="text-gray-100 font-bold">₹{totalSalesVal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Total Transactions</span>
          <span className="text-gray-100 font-bold">{filteredSales.length}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Average Order Value</span>
          <span className="text-gray-100 font-bold">₹{avgOrderVal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">New Customers</span>
          <span className="text-gray-100 font-bold">{uniqueCustomers}</span>
        </div>
        <div className="flex justify-between items-center text-xs border-t border-gray-700 pt-3">
          <span className="text-gray-400">Pending Payments</span>
          <span className="text-red-400 font-bold">₹{pendingPayments.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
