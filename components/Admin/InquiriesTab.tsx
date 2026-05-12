'use client';

import { Mail, Phone, MessageSquare, Calendar, Search, Filter, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ContactInquiry, Property } from '../../lib/supabase';

interface InquiriesTabProps {
  inquiries: ContactInquiry[];
  properties: Property[];
  onStatusUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

type StatusFilter = 'all' | 'new' | 'contacted' | 'closed';

export default function InquiriesTab({ inquiries, properties, onStatusUpdate, onDelete }: InquiriesTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getPropertyTitle = (propertyId?: string | null) => {
    if (!propertyId) return 'General Inquiry';
    return properties.find((p) => p.id === propertyId)?.title || 'Unknown Property';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date unknown';
    try {
      return new Date(dateString).toLocaleString('en-MW', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const normalized = inquiries.map((inq, index) => ({
    ...inq,
    id: inq.id ?? `temp-${index}`,
    status: inq.status ?? 'new',
    created_at: inq.created_at ?? new Date(0).toISOString(),
  }));

  const filtered = normalized
    .filter((inq) => {
      if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          inq.name?.toLowerCase().includes(q) ||
          inq.email?.toLowerCase().includes(q) ||
          inq.message?.toLowerCase().includes(q) ||
          getPropertyTitle(inq.property_id).toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const counts = {
    all: normalized.length,
    new: normalized.filter((i) => i.status === 'new').length,
    contacted: normalized.filter((i) => i.status === 'contacted').length,
    closed: normalized.filter((i) => i.status === 'closed').length,
  };

  const statusStyles: Record<string, string> = {
    new: 'bg-green-100 text-green-800',
    contacted: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-600',
  };

  const isTempId = (id: string) => id.startsWith('temp-');

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, message..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(['all', 'new', 'contacted', 'closed'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === s
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s} <span className="opacity-60">({counts[s]})</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Filter className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No inquiries match your filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {inquiry.name || 'Unknown'}
                    </h3>
                    {isTempId(inquiry.id) && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        Pending ID
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    Re: {getPropertyTitle(inquiry.property_id)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={inquiry.status}
                    onChange={(e) => {
                      if (!isTempId(inquiry.id)) onStatusUpdate(inquiry.id, e.target.value);
                    }}
                    disabled={isTempId(inquiry.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 cursor-pointer ${
                      statusStyles[inquiry.status] ?? 'bg-gray-100 text-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>

                  {/* Delete button */}
                  {confirmDeleteId === inquiry.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (!isTempId(inquiry.id)) onDelete(inquiry.id);
                          setConfirmDeleteId(null);
                        }}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg font-medium transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(inquiry.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${inquiry.email}`} className="hover:text-emerald-600 transition truncate">
                    {inquiry.email || '—'}
                  </a>
                </div>
                {inquiry.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${inquiry.phone}`} className="hover:text-emerald-600 transition">
                      {inquiry.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formatDate(inquiry.created_at)}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {inquiry.message || '—'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}