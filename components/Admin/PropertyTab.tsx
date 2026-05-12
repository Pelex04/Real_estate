'use client';

import { useState } from 'react';
import { Edit, Trash2, MapPin, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/supabase';
import type { Property, PropertyImage } from '../../lib/supabase';

interface PropertiesTabProps {
  properties: Property[];
  images: PropertyImage[];
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function PropertiesTab({ properties, images, onEdit, onDelete, onRefresh }: PropertiesTabProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<'available' | 'sold' | 'rented'>('available');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const getPropertyImage = (propertyId: string) => {
    const imgs = images.filter((img) => img.property_id === propertyId);
    return (
      imgs.find((img) => img.is_primary)?.image_url ||
      imgs[0]?.image_url ||
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400'
    );
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === properties.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(properties.map((p) => p.id)));
    }
  };

  const handleBulkUpdate = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const ids = Array.from(selected);
    const { error } = await supabase
      .from('properties')
      .update({ status: bulkStatus, updated_at: new Date().toISOString() })
      .in('id', ids);
    setBulkLoading(false);
    if (error) {
      alert('Bulk update failed: ' + error.message);
    } else {
      setSelected(new Set());
      setBulkOpen(false);
      onRefresh();
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-400">No properties yet. Add your first listing!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Bulk toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition">
            {selected.size === properties.length && properties.length > 0
              ? <CheckSquare className="w-4 h-4 text-emerald-600" />
              : <Square className="w-4 h-4" />
            }
            {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
          </button>
        </div>

        {selected.size > 0 && (
          <div className="relative">
            <button
              onClick={() => setBulkOpen(!bulkOpen)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Bulk Update Status
              <ChevronDown className="w-4 h-4" />
            </button>

            {bulkOpen && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-10 p-4 w-56">
                <p className="text-xs text-gray-500 mb-2 font-medium">Set status for {selected.size} properties</p>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as typeof bulkStatus)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
                <button
                  onClick={handleBulkUpdate}
                  disabled={bulkLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                  {bulkLoading ? 'Updating...' : 'Apply'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Property list */}
      <div className="space-y-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className={`bg-white rounded-xl border transition shadow-sm overflow-hidden ${
              selected.has(property.id) ? 'border-emerald-400 ring-1 ring-emerald-400' : 'border-gray-100'
            }`}
          >
            <div className="flex">
              {/* Checkbox */}
              <div className="flex items-center px-4">
                <button onClick={() => toggleSelect(property.id)}>
                  {selected.has(property.id)
                    ? <CheckSquare className="w-5 h-5 text-emerald-600" />
                    : <Square className="w-5 h-5 text-gray-300 hover:text-gray-500" />
                  }
                </button>
              </div>

              {/* Thumbnail */}
              <div className="w-40 h-36 flex-shrink-0 hidden sm:block">
                <img
                  src={getPropertyImage(property.id)}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900 truncate">{property.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      property.status === 'available' ? 'bg-green-100 text-green-700' :
                      property.status === 'sold' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{property.status}</span>
                    {property.featured && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700">Featured</span>
                    )}
                  </div>

                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {property.location}, {property.city}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="capitalize">{property.type}</span>
                    <span className="capitalize">{property.category}</span>
                    {property.bedrooms > 0 && <span>{property.bedrooms} bed</span>}
                    {property.bathrooms > 0 && <span>{property.bathrooms} bath</span>}
                    <span>{property.area_sqm}m²</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">{formatPrice(property.price)}</div>
                    {property.type === 'rent' && <div className="text-xs text-gray-400">/month</div>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(property)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(property.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
