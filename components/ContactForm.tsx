'use client';

import { X, CheckCircle, AlertCircle, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ContactFormProps {
  propertyId?: string;
  propertyTitle?: string;
  onClose: () => void;
}

type Field = 'name' | 'email' | 'phone' | 'message';

function FieldError({ show, message }: { show: boolean; message?: string }) {
  if (!show || !message) return null;
  return <p className="text-xs text-red-500 mt-1.5 pl-1">{message}</p>;
}

export default function ContactForm({ propertyId, propertyTitle, onClose }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [values, setValues] = useState({ name: '', email: '', phone: '', message: '' });
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const validate = () => {
    const errs: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) errs.name = 'Full name is required';
    if (!values.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = 'Enter a valid email';
    if (!values.message.trim()) errs.message = 'Please include a message';
    return errs;
  };

  const fieldErrors = validate();
  const isValid = Object.keys(fieldErrors).length === 0;

  const handleBlur = (field: Field) => setTouched((t) => ({ ...t, [field]: true }));
  const handleChange = (field: Field, value: string) => setValues((v) => ({ ...v, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true });
    if (!isValid) return;

    setLoading(true);
    setError('');

    const { error: submitError } = await supabase.from('contact_inquiries').insert([{
      property_id: propertyId ?? null,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || null,
      message: values.message.trim(),
    }]);

    setLoading(false);

    if (submitError) {
      setError('Something went wrong. Please try again or contact us directly.');
      return;
    }

    setSuccess(true);
  };

  const inputBase = 'w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent';
  const inputError = 'border-red-300 focus:ring-red-400';
  const inputNormal = 'border-gray-200';

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gray-950 px-8 py-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Send Enquiry</h2>
            {propertyTitle
              ? <p className="text-gray-400 text-sm mt-1 line-clamp-1">{propertyTitle}</p>
              : <p className="text-gray-400 text-sm mt-1">We typically respond within 24 hours</p>
            }
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition mt-0.5 p-1 -mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          {success ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enquiry Received</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Thank you. We&apos;ll review your message and be in touch shortly.
              </p>
              <button
                onClick={onClose}
                className="mt-7 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={values.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="John Banda"
                    className={`${inputBase} ${touched.name && fieldErrors.name ? inputError : inputNormal}`}
                  />
                </div>
                <FieldError show={!!touched.name} message={fieldErrors.name} />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="john@example.com"
                    className={`${inputBase} ${touched.email && fieldErrors.email ? inputError : inputNormal}`}
                  />
                </div>
                <FieldError show={!!touched.email} message={fieldErrors.email} />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Phone <span className="text-gray-400 font-normal normal-case tracking-normal">— optional</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={values.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="+265 888 000 000"
                    className={`${inputBase} ${inputNormal}`}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Message <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea
                    value={values.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    rows={4}
                    placeholder="I'm interested in this property and would like to arrange a viewing..."
                    className={`${inputBase} pl-10 resize-none ${touched.message && fieldErrors.message ? inputError : inputNormal}`}
                  />
                </div>
                <FieldError show={!!touched.message} message={fieldErrors.message} />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gray-950 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : 'Send Enquiry'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
