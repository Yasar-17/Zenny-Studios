const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const files = [
  'projects/brand-identity-system.html',
  'projects/digital-strategy.html',
  'projects/eid-campaign.html',
  'projects/harley-davidson.html',
  'projects/oreo.html',
  'projects/ramadan-campaign.html',
  'projects/tata-coffee.html',
  'projects/tavisa-fashion.html',
];

for (const rel of files) {
  const abs = path.join(ROOT, rel);
  let html = fs.readFileSync(abs, 'utf8');
  
  // Fix cover container: remove aspect-video, change max-w-7xl to max-w-5xl
  html = html.replace(
    /class="aspect-video max-w-7xl mx-auto/g,
    'class="max-w-5xl mx-auto'
  );
  
  // Fix cover image: change object-cover to object-contain with max-height
  html = html.replace(
    /class="w-full h-full object-cover"/g,
    'class="w-full h-auto max-h-[80vh] object-contain"'
  );
  
  fs.writeFileSync(abs, html);
  console.log('Fixed cover:', rel);
}

console.log('\nDone.');