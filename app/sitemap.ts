import { MetadataRoute } from 'next';
import { createServerClient } from '../lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();
  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at')
    .eq('status', 'available');

  const propertyUrls: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `https://primehomesmalawi.vercel.app/properties/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    { url: 'https://primehomesmalawi.vercel.app', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...propertyUrls,
  ];
}
