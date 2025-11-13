import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Property, PropertyImage, ContactInquiry } from '../../lib/supabase';
import PropertyForm from './PropertyForm';
import InquiriesTab from './InquiriesTab';
import PropertiesTab from './PropertyTab';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'inquiries'>('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  try {
    console.log('=== Starting Data Fetch ===');
    setLoading(true);
    setError(null);

    
    console.log('Testing Supabase connection...');
     
    const { error: testError } = await supabase
      .from('properties')
      .select('count');
    
    if (testError) {
      console.error('Supabase connection test failed:', testError);
      throw new Error(`Connection error: ${testError.message}`);
    }
    console.log('Supabase connection successful');

  
    console.log('Fetching properties...');
    const propertiesResult = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Properties result:', propertiesResult);
    console.log('Properties count:', propertiesResult.data?.length || 0);

    console.log('Fetching images...');
    const imagesResult = await supabase
      .from('property_images')
      .select('*');
    
    console.log('Images result:', imagesResult);
    console.log('Images count:', imagesResult.data?.length || 0);

   
    console.log('=== FETCHING INQUIRIES - DETAILED DEBUG ===');
    
   
    const { count, error: countError } = await supabase
      .from('contact_inquiries')
      .select('*', { count: 'exact', head: true });
    
    console.log('Inquiries count query result:', { count, error: countError });
    
    
    const inquiriesResult = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('=== INQUIRIES FETCH COMPLETE ===');
    console.log('Full inquiries result object:', inquiriesResult);
    console.log('Inquiries data:', inquiriesResult.data);
    console.log('Inquiries error:', inquiriesResult.error);
    console.log('Inquiries count:', inquiriesResult.data?.length || 0);
    console.log('Inquiries status code:', inquiriesResult.status);
    console.log('Inquiries status text:', inquiriesResult.statusText);
    
    
    if (inquiriesResult.data && inquiriesResult.data.length > 0) {
      console.log('Individual inquiries:');
      inquiriesResult.data.forEach((inquiry, index) => {
        console.log(`Inquiry ${index + 1}:`, inquiry);
      });
    } else {
      console.warn('⚠️ NO INQUIRIES FOUND IN DATABASE');
     
      const simpleCheck = await supabase
        .from('contact_inquiries')
        .select('*');
      
      console.log('Simple inquiry check (no ordering):', simpleCheck);
    }

  
    if (propertiesResult.error) {
      console.error('Properties fetch error:', propertiesResult.error);
      throw propertiesResult.error;
    }
    if (imagesResult.error) {
      console.error('Images fetch error:', imagesResult.error);
      throw imagesResult.error;
    }
    if (inquiriesResult.error) {
      console.error('❌ INQUIRIES FETCH ERROR:', inquiriesResult.error);
      console.error('Error details:', {
        message: inquiriesResult.error.message,
        details: inquiriesResult.error.details,
        hint: inquiriesResult.error.hint,
        code: inquiriesResult.error.code
      });
      throw inquiriesResult.error;
    }

   
    const propertiesData = propertiesResult.data || [];
    const imagesData = imagesResult.data || [];
    const inquiriesData = inquiriesResult.data || [];

    console.log('Setting state with:', {
      properties: propertiesData.length,
      images: imagesData.length,
      inquiries: inquiriesData.length
    });

    setProperties(propertiesData);
    setImages(imagesData);
    setInquiries(inquiriesData);

    console.log('=== Data Fetch Complete ===');
    console.log('Final state preview:', {
      propertiesCount: propertiesData.length,
      imagesCount: imagesData.length,
      inquiriesCount: inquiriesData.length
    });

 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("=== Error loading data ===");
    console.error("Error object:", error);
    console.error("Error message:", error?.message);
    console.error("Error details:", error?.details);
    console.error("Error hint:", error?.hint);
    console.error("Error code:", error?.code);
    
    const errorMessage = error?.message || 'Unknown error occurred';
    setError(errorMessage);
    alert(`Failed to load data: ${errorMessage}\n\nCheck console for details.`);
  } finally {
    setLoading(false);
    console.log('Loading complete');
  }
};

  const handlePropertySaved = () => {
    console.log('Property saved, reloading data...');
    setShowPropertyForm(false);
    setEditingProperty(null);
    loadData();
  };

  const handleEditProperty = (property: Property) => {
    console.log('Editing property:', property);
    setEditingProperty(property);
    setShowPropertyForm(true);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    console.log('Deleting property:', id);
    const { error } = await supabase.from('properties').delete().eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete: ${error.message}`);
    } else {
      console.log('Property deleted successfully');
      loadData();
    }
  };

  const handleInquiryStatusUpdate = async (id: string, status: string) => {
    console.log(`Updating inquiry ${id} to status: ${status}`);
    
    const { error } = await supabase
      .from('contact_inquiries')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Status update error:', error);
      alert(`Failed to update status: ${error.message}`);
    } else {
      console.log('Status updated successfully');
      loadData();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      <div className="min-h-screen">
        <div className="bg-white shadow-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setActiveTab('properties')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  activeTab === 'properties'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Properties ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  activeTab === 'inquiries'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inquiries ({inquiries.filter(i => i.status === 'new').length})
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Loading data from Supabase...</p>
            </div>
          ) : (
            <>
              {activeTab === 'properties' && (
                <>
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        setEditingProperty(null);
                        setShowPropertyForm(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Property
                    </button>
                  </div>

                  <PropertiesTab
                    properties={properties}
                    images={images}
                    onEdit={handleEditProperty}
                    onDelete={handleDeleteProperty}
                  />
                </>
              )}

              {activeTab === 'inquiries' && (
                <InquiriesTab
                  inquiries={inquiries}
                  properties={properties}
                  onStatusUpdate={handleInquiryStatusUpdate}
                />
              )}
            </>
          )}
        </div>
      </div>

      {showPropertyForm && (
        <PropertyForm
          property={editingProperty}
          onClose={() => {
            setShowPropertyForm(false);
            setEditingProperty(null);
          }}
          onSave={handlePropertySaved}
        />
      )}
    </div>
  );
}