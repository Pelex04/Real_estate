import { Mail, Phone, MessageSquare, Calendar } from 'lucide-react';
import type { ContactInquiry, Property } from '../../lib/supabase';
import { useEffect } from 'react';

interface InquiriesTabProps {
  inquiries: ContactInquiry[];
  properties: Property[];
  onStatusUpdate: (id: string, status: string) => void;
}

export default function InquiriesTab({ inquiries, properties, onStatusUpdate }: InquiriesTabProps) {
  // Debug logging
  useEffect(() => {
    console.log('=== InquiriesTab Debug Info ===');
    console.log('Inquiries received:', inquiries);
    console.log('Inquiries count:', inquiries?.length || 0);
    console.log('Properties received:', properties);
    console.log('Properties count:', properties?.length || 0);
    console.log('================================');
  }, [inquiries, properties]);

  const getPropertyTitle = (propertyId?: string | null) => {
    if (!propertyId) {
      console.log('No property ID provided for inquiry');
      return 'General Inquiry';
    }
    
    const property = properties.find(p => p.id === propertyId);
    
    if (!property) {
      console.warn(`Property not found for ID: ${propertyId}`);
      console.log('Available property IDs:', properties.map(p => p.id));
    }
    
    return property?.title || 'Unknown Property';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-MW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  const handleStatusUpdate = (id: string, status: string) => {
    console.log(`Updating inquiry ${id} to status: ${status}`);
    try {
      onStatusUpdate(id, status);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Check if inquiries is actually an array
  if (!Array.isArray(inquiries)) {
    console.error('Inquiries is not an array:', inquiries);
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <p className="text-red-600">Error: Invalid data format received</p>
      </div>
    );
  }

  if (inquiries.length === 0) {
    console.log('No inquiries to display');
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No inquiries yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {inquiries.map((inquiry) => {
        // Validate each inquiry
        if (!inquiry || !inquiry.id) {
          console.error('Invalid inquiry object:', inquiry);
          return null;
        }

        return (
          <div key={inquiry.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {inquiry.name || 'Unknown Name'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Re: {getPropertyTitle(inquiry.property_id)}
                </p>
              </div>

              <select
                value={inquiry.status || 'new'}
                onChange={(e) => handleStatusUpdate(inquiry.id, e.target.value)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold border-0 ${
                  inquiry.status === 'new' ? 'bg-green-100 text-green-800' :
                  inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${inquiry.email}`} className="hover:text-emerald-600">
                  {inquiry.email || 'No email provided'}
                </a>
              </div>

              {inquiry.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${inquiry.phone}`} className="hover:text-emerald-600">
                    {inquiry.phone}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(inquiry.created_at)}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                <p className="text-gray-700 whitespace-pre-line">
                  {inquiry.message || 'No message provided'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}