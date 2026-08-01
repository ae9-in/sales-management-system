import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: '01 Jul', value: 30 }, { day: '03 Jul', value: 30 },
  { day: '05 Jul', value: 28 }, { day: '07 Jul', value: 28 },
  { day: '10 Jul', value: 24 }, { day: '12 Jul', value: 24 },
  { day: '15 Jul', value: 18 }, { day: '17 Jul', value: 18 },
  { day: '20 Jul', value: 15 },
];

const StockOverviewChart = () => (
  <div className="h-[120px]">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} width={20} />
        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px', fontSize: '12px' }} />
        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default StockOverviewChart;




