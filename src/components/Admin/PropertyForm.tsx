import { X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Property, PropertyImage } from '../../lib/supabase';

interface PropertyFormProps {
  property: Property | null;
  onClose: () => void;
  onSave: () => void;
}

export default function PropertyForm({ property, onClose, onSave }: PropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);

  useEffect(() => {
    if (property) {
      loadImages();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property]);

  const loadImages = async () => {
    if (!property) return;

    const { data } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', property.id)
      .order('order_index');

    if (data) {
      setExistingImages(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  const formData = new FormData(e.currentTarget);
  const data = {
    title: (formData.get('title') as string).trim(),
    description: (formData.get('description') as string).trim(),
    price: parseFloat(formData.get('price') as string),
    type: (formData.get('type') as string).toLowerCase(),
    category: (formData.get('category') as string).toLowerCase(),
    bedrooms: parseInt(formData.get('bedrooms') as string) || 0,
    bathrooms: parseInt(formData.get('bathrooms') as string) || 0,
    area_sqm: parseFloat(formData.get('area_sqm') as string),
    location: (formData.get('location') as string).trim(),
    city: (formData.get('city') as string).trim(),
    latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
    longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
    featured: formData.get('featured') === 'on',
    status: (formData.get('status') as string).toLowerCase(),
    updated_at: new Date().toISOString(),
  };

  // Validate required fields
  if (!data.title || !data.description || isNaN(data.price) || isNaN(data.area_sqm) || !data.type || !data.category) {
    setError('Please fill in all required fields correctly');
    setLoading(false);
    return;
  }

  try {
    let propertyId = property?.id;

    if (property) {
      const { error: updateError } = await supabase.from('properties').update(data).eq('id', property.id);
      if (updateError) throw updateError;
    } else {
      const { data: newProperty, error: insertError } = await supabase.from('properties').insert([data]).select().single();
      if (insertError || !newProperty) throw insertError;
      propertyId = newProperty.id;
    }

    if (images.length > 0 && propertyId) {
      const imageRecords = images.map((url, idx) => ({
        property_id: propertyId,
        image_url: url,
        is_primary: idx === 0,
        order_index: idx,
      }));
      const { error: imgError } = await supabase.from('property_images').insert(imageRecords);
      if (imgError) console.error('Image insert error:', imgError);
    }

    onSave();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Supabase error:', err);
    setError('Failed to save property: ' + (err.message || 'Unknown error'));
  } finally {
    setLoading(false);
  }
};


  const addImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setImages([...images, url]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;

    const { error } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId);

    if (!error) {
      setExistingImages(existingImages.filter(img => img.id !== imageId));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {property ? 'Edit Property' : 'Add New Property'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={property?.title}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  defaultValue={property?.description}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (MWK) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  step="0.01"
                  defaultValue={property?.price}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  name="type"
                  required
                  defaultValue={property?.type || 'sale'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  required
                  defaultValue={property?.category || 'house'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select
                  name="status"
                  required
                  defaultValue={property?.status || 'available'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  min="0"
                  defaultValue={property?.bedrooms || 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  min="0"
                  defaultValue={property?.bathrooms || 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area (m²) *</label>
                <input
                  type="number"
                  name="area_sqm"
                  required
                  step="0.01"
                  defaultValue={property?.area_sqm}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  defaultValue={property?.city}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location/Address *</label>
                <input
                  type="text"
                  name="location"
                  required
                  defaultValue={property?.location}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  step="0.000001"
                  defaultValue={property?.latitude || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="-13.9626"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  step="0.000001"
                  defaultValue={property?.longitude || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="33.7741"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={property?.featured}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Property</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>

              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Existing Images:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img src={img.image_url} alt="" className="w-full h-20 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {img.is_primary && (
                          <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">New Images:</p>
                  <div className="space-y-2">
                    {images.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={url}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={addImageUrl}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Image URL
              </button>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Property'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
