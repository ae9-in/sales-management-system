import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopExecutivesList = ({ sales = [], employees = [] }) => {
  const navigate = useNavigate();

  const repSales = {};
  if (employees.length > 0) {
    employees.forEach(emp => {
      repSales[emp.name] = 0;
    });
  }

  sales.forEach(s => {
    if (s.rep) {
      repSales[s.rep] = (repSales[s.rep] || 0) + (s.total || 0);
    }
  });

  const sortedList = Object.keys(repSales)
    .map(name => ({ name, amount: repSales[name] }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="glass-card-elevated p-5 h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Top Executives</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">By total sales value</p>
        </div>
        <button onClick={() => navigate('/employees')} className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition">
          View All
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
        {sortedList.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
              <div className="w-7 h-7 rounded-full glass-icon flex items-center justify-center font-bold text-emerald-700 text-xs border border-emerald-200/60">
                {item.name.charAt(0)}
              </div>
              <span className="text-gray-700 text-xs font-medium truncate max-w-[100px]">{item.name}</span>
            </div>
            <span className="text-gray-800 text-xs font-bold">₹{item.amount.toLocaleString()}</span>
          </div>
        ))}
        {sortedList.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 py-8">
            <p className="text-xs text-gray-400">No executive data yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopExecutivesList;







