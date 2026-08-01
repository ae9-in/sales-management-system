import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { parseISO, format } from 'date-fns';

const SalesByDayChart = ({ sales = [] }) => {
  // Aggregate sales by date YYYY-MM-DD
  const aggregated = sales.reduce((acc, sale) => {
    try {
      const dateStr = sale.date.split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + (sale.total || 0);
    } catch {}
    return acc;
  }, {});

  const sortedDates = Object.keys(aggregated).sort();
  
  const data = sortedDates.map(dateStr => {
    let formattedDay = dateStr;
    try {
      formattedDay = format(parseISO(dateStr), 'dd MMM');
    } catch {}
    return {
      day: formattedDay,
      value: aggregated[dateStr]
    };
  }).slice(-7); // last 7 active days

  const hasData = data.length > 0;

  return (
    <div className="col-span-1 lg:col-span-4 glass-card-elevated p-5 h-[300px] flex flex-col justify-between">
      <h3 className="font-semibold text-gray-900 text-sm mb-4">Sales by Day</h3>
      <div className="flex-1 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.96)', border: '1px solid rgba(167,243,208,0.5)', borderRadius: '10px', boxShadow: '0 8px 24px -4px rgba(5,150,105,0.15)', color: '#111827', fontSize: '12px' }} />
              <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-500">
            No sales data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesByDayChart;







