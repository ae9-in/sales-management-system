import React, { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { parseISO, format } from 'date-fns';

const CustomersTable = ({ customersList = [], onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customersList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl mb-6">
      <div className="flex gap-3 mb-6 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-sm text-gray-200 border border-gray-600 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-blue-500" 
          />
        </div>
        <button 
          onClick={() => setSearchTerm('')}
          className="bg-gray-700 border border-gray-600 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-650"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-gray-400">
          <thead className="text-gray-500 uppercase bg-gray-700/50">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Mobile / Email</th>
              <th className="px-4 py-3">Sales rep</th>
              <th className="px-4 py-3">Total Orders</th>
              <th className="px-4 py-3">Total Spend</th>
              <th className="px-4 py-3">Last Purchase</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, index) => {
              let dateStr = '20 Jul 2026';
              try {
                dateStr = format(parseISO(row.lastDate), 'dd MMM yyyy');
              } catch {}
              return (
                <tr 
                  key={index} 
                  onClick={() => onSelect(row.name)}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex flex-shrink-0 items-center justify-center text-xs font-bold text-white">
                      {row.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-300 whitespace-nowrap">{row.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">—</td>
                  <td className="px-4 py-3">{row.rep}</td>
                  <td className="px-4 py-3 font-semibold text-gray-300">{row.orders}</td>
                  <td className="px-4 py-3 font-bold text-gray-200">₹{row.spend.toLocaleString()}</td>
                  <td className="px-4 py-3">{dateStr}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onSelect(row.name)} className="text-gray-400 hover:text-blue-400 transition flex items-center gap-1">
                      <Eye size={14} /> View
                    </button>
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

export default CustomersTable;
