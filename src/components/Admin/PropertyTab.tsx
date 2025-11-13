import { Edit, Trash2, MapPin } from 'lucide-react';
import type { Property, PropertyImage } from '../../lib/supabase';

interface PropertiesTabProps {
  properties: Property[];
  images: PropertyImage[];
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
}

export default function PropertiesTab({ properties, images, onEdit, onDelete }: PropertiesTabProps) {
  const getPropertyImage = (propertyId: string) => {
    const propertyImages = images.filter(img => img.property_id === propertyId);
    const primaryImage = propertyImages.find(img => img.is_primary);
    return primaryImage?.image_url || propertyImages[0]?.image_url || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No properties yet. Add your first property!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {properties.map((property) => (
        <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 h-48 md:h-auto">
              <img
                src={getPropertyImage(property.id)}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{property.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      property.status === 'available' ? 'bg-green-100 text-green-800' :
                      property.status === 'sold' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {property.status}
                    </span>
                    {property.featured && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.location}, {property.city}</span>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">{property.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="capitalize">{property.type}</span>
                    <span className="capitalize">{property.category}</span>
                    {property.bedrooms > 0 && <span>{property.bedrooms} beds</span>}
                    {property.bathrooms > 0 && <span>{property.bathrooms} baths</span>}
                    <span>{property.area_sqm} m²</span>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-emerald-600 mb-4">
                    {formatPrice(property.price)}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(property)}
                      className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(property.id)}
                      className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
