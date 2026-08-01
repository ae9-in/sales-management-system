import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../utils/toastConfig";
import { Calendar, Upload, Plus } from "lucide-react";
import { startOfMonth, format } from "date-fns";
import { fetchSales, fetchEmployees, fetchInventory } from "../services/api";
import api from "../services/api";
import { exportToCSV } from "../components/common/ExportToCSV.jsx";
import CustomersStats from "../components/customers/CustomersStats";
import CustomersTable from "../components/customers/CustomersTable";
import CustomerProfilePanel from "../components/customers/CustomerProfilePanel";
import { SkeletonPageFallback } from "../components/common/Skeleton";
import DateFilter from "../components/forms/DateFilter";
import { getDateRange, filterDataByDate } from "../utils/dateUtils";

const Customers = () => {
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [rep, setRep] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("0");
  const [status, setStatus] = useState("Paid");
  const [method, setMethod] = useState("UPI");

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
      
      // Select the first customer derived from sales history
      if (salesData.length > 0) {
        const uniqueNames = [...new Set(salesData.map(s => s.customer || "Walk-in"))];
        if (uniqueNames.length > 0 && !selectedCustomer) {
          setSelectedCustomer(uniqueNames[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !product || !quantity || !price) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const total = parseFloat(quantity) * parseFloat(price);
      await api.post("/sales", {
        customer: customerName,
        rep: rep || (employees[0]?.name || "Arjun Kumar"),
        product,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        total,
        status,
        method,
        date: new Date().toISOString()
      });

      toast.success("Customer registered and first transaction recorded!");
      setShowModal(false);
      setCustomerName("");
      setQuantity("1");
      setPrice("0");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to register customer.");
    }
  };

  if (loading) return <SkeletonPageFallback />;

  const activeDateRange = dateFilter.isCustom ? dateFilter.customRange : getDateRange(dateFilter.range);
  const filteredSales = filterDataByDate(sales, activeDateRange, "date");

  // Derive live customer records from `/api/sales` history
  const customerMap = filteredSales.reduce((acc, sale) => {
    const rawName = sale.customer || 'Walk-in';
    const normalizedKey = rawName.trim().toLowerCase();
    if (!acc[normalizedKey]) {
      acc[normalizedKey] = {
        name: rawName.trim(),
        orders: 0,
        spend: 0,
        lastDate: sale.date,
        rep: sale.rep || 'Arjun Kumar',
        product: sale.product
      };
    }
    acc[normalizedKey].orders += 1;
    acc[normalizedKey].spend += (sale.total || 0);
    if (new Date(sale.date) > new Date(acc[normalizedKey].lastDate)) {
      acc[normalizedKey].lastDate = sale.date;
      acc[normalizedKey].product = sale.product;
      acc[normalizedKey].name = rawName.trim();
    }
    return acc;
  }, {});

  const customersList = Object.values(customerMap);

  const handleExport = () => {
    const customerHeaders = [
      { key: 'name', label: 'Customer Name' },
      { key: 'orders', label: 'Total Orders' },
      { key: 'spend', label: 'Total Spend' },
      { key: 'rep', label: 'Sales Rep' },
      { key: 'lastDate', label: 'Last Purchase' }
    ];
    exportToCSV(customersList, customerHeaders, "customers_list");
  };

  return (
    <div className="flex flex-col min-h-screen text-gray-100 transition-all duration-200 bg-gray-900 animate-fadeIn overflow-hidden">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Customers</h1>
            <p className="text-gray-400 text-sm">Manage all your customers and their purchase history</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
            <button 
              onClick={handleExport}
              className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-700 transition"
            >
              <Upload className="w-4 h-4 mr-2" /> Export
            </button>
            <button 
              onClick={() => {
                if (inventory.length === 0) {
                  toast.error("Please register products first in Products / Services page.");
                  return;
                }
                setProduct(inventory[0]?.name || "");
                setRep(employees[0]?.name || "Arjun Kumar");
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Customer
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <CustomersStats customersList={customersList} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          {/* Left Column */}
          <div className="col-span-1 xl:col-span-9 flex flex-col">
            <CustomersTable 
              customersList={customersList} 
              onSelect={setSelectedCustomer} 
            />
          </div>

          {/* Right Column */}
          <div className="col-span-1 xl:col-span-3 flex flex-col">
            <CustomerProfilePanel customerName={selectedCustomer} sales={sales} />
          </div>
        </div>

      </main>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Register Customer</h3>
            
            <form onSubmit={handleAddCustomerSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1 text-xs">Customer Name</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="e.g. Rajesh Enterprises" 
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">Sales Executive</label>
                  <select 
                    value={rep} 
                    onChange={(e) => setRep(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">Product / Service</label>
                  <select 
                    value={product} 
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  >
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.name}>{inv.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">Quantity</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    placeholder="e.g. 1"
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
                    placeholder="e.g. 15000"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">Payment Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">Payment Method</label>
                  <select 
                    value={method} 
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
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
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                >
                  Register Customer
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

export default Customers;
