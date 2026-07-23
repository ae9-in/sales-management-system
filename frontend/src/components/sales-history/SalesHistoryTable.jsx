import React, { useState } from 'react';
import { Eye, Edit, Trash2, Search, Filter, RefreshCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { parseISO, format } from 'date-fns';

const getStatusColor = (status) => {
  if (status === 'Paid') return 'bg-green-500/20 text-green-400';
  if (status === 'Pending') return 'bg-orange-500/20 text-orange-400';
  return 'bg-blue-500/20 text-blue-400';
};

const SalesHistoryTable = ({ sales = [], onView, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const handleView = (id) => {
    const sale = sales.find(s => s.id === id);
    if (onView && sale) onView(sale);
  };

  const handleEdit = (id) => {
    const sale = sales.find(s => s.id === id);
    if (onEdit && sale) onEdit(sale);
  };

  // Format list
  const tableData = sales.map(s => {
    let dateStr = '20 Jul 2026';
    try {
      dateStr = format(parseISO(s.date), 'dd MMM yyyy');
    } catch {}
    return {
      id: s.id,
      date: dateStr,
      rep: s.rep || 'Arjun Kumar',
      customer: s.customer || 'Walk-in',
      product: s.product,
      amount: `₹${(s.total || 0).toLocaleString()}`,
      status: s.status || 'Paid',
      method: s.method || 'UPI',
    };
  });

  const filteredData = tableData.filter(row => {
    const matchesSearch = row.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          row.rep.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || row.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl">
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-sm text-gray-200 border border-gray-600 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-blue-500" 
          />
        </div>
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-sm text-gray-300 rounded-lg outline-none px-3 py-2 cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Partial">Partial</option>
        </select>
        <button 
          onClick={() => { setSearchTerm(''); setSelectedStatus('All'); }}
          className="bg-gray-700 border border-gray-600 text-gray-300 px-3 py-2 rounded-lg text-sm flex items-center hover:bg-gray-650"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-gray-400">
          <thead className="text-gray-500 uppercase bg-gray-700/50">
            <tr>
              <th className="px-4 py-3">Sales ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Executive</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, i) => (
              <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="px-4 py-3 font-medium text-gray-300">SAL-{String(row.id).padStart(5, '0')}</td>
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3">{row.rep}</td>
                <td className="px-4 py-3">{row.customer}</td>
                <td className="px-4 py-3">{row.product}</td>
                <td className="px-4 py-3 font-semibold text-gray-200">{row.amount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-[10px] ${getStatusColor(row.status)}`}>{row.status}</span>
                </td>
                <td className="px-4 py-3 flex space-x-2">
                  <button onClick={() => handleView(row.id)} className="text-gray-400 hover:text-blue-400 transition"><Eye size={14} /></button>
                  <button onClick={() => handleEdit(row.id)} className="text-gray-400 hover:text-green-400 transition"><Edit size={14} /></button>
                  <button onClick={() => onDelete(row.id)} className="text-gray-400 hover:text-red-400 transition"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesHistoryTable;
