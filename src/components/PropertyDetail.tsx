import { X, Bed, Bath, Maximize, MapPin, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Property, PropertyImage } from '../lib/supabase';
import ContactForm from './ContactForm';

interface PropertyDetailProps {
  property: Property;
  images: PropertyImage[];
  onClose: () => void;
}

export default function PropertyDetail({ property, images, onClose }: PropertyDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.order_index - b.order_index;
  });

  const displayImages = sortedImages.length > 0
    ? sortedImages
    : [{ id: '1', property_id: property.id, image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: true, order_index: 0, created_at: '' }];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl">
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative h-96 bg-gray-900">
              <img
                src={displayImages[currentImageIndex].image_url}
                alt={property.title}
                className="w-full h-full object-cover"
              />

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                </>
              )}

              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                </span>
                {property.featured && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {displayImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      idx === currentImageIndex ? 'border-emerald-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={`${property.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{property.location}, {property.city}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-4xl font-bold text-emerald-600">{formatPrice(property.price)}</div>
                {property.type === 'rent' && <div className="text-gray-500 text-sm">per month</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-lg mb-8">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <Bed className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <Bath className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <Maximize className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{property.area_sqm}</div>
                  <div className="text-sm text-gray-600">m² Area</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <Tag className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 capitalize">{property.category}</div>
                  <div className="text-sm text-gray-600">Type</div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {property.latitude && property.longitude && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="bg-gray-200 rounded-lg overflow-hidden h-96">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div className="border-t pt-8">
              <button
                onClick={() => setShowContactForm(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-lg transition text-lg"
              >
                Contact Us About This Property
              </button>
            </div>
          </div>
        </div>
      </div>

      {showContactForm && (
        <ContactForm
          propertyId={property.id}
          propertyTitle={property.title}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  );
}
