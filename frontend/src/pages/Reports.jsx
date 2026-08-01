import { format, startOfMonth } from "date-fns";
import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../utils/toastConfig";
import { Calendar, Upload, Filter } from "lucide-react";
import { fetchSales, fetchExpenses } from "../services/api";
import api from "../services/api";
import { exportToCSV } from "../components/common/ExportToCSV.jsx";
import DateFilter from "../components/forms/DateFilter";
import Filters from "../components/forms/Filters";
import { getDateRange, filterDataByDate } from "../utils/dateUtils";

import ReportsStats from "../components/reports/ReportsStats";
import SalesOverviewChart from "../components/reports/SalesOverviewChart";
import SalesByCategoryChart from "../components/reports/SalesByCategoryChart";
import SecondaryStats from "../components/reports/SecondaryStats";
import ReportSummaryTable from "../components/reports/ReportSummaryTable";
import ReportShortcuts from "../components/reports/ReportShortcuts";
import PaymentMethodChart from "../components/reports/PaymentMethodChart";
import DownloadReportsWidget from "../components/reports/DownloadReportsWidget";
import { SkeletonPageFallback } from "../components/common/Skeleton";

const Reports = () => {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
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
  const [filters, setFilters] = useState({
    product: "All",
    quantityMin: "",
    quantityMax: "",
    priceMin: "",
    priceMax: "",
    dateFrom: "",
    dateTo: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [salesData, expensesData, res] = await Promise.all([
        fetchSales(),
        fetchExpenses(),
        api.get("/reports")
      ]);
      setSales(salesData);
      setExpenses(expensesData);
      setReportData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeDateRange = dateFilter.isCustom ? dateFilter.customRange : getDateRange(dateFilter.range);
  const salesFilteredByDate = filterDataByDate(sales, activeDateRange, "date");

  const getFilteredSales = () => {
    return salesFilteredByDate.filter(sale => {
      // Product filter
      if (filters.product && filters.product !== "All" && sale.product !== filters.product) {
        return false;
      }
      // Quantity filter
      if (filters.quantityMin && sale.quantity < parseFloat(filters.quantityMin)) {
        return false;
      }
      if (filters.quantityMax && sale.quantity > parseFloat(filters.quantityMax)) {
        return false;
      }
      // Price filter
      if (filters.priceMin && sale.price < parseFloat(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && sale.price > parseFloat(filters.priceMax)) {
        return false;
      }
      // Date From filter
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (new Date(sale.date) < fromDate) return false;
      }
      // Date To filter
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (new Date(sale.date) > toDate) return false;
      }
      return true;
    });
  };

  const filteredSalesForDisplay = getFilteredSales();

  const handleExport = () => {
    const salesHeaders = [
      { key: 'product', label: 'Product' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'price', label: 'Price (₹)' },
      { key: 'total', label: 'Total (₹)' },
      { key: 'customer', label: 'Customer' },
      { key: 'rep', label: 'Sales Rep' },
      { key: 'status', label: 'Status' },
      { key: 'method', label: 'Method' },
      { key: 'date', label: 'Date' }
    ];
    exportToCSV(filteredSalesForDisplay, salesHeaders, "sales_transactions_report");
  };

  if (loading) return <SkeletonPageFallback />;

  return (
    <div className="flex flex-col min-h-screen text-gray-900 transition-all duration-200 bg-white animate-fadeIn overflow-hidden">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Reports</h1>
            <p className="text-gray-500 text-sm">Analyze your sales data and generate insightful reports</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
            <button 
              onClick={handleExport}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-100 transition"
            >
              <Upload className="w-4 h-4 mr-2" /> Export
            </button>
            <button 
              onClick={() => setShowFilters(true)}
              className="bg-emerald-600 text-gray-900 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
            >
              <Filter className="w-4 h-4 mr-1" /> Filters
            </button>
          </div>
        </div>

        {/* Top Stats Row */}
        <ReportsStats sales={filteredSalesForDisplay} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          
          {/* Left Column (Main Data) */}
          <div className="col-span-1 xl:col-span-9 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <SalesOverviewChart sales={filteredSalesForDisplay} />
                <SalesByCategoryChart sales={filteredSalesForDisplay} />
            </div>
            
            <SecondaryStats sales={filteredSalesForDisplay} />
            
            <ReportSummaryTable sales={filteredSalesForDisplay} />
          </div>

          {/* Right Column */}
          <div className="col-span-1 xl:col-span-3 flex flex-col">
            <ReportShortcuts />
            <PaymentMethodChart sales={filteredSalesForDisplay} />
            <DownloadReportsWidget sales={filteredSalesForDisplay} />
          </div>

        </div>

      </main>

      <Filters 
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        handleFilterChange={(e) => {
          const { name, value } = e.target;
          setFilters(prev => ({ ...prev, [name]: value }));
        }}
        resetFilters={() => {
          setFilters({
            product: "All",
            quantityMin: "",
            quantityMax: "",
            priceMin: "",
            priceMax: "",
            dateFrom: "",
            dateTo: "",
          });
          toast.info("Filters reset");
        }}
        applyFilters={() => {
          toast.success("Filters applied!");
        }}
        fields={[
          { name: "product", label: "Product", type: "select", options: ["All", ...new Set(sales.map(s => s.product))] },
          { name: "quantity", label: "Quantity Range", type: "range" },
          { name: "price", label: "Price Range", type: "range" },
          { name: "dateFrom", label: "From Date", type: "date" },
          { name: "dateTo", label: "To Date", type: "date" },
        ]}
        title="Filter Reports"
      />

      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default Reports;

