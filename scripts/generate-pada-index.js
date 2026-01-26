/**
 * Generate Pada (Word) Index from Padapatha
 * Extracts all unique words, removes svara marks, and creates alphabetical index
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/pada-index.json');

// Remove svara marks from text
function removeSvara(text) {
  return text
    .replace(/\{[0-9]\}/g, '')  // Remove {0}, {1}, {2}, {5}
    .replace(/[॒॑᳚]/g, '')       // Remove Unicode svara marks
    .trim();
}

// Extract words from padapatha line
function extractWords(line) {
  // Padapatha uses । as word separator
  const cleaned = removeSvara(line);
  const words = cleaned.split(/[।॥\s]+/)
    .map(w => w.trim())
    .filter(w => w.length > 0 && !/^[\d]+$/.test(w));
  return words;
}

// Get first consonant/vowel for sorting (Devanagari order)
const DEVANAGARI_ORDER = 'अआइईउऊऋॠऌॡएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहळक्ष';

function getFirstChar(word) {
  if (!word) return '';
  // Skip anusvara/visarga at start
  let i = 0;
  while (i < word.length && (word[i] === 'ं' || word[i] === 'ः' || word[i] === '्')) {
    i++;
  }
  return word[i] || word[0];
}

function getSortKey(word) {
  const char = getFirstChar(word);
  const idx = DEVANAGARI_ORDER.indexOf(char);
  return idx >= 0 ? idx : 999;
}

async function generatePadaIndex() {
  console.log('Generating Pada Index...');
  
  // Map: word -> array of verse IDs
  const wordIndex = new Map();
  let totalRiks = 0;
  
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
        totalRiks++;
        
        // Get padapatha lines
        const lines = Array.isArray(data.padapaatha?.lines) 
          ? data.padapaatha.lines 
          : [data.padapaatha?.lines].filter(Boolean);
        
        for (const line of lines) {
          const words = extractWords(line);
          for (const word of words) {
            if (word.length < 2) continue; // Skip single chars
            
            if (!wordIndex.has(word)) {
              wordIndex.set(word, new Set());
            }
            wordIndex.get(word).add(data.id);
          }
        }
      }
    }
    console.log(`  Processed mandala ${m}`);
  }
  
  // Convert to sorted array
  const sortedWords = Array.from(wordIndex.entries())
    .map(([word, verses]) => ({
      word,
      count: verses.size,
      verses: Array.from(verses).sort()
    }))
    .sort((a, b) => {
      const keyA = getSortKey(a.word);
      const keyB = getSortKey(b.word);
      if (keyA !== keyB) return keyA - keyB;
      return a.word.localeCompare(b.word, 'sa');
    });
  
  // Group by first letter
  const byLetter = new Map();
  for (const entry of sortedWords) {
    const firstChar = getFirstChar(entry.word);
    if (!byLetter.has(firstChar)) {
      byLetter.set(firstChar, []);
    }
    byLetter.get(firstChar).push(entry);
  }
  
  const result = {
    generated: new Date().toISOString(),
    totalWords: sortedWords.length,
    totalRiks,
    letters: Array.from(byLetter.keys()),
    byLetter: Object.fromEntries(byLetter)
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  
  console.log(`\nPada Index generated:`);
  console.log(`  Total unique words: ${sortedWords.length.toLocaleString()}`);
  console.log(`  Total verses: ${totalRiks.toLocaleString()}`);
  console.log(`  Letters: ${result.letters.length}`);
  console.log(`  Output: ${OUTPUT_FILE}`);
}

generatePadaIndex().catch(console.error);
