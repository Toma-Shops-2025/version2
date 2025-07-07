import React from 'react';

const Jobs = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Job Listings</h1>
      {/* Job listings will be displayed here */}
      <button className="bg-green-600 text-white px-4 py-2 rounded">Create New Job Listing</button>
      <div className="mt-8 text-gray-500">(Listings will appear here soon.)</div>
    </div>
  );
};

export default Jobs; 