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
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl h-[300px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-100 text-sm">Top Executives</h3>
        </div>
        
        <div className="space-y-4 max-h-[180px] overflow-y-auto no-scrollbar">
          {sortedList.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-500 w-4">{i + 1}</span>
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-300">{item.name.charAt(0)}</div>
                <span className="text-gray-300 font-medium truncate w-24">{item.name}</span>
              </div>
              <span className="text-gray-200 font-semibold">₹{item.amount.toLocaleString()}</span>
            </div>
          ))}
          {sortedList.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-xs">No executive sales found.</div>
          )}
        </div>
      </div>
      
      <button onClick={() => navigate('/employees')} className="text-blue-400 text-xs hover:underline text-center w-full mt-2">View All</button>
    </div>
  );
};

export default TopExecutivesList;
