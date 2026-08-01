import { format, startOfMonth } from "date-fns";
import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../utils/toastConfig";
import { Calendar, Download, Plus } from "lucide-react";
import { fetchInventory } from "../services/api";
import api from "../services/api";
import DateFilter from "../components/forms/DateFilter";
import { getDateRange, filterDataByDate } from "../utils/dateUtils";

import ProductsStats from "../components/products/ProductsStats";
import ProductsTable from "../components/products/ProductsTable";
import ProductProfilePanel from "../components/products/ProductProfilePanel";
import { SkeletonPageFallback } from "../components/common/Skeleton";

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [reorder, setReorder] = useState("");
  const [price, setPrice] = useState("");
  const [dateFilter, setDateFilter] = useState({
    range: "month",
    isCustom: false,
    isDirty: false,
    pickerOpen: false,
    customRange: {
      startDate: startOfMonth(new Date()),
      endDate: new Date()
    }
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchInventory();
      setInventory(data);
      if (data.length > 0 && !selectedProduct) {
        setSelectedProduct(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedProduct]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !stock || !reorder) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      if (editingProduct) {
        await api.put(`/inventory/${editingProduct.id}`, {
          name,
          currentStock: parseFloat(stock),
          reorderLevel: parseFloat(reorder),
          price: parseFloat(price) || 0,
          date: editingProduct.dateUpdated
        });
        toast.success("Product/service details updated successfully!");
      } else {
        await api.post("/inventory", {
          name,
          currentStock: parseFloat(stock),
          reorderLevel: parseFloat(reorder),
          price: parseFloat(price) || 0,
          date: new Date().toISOString()
        });
        toast.success("New product/service registered successfully!");
      }
      
      setShowModal(false);
      setName("");
      setStock("");
      setReorder("");
      setPrice("");
      setEditingProduct(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(editingProduct ? "Failed to update product." : "Failed to add product.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      toast.warning("Product removed from inventory.");
      if (selectedProduct?.id === id) setSelectedProduct(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <SkeletonPageFallback />;

  const activeDateRange = dateFilter.isCustom ? dateFilter.customRange : getDateRange(dateFilter.range);
  const filteredInventory = filterDataByDate(inventory, activeDateRange, "date");

  return (
    <div className="flex flex-col min-h-screen text-gray-100 transition-all duration-200 bg-gray-900 animate-fadeIn">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Products / Services</h1>
            <p className="text-gray-400 text-sm">Manage all your products and services</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
            <button 
              onClick={() => {
                setName("");
                setStock("");
                setReorder("");
                setPrice("");
                setEditingProduct(null);
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Product
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <ProductsStats inventory={filteredInventory} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          {/* Left Column */}
          <div className="col-span-1 xl:col-span-9 flex flex-col">
            <ProductsTable 
              inventory={filteredInventory} 
              onSelect={(prod) => setSelectedProduct(prod)}
              onEdit={(prod) => {
                setEditingProduct(prod);
                setName(prod.name);
                setStock(prod.currentStock);
                setReorder(prod.reorderLevel);
                setPrice(prod.price || "");
                setShowModal(true);
              }}
              onDelete={handleDelete}
            />
          </div>

          {/* Right Column */}
          <div className="col-span-1 xl:col-span-3 flex flex-col">
            <ProductProfilePanel product={selectedProduct} />
          </div>
        </div>

      </main>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn overflow-y-auto p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative my-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingProduct ? "Edit Product / Service" : "Add Product / Service"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1 text-xs">Product Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Cloud Hosting Plan" 
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-xs">Current Stock / Availability Limit</label>
                <input 
                  type="number" 
                  value={stock} 
                  onChange={(e) => setStock(e.target.value)} 
                  placeholder="e.g. 50"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-xs">Reorder Level (Min Limit)</label>
                <input 
                  type="number" 
                  value={reorder} 
                  onChange={(e) => setReorder(e.target.value)} 
                  placeholder="e.g. 10"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-xs">Unit Price (₹)</label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="e.g. 100"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                >
                  {editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default InventoryManagement;
