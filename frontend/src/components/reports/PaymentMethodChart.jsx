import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];

const PaymentMethodChart = ({ sales = [] }) => {
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);

  const methodsMap = sales.reduce((acc, sale) => {
    const method = sale.method || 'UPI';
    acc[method] = (acc[method] || 0) + (sale.total || 0);
    return acc;
  }, {});

  const data = Object.keys(methodsMap).map((name, i) => {
    const val = methodsMap[name];
    const pct = totalRevenue > 0 ? ((val / totalRevenue) * 100).toFixed(1) : '0.0';
    return {
      name,
      value: val,
      color: COLORS[i % COLORS.length],
      display: `₹${val.toLocaleString()} (${pct}%)`
    };
  }).sort((a, b) => b.value - a.value);

  const displayData = data;

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl mb-6 h-[250px] flex flex-col relative">
      <h3 className="font-semibold text-gray-100 mb-2 text-sm">Sales by Payment Method</h3>
      {displayData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
          No payment method sales data available.
        </div>
      ) : (
        <div className="flex-1 relative mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="30%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-[30%] transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="font-bold text-white text-[11px]">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400">Total Revenue</p>
          </div>
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 space-y-3">
              {displayData.map(item => (
                  <div key={item.name} className="flex items-start gap-2">
                      <div className="w-2.5 h-2.5 rounded-full mt-1.5" style={{backgroundColor: item.color}}></div>
                      <div>
                          <p className="text-xs text-gray-300 font-semibold">{item.name}</p>
                          <p className="text-[10px] text-gray-500">{item.display}</p>
                      </div>
                  </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodChart;
