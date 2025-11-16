import { Building2, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onAdminClick: () => void;
}

export default function Navbar({ onAdminClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to close menu when a link is clicked
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Handle admin click - close menu and trigger admin action
  const handleAdminClick = () => {
    setIsMenuOpen(false);
    onAdminClick();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Building2 className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">PrimeHomes</span>
            <span className="text-sm text-gray-500 hidden sm:inline">Malawi</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-emerald-600 transition">Home</a>
            <a href="#properties" className="text-gray-700 hover:text-emerald-600 transition">Properties</a>
            <a href="#about" className="text-gray-700 hover:text-emerald-600 transition">About</a>
            <a href="#contact" className="text-gray-700 hover:text-emerald-600 transition">Contact</a>
            <button
              onClick={onAdminClick}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Admin
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a 
              href="#" 
              className="block text-gray-700 hover:text-emerald-600 transition py-2"
              onClick={handleLinkClick}
            >
              Home
            </a>
            <a 
              href="#properties" 
              className="block text-gray-700 hover:text-emerald-600 transition py-2"
              onClick={handleLinkClick}
            >
              Properties
            </a>
            <a 
              href="#about" 
              className="block text-gray-700 hover:text-emerald-600 transition py-2"
              onClick={handleLinkClick}
            >
              About
            </a>
            <a 
              href="#contact" 
              className="block text-gray-700 hover:text-emerald-600 transition py-2"
              onClick={handleLinkClick}
            >
              Contact
            </a>
            <button
              onClick={handleAdminClick}
              className="w-full text-left bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Admin
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}