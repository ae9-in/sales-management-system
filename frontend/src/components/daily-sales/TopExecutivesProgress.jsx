import React from 'react';

const TopExecutivesProgress = ({ sales = [], employees = [] }) => {
  // Aggregate sales by representative
  const salesByRep = sales.reduce((acc, sale) => {
    const rep = sale.rep || 'Arjun Kumar';
    acc[rep] = (acc[rep] || 0) + (sale.total || 0);
    return acc;
  }, {});

  // Prepare list of employee performance
  const performers = employees.map(emp => {
    const revenue = salesByRep[emp.name] || 0;
    return {
      name: emp.name,
      revenue
    };
  });

  // Sort by revenue descending
  performers.sort((a, b) => b.revenue - a.revenue);

  // Take top 5
  const topPerformers = performers.slice(0, 5);

  // Find max revenue for percentage representation
  const maxRevenue = Math.max(...topPerformers.map(p => p.revenue), 1);

  const execs = topPerformers.map(p => ({
    name: p.name,
    amount: `₹${p.revenue.toLocaleString()}`,
    percentage: p.revenue > 0 ? Math.round((p.revenue / maxRevenue) * 100) : 0
  }));

  return (
    <div className="glass-card-elevated p-5 flex-1 flex flex-col min-h-[300px]">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm">Top Sales Executives (Today)</h3>
      <div className="flex-1 flex flex-col justify-around">
        {execs.map((exec, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 w-4">{i + 1}</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-semibold">{exec.name}</span>
                <span className="text-gray-800 font-bold">{exec.amount}</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${exec.percentage}%` }}></div>
              </div>
            </div>
          </div>
        ))}
        {execs.length === 0 && (
          <div className="text-center text-xs py-8 text-gray-500">No sales executives registered.</div>
        )}
      </div>
    </div>
  );
};

export default TopExecutivesProgress;







