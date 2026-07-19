import React from 'react';
import { CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

const RecentPayments = ({ sales = [] }) => {
  const handleRowClick = (customer) => {
    toast.info(`Opening payment history for ${customer}`);
  };

  const payments = sales.map(s => ({
    customer: s.customer || 'Walk-in',
    amount: `₹${(s.total || 0).toLocaleString()}`,
    method: s.method || 'UPI',
    status: s.status || 'Paid'
  })).slice(0, 5);

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl flex flex-col h-full">
      <h3 className="font-semibold text-gray-100 text-sm mb-4">Recent Payments</h3>
      <div className="flex-1 overflow-auto space-y-4 mt-2 pr-1 no-scrollbar">
        {payments.map((item, i) => (
          <div 
            key={i} 
            onClick={() => handleRowClick(item.customer)}
            className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-700/30 p-1 rounded transition"
          >
            <div className="flex items-center text-gray-400 gap-2">
              <CreditCard size={14} className="text-blue-400" />
              <span className="font-medium text-gray-300">{item.customer}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-200 font-bold block">{item.amount}</span>
              <span className="text-[10px] text-gray-500">{item.method}</span>
            </div>
          </div>
        ))}
        {payments.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-xs">No payments recorded.</div>
        )}
      </div>
    </div>
  );
};

export default RecentPayments;
