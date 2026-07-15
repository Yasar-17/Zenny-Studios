const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Load image dimensions from the conversion output
const sizesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'image-sizes.json'), 'utf8'));

// Build a lookup map: normalized-relative-path -> { width, height }
const sizeMap = {};
for (const entry of sizesData) {
  const norm = entry.output.replace(/\\/g, '/'); // assets/projects/oreo.webp
  const key = norm.replace(/\.webp$/, '');       // assets/projects/oreo
  sizeMap[key] = { width: entry.outWidth, height: entry.outHeight };
}

// Rendered-size overrides for specific display contexts.
// The key is matched against the original src (without extension or query).
// These reflect the CSS display size at a desktop reference viewport.
const RENDERED_OVERRIDES = {
  // Project page cover images: aspect-video max-w-7xl -> 1280x720
  'assets/projects/brand-identity-system': { width: 1280, height: 720 },
  'assets/projects/digital-strategy':      { width: 1280, height: 720 },
  'assets/projects/eid-campaign':          { width: 1280, height: 720 },
  'assets/projects/harley-davidson':       { width: 1280, height: 720 },
  'assets/projects/oreo':                  { width: 1280, height: 720 },
  'assets/projects/product-launch-film':   { width: 1280, height: 720 },
  'assets/projects/ramadan-campaign':      { width: 1280, height: 720 },
  'assets/projects/tata-coffee':           { width: 1280, height: 720 },
  'assets/projects/tavisa-fashion':        { width: 1280, height: 720 },
};

const LOGO_KEY = 'assets/images/Zenny_Studios_Logo/ZennyStudios_logo';

const FILES = [
  'work.html',
  'projects/brand-identity-system.html',
  'projects/digital-strategy.html',
  'projects/eid-campaign.html',
  'projects/harley-davidson.html',
  'projects/oreo.html',
  'projects/product-launch-film.html',
  'projects/ramadan-campaign.html',
  'projects/tata-coffee.html',
  'projects/tavisa-fashion.html',
];

// Normalize an src attribute to a root-relative key without extension
function normalizeSrc(src, fileDir) {
  let p = src.replace(/\\/g, '/');
  // Resolve relative paths
  if (p.startsWith('../')) {
    p = p.replace(/^\.\.\//, '');
  } else if (p.startsWith('./')) {
    p = p.replace(/^\.\//, '');
  }
  // Remove extension
  p = p.replace(/\.(jpg|jpeg|png)$/i, '');
  return p;
}

// Get the root-relative path of the .webp for a given normalized key
function getWebpSrc(normalizedKey, srcPrefix) {
  // srcPrefix is '../' for project pages, '' for root-level files
  return srcPrefix + normalizedKey.replace(/^assets\//, '') + '.webp';
}

// Rebuild an <img> tag with updated attributes
function buildImgTag(attrs) {
  const parts = [];
  for (const [k, v] of Object.entries(attrs)) {
    if (v === true) {
      parts.push(k);
    } else if (v !== false && v !== undefined && v !== null) {
      parts.push(`${k}="${v}"`);
    }
  }
  return `<img ${parts.join(' ')}>`;
}

// Parse attributes from an <img ...> tag string
function parseImgTag(tagStr) {
  const inner = tagStr.replace(/^<img\s+/i, '').replace(/\s*\/?>$/, '');
  const attrs = {};
  const re = /(\S+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(inner)) !== null) {
    attrs[m[1]] = m[2];
  }
  // Handle bare attributes (like `decoding="async"`)
  return attrs;
}

function processFile(relPath) {
  const absPath = path.join(ROOT, relPath);
  let html = fs.readFileSync(absPath, 'utf8');
  const fileDir = path.dirname(relPath);
  const srcPrefix = fileDir === '.' ? '' : '../';

  // Find all <img ...> tags in order (self-closing or with attributes)
  const imgRegex = /<img\s+[^>]*?>/gi;
  let imgIndex = 0;
  const matches = [];
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    matches.push({ index: m.index, tag: m[0] });
  }

  // Process in reverse order so indices don't shift
  for (let i = matches.length - 1; i >= 0; i--) {
    const { index, tag } = matches[i];
    const isFirst = (i === 0); // first <img> in DOM order
    const attrs = parseImgTag(tag);
    const src = attrs.src;

    if (!src || src.startsWith('data:')) continue;

    const normalizedKey = normalizeSrc(src, fileDir);

    // Determine dimensions: use rendered override if available, else intrinsic from sizeMap
    let dims = RENDERED_OVERRIDES[normalizedKey] || sizeMap[normalizedKey];

    // Special handling for logo images by class
    if (!dims) {
      const cls = attrs.class || '';
      if (normalizedKey === LOGO_KEY) {
        if (cls.includes('h-10')) {
          dims = { width: 42, height: 40 };
        } else if (cls.includes('h-12')) {
          dims = { width: 50, height: 48 };
        } else {
          dims = { width: 50, height: 48 };
        }
      }
    }

    // Check if .webp file exists for this source
    const webpAbsPath = path.join(ROOT, normalizedKey + '.webp');
    const hasWebp = fs.existsSync(webpAbsPath);

    // Build new attributes for the <img> fallback
    const newAttrs = {};
    for (const [k, v] of Object.entries(attrs)) {
      newAttrs[k] = v;
    }

    // Set loading attribute
    if (isFirst) {
      newAttrs.loading = 'eager';
      newAttrs.fetchpriority = 'high';
    } else {
      newAttrs.loading = 'lazy';
      delete newAttrs.fetchpriority;
    }

    // Set width/height
    if (dims) {
      newAttrs.width = String(dims.width);
      newAttrs.height = String(dims.height);
    }

    // Set decoding
    newAttrs.decoding = 'async';

    // Remove onerror from the img (keep it for fallback)
    // Keep onerror as-is

    const newImgTag = buildImgTag(newAttrs);

    let replacement;
    if (hasWebp) {
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      replacement = `<picture>\n        <source srcset="${webpSrc}" type="image/webp">\n        ${newImgTag}\n      </picture>`;
    } else {
      replacement = newImgTag;
    }

    html = html.slice(0, index) + replacement + html.slice(index + tag.length);
  }

  fs.writeFileSync(absPath, html);
  console.log(`Updated ${relPath} (${matches.length} img tags)`);
}

console.log('Starting HTML transformation...\n');
for (const f of FILES) {
  processFile(f);
}
console.log('\nDone.');