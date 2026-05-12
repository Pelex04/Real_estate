'use client';

import { TrendingUp, Eye, MessageSquare, Home, DollarSign } from 'lucide-react';
import type { Property, ContactInquiry } from '../../lib/supabase';
import { formatPrice } from '../../lib/supabase';

interface AnalyticsTabProps {
  properties: Property[];
  inquiries: ContactInquiry[];
}

export default function AnalyticsTab({ properties, inquiries }: AnalyticsTabProps) {
  const totalProperties = properties.length;
  const totalViews = 0; // view_count column not in schema yet
  const newInquiries = inquiries.filter((i) => i.status === 'new').length;
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);

  const topViewed: Property[] = []; // requires view_count column

  const inquiriesPerProperty = properties
    .map((p) => ({
      property: p,
      count: inquiries.filter((i) => i.property_id === p.id).length,
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const byType = {
    sale: properties.filter((p) => p.type === 'sale').length,
    rent: properties.filter((p) => p.type === 'rent').length,
  };

  const byCategory = ['house', 'apartment', 'land', 'commercial'].map((cat) => ({
    label: cat,
    count: properties.filter((p) => p.category === cat).length,
  }));

  const recentInquiries = [...inquiries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: totalProperties, icon: Home, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'New Inquiries', value: newInquiries, icon: MessageSquare, color: 'bg-amber-50 text-amber-600' },
          { label: 'Portfolio Value', value: formatPrice(totalValue), icon: DollarSign, color: 'bg-purple-50 text-purple-600', small: true },
        ].map(({ label, value, icon: Icon, color, small }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className={`inline-flex p-2 rounded-lg mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className={`font-bold text-gray-900 mb-1 ${small ? 'text-lg' : 'text-3xl'}`}>{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Most viewed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">Most Viewed Properties</h3>
          </div>
          {topViewed.length === 0 ? (
            <p className="text-gray-400 text-sm">No view data yet.</p>
          ) : (
            <div className="space-y-3">
              {topViewed.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.title}</div>
                    <div className="text-xs text-gray-500">{p.city}</div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold flex-shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                    —
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most inquired */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">Most Inquired Properties</h3>
          </div>
          {inquiriesPerProperty.length === 0 ? (
            <p className="text-gray-400 text-sm">No inquiries yet.</p>
          ) : (
            <div className="space-y-3">
              {inquiriesPerProperty.map(({ property: p, count }, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.title}</div>
                    <div className="text-xs text-gray-500">{p.city}</div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold flex-shrink-0">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Listing breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Listing Breakdown</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">By Type</p>
              <div className="flex gap-3">
                {[
                  { label: 'For Sale', count: byType.sale, color: 'bg-emerald-500' },
                  { label: 'For Rent', count: byType.rent, color: 'bg-blue-500' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                    <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-1`} />
                    <div className="text-xl font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">By Category</p>
              <div className="grid grid-cols-2 gap-2">
                {byCategory.map(({ label, count }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm capitalize text-gray-700">{label}</span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent inquiries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Inquiries</h3>
          {recentInquiries.length === 0 ? (
            <p className="text-gray-400 text-sm">No inquiries yet.</p>
          ) : (
            <div className="space-y-3">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{inq.name}</div>
                    <div className="text-xs text-gray-500 truncate">{inq.message}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                    inq.status === 'new' ? 'bg-green-100 text-green-700' :
                    inq.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {inq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
