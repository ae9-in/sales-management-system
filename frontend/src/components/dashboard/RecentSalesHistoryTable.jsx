import React, { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { parseISO, format } from 'date-fns';
import { exportToCSV } from "../common/ExportToCSV.jsx";

const getStatusColor = (status) => {
  if (status === 'Paid') return 'bg-green-500/20 text-green-400';
  if (status === 'Pending') return 'bg-orange-500/20 text-orange-400';
  return 'bg-emerald-500/20 text-emerald-600';
};

const RecentSalesHistoryTable = ({ sales = [], employees = [], onView, onEdit, onDelete, selectedDate = format(new Date(), "yyyy-MM-dd") }) => {
  const [selectedRep, setSelectedRep] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const handleView = (id) => {
    const sale = sales.find(s => s.id === id);
    if (onView && sale) onView(sale);
  };

  const handleEdit = (id) => {
    const sale = sales.find(s => s.id === id);
    if (onEdit && sale) onEdit(sale);
  };

  const handleExport = () => {
    const salesHeaders = [
      { key: 'product', label: 'Product' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'price', label: 'Price (₹)' },
      { key: 'total', label: 'Total (₹)' },
      { key: 'customer', label: 'Customer' },
      { key: 'rep', label: 'Sales Rep' },
      { key: 'status', label: 'Status' },
      { key: 'method', label: 'Method' },
      { key: 'date', label: 'Date' }
    ];
    // Filter sales to match current filters in CSV
    const filteredList = sales.filter(row => {
      const matchesRep = selectedRep === 'All' || row.rep === selectedRep;
      const matchesStatus = selectedStatus === 'All' || row.status === selectedStatus;
      const matchesDate = row.date.startsWith(selectedDate);
      return matchesRep && matchesStatus && matchesDate;
    });
    exportToCSV(filteredList, salesHeaders, "recent_sales_history");
  };

  // Format database sales for display
  const tableData = sales.map(s => {
    let dateStr = format(new Date(), 'dd MMM yyyy');
    try {
      dateStr = format(parseISO(s.date), 'dd MMM yyyy');
    } catch {}
    return {
      id: s.id,
      date: dateStr,
      rep: s.rep || 'Arjun Kumar',
      customer: s.customer || 'Rajesh Enterprises',
      product: s.product,
      amount: `₹${(s.total || 0).toLocaleString()}`,
      status: s.status || 'Paid',
      method: s.method || 'UPI',
      rawDate: s.date
    };
  });

  const filteredData = tableData.filter(row => {
    const matchesRep = selectedRep === 'All' || row.rep === selectedRep;
    const matchesStatus = selectedStatus === 'All' || row.status === selectedStatus;
    const matchesDate = row.rawDate.startsWith(selectedDate);
    return matchesRep && matchesStatus && matchesDate;
  });

  return (
    <div className="col-span-1 lg:col-span-8 glass-card-elevated p-5">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <h3 className="font-semibold text-gray-900">Recent Sales History</h3>
        <div className="flex gap-2">
          <select 
            value={selectedRep}
            onChange={(e) => setSelectedRep(e.target.value)}
            className="bg-gray-100 text-xs text-gray-600 border-none rounded outline-none p-1.5 cursor-pointer select-none"
          >
            <option value="All">All Executives</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.name}>{emp.name}</option>
            ))}
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-100 text-xs text-gray-600 border-none rounded outline-none p-1.5 cursor-pointer select-none"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
          </select>
          <button 
            onClick={handleExport}
            className="bg-emerald-600 text-gray-900 text-xs px-3 py-1.5 rounded hover:bg-emerald-700 transition"
          >
            Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-gray-500 font-sans">
          <thead className="text-gray-500 uppercase bg-gray-100/50">
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
              <tr key={i} className="border-b border-gray-200 hover:bg-gray-100/30">
                <td className="px-4 py-3 font-medium text-gray-600">SAL-{String(row.id).padStart(5, '0')}</td>
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3">{row.rep}</td>
                <td className="px-4 py-3">{row.customer}</td>
                <td className="px-4 py-3">{row.product}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{row.amount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-[10px] ${getStatusColor(row.status)}`}>{row.status}</span>
                </td>
                <td className="px-4 py-3 flex space-x-2">
                  <button onClick={() => handleView(row.id)} className="text-gray-500 hover:text-emerald-600 transition"><Eye size={14} /></button>
                  <button onClick={() => handleEdit(row.id)} className="text-gray-500 hover:text-green-400 transition"><Edit size={14} /></button>
                  <button onClick={() => onDelete(row.id)} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={14} /></button>
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

export default RecentSalesHistoryTable;







