import React from 'react';

const TopExecutivesList = ({ sales = [], employees = [] }) => {
  const repSales = {};
  if (employees.length > 0) {
    employees.forEach(emp => { repSales[emp.name] = 0; });
  }

  sales.forEach((s, i) => {
    const name = s.rep || (employees[i % employees.length]?.name || 'Arjun Kumar');
    repSales[name] = (repSales[name] || 0) + (s.total || 0);
  });

  const list = Object.keys(repSales).map(name => ({
    name,
    amount: repSales[name]
  })).sort((a, b) => b.amount - a.amount).slice(0, 3);

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl h-[230px] flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-gray-100 text-sm mb-4">Top Performance</h3>
        <div className="space-y-4">
          {list.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-500 w-4">{i + 1}</span>
                <span className="text-gray-300 font-medium">{item.name}</span>
              </div>
              <span className="text-gray-200 font-semibold">₹{item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopExecutivesList;
