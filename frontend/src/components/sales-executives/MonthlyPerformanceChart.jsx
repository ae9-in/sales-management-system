import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: '1 Jul', value: 35000 }, { day: '3 Jul', value: 30000 },
  { day: '5 Jul', value: 20000 }, { day: '7 Jul', value: 45000 },
  { day: '10 Jul', value: 65000 }, { day: '12 Jul', value: 40000 },
  { day: '15 Jul', value: 25000 }, { day: '17 Jul', value: 40000 },
  { day: '20 Jul', value: 55000 },
];

const MonthlyPerformanceChart = () => (
  <div className="h-[150px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} width={30} tickFormatter={(value) => `${value/1000}k`} />
        <Tooltip cursor={{fill: '#374151'}} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px', fontSize: '12px' }} />
        <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={12} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default MonthlyPerformanceChart;




