import React from 'react';
import { Eye } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { toast } from 'react-toastify';

const ReportSummaryTable = ({ sales = [] }) => {
  // Group sales by day
  const dailyMap = sales.reduce((acc, sale) => {
    try {
      const dateKey = sale.date.split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          rawDate: dateKey,
          sales: 0,
          orders: 0,
          customers: new Set(),
          paid: 0,
          pending: 0,
          discount: 0
        };
      }
      acc[dateKey].sales += (sale.total || 0);
      acc[dateKey].orders += 1;
      acc[dateKey].customers.add(sale.customer || 'Walk-in');
      if (sale.status === 'Paid') {
        acc[dateKey].paid += (sale.total || 0);
      } else {
        acc[dateKey].pending += (sale.total || 0);
      }
      // Est. discount
      acc[dateKey].discount += Math.round((sale.total || 0) * 0.05);
    } catch {}
    return acc;
  }, {});

  const tableData = Object.keys(dailyMap).map(dateKey => {
    const row = dailyMap[dateKey];
    let dateStr = dateKey;
    try {
      dateStr = format(parseISO(dateKey), 'dd MMM yyyy');
    } catch {}
    return {
      date: dateStr,
      sales: `₹${row.sales.toLocaleString()}`,
      orders: row.orders,
      customers: row.customers.size,
      paid: `₹${row.paid.toLocaleString()}`,
      pending: `₹${row.pending.toLocaleString()}`,
      discount: `₹${row.discount.toLocaleString()}`,
      rawDate: dateKey
    };
  }).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

  const displayData = tableData.slice(0, 5);

  const handleView = (row) => {
    toast.info(`Viewing sales report for ${row.date}`);
  };

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl mb-6 flex-1">
      <h3 className="font-semibold text-gray-100 mb-4 text-sm">Report Summary</h3>
      
      <div className="flex text-xs border-b border-gray-700 mb-4">
          <button className="py-2 px-4 font-semibold text-blue-400 border-b-2 border-blue-400">Sales Report</button>
          <button className="py-2 px-4 text-gray-400 hover:text-gray-200">Top Products</button>
          <button className="py-2 px-4 text-gray-400 hover:text-gray-200">Top Customers</button>
          <button className="py-2 px-4 text-gray-400 hover:text-gray-200">Top Sales Executives</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-gray-400">
          <thead className="text-gray-500 border-b border-gray-700/50">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total Sales (₹)</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Customers</th>
              <th className="px-4 py-3">Paid Amount (₹)</th>
              <th className="px-4 py-3">Pending Amount (₹)</th>
              <th className="px-4 py-3">Discount (₹)</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, i) => (
              <tr key={i} className="border-b border-gray-700/30 hover:bg-gray-700/30">
                <td className="px-4 py-4 font-medium text-gray-300">{row.date}</td>
                <td className="px-4 py-4 text-gray-200">{row.sales}</td>
                <td className="px-4 py-4">{row.orders}</td>
                <td className="px-4 py-4">{row.customers}</td>
                <td className="px-4 py-4 text-green-400">{row.paid}</td>
                <td className="px-4 py-4 text-orange-400">{row.pending}</td>
                <td className="px-4 py-4">{row.discount}</td>
                <td className="px-4 py-4 text-center">
                  <button onClick={() => handleView(row)} className="text-gray-400 hover:text-blue-400"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
            {displayData.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">No report entries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between mt-6 text-xs text-gray-400">
        <span>Showing 1 to {displayData.length} of {tableData.length} entries</span>
        <div className="flex gap-1 items-center">
          <button className="px-2 py-1 rounded border border-gray-600 bg-gray-700 hover:bg-gray-600">&lt;</button>
          <button className="px-2 py-1 rounded bg-blue-600 text-white">1</button>
          <button className="px-2 py-1 rounded border border-gray-600 bg-gray-700 hover:bg-gray-600">&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default ReportSummaryTable;
