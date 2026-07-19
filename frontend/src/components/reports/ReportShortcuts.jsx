import React from 'react';
import { ChevronRight, BarChart2, TrendingUp, Users, User, Package, FileText } from 'lucide-react';

const shortcuts = [
  { icon: BarChart2, title: 'Sales Report', subtext: 'Overview of all sales', color: 'text-blue-400 bg-blue-500/10' },
  { icon: TrendingUp, title: 'Revenue Report', subtext: 'Detailed revenue analysis', color: 'text-green-400 bg-green-500/10' },
  { icon: Users, title: 'Sales Executive Report', subtext: 'Performance of executives', color: 'text-purple-400 bg-purple-500/10' },
  { icon: User, title: 'Customer Report', subtext: 'Customer wise sales', color: 'text-indigo-400 bg-indigo-500/10' },
  { icon: Package, title: 'Product Report', subtext: 'Product wise sales', color: 'text-orange-400 bg-orange-500/10' },
  { icon: FileText, title: 'Receivables Report', subtext: 'Pending payments report', color: 'text-yellow-400 bg-yellow-500/10' },
];

const ReportShortcuts = () => (
  <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl mb-6">
    <h3 className="font-semibold text-gray-100 mb-4 text-sm">Report Shortcuts</h3>
    <div className="space-y-2">
      {shortcuts.map((s, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 cursor-pointer border border-transparent hover:border-gray-600 transition">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-200">{s.title}</h4>
                    <p className="text-[10px] text-gray-500">{s.subtext}</p>
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      ))}
    </div>
    <button className="w-full mt-4 py-2 border border-blue-600/50 text-blue-400 text-sm font-semibold rounded-lg hover:bg-blue-600/10 transition">View All Reports</button>
  </div>
);

export default ReportShortcuts;
