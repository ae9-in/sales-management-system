import { format, startOfMonth, parseISO } from "date-fns";
import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../utils/toastConfig";
import { Calendar, Download, Filter, Plus } from "lucide-react";
import { fetchSales, fetchEmployees, fetchInventory } from "../services/api";
import api from "../services/api";
import DateFilter from "../components/forms/DateFilter";
import { getDateRange, filterDataByDate } from "../utils/dateUtils";

import SalesHistoryStats from "../components/sales-history/SalesHistoryStats";
import SalesHistoryTable from "../components/sales-history/SalesHistoryTable";
import SalesSummaryChart from "../components/sales-history/SalesSummaryChart";
import PaymentMethodBars from "../components/sales-history/PaymentMethodBars";
import TopExecutivesList from "../components/sales-history/TopExecutivesList";
import { SkeletonPageFallback } from "../components/common/Skeleton";

const getStatusColor = (status) => {
  if (status === 'Paid') return 'bg-green-500/20 text-green-400';
  if (status === 'Pending') return 'bg-orange-500/20 text-orange-400';
  return 'bg-emerald-500/20 text-emerald-600';
};

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleRecordSale = async (e) => {
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
          date: new Date(`${date}T12:00:00`).toISOString()
        });
        toast.success("Sale transaction updated successfully!");
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
          date: new Date(`${date}T12:00:00`).toISOString()
        });
        toast.success("Sale transaction recorded successfully!");
      }
      
      setShowModal(false);
      setCustomer("");
      setQuantity("");
      setPrice("");
      setEditingSale(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(editingSale ? "Failed to update sale." : "Failed to record sale.");
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

  const activeDateRange = dateFilter.isCustom ? dateFilter.customRange : getDateRange(dateFilter.range);
  const filteredSales = filterDataByDate(sales, activeDateRange, "date");

  return (
    <div className="flex flex-col min-h-screen text-gray-900 transition-all duration-200 bg-white animate-fadeIn overflow-hidden">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Sales History</h1>
            <p className="text-gray-500 text-sm">View and manage all your sales transactions.</p>
          </div>
          <div className="flex gap-3">
            <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
            <button 
              onClick={() => {
                if (inventory.length === 0) {
                  toast.error("Please add a product in Products / Services first!");
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
                setDate(new Date().toISOString().split('T')[0]);
                setShowModal(true);
              }}
              className="bg-emerald-600 text-gray-900 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 mr-1" /> Record Sale
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <SalesHistoryStats sales={filteredSales} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left Column */}
          <div className="col-span-1 lg:col-span-8 flex flex-col">
            <SalesHistoryTable 
              sales={filteredSales} 
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
              onDelete={handleDelete} 
            />
          </div>

          {/* Right Column */}
          <div className="col-span-1 lg:col-span-4 flex flex-col">
            <SalesSummaryChart sales={filteredSales} />
            <PaymentMethodBars sales={filteredSales} />
            <TopExecutivesList sales={filteredSales} employees={employees} />
          </div>
        </div>

      </main>

      {/* Record/Edit Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingSale ? `Edit Sale: SAL-${String(editingSale.id).padStart(5, '0')}` : "Record New Sale"}
            </h3>
            
            <form onSubmit={handleRecordSale} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-500 mb-1 text-xs">Customer Name</label>
                <input 
                  type="text" 
                  value={customer} 
                  onChange={(e) => setCustomer(e.target.value)} 
                  placeholder="e.g. Rajesh Enterprises" 
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-200 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1 text-xs">Sales Executive</label>
                  <select 
                    value={rep} 
                    onChange={(e) => setRep(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-200 outline-none focus:border-emerald-500"
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
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-200 outline-none focus:border-emerald-500"
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
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-200 outline-none focus:border-emerald-500"
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
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-200 outline-none focus:border-emerald-500"
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
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-200 outline-none focus:border-emerald-500"
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
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-200 outline-none focus:border-emerald-500"
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
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-200 outline-none focus:border-emerald-500"
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
                  {editingSale ? "Save Changes" : "Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Sale Modal */}
      {viewingSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction Details</h3>
            
            <div className="space-y-4 text-xs text-gray-600">
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Transaction ID</span>
                <span className="text-gray-200 font-semibold">SAL-{String(viewingSale.id).padStart(5, '0')}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Customer Name</span>
                <span className="text-gray-200 font-semibold">{viewingSale.customer || 'Walk-in'}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Sales Executive</span>
                <span className="text-gray-200 font-semibold">{viewingSale.rep}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Product / Service</span>
                <span className="text-gray-200 font-semibold">{viewingSale.product}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Quantity</span>
                <span className="text-gray-200 font-semibold">{viewingSale.quantity}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Unit Price</span>
                <span className="text-gray-200 font-semibold">₹{(viewingSale.price || 0).toLocaleString()}</span>
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
                <span className="text-gray-200 font-semibold">{viewingSale.method}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Transaction Date</span>
                <span className="text-gray-200 font-semibold">
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
        </div>
      )}

      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default SalesManagement;

