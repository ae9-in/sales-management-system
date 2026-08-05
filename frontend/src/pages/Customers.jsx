import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { createPortal } from "react-dom";
import { toastConfig } from "../utils/toastConfig";
import { Calendar, Download, Upload, FileDown, Plus } from "lucide-react";
import { startOfMonth, format } from "date-fns";
import { fetchSales, fetchEmployees, fetchInventory } from "../services/api";
import api from "../services/api";
import { exportToExcel, downloadTemplate, importFromExcel } from "../utils/excelUtils";

const CUSTOMER_HEADERS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Customer Name" },
  { key: "phone", label: "Mobile" },
  { key: "email", label: "Email" },
  { key: "rep", label: "Sales Rep" },
  { key: "orders", label: "Total Orders" },
  { key: "spend", label: "Total Spend" },
  { key: "lastDate", label: "Last Purchase" },
  { key: "action", label: "Action" }
];

const CUSTOMER_HEADERS_MAP = {
  id: "ID",
  customerName: "Customer Name",
  phone: "Mobile",
  email: "Email",
  rep: "Sales Rep",
  orders: "Total Orders",
  spend: "Total Spend",
  lastDate: "Last Purchase",
  action: "Action",
  product: "Product",
  quantity: "Quantity",
  price: "Price",
  status: "Status",
  method: "Method"
};
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
        product: sale.product,
        phone: sale.phone || '',
        email: sale.email || ''
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

  const handleExportExcel = () => {
    if (customersList.length === 0) {
      toast.info("No customers data to export.");
      return;
    }
    const customerHeaders = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Customer Name' },
      { key: 'phone', label: 'Mobile' },
      { key: 'email', label: 'Email' },
      { key: 'rep', label: 'Sales Rep' },
      { key: 'orders', label: 'Total Orders' },
      { key: 'spend', label: 'Total Spend (₹)' },
      { key: 'lastDate', label: 'Last Purchase' },
      { key: 'action', label: 'Action' }
    ];
    const listToExport = customersList.map((cust, idx) => ({
      ...cust,
      id: idx + 1,
      action: 'View'
    }));
    exportToExcel(listToExport, customerHeaders, "customers_list");
    toast.success("Customers list exported to Excel!");
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(CUSTOMER_HEADERS, "customers");
    toast.info("Excel template downloaded!");
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (inventory.length === 0) {
      toast.error("Please register products first in Products / Services page before importing customers.");
      return;
    }

    const loadingToast = toast.loading("Parsing Excel file...");
    try {
      const rawRows = await importFromExcel(file, CUSTOMER_HEADERS_MAP);
      toast.update(loadingToast, { render: `Found ${rawRows.length} rows. Registering customers...`, type: "info", isLoading: true });

      let successCount = 0;
      let failCount = 0;
      let errorMsgs = [];

      for (const row of rawRows) {
        const customerNameVal = row.customerName || row.name || row.customer;
        if (!customerNameVal) {
          failCount++;
          errorMsgs.push(`Row ${successCount + failCount + 1}: Missing customer name.`);
          continue;
        }

        const productVal = row.product || (inventory[0]?.name || "");
        const productItem = inventory.find(inv => inv.name.toLowerCase() === String(productVal).trim().toLowerCase());
        if (!productItem) {
          failCount++;
          errorMsgs.push(`Row ${successCount + failCount + 1}: Product "${productVal}" not found in inventory.`);
          continue;
        }

        const qty = row.quantity ? parseFloat(row.quantity) : 1;
        if (qty > productItem.currentStock) {
          failCount++;
          errorMsgs.push(`Row ${successCount + failCount + 1}: Insufficient stock for "${productItem.name}".`);
          continue;
        }

        const priceVal = row.price ? parseFloat(row.price) : 0;

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
            customer: String(customerNameVal).trim(),
            rep: String(row.rep || (employees[0]?.name || "Arjun Kumar")).trim(),
            product: productItem.name,
            quantity: qty,
            price: priceVal,
            total: qty * priceVal,
            status: statusVal,
            method: methodVal,
            date: new Date().toISOString()
          });
          successCount++;
        } catch (err) {
          console.error("Failed to import customer transaction:", row, err);
          failCount++;
          errorMsgs.push(`Row ${successCount + failCount + 1}: Backend error (${err.response?.data?.message || err.message})`);
        }
      }

      loadData();
      if (failCount === 0) {
        toast.update(loadingToast, { render: `Successfully registered ${successCount} customers!`, type: "success", isLoading: false, autoClose: 2500 });
      } else {
        toast.update(loadingToast, { render: `Registered ${successCount} customers. Failed to import ${failCount} rows. Details: ${errorMsgs.slice(0, 2).join('; ')}`, type: "warning", isLoading: false, autoClose: 5000 });
      }
    } catch (err) {
      console.error("Excel import error:", err);
      toast.update(loadingToast, { render: `Import failed: ${err.message || "Invalid file format"}`, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      e.target.value = ""; // Clear file input
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-gray-900 transition-all duration-200 page-bg animate-fadeIn overflow-hidden">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Customers</h1>
            <p className="text-gray-500 text-sm">Manage all your customers and their purchase history</p>
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
                if (inventory.length === 0) {
                  toast.error("Please register products first in Products / Services page.");
                  return;
                }
                setProduct(inventory[0]?.name || "");
                setRep(employees[0]?.name || "Arjun Kumar");
                setShowModal(true);
              }}
              className="bg-emerald-600 text-gray-900 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
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
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="glass-modal relative w-full max-w-md p-5 max-h-[90vh] overflow-y-auto no-scrollbar animate-modalSlideIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Register Customer</h3>
            
            <form onSubmit={handleAddCustomerSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-500 mb-1 text-xs">Customer Name</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
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
                    placeholder="e.g. 1"
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
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-gray-900 rounded hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
                >
                  Register Customer
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

export default Customers;



