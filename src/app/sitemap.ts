import { MetadataRoute } from 'next';
import { query } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://examsetu.in';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/exams`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/opportunities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  try {
    // Dynamic Exam Pages
    const examsRes = await query('SELECT slug, updated_at FROM exams WHERE is_active = true');
    const examRoutes: MetadataRoute.Sitemap = examsRes.rows.map((exam) => ({
      url: `${baseUrl}/exams/${exam.slug}`,
      lastModified: new Date(exam.updated_at),
      changeFrequency: 'hourly',
      priority: 0.8,
    }));

    // Dynamic Opportunity Pages
    const oppsRes = await query('SELECT slug, updated_at FROM opportunities');
    const oppRoutes: MetadataRoute.Sitemap = oppsRes.rows.map((opp) => ({
      url: `${baseUrl}/opportunities/${opp.slug}`,
      lastModified: new Date(opp.updated_at),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    return [...staticRoutes, ...examRoutes, ...oppRoutes];
  } catch (err) {
    console.error('Error generating dynamic sitemap:', err);
    return staticRoutes;
  }
}
