import { format, startOfMonth } from "date-fns";
import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../utils/toastConfig";
import { Calendar, Download, Filter } from "lucide-react";
import { fetchSales, fetchExpenses } from "../services/api";
import api from "../services/api";
import { exportToCSV } from "../components/common/ExportToCSV.jsx";

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
    exportToCSV(sales, salesHeaders, "sales_transactions_report");
  };

  if (loading) return <SkeletonPageFallback />;

  return (
    <div className="flex flex-col min-h-screen text-gray-100 transition-all duration-200 bg-gray-900 animate-fadeIn overflow-hidden">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Reports</h1>
            <p className="text-gray-400 text-sm">Analyze your sales data and generate insightful reports</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-700 transition">
              <Calendar className="w-4 h-4 mr-2" /> {format(startOfMonth(new Date()), "dd MMM yyyy")} - {format(new Date(), "dd MMM yyyy")}
            </button>
            <button 
              onClick={handleExport}
              className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-700 transition"
            >
              <Download className="w-4 h-4 mr-2" /> Export
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
              <Filter className="w-4 h-4 mr-1" /> Filters
            </button>
          </div>
        </div>

        {/* Top Stats Row */}
        <ReportsStats sales={sales} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          
          {/* Left Column (Main Data) */}
          <div className="col-span-1 xl:col-span-9 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <SalesOverviewChart sales={sales} />
                <SalesByCategoryChart sales={sales} />
            </div>
            
            <SecondaryStats sales={sales} />
            
            <ReportSummaryTable sales={sales} />
          </div>

          {/* Right Column */}
          <div className="col-span-1 xl:col-span-3 flex flex-col">
            <ReportShortcuts />
            <PaymentMethodChart sales={sales} />
            <DownloadReportsWidget sales={sales} />
          </div>

        </div>

      </main>
      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default Reports;
