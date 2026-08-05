// frontend/src/utils/excelUtils.js - Excel import/export utilities using SheetJS
import * as XLSX from 'xlsx';

/**
 * Export data to .xlsx file
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of { key, label } objects representing columns
 * @param {string} fileName - Output file name (without extension)
 */
export const exportToExcel = (data, headers, fileName) => {
  // Map data keys to headers
  const worksheetData = data.map(item => {
    const row = {};
    headers.forEach(h => {
      row[h.label] = item[h.key] !== undefined && item[h.key] !== null ? item[h.key] : '';
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Download a blank Excel template
 * @param {Array} headers - Array of { key, label } objects representing columns
 * @param {string} fileName - Template file name (without extension)
 */
export const downloadTemplate = (headers, fileName) => {
  const row = {};
  headers.forEach(h => {
    row[h.label] = '';
  });
  const worksheet = XLSX.utils.json_to_sheet([row]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, `${fileName}_template.xlsx`);
};

/**
 * Read Excel file and return data rows
 * @param {File} file - Excel file object
 * @param {Object} headersMap - Key-value pairs matching database keys to Excel column labels
 * @returns {Promise<Array>} - Resolves to array of rows mapped by keys
 */
export const importFromExcel = (file, headersMap) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet);

        if (rawJson.length === 0) {
          reject(new Error("The uploaded Excel file is empty."));
          return;
        }

        // Map sheet headers back to database keys
        const mappedData = rawJson.map(row => {
          const mappedRow = {};
          const rowKeys = Object.keys(row);
          Object.keys(headersMap).forEach(key => {
            const expectedLabel = String(headersMap[key]).toLowerCase().trim();
            const matchedKey = rowKeys.find(rk => String(rk).toLowerCase().trim() === expectedLabel);
            mappedRow[key] = matchedKey !== undefined && row[matchedKey] !== undefined && row[matchedKey] !== null ? row[matchedKey] : '';
          });
          return mappedRow;
        });

        resolve(mappedData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
