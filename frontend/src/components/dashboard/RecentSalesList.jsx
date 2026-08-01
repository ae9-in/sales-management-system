import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { parseISO, format } from 'date-fns';

const RecentSalesList = ({ sales = [], selectedDate = format(new Date(), "yyyy-MM-dd") }) => {
  const navigate = useNavigate();

  const handleRowClick = (customer) => {
    toast.info(`Viewing transaction details for ${customer}`);
  };

  const getStatusColor = (status) => {
    if (status === 'Paid') return 'bg-green-500/20 text-green-400';
    if (status === 'Pending') return 'bg-orange-500/20 text-orange-400';
    return 'bg-emerald-500/20 text-emerald-600';
  };

  // Filter sales matching selectedDate
  const filteredSales = sales.filter(s => {
    try {
      return parseISO(s.date).toISOString().startsWith(selectedDate);
    } catch {
      return false;
    }
  });

  const listData = filteredSales.map(s => {
    let timeStr = '11:30 AM';
    try {
      timeStr = format(parseISO(s.date), 'hh:mm a');
    } catch {}
    return {
      time: timeStr,
      customer: s.customer || 'Walk-in Customer',
      rep: s.rep || 'Sales Exec',
      amount: `₹${(s.total || 0).toLocaleString()}`,
      status: s.status || 'Paid'
    };
  }).slice(0, 5);

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">Recent Sales (Today)</h3>
        <button 
          onClick={() => navigate('/sales')}
          className="text-emerald-600 text-xs hover:underline"
        >
          View All
        </button>
      </div>
      <div className="flex-1 overflow-auto space-y-3 pr-1 no-scrollbar">
        {listData.map((sale, i) => (
          <div 
            key={i} 
            onClick={() => handleRowClick(sale.customer)}
            className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-100/30 p-1.5 rounded transition"
          >
            <span className="text-gray-500 w-16">{sale.time}</span>
            <span className="text-gray-600 flex-1 truncate">{sale.customer}</span>
            <span className="text-gray-500 w-24 truncate hidden sm:block">{sale.rep}</span>
            <span className="text-gray-200 w-16 text-right font-medium">{sale.amount}</span>
            <span className={`w-16 text-center rounded text-[10px] py-0.5 ml-2 ${getStatusColor(sale.status)}`}>{sale.status}</span>
          </div>
        ))}
        {listData.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-xs">No sales recorded on this date.</div>
        )}
      </div>
    </div>
  );
};

export default RecentSalesList;



