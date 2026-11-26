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
  const { weaverse } = context;
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  let entries: Awaited<ReturnType<typeof weaverse.fetchCustomPages>>;
  try {
    entries = await weaverse.fetchCustomPages();
  } catch (error) {
    // A partial or empty 200 would make crawlers drop the missing URLs and
    // cache that answer. 503 + Retry-After makes them keep the old sitemap
    // and come back later.
    console.error("[sitemap-weaverse] Failed to load custom pages", error);
    return new Response("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "3600", "Cache-Control": "no-store" },
    });
  }

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
