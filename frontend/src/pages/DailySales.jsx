import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { toastConfig } from "../utils/toastConfig";
import { Plus, Download, Upload, FileDown } from "lucide-react";
import { fetchSales, fetchEmployees, fetchInventory } from "../services/api";
import api from "../services/api";
import { parseISO, format } from "date-fns";
import { exportToExcel, downloadTemplate, importFromExcel } from "../utils/excelUtils";

const DAILY_SALE_HEADERS = [
  { key: "salesId", label: "Sales ID" },
  { key: "rep", label: "Executive" },
  { key: "customer", label: "Customer" },
  { key: "product", label: "Product" },
  { key: "quantity", label: "Qty" },
  { key: "price", label: "Price" },
  { key: "total", label: "Total" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" }
];

const DAILY_SALE_HEADERS_MAP = {
  rep: "Executive",
  customer: "Customer",
  product: "Product",
  quantity: "Qty",
  price: "Price",
  status: "Status",
};

import DailyStats from "../components/daily-sales/DailyStats";
import DailySalesTable from "../components/daily-sales/DailySalesTable";
import RecentPayments from "../components/daily-sales/RecentPayments";
import PendingFollowUps from "../components/daily-sales/PendingFollowUps";
import TodaySalesSummaryChart from "../components/daily-sales/TodaySalesSummaryChart";
import PaymentMethodsChart from "../components/daily-sales/PaymentMethodsChart";
import TopExecutivesProgress from "../components/daily-sales/TopExecutivesProgress";
import { SkeletonPageFallback } from "../components/common/Skeleton";

const DailySales = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showNoProductsModal, setShowNoProductsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [viewingSale, setViewingSale] = useState(null);

  // Form states for new sale
  const [customer, setCustomer] = useState("");
  const [rep, setRep] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Paid");
  const [method, setMethod] = useState("UPI");

  const handleExportExcel = () => {
    if (dailySales.length === 0) {
      toast.info("No sales data to export for this day.");
      return;
    }
    exportToExcel(dailySales, DAILY_SALE_HEADERS, `daily_sales_${selectedDate}`);
    toast.success("Daily sales list exported to Excel!");
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(DAILY_SALE_HEADERS, "daily_sales");
    toast.info("Excel template downloaded!");
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (inventory.length === 0) {
      toast.error("Please register products first in Products / Services page before importing sales.");
      return;
    }

    const loadingToast = toast.loading("Parsing Excel file...");
    try {
      const rawRows = await importFromExcel(file, DAILY_SALE_HEADERS_MAP);
      toast.update(loadingToast, { render: `Found ${rawRows.length} rows. Recording transactions...`, type: "info", isLoading: true });

      let successCount = 0;
      let failCount = 0;
      let errorMsgs = [];

      for (const row of rawRows) {
        if (!row.customer || !row.product || !row.quantity || !row.price) {
          failCount++;
          errorMsgs.push(`Row ${successCount + failCount + 1}: Missing required fields.`);
          continue;
        }

        const productItem = inventory.find(inv => inv.name.toLowerCase() === String(row.product).trim().toLowerCase());
        if (!productItem) {
          failCount++;
          errorMsgs.push(`Row ${successCount + failCount + 1}: Product "${row.product}" not found in inventory.`);
          continue;
        }

        const qty = parseFloat(row.quantity);
        if (qty > productItem.currentStock) {
          failCount++;
          errorMsgs.push(`Row ${successCount + failCount + 1}: Insufficient stock for "${row.product}".`);
          continue;
        }

        let rawStatus = String(row.status || "Paid").trim();
        let statusVal = "Paid";
        if (rawStatus.toLowerCase() === "pending") statusVal = "Pending";
        if (rawStatus.toLowerCase() === "partial") statusVal = "Partial";

        let rawMethod = String(row.method || "UPI").trim();
        let methodVal = "UPI";
        if (rawMethod.toLowerCase() === "cash") methodVal = "Cash";
        if (rawMethod.toLowerCase() === "card") methodVal = "Card";
        if (rawMethod.toLowerCase() === "bank transfer") methodVal = "Bank Transfer";

        try {
          await api.post("/sales", {
            customer: String(row.customer).trim(),
            rep: String(row.rep || (employees[0]?.name || "Arjun Kumar")).trim(),
            product: productItem.name,
            quantity: qty,
            price: parseFloat(row.price),
            total: qty * parseFloat(row.price),
            status: statusVal,
            method: methodVal,
            date: new Date(`${selectedDate}T12:00:00`).toISOString()
          });
          successCount++;
        } catch (err) {
          console.error("Failed to import sale:", row, err);
          failCount++;
          errorMsgs.push(`Row ${successCount + failCount + 1}: Backend error (${err.response?.data?.message || err.message})`);
        }
      }

      loadData();
      if (failCount === 0) {
        toast.update(loadingToast, { render: `Successfully recorded ${successCount} sale transactions!`, type: "success", isLoading: false, autoClose: 2500 });
      } else {
        toast.update(loadingToast, { render: `Recorded ${successCount} sales. Failed to import ${failCount} rows. Details: ${errorMsgs.slice(0, 2).join('; ')}`, type: "warning", isLoading: false, autoClose: 5000 });
      }
    } catch (err) {
      console.error("Excel import error:", err);
      toast.update(loadingToast, { render: `Import failed: ${err.message || "Invalid file format"}`, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      e.target.value = ""; // Clear file input
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [salesData, employeesData, inventoryData] = await Promise.all([
        fetchSales(),
        fetchEmployees(),
        fetchInventory()
      ]);
      setSales(salesData);
      setEmployees(employeesData);
      setInventory(inventoryData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!customer || !product || !quantity || !price) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const total = parseFloat(quantity) * parseFloat(price);
      if (editingSale) {
        await api.put(`/sales/${editingSale.id}`, {
          customer,
          rep: rep || (employees[0]?.name || "Arjun Kumar"),
          product,
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          total,
          status,
          method,
          date: editingSale.date
        });
        toast.success("Sale details updated successfully!");
      } else {
        await api.post("/sales", {
          customer,
          rep: rep || (employees[0]?.name || "Arjun Kumar"),
          product,
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          total,
          status,
          method,
          date: (() => {
            const d = new Date(selectedDate);
            return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
          })()
        });
        toast.success("New sale added to database successfully!");
      }
      
      setShowModal(false);
      setCustomer("");
      setQuantity("");
      setPrice("");
      setEditingSale(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(editingSale ? "Failed to update sale." : "Failed to save sale.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/sales/${id}`);
      toast.warning(`Deleted sales record: SAL-${String(id).padStart(5, '0')}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <SkeletonPageFallback />;

  // Filter sales matching selectedDate
  const dailySales = sales.filter(s => {
    try {
      return parseISO(s.date).toISOString().startsWith(selectedDate);
    } catch {
      return false;
    }
  });

  return (
    <div className="flex flex-col min-h-screen text-gray-900 transition-all duration-200 page-bg animate-fadeIn overflow-hidden">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Daily Sales</h1>
            <p className="text-gray-500 text-sm">Track and manage all the sales made on a daily basis.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex items-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100/85 transition px-3 py-2 shadow-sm">
              <span className="mr-2 text-sm">📅</span>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  toast.info(`Switched view to ${e.target.value}`);
                }}
                className="bg-transparent border-none text-gray-600 text-xs font-semibold outline-none cursor-pointer"
              />
            </div>
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
                if (inventory.length === 0) {
                  setShowNoProductsModal(true);
                  return;
                }
                setEditingSale(null);
                setCustomer("");
                setProduct(inventory[0]?.name || "");
                setRep(employees[0]?.name || "Arjun Kumar");
                setQuantity("");
                setPrice("");
                setStatus("Paid");
                setMethod("UPI");
                setShowModal(true);
              }}
              className="bg-emerald-600 text-gray-900 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 mr-1" /> Add New Sale
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <DailyStats sales={dailySales} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left Column */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
            <DailySalesTable 
              sales={dailySales} 
              onView={(sale) => setViewingSale(sale)}
              onEdit={(sale) => {
                setEditingSale(sale);
                setCustomer(sale.customer || "Walk-in");
                setRep(sale.rep || (employees[0]?.name || "Arjun Kumar"));
                setProduct(sale.product || "");
                setQuantity(sale.quantity || "");
                setPrice(sale.price || "");
                setStatus(sale.status || "Paid");
                setMethod(sale.method || "UPI");
                setShowModal(true);
              }}
              onDelete={handleDelete} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
              <RecentPayments sales={dailySales} />
              <PendingFollowUps sales={sales} />
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
            <TodaySalesSummaryChart sales={dailySales} />
            <PaymentMethodsChart sales={dailySales} />
            <TopExecutivesProgress sales={dailySales} employees={employees} />
          </div>
        </div>

      </main>

      {/* Add/Edit Sale Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="glass-modal relative w-full max-w-md p-5 max-h-[90vh] overflow-y-auto no-scrollbar animate-modalSlideIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingSale ? `Edit Sale: SAL-${String(editingSale.id).padStart(5, '0')}` : "Record New Sale"}
            </h3>
            
            <form onSubmit={handleAddSale} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-500 mb-1 text-xs">Customer Name</label>
                <input 
                  type="text" 
                  value={customer} 
                  onChange={(e) => setCustomer(e.target.value)} 
                  placeholder="e.g. Rajesh Enterprises" 
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1 text-xs">Sales Executive</label>
                  <select 
                    value={rep} 
                    onChange={(e) => setRep(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-xs">Product / Service</label>
                  <select 
                    value={product} 
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  >
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.name}>{inv.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1 text-xs">Quantity</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    placeholder="e.g. 2"
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
                    placeholder="e.g. 15000"
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1 text-xs">Payment Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-xs">Payment Method</label>
                  <select 
                    value={method} 
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingSale(null);
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-gray-900 rounded hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
                >
                  {editingSale ? "Save Changes" : "Save Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Sale Modal */}
      {viewingSale && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="glass-modal relative w-full max-w-md p-5 max-h-[90vh] overflow-y-auto no-scrollbar animate-modalSlideIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction Details</h3>
            
            <div className="space-y-4 text-xs text-gray-600">
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Transaction ID</span>
                <span className="text-gray-800 font-semibold">SAL-{String(viewingSale.id).padStart(5, '0')}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Customer Name</span>
                <span className="text-gray-800 font-semibold">{viewingSale.customer || 'Walk-in'}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Sales Executive</span>
                <span className="text-gray-800 font-semibold">{viewingSale.rep}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Product / Service</span>
                <span className="text-gray-800 font-semibold">{viewingSale.product}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Quantity</span>
                <span className="text-gray-800 font-semibold">{viewingSale.quantity}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Unit Price</span>
                <span className="text-gray-800 font-semibold">₹{(viewingSale.price || 0).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Total Bill</span>
                <span className="text-green-400 font-bold text-sm">₹{(viewingSale.total || 0).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Payment Status</span>
                <span className="text-gray-800 font-semibold">{viewingSale.status}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Payment Method</span>
                <span className="text-gray-800 font-semibold">{viewingSale.method}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Transaction Date</span>
                <span className="text-gray-800 font-semibold">
                  {viewingSale.date ? format(parseISO(viewingSale.date), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button 
                type="button" 
                onClick={() => setViewingSale(null)}
                className="px-4 py-2 bg-emerald-600 text-gray-900 rounded hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 text-xs font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ToastContainer {...toastConfig} />

      {showNoProductsModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="glass-modal relative w-full max-w-sm p-5 text-center max-h-[90vh] overflow-y-auto no-scrollbar animate-modalSlideIn">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Available</h3>
            <p className="text-gray-500 text-xs leading-relaxed mb-6">
              You must register at least one product in your inventory before you can record sales transactions.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowNoProductsModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-100 transition text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowNoProductsModal(false);
                  const user = JSON.parse(localStorage.getItem("user") || "{}");
                  navigate(user.role === "admin" ? "/admin/inventory" : "/inventory");
                }}
                className="px-4 py-2 bg-emerald-600 text-gray-900 rounded hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 text-xs font-semibold"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DailySales;



