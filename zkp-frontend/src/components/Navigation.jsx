import React from 'react';

/**
 * Navigation component for the application
 * @param {Object} props - Component props
 * @param {string} props.activePage - The currently active page
 * @param {Function} props.setActivePage - Function to change the active page
 */
function Navigation({ activePage, setActivePage }) {
  const pages = [
    { id: 'pod-creator', label: 'Create POD' },
    { id: 'proof-generator', label: 'Create Proof' },
    { id: 'proof-verifier', label: 'Verify Proof' },
  ];

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Sky's POD Demo</div>
        
        <div className="flex space-x-4">
          {pages.map((page) => (
            <button
              key={page.id}
              className={`px-3 py-2 rounded ${
                activePage === page.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setActivePage(page.id)}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navigation; 