'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Property, PropertyImage } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import PropertyFilters, { type FilterState } from '../components/PropertyFilters';
import PropertyCard from '../components/PropertyCard';
import PropertyDetail from '../components/PropertyDetail';
import AdminLogin from '../components/Admin/AdminLogin';
import AdminDashboard from '../components/Admin/AdminDashboard';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import { Building2, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 9;

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<FilterState>({
    type: 'all', category: 'all', city: '', minPrice: '', maxPrice: '',
  });

  // ── Auth check ──────────────────────────────────────────────────────────────
  const checkAuth = useCallback(() => {
    try {
      const raw = localStorage.getItem('admin_session');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const hours = (Date.now() - new Date(parsed.loginTime).getTime()) / 3_600_000;
      if (hours < 24) setIsAuthenticated(true);
      else localStorage.removeItem('admin_session');
    } catch {
      localStorage.removeItem('admin_session');
    }
  }, []);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const [propsRes, imgsRes] = await Promise.all([
        supabase
          .from('properties')
          .select('*')
          .eq('status', 'available')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('property_images').select('*'),
      ]);
      if (propsRes.data) setProperties(propsRes.data);
      if (imgsRes.data) setImages(imgsRes.data);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    loadProperties();
  }, [checkAuth, loadProperties]);

  // Reset to page 1 when filters/search change
  useEffect(() => { setPage(1); }, [filters, searchQuery]);

  const getPropertyImages = (id: string) => images.filter((img) => img.property_id === id);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setIsAuthenticated(false);
    setShowAdmin(false);
  };

  const cities = [...new Set(properties.map((p) => p.city))].sort();

  const filteredProperties = properties.filter((p) => {
    if (filters.type !== 'all' && p.type !== filters.type) return false;
    if (filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.city && p.city !== filters.city) return false;
    if (filters.minPrice && p.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && p.price > parseFloat(filters.maxPrice)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const featured = filteredProperties.filter((p) => p.featured);
  const regular = filteredProperties.filter((p) => !p.featured);

  // Pagination on regular listings only
  const totalPages = Math.max(1, Math.ceil(regular.length / PAGE_SIZE));
  const paginatedRegular = regular.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onAdminClick={() => setShowAdmin(true)} />
      <Hero onSearch={setSearchQuery} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="properties">
          <PropertyFilters filters={filters} onFilterChange={setFilters} cities={cities} />

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
              <p className="mt-4 text-gray-500">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No properties match your search</p>
              <button
                onClick={() => { setFilters({ type: 'all', category: 'all', city: '', minPrice: '', maxPrice: '' }); setSearchQuery(''); }}
                className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Properties</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featured.map((p) => (
                      <PropertyCard key={p.id} property={p} images={getPropertyImages(p.id)} onClick={() => setSelectedProperty(p)} />
                    ))}
                  </div>
                </div>
              )}

              {/* All / paginated */}
              {regular.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {featured.length > 0 ? 'All Properties' : 'Available Properties'}
                    </h2>
                    <span className="text-sm text-gray-500">{regular.length} listing{regular.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {paginatedRegular.map((p) => (
                      <PropertyCard key={p.id} property={p} images={getPropertyImages(p.id)} onClick={() => setSelectedProperty(p)} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          onClick={() => setPage(n)}
                          className={`w-10 h-10 rounded-lg text-sm font-semibold transition ${
                            n === page
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {n}
                        </button>
                      ))}

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* About & Contact */}
        <div className="bg-gray-900 text-white py-16" id="about">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">About PrimeHomes Malawi</h2>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  PrimeHomes Malawi is your trusted partner in finding the perfect property. Whether
                  you&apos;re buying your dream home or finding a rental, we&apos;re here every step of the way.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  With deep roots in the Malawian real estate market, we curate quality properties
                  across major cities, ensuring value for every client.
                </p>
              </div>

              <div id="contact">
                <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <a href="tel:+265888414728" className="hover:text-emerald-400 transition">+265 888 414 728</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-emerald-400" />
                    <a href="mailto:info@primehomes.mw" className="hover:text-emerald-400 transition">info@primehomes.mw</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <span>Lilongwe, Malawi</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition font-medium"
                  >
                    Send a Message
                  </button>
                  <a
                    href="https://wa.me/265888414728?text=Hello%2C%20I%27m%20interested%20in%20a%20property%20on%20PrimeHomes%20Malawi"
                    target="_blank" rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition font-medium"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          images={getPropertyImages(selectedProperty.id)}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {showAdmin && (
        !isAuthenticated
          ? <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} onClose={() => setShowAdmin(false)} />
          : <AdminDashboard onClose={handleLogout} />
      )}

      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
    </div>
  );
}
