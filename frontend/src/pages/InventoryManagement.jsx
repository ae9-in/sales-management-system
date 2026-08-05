import { format, startOfMonth } from "date-fns";
import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { createPortal } from "react-dom";
import { toastConfig } from "../utils/toastConfig";
import { Calendar, Download, Upload, FileDown, Plus } from "lucide-react";
import { fetchInventory } from "../services/api";
import api from "../services/api";
import DateFilter from "../components/forms/DateFilter";
import { getDateRange, filterDataByDate } from "../utils/dateUtils";
import { exportToExcel, downloadTemplate, importFromExcel } from "../utils/excelUtils";

const PRODUCT_HEADERS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Product / Service Name" },
  { key: "prdId", label: "Product ID" },
  { key: "price", label: "Unit Price" },
  { key: "currentStock", label: "Stock Level" },
  { key: "reorderLevel", label: "Reorder Point" },
  { key: "status", label: "Stock Status" },
  { key: "action", label: "Action" }
];

const PRODUCT_HEADERS_MAP = {
  id: "ID",
  name: "Product / Service Name",
  prdId: "Product ID",
  price: "Unit Price",
  currentStock: "Stock Level",
  reorderLevel: "Reorder Point",
  status: "Stock Status",
  action: "Action",
  oldName: "Product Name",
  oldCurrentStock: "Current Stock",
  oldReorderLevel: "Reorder Level",
  oldPrice: "Unit Price (₹)"
};

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

  const handleExportExcel = () => {
    if (inventory.length === 0) {
      toast.info("No products data to export.");
      return;
    }
    const listToExport = inventory.map((item, idx) => ({
      ...item,
      id: idx + 1,
      prdId: `PRD-${String(item.id).padStart(4, '0')}`,
      status: item.currentStock <= item.reorderLevel ? 'Low Stock' : 'In Stock',
      action: 'View'
    }));
    exportToExcel(listToExport, PRODUCT_HEADERS, "products_services_list");
    toast.success("Products list exported to Excel!");
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(PRODUCT_HEADERS, "products_services");
    toast.info("Excel template downloaded!");
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading("Parsing Excel file...");
    try {
      const rawRows = await importFromExcel(file, PRODUCT_HEADERS_MAP);
      toast.update(loadingToast, { render: `Found ${rawRows.length} rows. Registering products...`, type: "info", isLoading: true });

      let successCount = 0;
      let failCount = 0;

      for (const row of rawRows) {
        const resolvedName = row.name || row.oldName;
        if (!resolvedName) {
          failCount++;
          continue;
        }

        const rawStock = row.currentStock !== '' ? row.currentStock : row.oldCurrentStock;
        const rawReorder = row.reorderLevel !== '' ? row.reorderLevel : row.oldReorderLevel;
        const rawPrice = row.price !== '' ? row.price : row.oldPrice;

        if (rawStock === undefined || rawStock === '' || rawReorder === undefined || rawReorder === '') {
          failCount++;
          continue;
        }

        try {
          await api.post("/inventory", {
            name: String(resolvedName).trim(),
            currentStock: parseFloat(rawStock),
            reorderLevel: parseFloat(rawReorder),
            price: parseFloat(rawPrice) || 0,
            date: new Date().toISOString()
          });
          successCount++;
        } catch (err) {
          console.error("Failed to import product:", row, err);
          failCount++;
        }
      }

      loadData();
      if (failCount === 0) {
        toast.update(loadingToast, { render: `Successfully registered ${successCount} products!`, type: "success", isLoading: false, autoClose: 2500 });
      } else {
        toast.update(loadingToast, { render: `Registered ${successCount} products. Failed to register ${failCount} rows.`, type: "warning", isLoading: false, autoClose: 3500 });
      }
    } catch (err) {
      console.error("Excel import error:", err);
      toast.update(loadingToast, { render: `Import failed: ${err.message || "Invalid file format"}`, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      e.target.value = ""; // Clear file input
    }
  };
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
    <div className="flex flex-col min-h-screen text-gray-900 transition-all duration-200 page-bg animate-fadeIn">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Products / Services</h1>
            <p className="text-gray-500 text-sm">Manage all your products and services</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
            <button 
              onClick={handleDownloadTemplate}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-100 transition shadow-md"
              title="Download Excel Template"
            >
              <FileDown className="w-4 h-4 mr-1 text-purple-500" /> Template
            </button>
            <label className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-100 transition cursor-pointer shadow-md">
              <Upload className="w-4 h-4 mr-1 text-purple-500" /> Import
              <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
            </label>
            <button 
              onClick={handleExportExcel}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-100 transition shadow-md"
              title="Export to Excel"
            >
              <Download className="w-4 h-4 mr-1 text-purple-500" /> Export
            </button>
            <button 
              onClick={() => {
                setName("");
                setStock("");
                setReorder("");
                setPrice("");
                setEditingProduct(null);
                setShowModal(true);
              }}
              className="bg-emerald-600 text-gray-900 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
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
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="glass-modal relative w-full max-w-md p-5 max-h-[90vh] overflow-y-auto no-scrollbar animate-modalSlideIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingProduct ? "Edit Product / Service" : "Add Product / Service"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-500 mb-1 text-xs">Product Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Cloud Hosting Plan" 
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 text-xs">Current Stock / Availability Limit</label>
                <input 
                  type="number" 
                  value={stock} 
                  onChange={(e) => setStock(e.target.value)} 
                  placeholder="e.g. 50"
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 text-xs">Reorder Level (Min Limit)</label>
                <input 
                  type="number" 
                  value={reorder} 
                  onChange={(e) => setReorder(e.target.value)} 
                  placeholder="e.g. 10"
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 text-xs">Unit Price (₹)</label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="e.g. 100"
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
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
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-gray-900 rounded hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
                >
                  {editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default InventoryManagement;



