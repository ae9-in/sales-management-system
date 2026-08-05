import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../utils/toastConfig";
import { fetchSales, fetchEmployees, fetchInventory } from "../services/api";
import { format, parseISO } from "date-fns";
import api from "../services/api";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import StatCards from "../components/dashboard/StatCards";
import SalesOverviewChart from "../components/dashboard/SalesOverviewChart";
import TopProductsChart from "../components/dashboard/TopProductsChart";
import TopExecutivesList from "../components/dashboard/TopExecutivesList";
import RecentSalesList from "../components/dashboard/RecentSalesList";
import FollowUpsList from "../components/dashboard/FollowUpsList";
import DashboardSummary from "../components/dashboard/DashboardSummary";
import RecentSalesHistoryTable from "../components/dashboard/RecentSalesHistoryTable";
import SalesByDayChart from "../components/dashboard/SalesByDayChart";
import { SkeletonPageFallback } from "../components/common/Skeleton";

const getStatusColor = (status) => {
  if (status === 'Paid') return 'bg-green-500/20 text-green-400';
  if (status === 'Pending') return 'bg-orange-500/20 text-orange-400';
  return 'bg-emerald-500/20 text-emerald-600';
};

const Dashboard = () => {
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [viewingSale, setViewingSale] = useState(null);

  // Form fields
  const [customer, setCustomer] = useState("");
  const [rep, setRep] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Paid");
  const [method, setMethod] = useState("UPI");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportClick = async () => {
    if (!dashboardRef.current) return;
    try {
      setIsExporting(true);
      toast.info("Compiling dashboard widgets into PDF report...");

      // Small delay to let the toast render
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#111827" // match app gray-900 bg
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`dashboard-report-${selectedDate}.pdf`);
      toast.success("Dashboard report PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateSale = async (e) => {
    e.preventDefault();
    if (!customer || !product || !quantity || !price) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const total = parseFloat(quantity) * parseFloat(price);
      await api.put(`/sales/${editingSale.id}`, {
        customer,
        rep: rep || (employees[0]?.name || "Arjun Kumar"),
        product,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        total,
        status,
        method,
        date: (() => {
          const d = new Date(date);
          return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        })()
      });

      toast.success("Sale details updated successfully!");
      setShowModal(false);
      setEditingSale(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update sale.");
    }
  };

  const handleDeleteSale = async (id) => {
    try {
      await api.delete(`/sales/${id}`);
      toast.warning(`Deleted sales record: SAL-${String(id).padStart(5, '0')}`);
      loadData(); // Reload live data from database
    } catch (error) {
      console.error("Failed to delete sale:", error);
    }
  };

  if (loading) {
    return <SkeletonPageFallback />;
  }

  return (
    <div className="flex flex-col min-h-screen text-gray-900 transition-all duration-200 page-bg animate-fadeIn overflow-hidden">
      <main ref={dashboardRef} className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 text-sm">Here's what's happening with your sales today.</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="glass-card flex items-center px-3.5 py-2.5 gap-2 hover-lift cursor-pointer">
              <span className="text-sm">📅</span>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  toast.info(`Filtered dashboard data for ${e.target.value}`);
                }}
                className="bg-transparent border-none text-gray-600 text-xs font-semibold outline-none cursor-pointer"
              />
            </div>
            <button 
              onClick={handleExportClick}
              disabled={isExporting}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                isExporting 
                  ? "bg-emerald-500/60 text-white cursor-not-allowed" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {isExporting ? "Exporting…" : "Export Report"}
            </button>
          </div>
        </div>

        {/* Top Stats Row */}
        <StatCards sales={sales} employees={employees} selectedDate={selectedDate} />

        {/* First Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          <div className="col-span-1 lg:col-span-4">
            <SalesOverviewChart sales={sales} />
          </div>
          <div className="col-span-1 lg:col-span-4">
            <TopProductsChart sales={sales} />
          </div>
          <div className="col-span-1 lg:col-span-4">
            <TopExecutivesList sales={sales} employees={employees} />
          </div>
        </div>

        {/* Second Row (Lists & Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          <div className="col-span-1 lg:col-span-4">
            <RecentSalesList sales={sales} selectedDate={selectedDate} />
          </div>
          <div className="col-span-1 lg:col-span-4">
            <FollowUpsList sales={sales} />
          </div>
          <div className="col-span-1 lg:col-span-4">
            <DashboardSummary sales={sales} selectedDate={selectedDate} />
          </div>
        </div>

        {/* Third Row (Table & Bar Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          <RecentSalesHistoryTable 
            sales={sales} 
            employees={employees} 
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
              setDate(sale.date ? sale.date.split('T')[0] : new Date().toISOString().split('T')[0]);
              setShowModal(true);
            }}
            onDelete={handleDeleteSale} 
            selectedDate={selectedDate} 
          />
          <SalesByDayChart sales={sales} />
        </div>

      </main>

      {/* Edit Sale Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="glass-modal relative w-full max-w-md p-5 max-h-[90vh] overflow-y-auto no-scrollbar animate-modalSlideIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Edit Sale: SAL-{String(editingSale.id).padStart(5, '0')}
            </h3>
            
            <form onSubmit={handleUpdateSale} className="space-y-4 text-sm">
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

              <div>
                <label className="block text-gray-500 mb-1 text-xs">Sale Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  required
                />
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
                  Save Changes
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
                <span className={`px-2 py-0.5 rounded text-[10px] w-fit font-medium ${getStatusColor(viewingSale.status)}`}>
                  {viewingSale.status}
                </span>
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
    </div>
  );
};

export default Dashboard;



