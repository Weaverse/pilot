import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import expressiveCode from 'astro-expressive-code'

// Production site URL — kept in parity with legacy `data/site-metadata.ts`.
export default defineConfig({
  site: 'https://www.leohuynh.dev',
  adapter: vercel(),
  // No trailing slash, matching the legacy Next.js canonical URLs.
  trailingSlash: 'never',
  // expressiveCode must run before mdx so it owns code-block rendering.
  integrations: [
    expressiveCode({
      // Default light, with a manually selectable dark variant via <html data-theme="...">.
      themes: ['github-light-default', 'github-dark-default'],
      useDarkModeMediaQuery: false,
      frames: {
        // Drop the copy-to-clipboard button.
        showCopyToClipboardButton: false,
      },
      styleOverrides: {
        borderRadius: '12px',
        borderColor: 'transparent',
        codeFontSize: '13.5px',
        codeFontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        frames: {
          shadowColor: 'transparent',
        },
      },
      defaultProps: {
        wrap: true,
        // No editor/terminal chrome: drop the filename header and the
        // traffic-light dots, keep just the bare code box.
        frame: 'none',
      },
    }),
    mdx(),
    react(),
    sitemap({
      // `/dotfiles/*` is a GitHub-backed SSR mirror (prerender: false), so it
      // never shows up in the static build output the sitemap scans. List
      // just the landing page — individual files stay crawlable via the
      // sidebar without pulling GitHub into the build.
      customPages: ['https://www.leohuynh.dev/dotfiles'],
      // Keep out of the sitemap (still browsable/crawlable via in-app links):
      //  - tag archive pages (`/topics/<tag>`) — low-value aggregation, thin
      //    single-item ones render `noindex`, so submitting them mixes "index
      //    this" (sitemap) with "don't index this" (page). The `/topics` index
      //    itself stays in.
      //  - `/guestbook` — UGC (`noindex`), no search value.
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, '')
        if (path === '/guestbook') return false
        return !/\/topics\/[^/]+$/.test(path)
      },
    }),
  ],
  // v4 route rebrand: old section prefixes 301 to the new ones (slugs preserved).
  // The specific legacy redirect must precede the broader `/snippets/*` rule.
  redirects: {
    '/snippets/crawling-goodreads-books-data': {
      status: 301,
      destination: '/blog/crawling-goodreads-books-data',
    },
    '/about': { status: 301, destination: '/whoami' },
    // `/log*` is the old v4-only prefix — 301 back to the canonical `/blog*`.
    // Page 1 must precede `/log/page/[page]` so it doesn't chain through
    // `/blog/page/1` first.
    '/log': { status: 301, destination: '/blog' },
    '/log/page/1': { status: 301, destination: '/blog' },
    '/blog/page/1': { status: 301, destination: '/blog' },
    '/log/page/[page]': { status: 301, destination: '/blog/page/[page]' },
    '/log/[...slug]': { status: 301, destination: '/blog/[...slug]' },
    '/snippets': { status: 301, destination: '/gists' },
    '/snippets/[...slug]': { status: 301, destination: '/gists/[...slug]' },
    '/projects': { status: 301, destination: '/builds' },
    '/books': { status: 301, destination: '/shelf' },
    '/movies': { status: 301, destination: '/shelf' },
    '/tags': { status: 301, destination: '/topics' },
    // Legacy tag RSS feeds — must precede `/tags/[tag]` so it wins the match.
    '/tags/[tag]/feed.xml': {
      status: 301,
      destination: '/topics/[tag]/feed.xml',
    },
    '/tags/[tag]': { status: 301, destination: '/topics/[tag]' },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
