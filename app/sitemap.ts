import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://holdco.vercel.app";
  const staticPages = ["", "/companies", "/lists", "/compare", "/community"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  // Dynamic company + investor slugs fetched from backend
  let companySlugs: string[] = [];
  let investorSlugs: string[] = [];
  try {
    const resp = await fetch("http://127.0.0.1:8080/api/companies?limit=200");
    if (resp.ok) {
      const data = await resp.json();
      companySlugs = (data || []).map((c: any) => c.slug).filter(Boolean);
    }
  } catch {}
  try {
    const resp = await fetch("http://127.0.0.1:8080/api/investors?limit=50");
    if (resp.ok) {
      const data = await resp.json();
      investorSlugs = (data || []).map((i: any) => i.slug || i.id).filter(Boolean);
    }
  } catch {}

  const companyPages = companySlugs.map((slug) => ({
    url: `${baseUrl}/companies/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));
  const investorPages = investorSlugs.map((slug) => ({
    url: `${baseUrl}/investors/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...companyPages, ...investorPages];
}
