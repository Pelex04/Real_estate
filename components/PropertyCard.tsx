'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, Tag, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import type { Property, PropertyImage } from '../lib/supabase';
import { formatPrice } from '../lib/supabase';

interface PropertyCardProps {
  property: Property;
  images: PropertyImage[];
  onClick: () => void;
}

export default function PropertyCard({ property, images, onClick }: PropertyCardProps) {
  const [imgIndex, setImgIndex] = useState(0);

  const sorted = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.order_index - b.order_index;
  });

  const displayImages = sorted.length > 0
    ? sorted
    : [{ id: '0', property_id: property.id, image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800', is_primary: true, order_index: 0, created_at: '' }];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((p) => (p - 1 + displayImages.length) % displayImages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((p) => (p + 1) % displayImages.length);
  };

  const whatsappNumber = '+265888414728';
  const whatsappMsg = encodeURIComponent(`Hi, I'm interested in: ${property.title} – https://primehomesmalawi.vercel.app/properties/${property.id}`);
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappMsg}`;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group flex flex-col">
      {/* Image */}
      <div className="relative h-56 overflow-hidden flex-shrink-0 cursor-pointer" onClick={onClick}>
        <img
          src={displayImages[imgIndex].image_url}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />

        {/* Carousel arrows */}
        {displayImages.length > 1 && (
          <>
            <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/75 hover:bg-white rounded-full p-1 shadow transition opacity-0 group-hover:opacity-100">
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/75 hover:bg-white rounded-full p-1 shadow transition opacity-0 group-hover:opacity-100">
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {displayImages.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
            {property.type === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
          {property.featured && (
            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">Featured</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1 gap-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 flex-1">{property.title}</h3>
          <span className="text-lg font-bold text-emerald-600 flex-shrink-0">{formatPrice(property.price)}</span>
        </div>

        <div className="flex items-center text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{property.location}, {property.city}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{property.description}</p>

        <div className="flex items-center gap-3 text-gray-600 border-t pt-3 mb-4">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /><span className="text-xs">{property.bedrooms} bed</span></div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /><span className="text-xs">{property.bathrooms} bath</span></div>
          )}
          <div className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /><span className="text-xs">{property.area_sqm}m²</span></div>
          <div className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /><span className="text-xs capitalize">{property.category}</span></div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-lg transition"
            onClick={(e) => e.stopPropagation()}
          >
            View Details
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
