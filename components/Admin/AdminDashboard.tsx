'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, BarChart2, Home, MessageSquare, LogOut, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Property, PropertyImage, ContactInquiry } from '../../lib/supabase';
import PropertyForm from './PropertyForm';
import InquiriesTab from './InquiriesTab';
import PropertiesTab from './PropertyTab';
import AnalyticsTab from './AnalyticsTab';

interface AdminDashboardProps {
  onClose: () => void;
}

type Tab = 'properties' | 'inquiries' | 'analytics';

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [properties, setProperties] = useState<Property[]>([]);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      // Fetch each separately so one failure doesn't kill the rest
      const propertiesResult = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      const imagesResult = await supabase
        .from('property_images')
        .select('*');

      const inquiriesResult = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (propertiesResult.error) throw new Error(`Properties: ${propertiesResult.error.message}`);
      if (imagesResult.error) throw new Error(`Images: ${imagesResult.error.message}`);
      if (inquiriesResult.error) throw new Error(`Inquiries: ${inquiriesResult.error.message}`);

      setProperties(propertiesResult.data ?? []);
      setImages(imagesResult.data ?? []);
      setInquiries(inquiriesResult.data ?? []);
      setLastUpdated(new Date());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + auto-refresh every 30 seconds
  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handlePropertySaved = () => {
    setShowPropertyForm(false);
    setEditingProperty(null);
    loadData(true);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Delete this property permanently?')) return;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) alert('Delete failed: ' + error.message);
    else loadData(true);
  };

  const handleInquiryStatusUpdate = async (id: string, status: string) => {
    const { error } = await supabase.from('contact_inquiries').update({ status }).eq('id', id);
    if (error) alert('Update failed: ' + error.message);
    else loadData(true);
  };

  const newInquiryCount = inquiries.filter((i) => i.status === 'new').length;

  const tabs: { id: Tab; label: string; icon: typeof Home; badge?: number }[] = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'properties', label: 'Properties', icon: Home, badge: properties.length },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare, badge: newInquiryCount || undefined },
  ];

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-1.5 rounded-lg">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">PrimeHomes Admin</span>
              </div>

              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <span className="text-xs text-gray-400 hidden md:inline">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                <button
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  title="Refresh data"
                  className="p-2 text-gray-400 hover:text-emerald-600 transition disabled:opacity-40"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="pb-3">
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
                  <span><strong>Error:</strong> {error}</span>
                  <button onClick={() => loadData()} className="text-red-600 underline text-xs ml-4">Retry</button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 -mb-px">
              {tabs.map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                    activeTab === id
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {badge !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      activeTab === id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4" />
                <p className="text-gray-500">Loading dashboard...</p>
              </div>
            ) : (
              <>
                {activeTab === 'analytics' && (
                  <AnalyticsTab properties={properties} inquiries={inquiries} />
                )}

                {activeTab === 'properties' && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">All Properties</h2>
                      <button
                        onClick={() => { setEditingProperty(null); setShowPropertyForm(true); }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add Property
                      </button>
                    </div>
                    <PropertiesTab
                      properties={properties}
                      images={images}
                      onEdit={(p) => { setEditingProperty(p); setShowPropertyForm(true); }}
                      onDelete={handleDeleteProperty}
                      onRefresh={() => loadData(true)}
                    />
                  </>
                )}

                {activeTab === 'inquiries' && (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Inquiries</h2>
                    <InquiriesTab
                      inquiries={inquiries}
                      properties={properties}
                      onStatusUpdate={handleInquiryStatusUpdate}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showPropertyForm && (
        <PropertyForm
          property={editingProperty}
          onClose={() => { setShowPropertyForm(false); setEditingProperty(null); }}
          onSave={handlePropertySaved}
        />
      )}
    </div>
  );
}
