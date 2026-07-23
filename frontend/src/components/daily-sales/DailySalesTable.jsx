import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const getStatusColor = (status) => {
  if (status === 'Paid') return 'bg-green-500/20 text-green-400';
  if (status === 'Pending') return 'bg-orange-500/20 text-orange-400';
  return 'bg-blue-500/20 text-blue-400';
};

const DailySalesTable = ({ sales = [], onView, onEdit, onDelete }) => {
  const handleView = (id) => {
    const sale = sales.find(s => s.id === id);
    if (onView && sale) onView(sale);
  };

  const handleEdit = (id) => {
    const sale = sales.find(s => s.id === id);
    if (onEdit && sale) onEdit(sale);
  };

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl">
      <h3 className="font-semibold text-gray-100 mb-4 text-sm">Today's Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-gray-400">
          <thead className="text-gray-500 uppercase bg-gray-700/50">
            <tr>
              <th className="px-4 py-3">Sales ID</th>
              <th className="px-4 py-3">Executive</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((row, i) => (
              <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="px-4 py-3 font-medium text-gray-300">SAL-{String(row.id).padStart(5, '0')}</td>
                <td className="px-4 py-3">{row.rep || 'Arjun Kumar'}</td>
                <td className="px-4 py-3">{row.customer || 'Walk-in'}</td>
                <td className="px-4 py-3">{row.product}</td>
                <td className="px-4 py-3">{row.quantity}</td>
                <td className="px-4 py-3">₹{row.price.toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold text-gray-200">₹{row.total.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-[10px] ${getStatusColor(row.status || 'Paid')}`}>{row.status || 'Paid'}</span>
                </td>
                <td className="px-4 py-3 flex space-x-2">
                  <button onClick={() => handleView(row.id)} className="text-gray-400 hover:text-blue-400 transition"><Eye size={14} /></button>
                  <button onClick={() => handleEdit(row.id)} className="text-gray-400 hover:text-green-400 transition"><Edit size={14} /></button>
                  <button onClick={() => onDelete(row.id)} className="text-gray-400 hover:text-red-400 transition"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">No transactions recorded for this day.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailySalesTable;
