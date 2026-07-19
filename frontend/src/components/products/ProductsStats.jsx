import React from 'react';
import { Package, Award, TrendingUp, ShieldAlert } from 'lucide-react';

const StatCard = ({ title, value, change, isPositive, icon: Icon, color }) => (
  <div className="flex flex-col justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-gray-300" />
      </div>
    </div>
    <div>
      <p className="text-xs text-gray-400">{title}</p>
      <h3 className="text-xl font-bold text-white mt-1">{value}</h3>
    </div>
  </div>
);

const ProductsStats = ({ inventory = [] }) => {
  const lowStockCount = inventory.filter(item => item.currentStock <= item.reorderLevel).length;

  // Valuation of stock in hand
  const totalStockValuation = inventory.reduce((sum, item) => sum + ((item.currentStock || 0) * (item.price || 0)), 0);
  
  let catalogValueDisplay = "₹0";
  if (totalStockValuation > 0) {
    if (totalStockValuation >= 100000) {
      catalogValueDisplay = `₹${(totalStockValuation / 100000).toFixed(1)} Lakhs`;
    } else {
      catalogValueDisplay = `₹${totalStockValuation.toLocaleString()}`;
    }
  }

  // Count active services (items with reorderLevel === 0)
  const activeServicesCount = inventory.filter(item => item.reorderLevel === 0).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard title="Total Products / Services" value={inventory.length} icon={Package} color="bg-blue-500/10 text-blue-400" />
      <StatCard title="Active Services" value={activeServicesCount} icon={Award} color="bg-green-500/10 text-green-400" />
      <StatCard title="Low Stock Alerts" value={lowStockCount} icon={ShieldAlert} color="bg-red-500/10 text-red-400" />
      <StatCard title="Catalog Value" value={catalogValueDisplay} icon={TrendingUp} color="bg-yellow-500/10 text-yellow-400" />
    </div>
  );
};

export default ProductsStats;
