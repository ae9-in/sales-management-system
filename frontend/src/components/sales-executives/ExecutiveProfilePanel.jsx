import React from 'react';
import { Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';
import ExecutiveRecentSales from './ExecutiveRecentSales';

const ExecutiveProfilePanel = ({ executive, sales = [] }) => {
  if (!executive) {
    return (
      <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl text-center text-gray-400 text-xs py-10">
        Select a sales executive to view profile
      </div>
    );
  }

  // Calculate executive totals
  const execSales = sales.filter(s => s.rep === executive.name && s.status !== 'Pending');
  const totalRev = execSales.reduce((sum, s) => sum + (s.total || 0), 0);

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl flex flex-col gap-6">
      <div className="text-center pb-4 border-b border-gray-700">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center font-bold text-2xl text-white mx-auto mb-3 shadow-lg shadow-blue-500/20">
          {executive.name.charAt(0)}
        </div>
        <h3 className="font-bold text-gray-100 text-sm">{executive.name}</h3>
        <p className="text-[10px] text-gray-400">{executive.position || 'Sales Executive'}</p>
        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] bg-green-500/10 text-green-400 font-semibold">Active</span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex gap-3 text-gray-300">
          <Phone className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="truncate">{executive.phone || '+91 98765 43210'}</span>
        </div>
        <div className="flex gap-3 text-gray-300">
          <Mail className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="truncate">{executive.name.toLowerCase().replace(' ', '')}@salestrack.com</span>
        </div>
        <div className="flex gap-3 text-gray-300">
          <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="truncate">{executive.area || 'Bangalore, India'}</span>
        </div>
        <div className="flex gap-3 text-gray-300">
          <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
          <span>Salary: ₹{(executive.salary || 18000).toLocaleString()}/mo</span>
        </div>
      </div>

      <div className="p-3 bg-gray-900 rounded-lg flex items-center gap-3 border border-gray-700/50">
        <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-md shrink-0">
          <Award size={18} />
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block">Total Revenue</span>
          <span className="text-sm font-bold text-gray-200">₹{totalRev.toLocaleString()}</span>
        </div>
      </div>

      <ExecutiveRecentSales executiveName={executive.name} sales={sales} />
    </div>
  );
};

export default ExecutiveProfilePanel;
