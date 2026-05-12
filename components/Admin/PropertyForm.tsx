'use client';

import { X, Plus, Trash2, Upload, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { Property, PropertyImage } from '../../lib/supabase';

interface PropertyFormProps {
  property: Property | null;
  onClose: () => void;
  onSave: () => void;
}

type NewImage = { url: string; file?: File; preview?: string };

export default function PropertyForm({ property, onClose, onSave }: PropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (property) loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property]);

  const loadImages = async () => {
    if (!property) return;
    const { data } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', property.id)
      .order('order_index');
    if (data) setExistingImages(data);
  };

  // Upload a single file to Supabase Storage
  const uploadFile = async (file: File, propertyId: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `properties/${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('property-images').upload(path, file, { upsert: false });
    if (error) { console.error('Upload error:', error); return null; }
    const { data } = supabase.storage.from('property-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const previews: NewImage[] = files.map((file) => ({
      url: '',
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...previews]);
    e.target.value = '';
  };

  const addUrlImage = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch { setError('Invalid URL'); return; }
    setNewImages((prev) => [...prev, { url: trimmed }]);
    setUrlInput('');
    setError('');
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const img = prev[index];
      if (img.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;
    await supabase.from('property_images').delete().eq('id', imageId);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
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
      type: formData.get('type') as string,
      category: formData.get('category') as string,
      bedrooms: parseInt(formData.get('bedrooms') as string) || 0,
      bathrooms: parseInt(formData.get('bathrooms') as string) || 0,
      area_sqm: parseFloat(formData.get('area_sqm') as string),
      location: (formData.get('location') as string).trim(),
      city: (formData.get('city') as string).trim(),
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
      featured: formData.get('featured') === 'on',
      status: formData.get('status') as string,
      whatsapp: null,
      updated_at: new Date().toISOString(),
    };

    if (!data.title || !data.description || isNaN(data.price) || isNaN(data.area_sqm)) {
      setError('Please fill in all required fields correctly.');
      setLoading(false);
      return;
    }

    try {
      let propertyId = property?.id;

      if (property) {
        const { error: updateError } = await supabase.from('properties').update(data).eq('id', property.id);
        if (updateError) throw updateError;
      } else {
        const { data: newProp, error: insertError } = await supabase
          .from('properties')
          .insert([{ ...data, created_at: new Date().toISOString() }])
          .select()
          .single();
        if (insertError || !newProp) throw insertError;
        propertyId = newProp.id;
      }

      if (!propertyId) throw new Error('No property ID');

      // Upload files & save images
      if (newImages.length > 0) {
        setUploading(true);
        const existingCount = existingImages.length;
        const imageRecords: { property_id: string; image_url: string; is_primary: boolean; order_index: number }[] = [];

        for (let i = 0; i < newImages.length; i++) {
          const img = newImages[i];
          let url = img.url;

          if (img.file) {
            const uploaded = await uploadFile(img.file, propertyId);
            if (!uploaded) continue;
            url = uploaded;
          }

          if (!url) continue;
          imageRecords.push({
            property_id: propertyId,
            image_url: url,
            is_primary: existingCount === 0 && i === 0,
            order_index: existingCount + i,
          });
        }

        if (imageRecords.length > 0) {
          await supabase.from('property_images').insert(imageRecords);
        }
        setUploading(false);
      }

      onSave();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError('Failed to save: ' + (err?.message ?? 'Unknown error'));
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {property ? 'Edit Property' : 'Add New Property'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelCls}>Title *</label>
                <input type="text" name="title" required defaultValue={property?.title} className={inputCls} placeholder="e.g. Modern 4-Bedroom House in Area 49" />
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>Description *</label>
                <textarea name="description" required rows={4} defaultValue={property?.description} className={inputCls} placeholder="Describe the property in detail..." />
              </div>

              <div>
                <label className={labelCls}>Price (MWK) *</label>
                <input type="number" name="price" required step="0.01" min="0" defaultValue={property?.price} className={inputCls} placeholder="e.g. 50000000" />
              </div>

              <div>
                <label className={labelCls}>Type *</label>
                <select name="type" required defaultValue={property?.type ?? 'sale'} className={inputCls}>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Category *</label>
                <select name="category" required defaultValue={property?.category ?? 'house'} className={inputCls}>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Status *</label>
                <select name="status" required defaultValue={property?.status ?? 'available'} className={inputCls}>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Bedrooms</label>
                <input type="number" name="bedrooms" min="0" defaultValue={property?.bedrooms ?? 0} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Bathrooms</label>
                <input type="number" name="bathrooms" min="0" defaultValue={property?.bathrooms ?? 0} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Area (m²) *</label>
                <input type="number" name="area_sqm" required step="0.01" min="0" defaultValue={property?.area_sqm} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>City *</label>
                <input type="text" name="city" required defaultValue={property?.city} className={inputCls} placeholder="e.g. Lilongwe" />
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>Location / Address *</label>
                <input type="text" name="location" required defaultValue={property?.location} className={inputCls} placeholder="e.g. Area 49, near Shoprite" />
              </div>

              <div>
                <label className={labelCls}>Latitude</label>
                <input type="number" name="latitude" step="0.000001" defaultValue={property?.latitude ?? ''} className={inputCls} placeholder="-13.9626" />
              </div>

              <div>
                <label className={labelCls}>Longitude</label>
                <input type="number" name="longitude" step="0.000001" defaultValue={property?.longitude ?? ''} className={inputCls} placeholder="33.7741" />
              </div>

              <div className="flex items-center gap-3 self-end pb-2.5">
                <input type="checkbox" name="featured" id="featured" defaultChecked={property?.featured} className="w-4 h-4 text-emerald-600 rounded" />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">Mark as Featured</label>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className={labelCls}>Images</label>

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Current images</p>
                  <div className="grid grid-cols-4 gap-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group aspect-square">
                        <img src={img.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                        {img.is_primary && (
                          <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded">Primary</span>
                        )}
                        <button type="button" onClick={() => removeExistingImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New images preview */}
              {newImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">New images to upload</p>
                  <div className="grid grid-cols-4 gap-2">
                    {newImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={img.preview ?? img.url}
                          alt=""
                          className="w-full h-full object-cover rounded-lg border-2 border-dashed border-emerald-300"
                        />
                        {img.file && (
                          <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">Upload</span>
                        )}
                        <button type="button" onClick={() => removeNewImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add image controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium transition">
                  <Upload className="w-4 h-4" />
                  Upload Files
                </button>

                <div className="flex flex-1 gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrlImage())}
                    placeholder="Or paste image URL..."
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button type="button" onClick={addUrlImage}
                    className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-lg text-sm font-medium transition">
                    <LinkIcon className="w-4 h-4" />
                    Add URL
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">First image will be set as primary. Supported: JPG, PNG, WebP.</p>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={loading || uploading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50">
                {uploading ? 'Uploading images...' : loading ? 'Saving...' : property ? 'Save Changes' : 'Add Property'}
              </button>
              <button type="button" onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
