import type { LoaderFunctionArgs } from "react-router";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { weaverse } = context as any;
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const entries = await weaverse.fetchCustomPages();

  const urls = entries.map((entry) => {
    const loc = escapeXml(`${baseUrl}${entry.path}`);
    return `  <url>
      <loc>${loc}</loc>
      <lastmod>${escapeXml(entry.lastModified)}</lastmod>
      <changefreq>${entry.changeFrequency || "weekly"}</changefreq>
      <priority>${entry.priority ?? 0.7}</priority>
    </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": `max-age=${60 * 60 * 24}`,
    },
  });
}
