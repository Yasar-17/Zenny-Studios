const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIRS = ['assets/projects', 'assets/images'];
const MAX_WIDTH = 1600;
const QUALITY = 80;

const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

async function processImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!EXTENSIONS.has(ext)) return null;

  const outPath = filePath.slice(0, -ext.length) + '.webp';
  const relPath = path.relative(ROOT, filePath);

  try {
    const meta = await sharp(filePath).metadata();
    const originalWidth = meta.width || 0;
    const originalHeight = meta.height || 0;
    const needsResize = originalWidth > MAX_WIDTH;

    const pipeline = sharp(filePath, { failOn: 'none' });
    if (needsResize) {
      pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    await pipeline
      .webp({ quality: QUALITY })
      .toFile(outPath);

    const outMeta = await sharp(outPath).metadata();
    return {
      input: relPath,
      output: path.relative(ROOT, outPath),
      originalWidth,
      originalHeight,
      outWidth: outMeta.width,
      outHeight: outMeta.height,
      resized: needsResize,
    };
  } catch (err) {
    console.error(`ERROR processing ${relPath}: ${err.message}`);
    return null;
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const allFiles = [];
  for (const d of DIRS) {
    const abs = path.join(ROOT, d);
    if (fs.existsSync(abs)) {
      allFiles.push(...walk(abs));
    }
  }

  const results = [];
  for (const f of allFiles) {
    const r = await processImage(f);
    if (r) results.push(r);
  }

  console.log(`\nProcessed ${results.length} image(s):\n`);
  for (const r of results) {
    const resizeTag = r.resized ? ` [resized ${r.originalWidth} -> ${r.outWidth}]` : '';
    console.log(`  ${r.input}  ->  ${r.output}  (${r.outWidth}x${r.outHeight})${resizeTag}`);
  }

  const sizesJson = JSON.stringify(results, null, 2);
  fs.writeFileSync(path.join(__dirname, 'image-sizes.json'), sizesJson);
  console.log(`\nSaved metadata to backend/image-sizes.json`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});