import React from 'react';
import { parseISO, format } from 'date-fns';

const ExecutiveRecentSales = ({ executiveName, sales = [] }) => {
  const list = sales
    .filter(s => s.rep === executiveName)
    .map(s => {
      let dateStr = '20 Jul';
      try {
        dateStr = format(parseISO(s.date), 'dd MMM');
      } catch {}
      return {
        date: dateStr,
        customer: s.customer || 'Walk-in',
        amount: `₹${(s.total || 0).toLocaleString()}`
      };
    })
    .slice(0, 3);

  return (
    <div className="mt-2">
      <h4 className="font-semibold text-gray-800 text-xs mb-3">Recent Transactions</h4>
      <div className="space-y-3">
        {list.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-[10px] p-2 bg-white/40 rounded border border-gray-200/30">
            <span className="text-gray-500">{item.date}</span>
            <span className="text-gray-800 font-medium truncate w-24 block text-center">{item.customer}</span>
            <span className="text-emerald-600 font-semibold">{item.amount}</span>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-[10px]">No sales recorded for this executive.</div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveRecentSales;





