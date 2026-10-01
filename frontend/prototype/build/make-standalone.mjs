#!/usr/bin/env node
/**
 * Builds a single self-contained HTML file that opens straight from disk
 * (double-click, file://) with no web server.
 *
 * Why this is needed: the .dc.html runtime fetches its own page source,
 * fetches ./image-slot.js, and loads photos by relative URL. Chrome blocks
 * fetch() on file:// URLs, so all three fail and the page renders empty.
 *
 * support.js already ships the escape hatch we use here (see support.js
 * bundledBlob / __resources): before every fetch it consults two globals,
 *   window.__resources      url -> replacement url
 *   window.__resourceBlobs  url -> Blob
 * and prefers a Blob when one is registered. Prefilling those maps means
 * nothing ever hits the network or the filesystem.
 *
 * Photos are compressed to ~2x their measured on-page render size, then
 * embedded as data: URLs.
 *
 * Usage: node build/make-standalone.mjs
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url)) + '/..'
const SRC = join(root, 'Homepage.dc.html')
const OUT = join(root, 'Homepage.standalone.html')

/**
 * Target widths measured from the live page (largest rendered box x2 for
 * retina). Anything not listed is embedded untouched.
 */
const TARGETS = {
  'map-restyled-mockup.jpg': 2400,
  'staff-campers-game.jpg': 1926,
  'doctors-office.png': 1380,
  'big-top-panorama (1).png': 2070,
  'lifeguard-on-duty.jpg': 1200,
  'leader-anna-gerson.jpg': 878,
  'leader-justin.jpg': 878,
  'directors-gerson-family.jpg': 804,
}

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.avif': 'image/avif', '.webp': 'image/webp', '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

const kb = (n) => Math.round(n / 1024) + ' KB'
const tmp = mkdtempSync(join(tmpdir(), 'standalone-'))

/**
 * Compress one image to `width`, trying JPEG and WebP and keeping whichever
 * is smaller (never larger than the original). Returns {buf, mime}.
 * PNGs with no transparency are allowed to become JPEG.
 */
function compress(absPath, name) {
  const orig = readFileSync(absPath)
  const width = TARGETS[name]
  if (!width) return { buf: orig, mime: MIME[extname(name).toLowerCase()] || 'application/octet-stream' }

  // AVIF stays as-is; re-encoding it usually loses to the original.
  if (extname(name).toLowerCase() === '.avif') {
    return { buf: orig, mime: 'image/avif' }
  }

  let hasAlpha = false
  try {
    hasAlpha = execFileSync('magick', ['identify', '-format', '%A', absPath], { encoding: 'utf8' })
      .trim().toLowerCase().startsWith('t')
  } catch {}

  const candidates = []
  const mk = (ext, args) => {
    const out = join(tmp, `c${candidates.length}${ext}`)
    try {
      execFileSync('magick', [absPath, '-resize', `${width}x>`, ...args, out], { stdio: 'pipe' })
      candidates.push({ buf: readFileSync(out), mime: MIME[ext] })
    } catch {}
  }

  if (!hasAlpha) mk('.jpg', ['-quality', '82', '-strip', '-interlace', 'Plane'])
  mk('.webp', ['-quality', '82', '-define', 'webp:method=6', '-strip'])
  if (hasAlpha) mk('.png', ['-strip'])

  candidates.push({ buf: orig, mime: MIME[extname(name).toLowerCase()] })
  candidates.sort((a, b) => a.buf.length - b.buf.length)
  return candidates[0]
}

let html = readFileSync(SRC, 'utf8')

// 1. Inline the photos as data: URLs.
// Filenames may contain spaces AND parentheses ("big-top-panorama (1).png"),
// so stop only at a quote or angle bracket, then trim any trailing CSS url()
// paren that was not part of the name.
const refs = [...new Set(
  [...html.matchAll(/\.\/uploads\/([^"'>]+?)(?=["'>]|\)\s*[;,}])/g)].map((m) => m[1].trim())
)]
let before = 0, after = 0
for (const name of refs) {
  const abs = join(root, 'uploads', name)
  let st
  try { st = statSync(abs) } catch { console.warn(`  ! missing, skipped: ${name}`); continue }
  const { buf, mime } = compress(abs, name)
  before += st.size; after += buf.length
  console.log(`  ${name}: ${kb(st.size)} -> ${kb(buf.length)} (${mime})`)
  const dataUrl = `data:${mime};base64,${buf.toString('base64')}`
  // Replace both the raw and HTML-escaped forms of the reference.
  for (const form of [`./uploads/${name}`, `./uploads/${name}`.replace(/&/g, '&amp;')]) {
    html = html.split(form).join(dataUrl)
  }
}
console.log(`  photos: ${kb(before)} -> ${kb(after)}`)

// 2. Register image-slot.js as a preloaded Blob and neutralise the page's
//    self-fetch, then inline support.js. This block must run BEFORE
//    support.js so the maps exist by the time the runtime boots.
const imageSlot = readFileSync(join(root, 'image-slot.js'), 'utf8')
const support = readFileSync(join(root, 'support.js'), 'utf8')

const shim = `
// --- standalone shim: satisfies every fetch the runtime would make ---
(function () {
  var slotSrc = ${JSON.stringify(imageSlot)};
  var blob = new Blob([slotSrc], { type: 'text/javascript' });
  window.__resources = window.__resources || {};
  window.__resourceBlobs = window.__resourceBlobs || {};
  // The runtime resolves './image-slot.js' against the document URL, so
  // register the absolute form as well as the relative one.
  var abs = new URL('./image-slot.js', location.href).href;
  window.__resourceBlobs['./image-slot.js'] = blob;
  window.__resourceBlobs[abs] = blob;

  // boot() re-fetches location.href to rebuild the render tree. Under
  // file:// that fetch rejects; the guard below is what support.js checks
  // (\`if (!window.__resources)\`), and it is now truthy, so the refetch is
  // skipped entirely and the inline parse is used instead.

  // Any other same-directory fetch (sibling .dc.html components) would also
  // fail on file://. Fail it quietly rather than throwing an uncaught error.
  var nativeFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (input) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('file://') === 0 || url.indexOf('./') === 0) {
      var hit = window.__resourceBlobs[url];
      if (hit) return Promise.resolve(new Response(hit));
      return Promise.resolve(new Response('', { status: 404 }));
    }
    return nativeFetch ? nativeFetch.apply(null, arguments)
                       : Promise.reject(new Error('fetch unavailable'));
  };
})();
`

if (!html.includes('<script src="./support.js"></script>')) {
  throw new Error('support.js script tag not found in source HTML')
}
html = html.replace(
  '<script src="./support.js"></script>',
  `<script>${shim}</script>\n<script>${support}</script>`
)

writeFileSync(OUT, html)
rmSync(tmp, { recursive: true, force: true })
console.log(`\n  wrote ${OUT}`)
console.log(`  final size: ${kb(statSync(OUT).size)}`)
