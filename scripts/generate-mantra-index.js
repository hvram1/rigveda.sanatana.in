/**
 * Generate Mantra Index - alphabetical listing of all mantras by first line
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/mantra-index.json');

// Remove svara marks from text
function removeSvara(text) {
  return text
    .replace(/\{[0-9]\}/g, '')  // Remove {0}, {1}, {2}, {5}
    .replace(/[॒॑᳚]/g, '')       // Remove Unicode svara marks
    .trim();
}

// Get first line of samhita
function getFirstLine(samhita) {
  const lines = Array.isArray(samhita?.lines) ? samhita.lines : [samhita?.lines];
  const firstLine = lines[0] || '';
  return removeSvara(firstLine);
}

// Get first consonant/vowel for sorting (Devanagari order)
const DEVANAGARI_ORDER = 'अआइईउऊऋॠऌॡएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहळक्ष';

function getFirstChar(text) {
  if (!text) return '';
  // Skip punctuation and spaces
  let i = 0;
  while (i < text.length && (text[i] === ' ' || text[i] === '।' || text[i] === '॥')) {
    i++;
  }
  return text[i] || text[0];
}

function getSortKey(text) {
  const char = getFirstChar(text);
  const idx = DEVANAGARI_ORDER.indexOf(char);
  return idx >= 0 ? idx : 999;
}

async function generateMantraIndex() {
  console.log('Generating Mantra Index...');
  
  const mantras = [];
  
  // Process all mandalas
  for (let m = 1; m <= 10; m++) {
    const mandalaDir = path.join(DATA_DIR, String(m).padStart(3, '0'));
    const suktas = fs.readdirSync(mandalaDir).filter(d => !d.startsWith('.'));
    
    for (const sukta of suktas) {
      const suktaDir = path.join(mandalaDir, sukta);
      const files = fs.readdirSync(suktaDir).filter(f => f.endsWith('.json'));
      
      for (const file of files) {
        const filePath = path.join(suktaDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        const firstLine = getFirstLine(data.samhitaAux || data.samhita);
        
        mantras.push({
          id: data.id,
          firstLine,
          rishi: data.attribute.rishi,
          devata: data.attribute.devata
        });
      }
    }
    console.log(`  Processed mandala ${m}`);
  }
  
  // Sort alphabetically by first line
  mantras.sort((a, b) => {
    const keyA = getSortKey(a.firstLine);
    const keyB = getSortKey(b.firstLine);
    if (keyA !== keyB) return keyA - keyB;
    return a.firstLine.localeCompare(b.firstLine, 'sa');
  });
  
  // Group by first letter
  const byLetter = new Map();
  for (const mantra of mantras) {
    const firstChar = getFirstChar(mantra.firstLine);
    if (!firstChar || firstChar === ' ') continue;
    
    if (!byLetter.has(firstChar)) {
      byLetter.set(firstChar, []);
    }
    byLetter.get(firstChar).push(mantra);
  }
  
  const result = {
    generated: new Date().toISOString(),
    totalMantras: mantras.length,
    letters: Array.from(byLetter.keys()),
    byLetter: Object.fromEntries(byLetter)
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  
  console.log(`\nMantra Index generated:`);
  console.log(`  Total mantras: ${mantras.length.toLocaleString()}`);
  console.log(`  Letters: ${result.letters.length}`);
  console.log(`  Output: ${OUTPUT_FILE}`);
}

generateMantraIndex().catch(console.error);
