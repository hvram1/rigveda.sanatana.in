/**
 * Sanskrit Phonetic Normalization
 * Creates a phonetic key for fuzzy matching similar-sounding words
 */

// Strip svara/accent marks
const SVARA_MARKS = /[॒॑᳚]/g;

// Phonetic equivalence groups - similar sounding characters map to a common form
const PHONETIC_MAP: [RegExp, string][] = [
  // Aspirated → Unaspirated consonants
  [/ख/g, 'क'],
  [/घ/g, 'ग'],
  [/छ/g, 'च'],
  [/झ/g, 'ज'],
  [/ठ/g, 'ट'],
  [/ढ/g, 'ड'],
  [/थ/g, 'त'],
  [/ध/g, 'द'],
  [/फ/g, 'प'],
  [/भ/g, 'ब'],
  
  // Sibilants → स
  [/श/g, 'स'],
  [/ष/g, 'स'],
  
  // Nasals (optional - can be confusing)
  [/ण/g, 'न'],
  [/ङ/g, 'न'],
  [/ञ/g, 'न'],
  
  // ळ → ल (Vedic ळ)
  [/ळ/g, 'ल'],
  
  // Long vowels → Short vowels
  [/आ/g, 'अ'],
  [/ई/g, 'इ'],
  [/ऊ/g, 'उ'],
  [/ऐ/g, 'ए'],
  [/औ/g, 'ओ'],
  [/ॠ/g, 'ऋ'],
  
  // Anusvara variations
  [/ं/g, 'म'],
  [/ँ/g, ''],
  
  // Visarga (often dropped or varies)
  [/ः/g, ''],
  
  // Avagraha
  [/ऽ/g, ''],
  
  // Halant/Virama - keep consonant clusters readable
  [/्अ/g, ''], // Explicit schwa
];

/**
 * Remove svara (accent) marks from text
 */
export function stripSvara(text: string): string {
  return text.replace(SVARA_MARKS, '');
}

/**
 * Create phonetic key for fuzzy matching
 * Normalizes similar-sounding characters to a common form
 */
export function phoneticKey(text: string): string {
  let result = stripSvara(text);
  
  // Apply phonetic mappings
  for (const [pattern, replacement] of PHONETIC_MAP) {
    result = result.replace(pattern, replacement);
  }
  
  // Remove spaces and punctuation for matching
  result = result.replace(/[\s।॥,\.\-]+/g, '');
  
  return result.toLowerCase();
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses Levenshtein distance normalized by length
 */
export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[a.length][b.length];
  const maxLen = Math.max(a.length, b.length);
  return 1 - distance / maxLen;
}

/**
 * Check if query phonetically matches text
 */
export function phoneticMatch(query: string, text: string): boolean {
  const queryKey = phoneticKey(query);
  const textKey = phoneticKey(text);
  return textKey.includes(queryKey);
}

/**
 * Get phonetic similarity score
 */
export function phoneticSimilarity(query: string, text: string): number {
  return similarity(phoneticKey(query), phoneticKey(text));
}
