'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Bed, Bath, Maximize, MapPin, Tag,
  ChevronLeft, ChevronRight, Share2, MessageCircle, Phone,
} from 'lucide-react';
import type { Property, PropertyImage } from '../../../lib/supabase';
import { formatPrice } from '../../../lib/supabase';
import ContactForm from '../../../components/ContactForm';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface Props {
  property: Property;
  images: PropertyImage[];
}

export default function PropertyPageClient({ property, images }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState(false);

  const sorted = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.order_index - b.order_index;
  });

  const displayImages = sorted.length > 0
    ? sorted
    : [{ id: '1', property_id: property.id, image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: true, order_index: 0, created_at: '' }];

  const next = () => setCurrentIndex((p) => (p + 1) % displayImages.length);
  const prev = () => setCurrentIndex((p) => (p - 1 + displayImages.length) % displayImages.length);

  const whatsappNumber = '+265888414728';
  const whatsappMsg = encodeURIComponent(
    `Hi, I'm interested in: ${property.title} (${typeof window !== 'undefined' ? window.location.href : ''})`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappMsg}`;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onAdminClick={() => {}} />

      <main className="flex-1">
        {/* Back */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link href="/#properties" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to listings
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

            {/* Image gallery */}
            <div className="relative h-[28rem] bg-gray-900">
              <img
                src={displayImages[currentIndex].image_url}
                alt={property.title}
                className="w-full h-full object-cover"
              />

              {displayImages.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {displayImages.length}
                  </div>
                </>
              )}

              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                </span>
                {property.featured && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Featured</span>
                )}
              </div>

              <button onClick={handleShare} className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow transition">
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
              {copied && (
                <div className="absolute top-14 right-4 bg-gray-900 text-white text-xs px-3 py-1 rounded">
                  Link copied!
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50 border-b">
                {displayImages.map((img, idx) => (
                  <button key={img.id} onClick={() => setCurrentIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${idx === currentIndex ? 'border-emerald-600' : 'border-transparent'}`}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2 text-emerald-500" />
                    <span>{property.location}, {property.city}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-4xl font-bold text-emerald-600">{formatPrice(property.price)}</div>
                  {property.type === 'rent' && <div className="text-gray-500 text-sm">per month</div>}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-xl mb-8">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-3 rounded-lg"><Bed className="w-6 h-6 text-emerald-600" /></div>
                    <div><div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div><div className="text-sm text-gray-500">Bedrooms</div></div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-3 rounded-lg"><Bath className="w-6 h-6 text-emerald-600" /></div>
                    <div><div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div><div className="text-sm text-gray-500">Bathrooms</div></div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-3 rounded-lg"><Maximize className="w-6 h-6 text-emerald-600" /></div>
                  <div><div className="text-2xl font-bold text-gray-900">{property.area_sqm}</div><div className="text-sm text-gray-500">m² Area</div></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-3 rounded-lg"><Tag className="w-6 h-6 text-emerald-600" /></div>
                  <div><div className="text-lg font-bold text-gray-900 capitalize">{property.category}</div><div className="text-sm text-gray-500">Category</div></div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {/* Map */}
              {property.latitude && property.longitude && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                  <div className="rounded-xl overflow-hidden h-80">
                    <iframe
                      width="100%" height="100%"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="border-t pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition text-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href="tel:+265888414728"
                  className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-xl transition text-lg"
                >
                  <Phone className="w-5 h-5" />
                  Call Us
                </a>
                <button
                  onClick={() => setShowContact(true)}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition text-lg"
                >
                  Send Enquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showContact && (
        <ContactForm
          propertyId={property.id}
          propertyTitle={property.title}
          onClose={() => setShowContact(false)}
        />
      )}
    </div>
  );
}
