import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-purple-700 text-white py-4 px-6 flex justify-between items-center shadow-lg">
      <div className="text-lg font-bold hover:scale-105 transition-transform duration-300 ease-in-out">
        <Link to="/">SoulSite</Link>
      </div>
      <ul className="flex space-x-6">
        <li className="hover:text-gray-300 hover:scale-105 transition-transform duration-300 ease-in-out">
          <Link to="/numerology">Numerology</Link>
        </li>
        <li className="hover:text-gray-300 hover:scale-105 transition-transform duration-300 ease-in-out">
          <Link to="/tarot">Tarot</Link>
        </li>
        <li className="hover:text-gray-300 hover:scale-105 transition-transform duration-300 ease-in-out">
          <Link to="/chakra">Chakra</Link>
        </li>
        <li className="hover:text-gray-300 hover:scale-105 transition-transform duration-300 ease-in-out">
          <Link to="/journal">Shadow Work</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
