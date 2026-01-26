/**
 * Parse Aitareya Brahmana XML and generate JSON data
 */

import fs from 'fs';
import path from 'path';

const INPUT_FILE = '/Users/hvina/projects/rigveda-sanatana/Aitareya_Brahmana.xml';
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/aitareya-brahmana.json');

function cleanText(text) {
  return text
    .replace(/<[^>]+>/g, '')  // Remove HTML tags
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
}

function parseXML(xml) {
  const adhyayas = [];
  
  // Match each adhyaya
  const adhyayaRegex = /<adhyaya\s+id="([^"]+)">([\s\S]*?)<\/adhyaya>/g;
  let adhyayaMatch;
  
  while ((adhyayaMatch = adhyayaRegex.exec(xml)) !== null) {
    const adhyayaId = adhyayaMatch[1];
    const adhyayaContent = adhyayaMatch[2];
    
    const adhyayaNum = parseInt(adhyayaId.replace('C', ''), 10);
    
    // Parse khandas within this adhyaya
    const khandas = [];
    const khandaRegex = /<div class="khanda" id="([^"]+)">([\s\S]*?)<\/div>\s*(?=<div class="khanda"|$)/g;
    let khandaMatch;
    
    while ((khandaMatch = khandaRegex.exec(adhyayaContent)) !== null) {
      const khandaId = khandaMatch[1];
      const khandaContent = khandaMatch[2];
      
      // Extract khanda number from ID (e.g., C01_K01 -> 1)
      const khandaNumMatch = khandaId.match(/_K(\d+)/);
      const khandaNum = khandaNumMatch ? parseInt(khandaNumMatch[1], 10) : 0;
      
      // Extract title
      const titleMatch = khandaContent.match(/<p class="adhyaya_title">([^<]+)<\/p>/);
      const title = titleMatch ? cleanText(titleMatch[1]) : `खण्डः ${khandaNum}`;
      
      // Extract brahmana text and bhashya pairs
      const passages = [];
      const brahmanaRegex = /<div class="aitareya_brahmana">([\s\S]*?)<\/div>\s*<div class="aitareya_brahmana_bhashya">([\s\S]*?)<\/div>/g;
      let passageMatch;
      let passageNum = 1;
      
      while ((passageMatch = brahmanaRegex.exec(khandaContent)) !== null) {
        const brahmanaText = cleanText(passageMatch[1]);
        const bhashyaText = cleanText(passageMatch[2]);
        
        if (brahmanaText) {
          passages.push({
            num: passageNum++,
            brahmana: brahmanaText,
            bhashya: bhashyaText
          });
        }
      }
      
      if (passages.length > 0) {
        khandas.push({
          id: khandaId,
          khanda: khandaNum,
          title,
          passages
        });
      }
    }
    
    if (khandas.length > 0) {
      adhyayas.push({
        id: adhyayaId,
        adhyaya: adhyayaNum,
        khandas
      });
    }
  }
  
  return adhyayas;
}

async function main() {
  console.log('Parsing Aitareya Brahmana XML...');
  
  const xml = fs.readFileSync(INPUT_FILE, 'utf-8');
  const adhyayas = parseXML(xml);
  
  const totalKhandas = adhyayas.reduce((sum, a) => sum + a.khandas.length, 0);
  const totalPassages = adhyayas.reduce((sum, a) => 
    sum + a.khandas.reduce((s, k) => s + k.passages.length, 0), 0);
  
  const result = {
    generated: new Date().toISOString(),
    title: 'ऐतरेय ब्राह्मणम्',
    titleRoman: 'Aitareya Brāhmaṇa',
    description: 'A Brahmana text associated with the Rigveda, with Sayana Bhashya',
    totalAdhyayas: adhyayas.length,
    totalKhandas,
    totalPassages,
    adhyayas
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  
  console.log(`\nAitareya Brahmana parsed:`);
  console.log(`  Adhyayas: ${result.totalAdhyayas}`);
  console.log(`  Khandas: ${totalKhandas}`);
  console.log(`  Passages: ${totalPassages}`);
  console.log(`  Output: ${OUTPUT_FILE}`);
}

main().catch(console.error);
