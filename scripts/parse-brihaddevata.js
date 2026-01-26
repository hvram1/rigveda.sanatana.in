/**
 * Parse Brihaddevata XML and generate JSON data
 */

import fs from 'fs';
import path from 'path';

const INPUT_FILE = '/Users/hvina/projects/rigveda-sanatana/brihaddevatha.xml';
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/brihaddevata.json');

function parseXML(xml) {
  const sections = [];
  
  // Match each section (handle inconsistent spacing in tags)
  const sectionRegex = /<section\s+id="([^"]+)">([\s\S]*?)<\/section\s*>/g;
  let sectionMatch;
  
  while ((sectionMatch = sectionRegex.exec(xml)) !== null) {
    const sectionId = sectionMatch[1];
    const sectionContent = sectionMatch[2];
    
    // Extract title
    const titleMatch = sectionContent.match(/<p class="adhyaya_title">([^<]+)<\/p>/);
    const title = titleMatch ? titleMatch[1].trim() : `अध्यायः ${sectionId}`;
    
    // Extract verses
    const verses = [];
    const verseRegex = /<p class="verse" id="([^"]+)">([^<]+(?:<br\s*\/?>)?[^<]*)<\/p>/g;
    let verseMatch;
    
    while ((verseMatch = verseRegex.exec(sectionContent)) !== null) {
      const verseId = verseMatch[1];
      let verseText = verseMatch[2]
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Extract verse number from end (e.g., ॥१॥)
      const numMatch = verseText.match(/॥(\d+)॥\s*$/);
      const verseNum = numMatch ? parseInt(numMatch[1], 10) : null;
      
      verses.push({
        id: verseId,
        number: verseNum,
        text: verseText
      });
    }
    
    // Extract adhyaya number from section ID (e.g., C01 -> 1)
    const adhyayaNum = parseInt(sectionId.replace('C', ''), 10);
    
    sections.push({
      id: sectionId,
      adhyaya: adhyayaNum,
      title,
      verses
    });
  }
  
  return sections;
}

async function main() {
  console.log('Parsing Brihaddevata XML...');
  
  const xml = fs.readFileSync(INPUT_FILE, 'utf-8');
  const sections = parseXML(xml);
  
  const result = {
    generated: new Date().toISOString(),
    title: 'बृहद्देवता',
    description: 'A treatise on the deities of the Rigveda by Shaunaka',
    totalAdhyayas: sections.length,
    totalVerses: sections.reduce((sum, s) => sum + s.verses.length, 0),
    adhyayas: sections
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  
  console.log(`\nBrihaddevata parsed:`);
  console.log(`  Adhyayas: ${result.totalAdhyayas}`);
  console.log(`  Total verses: ${result.totalVerses}`);
  console.log(`  Output: ${OUTPUT_FILE}`);
}

main().catch(console.error);
