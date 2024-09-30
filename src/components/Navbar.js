import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Use Link from react-router-dom

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to control mobile menu toggle

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-purple-700 text-white py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-lg font-bold hover:scale-105 transition-transform duration-300 ease-in-out">
          <Link to="/">🌟 SoulSite</Link>
        </div>

        {/* Hamburger Menu Icon for Mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            {/* Hamburger Icon (3 horizontal lines) */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>

        {/* Desktop Menu Links */}
        <ul className="hidden md:flex space-x-6">
          <li className="hover:text-gray-300 hover:scale-105 transition-transform duration-300 ease-in-out">
            <Link to="/numerology">🔢 Numerology</Link>
          </li>
          <li className="hover:text-gray-300 hover:scale-105 transition-transform duration-300 ease-in-out">
            <Link to="/tarot">🔮 Tarot</Link>
          </li>
          <li className="hover:text-gray-300 hover:scale-105 transition-transform duration-300 ease-in-out">
            <Link to="/chakra">🧘 Chakra</Link>
          </li>
          <li className="hover:text-gray-300 hover:scale-105 transition-transform duration-300 ease-in-out">
            <Link to="/journal">📖 Shadow Work</Link>
          </li>
        </ul>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden mt-4 space-y-4 text-center">
          <li>
            <Link
              to="/numerology"
              className="block text-white hover:bg-purple-800 py-2"
              onClick={toggleMenu} // Close menu on link click
            >
              🔢 Numerology
            </Link>
          </li>
          <li>
            <Link
              to="/tarot"
              className="block text-white hover:bg-purple-800 py-2"
              onClick={toggleMenu}
            >
              🔮 Tarot
            </Link>
          </li>
          <li>
            <Link
              to="/chakra"
              className="block text-white hover:bg-purple-800 py-2"
              onClick={toggleMenu}
            >
              🧘 Chakra
            </Link>
          </li>
          <li>
            <Link
              to="/journal"
              className="block text-white hover:bg-purple-800 py-2"
              onClick={toggleMenu}
            >
              📖 Shadow Work
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
