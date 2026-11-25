// Writes dist/sitemap.xml and dist/robots.txt. Run by `copy:sitemap`
// (after `mkdirs`). Keep PAGES in sync with the pug files in package.json's
// `html` script and with the `path` each page passes to +seoHead.
const fs = require('fs')
const path = require('path')

const ORIGIN = 'https://www.littl31.com'
const PAGES = [
  { path: '', priority: '1.0' },
  { path: 'alfr3d', priority: '0.9' },
  { path: 'timeline', priority: '0.7' },
  { path: 'honesty', priority: '0.6' },
  { path: 'lab', priority: '0.5' },
  { path: 'privacy', priority: '0.3' }
]
const lastmod = new Date().toISOString().slice(0, 10)

const urls = PAGES.map(
  (p) =>
    `  <url>\n    <loc>${ORIGIN}/${p.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${p.priority}</priority>\n  </url>`
).join('\n')

const dist = path.join(__dirname, '..', 'dist')
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
)
fs.writeFileSync(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`
)
