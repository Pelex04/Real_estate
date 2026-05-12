import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient, formatPrice } from '../../../lib/supabase';
import PropertyPageClient from './property-page-client';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (!property) {
    return { title: 'Property Not Found' };
  }

  const { data: images } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', id)
    .eq('is_primary', true)
    .limit(1);

  const primaryImage = images?.[0]?.image_url;

  const title = `${property.title} – ${property.city} | PrimeHomes Malawi`;
  const description = `${property.type === 'sale' ? 'For Sale' : 'For Rent'}: ${property.title} in ${property.city}, Malawi. ${property.bedrooms > 0 ? `${property.bedrooms} bed, ` : ''}${property.bathrooms > 0 ? `${property.bathrooms} bath, ` : ''}${property.area_sqm}m². ${formatPrice(property.price)}${property.type === 'rent' ? '/month' : ''}. ${property.description.slice(0, 100)}...`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://primehomes.mw/properties/${id}`,
      images: primaryImage ? [{ url: primaryImage, width: 1200, height: 630, alt: property.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServerClient();

  const [{ data: property }, { data: images }] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).single(),
    supabase.from('property_images').select('*').eq('property_id', id).order('order_index'),
  ]);

  if (!property) notFound();

  // Increment view count omitted — view_count column not yet in schema

  const primaryImage = images?.find((i) => i.is_primary)?.image_url ?? images?.[0]?.image_url;

  // JSON-LD structured data for Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `https://primehomes.mw/properties/${id}`,
    image: primaryImage,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'MWK',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location,
      addressLocality: property.city,
      addressCountry: 'MW',
    },
    ...(property.bedrooms > 0 && { numberOfRooms: property.bedrooms }),
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.area_sqm,
      unitCode: 'MTK',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyPageClient property={property} images={images ?? []} />
    </>
  );
}
