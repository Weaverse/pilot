/**
 * Non-secret site metadata, ported subset of legacy `data/site-metadata.ts`.
 * Secrets (analytics IDs, tokens) are read from env at runtime — never hardcoded here.
 */
export const SITE = {
  title: `Leo's dev blog – stories, insights, and ideas`,
  author: 'Leo Huynh',
  headerTitle: `Leo's dev blog`,
  description:
    'A personal space on the cloud where I document my programming journey, sharing lessons, insights, and resources for fellow developers.',
  language: 'en-us',
  locale: 'en-US',
  siteUrl: 'https://www.leohuynh.dev',
  siteRepo: 'https://github.com/hta218/leohuynh.dev',
  email: 'contact@leohuynh.dev',
  github: 'https://github.com/hta218',
  x: 'https://x.com/hta218_',
  linkedin: 'https://www.linkedin.com/in/hta218',
  facebook: 'https://facebook.com/hta218',
  youtube: 'https://www.youtube.com/@hta218_',
  threads: 'https://www.threads.net/hta218_',
  instagram: 'https://www.instagram.com/hta218_',
  goodreadsBookshelfUrl:
    'https://www.goodreads.com/review/list/179720035-leo-huynh',
  imdbRatingsList: 'https://www.imdb.com/user/ur154483197/ratings/?view=grid',
  godyProfileUrl: 'https://gody.vn/blog/huynhtuananh218951440',
  // OG/Twitter fallback banner generated from the current profile photo.
  socialBanner: '/static/images/og.jpg',
  analytics: {
    umamiShareUrl:
      'https://analytics.leohuynh.dev/share/c9ErglxqzY5CQJ8g/leohuynh.dev',
  },
} as const

/** Support/donation links — parity with legacy `site-metadata.support`. */
export const SUPPORT = {
  buyMeACoffee: 'https://www.buymeacoffee.com/leohuynh.dev',
  paypal: 'https://paypal.me/hta218?country.x=VN&locale.x=en_US',
  kofi: 'https://ko-fi.com/hta218',
} as const

/** Career timeline shown on `/about`, ported from `data/authors/default.mdx`. */
/** Shared class for inline links rendered inside career note HTML. */
const NOTE_LINK =
  'text-code-blue underline underline-offset-2 hover:decoration-2'

export const CAREER = [
  {
    role: 'CTO / Co-Founder / Software Engineer',
    org: 'Weaverse',
    url: 'https://weaverse.io/',
    logo: '/static/images/weaverse-logo.png',
    period: 'Mar 2022 - now',
    notes: [
      `Building a smart <a class="${NOTE_LINK}" href="https://weaverse.io/demo" target="_blank" rel="noreferrer">Shopify Hydrogen Theme Customizer</a> to help creators build their own high quality and high performance headless storefronts easily.`,
    ],
  },
  {
    role: 'Senior Software Engineer',
    org: 'FoxEcom',
    url: 'https://foxecom.com/',
    logo: '/static/images/foxecom-logo.jpeg',
    period: 'May 2021 - Feb 2022',
    notes: [
      `Built <a class="${NOTE_LINK}" href="https://themeforest.net/item/minimog-the-high-converting-shopify-theme/33380968" target="_blank" rel="noreferrer">Minimog</a> — a multipurpose Shopify theme (top best-selling templates on Envato Market).`,
      `Built the <a class="${NOTE_LINK}" href="https://apps.shopify.com/foxecom-boost-sales" target="_blank" rel="noreferrer">Fox Kit Shopify App</a> — the upsells and boost-conversion tool built to support Minimog theme.`,
    ],
  },
  {
    role: 'Frontend Engineer',
    org: 'Coc Coc',
    url: 'https://coccoc.com/en',
    logo: '/static/images/coc-coc-logo.png',
    period: 'May 2020 - Apr 2021',
    notes: [
      'Working on the <strong>#1 web browser & search engine</strong> in <strong>Viet Nam</strong> (30M+ users).',
      `Built <a class="${NOTE_LINK}" href="https://coccoc.com/webhp" target="_blank" rel="noreferrer">Coc Coc's newsfeed</a>.`,
      "Maintained and optimized the new tab's widgets and performance.",
    ],
  },
  {
    role: 'Fullstack Developer',
    org: 'BraveBits',
    url: 'https://bravebits.co/',
    logo: '/static/images/bb-logo.png',
    period: 'Aug 2018 - Apr 2020',
    notes: [
      'Working on the #1 Page Builder app on the Shopify app store.',
      "Built PageFly's Analytics APIs.",
      `Built <a class="${NOTE_LINK}" href="https://github.com/sellersmith/slider-x" target="_blank" rel="noreferrer">Slider-x</a>.`,
    ],
  },
  {
    role: 'Instructor and Developer',
    org: 'MindX - Technology School',
    url: 'https://mindx.edu.vn/',
    logo: '/static/images/mindx-logo.jpeg',
    period: 'May 2017 - Jul 2018',
    notes: [
      `Built <a class="${NOTE_LINK}" href="http://lok.vn/" target="_blank" rel="noreferrer">Love of Knowledge</a> (Front-end Developer).`,
      `Built <a class="${NOTE_LINK}" href="https://hta218.github.io/get-a-room-api-docs/" target="_blank" rel="noreferrer">Room Finder APIs</a> (Back-end Developer).`,
      `Built <a class="${NOTE_LINK}" href="https://github.com/hta218/Travel_Egypt" target="_blank" rel="noreferrer">Travel Egypt</a> — a picture puzzle game made by pygame (Python).`,
      'Mentored Python fundamentals and Python web development for newbies.',
    ],
  },
  {
    role: 'Student at SEEE (School of Electrical & Electronic Engineering)',
    org: 'Hanoi University of Science and Technology',
    url: 'https://www.hust.edu.vn/en/',
    logo: '/static/images/hust-logo.png',
    period: 'Sep 2013 - Feb 2019',
    notes: [
      'Got a good degree at the <strong>School of Electrical & Electronic Engineering</strong>.',
      "And yeah! My major was <strong>Electronics and Telecommunications</strong>, but I couldn't find interest in that field. So I learned Software Engineering instead, and became what I am today.",
    ],
  },
] as const

/** Blog list pagination size — parity with legacy `utils/const.ts`. */
export const POSTS_PER_PAGE = 9
