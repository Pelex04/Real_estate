import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase.ts';
import type { Property, PropertyImage } from './lib/supabase.ts';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import PropertyFilters, { type FilterState } from './components/PropertyFilters.tsx';
import PropertyCard from './components/PropertyCard.tsx';
import PropertyDetail from './components/PropertyDetail.tsx';
import AdminLogin from './components/Admin/AdminLogin.tsx';
import AdminDashboard from './components/Admin/AdminDashboard.tsx';
import ContactForm from './components/ContactForm.tsx';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    category: 'all',
    city: '',
    minPrice: '',
    maxPrice: '',
  });

  
  const checkAdminSession = useCallback(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) return;

    try {
      const parsed = JSON.parse(session);
      const loginTime = new Date(parsed.loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        
        setTimeout(() => {
          setIsAuthenticated(true);
          console.log('Admin session restored:', parsed.email);
        }, 0);
      } else {
        localStorage.removeItem('admin_session');
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error('Invalid session data:', e);
      localStorage.removeItem('admin_session');
      setIsAuthenticated(false);
    }
  }, []);

 
  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const [propertiesResult, imagesResult] = await Promise.all([
        supabase
          .from('properties')
          .select('*')
          .eq('status', 'available')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('property_images').select('*'),
      ]);

      if (propertiesResult.data) setProperties(propertiesResult.data);
      if (imagesResult.data) setImages(imagesResult.data);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    checkAdminSession();
    loadProperties();
  }, [checkAdminSession, loadProperties]);

 
  const getPropertyImages = (propertyId: string) =>
    images.filter((img) => img.property_id === propertyId);

  const handleAdminClick = () => setShowAdmin(true);
  const handleAdminClose = () => setShowAdmin(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    console.log('Login successful, authenticated:', true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setIsAuthenticated(false);
    setShowAdmin(false);
    console.log('Logged out successfully');
  };

  const cities = [...new Set(properties.map((p) => p.city))].sort();

  const filteredProperties = properties.filter((property) => {
    if (filters.type !== 'all' && property.type !== filters.type) return false;
    if (filters.category !== 'all' && property.category !== filters.category) return false;
    if (filters.city && property.city !== filters.city) return false;
    if (filters.minPrice && property.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && property.price > parseFloat(filters.maxPrice)) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        property.title.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.city.toLowerCase().includes(query) ||
        property.category.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const featuredProperties = filteredProperties.filter((p) => p.featured).slice(0, 3);
  const regularProperties = filteredProperties.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onAdminClick={handleAdminClick} />
      <Hero onSearch={setSearchQuery} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="properties">
        <PropertyFilters filters={filters} onFilterChange={setFilters} cities={cities} />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No properties found matching your criteria
            </p>
            <button
              onClick={() => {
                setFilters({
                  type: 'all',
                  category: 'all',
                  city: '',
                  minPrice: '',
                  maxPrice: '',
                });
                setSearchQuery('');
              }}
              className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {featuredProperties.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Featured Properties
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      images={getPropertyImages(property.id)}
                      onClick={() => setSelectedProperty(property)}
                    />
                  ))}
                </div>
              </div>
            )}

            {regularProperties.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {featuredProperties.length > 0
                    ? 'All Properties'
                    : 'Available Properties'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      images={getPropertyImages(property.id)}
                      onClick={() => setSelectedProperty(property)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* About & Contact Section */}
      <div className="bg-gray-900 text-white py-16" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">About PrimeHomes Malawi</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                PrimeHomes Malawi is your trusted partner in finding the perfect
                property in Malawi. Whether you're looking to buy your dream home
                or find the ideal rental property, we're here to help you every
                step of the way.
              </p>
              <p className="text-gray-300 leading-relaxed">
                With years of experience in the Malawian real estate market, we
                offer a carefully curated selection of properties across major
                cities, ensuring quality and value for our clients.
              </p>
            </div>

            <div id="contact">
              <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <span>+265 888 414 728</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <span>info@primehomes.mw</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <span>Lilongwe, Malawi</span>
                </div>
              </div>
              <button
                onClick={() => setShowContactForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition"
              >
                Send us a message
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-950 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>
            &copy; {new Date().getFullYear()} PrimeHomes Malawi. All rights
            reserved.
          </p>
        </div>
      </footer>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          images={getPropertyImages(selectedProperty.id)}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* Admin Login/Dashboard */}
      {showAdmin && (
        <>
          {!isAuthenticated ? (
            <AdminLogin
              onLoginSuccess={handleLoginSuccess}
              onClose={handleAdminClose}
            />
          ) : (
            <AdminDashboard onClose={handleLogout} />
          )}
        </>
      )}

      {/* Contact Form Modal */}
      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
    </div>
  );
}

export default App;
