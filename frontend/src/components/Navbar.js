import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            📋 Gestionnaire de Tâches
          </h1>
          <div className="text-sm">
            Application React + Django
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;