import React, { useState } from 'react';
import { Eye, Edit, Trash2, Search, RefreshCcw } from 'lucide-react';
import { toast } from 'react-toastify';

const getStatusColor = (status) => {
  return status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
};

const ExecutivesTable = ({ employees = [], sales = [], onSelect, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const calculateExecData = (emp) => {
    // Filter sales belonging to this executive
    const execSales = sales.filter(s => s.rep === emp.name);
    const totalSalesCount = execSales.length;
    const totalRevenueVal = execSales.reduce((sum, s) => sum + (s.total || 0), 0);
    const avgSalesVal = totalSalesCount > 0 ? Math.round(totalRevenueVal / totalSalesCount) : 0;

    return {
      salesCount: totalSalesCount,
      revenue: `₹${totalRevenueVal.toLocaleString()}`,
      avg: `₹${avgSalesVal.toLocaleString()}`
    };
  };

  const filteredList = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.area && emp.area.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="glass-card-elevated p-5 mb-6">
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search executives..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 text-sm text-gray-200 border border-gray-200 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-emerald-500" 
          />
        </div>
        <button 
          onClick={() => setSearchTerm('')}
          className="bg-gray-100 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-gray-500">
          <thead className="text-gray-500 bg-gray-100/50">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Executive Name</th>
              <th className="px-4 py-3">Employee ID</th>
              <th className="px-4 py-3">Mobile Number</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Total Sales</th>
              <th className="px-4 py-3">Total Revenue</th>
              <th className="px-4 py-3">Avg. Sales Value</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((row, index) => {
              const stats = calculateExecData(row);
              return (
                <tr 
                  key={row.id} 
                  onClick={() => onSelect(row)}
                  className="border-b border-gray-200/50 hover:bg-gray-100/30 cursor-pointer"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex flex-shrink-0 items-center justify-center text-xs font-bold text-gray-900">
                      {row.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-600 whitespace-nowrap">{row.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">SE-{String(row.id).padStart(4, '0')}</td>
                  <td className="px-4 py-3">{row.phone || '9876543210'}</td>
                  <td className="px-4 py-3">{row.area || 'Bangalore'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-200">{stats.salesCount}</td>
                  <td className="px-4 py-3 font-semibold text-gray-200">{stats.revenue}</td>
                  <td className="px-4 py-3">{stats.avg}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] ${getStatusColor(row.status || 'Active')}`}>{row.status || 'Active'}</span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
                        <button onClick={() => onSelect(row)} className="text-gray-500 hover:text-emerald-600 transition"><Eye size={14} /></button>
                        <button onClick={() => onEdit(row)} className="text-gray-500 hover:text-green-400 transition"><Edit size={14} /></button>
                        <button onClick={() => onDelete(row.id)} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExecutivesTable;




