import Link from 'next/link';
import { Building2, Zap } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center gap-6">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <span className="text-white font-semibold text-lg">PrimeHomes Malawi</span>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition">Home</a>
            <a href="#properties" className="hover:text-white transition">Properties</a>
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>

          {/* Divider */}
          <div className="w-full border-t border-gray-800" />

          {/* Copyright + Powered by */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 text-sm">
            <p>&copy; {year} PrimeHomes Malawi. All rights reserved.</p>

            <Link
              href="https://cheza-x-malawi.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-400 transition group"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500 group-hover:text-emerald-400" />
              <span>
                Powered by{' '}
                <span className="text-emerald-500 group-hover:text-emerald-400 font-medium">
                  Rasta Kadema
                </span>
              </span>
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
