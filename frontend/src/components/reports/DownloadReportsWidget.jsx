import React from 'react';
import { FileSpreadsheet, FileText, FileJson, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import { exportToCSV } from '../common/ExportToCSV.jsx';

const DownloadReportsWidget = ({ sales = [] }) => {
  const handleCSV = () => {
    if (!sales || sales.length === 0) {
      toast.error("No sales data available to download");
      return;
    }
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
    exportToCSV(sales, salesHeaders, "sales_report");
  };

  const handleExcel = () => {
    if (!sales || sales.length === 0) {
      toast.error("No sales data available to download");
      return;
    }
    const headers = ['Product', 'Quantity', 'Price (INR)', 'Total (INR)', 'Customer', 'Sales Rep', 'Status', 'Payment Method', 'Date'];
    const rows = sales.map((s, idx) => [
      s.product,
      s.quantity,
      s.price,
      s.total,
      s.customer || 'Walk-in',
      s.rep || 'N/A',
      s.status || 'Paid',
      s.method || 'Cash',
      s.date ? new Date(s.date).toLocaleDateString() : 'N/A'
    ]);
    const content = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    const blob = new Blob([content], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${new Date().toISOString().split('T')[0]}.xls`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel sheet downloaded successfully!");
  };

  const handlePrintOrPDF = () => {
    if (!sales || sales.length === 0) {
      toast.error("No sales data available");
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow popups for this page.");
      return;
    }

    const tableRows = sales.map((s, idx) => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px;">SAL-${String(s.id || idx + 1).padStart(5, '0')}</td>
        <td style="padding: 8px;">${s.customer || 'Walk-in'}</td>
        <td style="padding: 8px;">${s.rep || 'N/A'}</td>
        <td style="padding: 8px;">${s.product}</td>
        <td style="padding: 8px; text-align: right;">${s.quantity}</td>
        <td style="padding: 8px; text-align: right;">₹${s.price.toLocaleString()}</td>
        <td style="padding: 8px; text-align: right;">₹${s.total.toLocaleString()}</td>
        <td style="padding: 8px; text-align: center;">
          <span style="padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; background-color: ${s.status === 'Paid' ? '#d1e7dd' : '#f8d7da'}; color: ${s.status === 'Paid' ? '#0f5132' : '#842029'};">
            ${s.status}
          </span>
        </td>
        <td style="padding: 8px;">${s.date ? new Date(s.date).toLocaleDateString() : 'N/A'}</td>
      </tr>
    `).join('');

    const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            body { font-family: sans-serif; color: #333; margin: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f4f5f7; border-bottom: 2px solid #ddd; padding: 10px; text-align: left; }
            h2 { margin-bottom: 5px; }
            p { margin: 5px 0; color: #666; }
          </style>
        </head>
        <body>
          <h2>Sales Transactions Report</h2>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Total Sales: ${sales.length}</p>
          <p>Total Revenue: <strong>₹${totalRevenue.toLocaleString()}</strong></p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Sales Rep</th>
                <th>Product</th>
                <th>Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
                <th style="text-align: center;">Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const buttons = [
    { icon: FileSpreadsheet, title: 'Excel', subtext: '.xlsx format', color: 'text-green-500', onClick: handleExcel },
    { icon: FileText, title: 'PDF', subtext: '.pdf format', color: 'text-red-500', onClick: handlePrintOrPDF },
    { icon: FileJson, title: 'CSV', subtext: '.csv format', color: 'text-green-400', onClick: handleCSV },
    { icon: Printer, title: 'Print', subtext: 'Print report', color: 'text-purple-500', onClick: handlePrintOrPDF },
  ];

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl mb-6">
      <h3 className="font-semibold text-gray-900 mb-1 text-sm">Download Reports</h3>
      <p className="text-[10px] text-gray-500 mb-4">Download your reports in different formats</p>
      
      <div className="grid grid-cols-2 gap-3">
        {buttons.map((b, i) => (
          <button 
            key={i} 
            onClick={b.onClick}
            className="flex items-center gap-3 p-3 bg-gray-100/50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-500 transition text-left"
          >
            <b.icon className={`w-5 h-5 ${b.color}`} />
            <div>
              <div className="text-sm font-semibold text-gray-200">{b.title}</div>
              <div className="text-[9px] text-gray-500">{b.subtext}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DownloadReportsWidget;



