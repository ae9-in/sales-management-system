import React from 'react';

const products = [
  { name: 'Dell Inspiron 15 Laptop', sold: '5 Nos' },
  { name: 'HP LaserJet Pro Printer', sold: '4 Nos' },
  { name: 'Antivirus Software', sold: '8 Licenses' },
  { name: 'Office Desk - Wooden', sold: '3 Nos' },
  { name: 'Wireless Headset', sold: '6 Nos' },
];

const TopSellingProducts = () => (
  <div className="space-y-3">
    {products.map((product, i) => (
      <div key={i} className="flex justify-between items-center text-xs">
        <div className="flex gap-3 w-2/3">
            <span className="text-gray-500 font-bold">{i + 1}</span>
            <span className="text-gray-600 truncate">{product.name}</span>
        </div>
        <span className="text-gray-200 font-semibold">{product.sold}</span>
      </div>
    ))}
  </div>
);

export default TopSellingProducts;




