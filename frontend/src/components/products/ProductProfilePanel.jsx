import React from 'react';
import { Package, ShieldAlert, BadgeInfo } from 'lucide-react';

const ProductProfilePanel = ({ product }) => {
  if (!product) {
    return (
      <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl text-center text-gray-400 text-xs py-10">
        Select a product to view details
      </div>
    );
  }

  const isLowStock = product.currentStock <= product.reorderLevel;

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl flex flex-col gap-6">
      <div className="text-center pb-4 border-b border-gray-700">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center font-bold text-2xl text-white mx-auto mb-3 shadow-lg shadow-blue-500/20">
          <Package size={24} />
        </div>
        <h3 className="font-bold text-gray-100 text-sm truncate">{product.name}</h3>
        <p className="text-[10px] text-gray-400">PRD-{String(product.id).padStart(4, '0')}</p>
        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-semibold ${isLowStock ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
          {isLowStock ? 'Low Stock' : 'Active / In Stock'}
        </span>
      </div>

      <div className="space-y-3 text-xs text-gray-300">
        <div className="flex justify-between">
          <span className="text-gray-500">Current Stock</span>
          <span className="font-semibold text-gray-200">{product.currentStock} Units</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Reorder Level</span>
          <span className="font-semibold text-gray-200">{product.reorderLevel} Units</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Unit Price</span>
          <span className="font-semibold text-gray-200">₹{(product.price || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 flex gap-3 text-xs">
        <BadgeInfo className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Product sales are tracked and graphed in real-time on your main Sales Overview page.
        </p>
      </div>
    </div>
  );
};

export default ProductProfilePanel;
