import React from 'react';
import { TrendingUp, TrendingDown, Target, IndianRupee } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const InsightCard = ({ title, name, amount, subtext, icon: Icon, color, colorClass, chartData = [] }) => (
  <div className="glass-stat-card p-5 flex items-center justify-between gap-3">
    <div className="flex gap-3 items-start flex-1 min-w-0">
      <div className={`p-2.5 rounded-xl h-fit flex-shrink-0 ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">{title}</p>
        <h4 className="text-sm font-bold text-gray-800 truncate">{name}</h4>
        {amount && <p className="text-xs font-semibold text-emerald-700 mt-0.5">{amount}</p>}
        <p className="text-[10px] text-gray-400 mt-0.5">{subtext}</p>
      </div>
    </div>
    <div className="w-16 h-10 flex-shrink-0">
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
      <InsightCard title="Top Performer" name={topName} amount={`₹${topAmount.toLocaleString()}`} subtext={`${topSalesCount} Sales`} icon={TrendingUp} color="#8B639B" colorClass="bg-emerald-100 text-emerald-700" chartData={topTrend} />
      <InsightCard title="Lowest Sales" name={lowName} amount={`₹${lowAmount.toLocaleString()}`} subtext={`${lowSalesCount} Sales`} icon={TrendingDown} color="#f59e0b" colorClass="bg-orange-100 text-orange-600" chartData={lowTrend} />
      <InsightCard title="Best Conversion" name={bestConversionName} amount={bestConversionVal} subtext="Conversion Rate" icon={Target} color="#AF719D" colorClass="bg-teal-100 text-teal-700" chartData={conversionTrend} />
      <InsightCard title="Avg. Revenue / Executive" name={`₹${avgRev.toLocaleString()}`} amount="" subtext="Per Executive" icon={IndianRupee} color="#8b5cf6" colorClass="bg-violet-100 text-violet-700" chartData={allTrend} />
    </div>
  );
};

export default ExecutiveInsights;




