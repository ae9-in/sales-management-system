import React, { useState } from 'react';
import { Eye, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductsTable = ({ inventory = [], onSelect, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-card-elevated p-5 mb-6">
      <div className="flex gap-3 mb-6 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 text-sm text-gray-800 border border-gray-200 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-emerald-500" 
          />
        </div>
        <button 
          onClick={() => setSearchTerm('')}
          className="bg-gray-100 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-650"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-gray-500">
          <thead className="text-gray-500 uppercase bg-gray-100/50">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Product / Service Name</th>
              <th className="px-4 py-3">Product ID</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Stock Level</th>
              <th className="px-4 py-3">Reorder Point</th>
              <th className="px-4 py-3">Stock Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, index) => {
              const isLowStock = row.currentStock <= row.reorderLevel;
              return (
                <tr 
                  key={row.id} 
                  onClick={() => onSelect(row)}
                  className="border-b border-gray-200/50 hover:bg-gray-100/30 cursor-pointer"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-3 text-gray-500">PRD-{String(row.id).padStart(4, '0')}</td>
                  <td className="px-4 py-3 font-medium text-gray-600">₹{(row.price || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">{row.currentStock}</td>
                  <td className="px-4 py-3">{row.reorderLevel}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${isLowStock ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
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

export default ProductsTable;





