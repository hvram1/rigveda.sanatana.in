/**
 * Generate search index for client-side search
 * Run with: node scripts/generate-search-index.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(__dirname, '../public/search-index.json');

// Svara marks to strip
const SVARA_MARKS = /[॒॑᳚\{\d\}]/g;

// Phonetic mappings
const PHONETIC_MAP = [
  [/ख/g, 'क'], [/घ/g, 'ग'], [/छ/g, 'च'], [/झ/g, 'ज'],
  [/ठ/g, 'ट'], [/ढ/g, 'ड'], [/थ/g, 'त'], [/ध/g, 'द'],
  [/फ/g, 'प'], [/भ/g, 'ब'],
  [/श/g, 'स'], [/ष/g, 'स'],
  [/ण/g, 'न'], [/ङ/g, 'न'], [/ञ/g, 'न'],
  [/ळ/g, 'ल'],
  [/आ/g, 'अ'], [/ई/g, 'इ'], [/ऊ/g, 'उ'], [/ऐ/g, 'ए'], [/औ/g, 'ओ'], [/ॠ/g, 'ऋ'],
  [/ं/g, 'म'], [/ँ/g, ''], [/ः/g, ''], [/ऽ/g, ''],
];

function stripSvara(text) {
  return text.replace(SVARA_MARKS, '');
}

function phoneticKey(text) {
  let result = stripSvara(text);
  for (const [pattern, replacement] of PHONETIC_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result.replace(/[\s।॥,\.\-]+/g, ' ').trim().toLowerCase();
}

function getLines(obj) {
  if (!obj || !obj.lines) return '';
  return Array.isArray(obj.lines) ? obj.lines.join(' ') : obj.lines;
}

async function generateIndex() {
  console.log('Generating search index...');
  
  const index = [];
  let count = 0;
  
  // Iterate through all mandalas
  for (let m = 1; m <= 10; m++) {
    const mandalaDir = path.join(DATA_DIR, String(m).padStart(3, '0'));
    if (!fs.existsSync(mandalaDir)) continue;
    
    const suktas = fs.readdirSync(mandalaDir).filter(d => !d.startsWith('.'));
    
    for (const sukta of suktas) {
      const suktaDir = path.join(mandalaDir, sukta);
      const riks = fs.readdirSync(suktaDir).filter(f => f.endsWith('.json'));
      
      for (const rikFile of riks) {
        const content = fs.readFileSync(path.join(suktaDir, rikFile), 'utf-8');
        const data = JSON.parse(content);
        
        // Get samhita text (the main verse)
        const samhitaText = stripSvara(getLines(data.samhitaAux));
        const padaText = stripSvara(getLines(data.padapaatha));
        
        // Combine for searchable text
        const fullText = `${samhitaText} ${padaText}`;
        const phonetic = phoneticKey(fullText);
        
        index.push({
          id: data.id,
          m: parseInt(data.classification.mandala),
          s: parseInt(data.classification.sukta),
          r: parseInt(data.classification.rik),
          t: samhitaText.substring(0, 150), // Truncate for display
          p: phonetic.substring(0, 200), // Phonetic key
          ri: data.attribute.rishi,
          de: data.attribute.devata,
        });
        
        count++;
      }
    }
  }
  
  console.log(`Indexed ${count} verses`);
  
  // Write index (minified)
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index));
  
  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`Index size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  // Estimate gzipped size
  const { gzipSync } = await import('zlib');
  const gzipped = gzipSync(JSON.stringify(index));
  console.log(`Gzipped size: ${(gzipped.length / 1024).toFixed(0)} KB`);
  
  console.log(`Output: ${OUTPUT_FILE}`);
}

generateIndex().catch(console.error);
