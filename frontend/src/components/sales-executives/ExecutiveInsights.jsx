import React from 'react';
import { TrendingUp, TrendingDown, Target, IndianRupee } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const InsightCard = ({ title, name, amount, subtext, icon: Icon, color, colorClass, chartData = [] }) => (
  <div className="glass-card-elevated p-5 flex items-center justify-between">
    <div className="flex gap-3">
      <div className={`p-2 rounded-lg h-fit ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <h4 className="text-sm font-bold text-gray-200 truncate w-32">{name}</h4>
        <p className="text-xs font-semibold text-gray-900">{amount}</p>
        <p className="text-[10px] text-gray-500">{subtext}</p>
      </div>
    </div>
    <div className="w-20 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData.length > 0 ? chartData : [{ value: 0 }]}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ExecutiveInsights = ({ sales = [], employees = [] }) => {
  const repSales = {};
  const repCount = {};
  sales.forEach(s => {
    if (s.rep) {
      repSales[s.rep] = (repSales[s.rep] || 0) + (s.total || 0);
      repCount[s.rep] = (repCount[s.rep] || 0) + 1;
    }
  });

  let topName = "None";
  let topAmount = 0;
  let topSalesCount = 0;
  Object.entries(repSales).forEach(([name, amount]) => {
    if (amount > topAmount) {
      topName = name;
      topAmount = amount;
      topSalesCount = repCount[name] || 0;
    }
  });

  let lowName = "None";
  let lowAmount = Infinity;
  let lowSalesCount = 0;
  Object.entries(repSales).forEach(([name, amount]) => {
    if (amount < lowAmount) {
      lowName = name;
      lowAmount = amount;
      lowSalesCount = repCount[name] || 0;
    }
  });
  if (lowAmount === Infinity) {
    lowName = "None";
    lowAmount = 0;
  }

  const bestConversionName = topName;
  const bestConversionVal = sales.length > 0 ? ((topSalesCount / sales.length) * 100).toFixed(1) + "%" : "0%";
  const avgRev = employees.length > 0 ? Math.round(sales.reduce((sum, s) => sum + (s.total || 0), 0) / employees.length) : 0;

  // Build sparkline trends
  const getRepTrend = (repName) => {
    if (!repName || repName === "None") return [];
    return sales
      .filter(s => s.rep === repName)
      .slice(-10) // last 10 transactions
      .map(s => ({ value: s.total }));
  };

  const topTrend = getRepTrend(topName);
  const lowTrend = getRepTrend(lowName);
  const conversionTrend = getRepTrend(bestConversionName);
  const allTrend = sales.slice(-10).map(s => ({ value: s.total }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 font-sans">
      <InsightCard title="Top Performer" name={topName} amount={`₹${topAmount.toLocaleString()}`} subtext={`${topSalesCount} Sales`} icon={TrendingUp} color="#10b981" colorClass="bg-green-500/20 text-green-400" chartData={topTrend} />
      <InsightCard title="Lowest Sales" name={lowName} amount={`₹${lowAmount.toLocaleString()}`} subtext={`${lowSalesCount} Sales`} icon={TrendingDown} color="#f59e0b" colorClass="bg-orange-500/20 text-orange-400" chartData={lowTrend} />
      <InsightCard title="Best Conversion" name={bestConversionName} amount={bestConversionVal} subtext="Conversion Rate" icon={Target} color="#3b82f6" colorClass="bg-emerald-500/20 text-emerald-600" chartData={conversionTrend} />
      <InsightCard title="Avg. Revenue / Executive" name={`₹${avgRev.toLocaleString()}`} amount="" subtext="Per Executive" icon={IndianRupee} color="#8b5cf6" colorClass="bg-purple-500/20 text-purple-400" chartData={allTrend} />
    </div>
  );
};

export default ExecutiveInsights;



