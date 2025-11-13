import { Bed, Bath, Maximize, MapPin, Tag } from 'lucide-react';
import type { Property, PropertyImage } from '../lib/supabase';

interface PropertyCardProps {
  property: Property;
  images: PropertyImage[];
  onClick: () => void;
}

export default function PropertyCard({ property, images, onClick }: PropertyCardProps) {
  const primaryImage = images.find(img => img.is_primary) || images[0];
  const imageUrl = primaryImage?.image_url || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer group"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />
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

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{property.title}</h3>
          <span className="text-2xl font-bold text-emerald-600">{formatPrice(property.price)}</span>
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}, {property.city}</span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>

        <div className="flex items-center gap-4 text-gray-700 border-t pt-4">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            <span className="text-sm">{property.area_sqm} m²</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            <span className="text-sm capitalize">{property.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
