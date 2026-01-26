import fs from 'fs';
import path from 'path';

export interface RikData {
  id: string;
  classification: {
    mandala: string;
    sukta: string;
    ashtaka: string;
    adhyaya: string;
    varga: string;
    anuvaka: string;
    rik: string;
  };
  attribute: {
    devata: string;
    rishi: string;
    chandas: string;
  };
  samhita: { lines: string | string[] };
  samhitaAux: { lines: string | string[] };
  padapaatha: { lines: string | string[] };
  sayanaBhashya: string;
}

export function parseSvara(text: string): string {
  // Insert actual Vedic svara marks:
  // {1} = anudatta (अनुदात्त) - horizontal line below: ॒
  // {2} = svarita (स्वरित) - double mark: ᳚
  // {5} = udatta (उदात्त) - vertical line above: ॑
  // {0} = end marker (no action needed, just remove)
  return text
    .replace(/\{1\}/g, '॒')
    .replace(/\{2\}/g, '᳚')
    .replace(/\{5\}/g, '॑')
    .replace(/\{0\}/g, '');
}

export function formatVerseId(mandala: number, sukta: number, rik: number): string {
  return `${mandala}.${sukta}.${rik}`;
}

export function padNumber(n: number, width: number = 3): string {
  return String(n).padStart(width, '0');
}

export async function loadRik(mandala: number, sukta: number, rik: number): Promise<RikData | null> {
  const filePath = path.join(
    process.cwd(),
    'src/data',
    padNumber(mandala),
    padNumber(sukta),
    `${padNumber(rik)}.json`
  );
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function getSuktaRiks(mandala: number, sukta: number): Promise<RikData[]> {
  const suktaPath = path.join(process.cwd(), 'src/data', padNumber(mandala), padNumber(sukta));
  const riks: RikData[] = [];
  
  try {
    const files = fs.readdirSync(suktaPath).filter(f => f.endsWith('.json')).sort();
    for (const file of files) {
      const content = fs.readFileSync(path.join(suktaPath, file), 'utf-8');
      riks.push(JSON.parse(content));
    }
  } catch {}
  
  return riks;
}

export function getMandalaInfo(mandala: number): { suktas: number[] } {
  const mandalaPath = path.join(process.cwd(), 'src/data', padNumber(mandala));
  
  try {
    const suktas = fs.readdirSync(mandalaPath)
      .filter(d => !d.startsWith('.'))
      .map(d => parseInt(d, 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
    return { suktas };
  } catch {
    return { suktas: [] };
  }
}

export const MANDALA_NAMES = [
  '', // index 0 unused
  'प्रथमं मण्डलम्',
  'द्वितीयं मण्डलम्',
  'तृतीयं मण्डलम्',
  'चतुर्थं मण्डलम्',
  'पञ्चमं मण्डलम्',
  'षष्ठं मण्डलम्',
  'सप्तमं मण्डलम्',
  'अष्टमं मण्डलम्',
  'नवमं मण्डलम्',
  'दशमं मण्डलम्',
];

// Cache for all riks to avoid repeated file reads
let _allRiksCache: RikData[] | null = null;

// Load all riks and extract unique attributes (cached)
export function getAllRiks(): RikData[] {
  if (_allRiksCache) return _allRiksCache;
  
  const allRiks: RikData[] = [];
  const dataPath = path.join(process.cwd(), 'src/data');
  
  for (let m = 1; m <= 10; m++) {
    const mandalaPath = path.join(dataPath, padNumber(m));
    try {
      const suktas = fs.readdirSync(mandalaPath).filter(d => !d.startsWith('.'));
      for (const s of suktas) {
        const suktaPath = path.join(mandalaPath, s);
        const riks = fs.readdirSync(suktaPath).filter(f => f.endsWith('.json'));
        for (const r of riks) {
          const content = fs.readFileSync(path.join(suktaPath, r), 'utf-8');
          allRiks.push(JSON.parse(content));
        }
      }
    } catch {}
  }
  
  _allRiksCache = allRiks;
  return allRiks;
}

export interface AttributeInfo {
  name: string;
  count: number;
  verses: { mandala: number; sukta: number; rik: number; id: string }[];
}

// Cache for attribute indices
const _attrIndexCache = new Map<string, AttributeInfo[]>();

export function getAttributeIndex(type: 'rishi' | 'devata' | 'chandas'): AttributeInfo[] {
  if (_attrIndexCache.has(type)) return _attrIndexCache.get(type)!;
  
  const allRiks = getAllRiks();
  const attrMap = new Map<string, AttributeInfo>();
  
  for (const rik of allRiks) {
    const attrValue = rik.attribute[type];
    if (!attrMap.has(attrValue)) {
      attrMap.set(attrValue, { name: attrValue, count: 0, verses: [] });
    }
    const info = attrMap.get(attrValue)!;
    info.count++;
    info.verses.push({
      mandala: parseInt(rik.classification.mandala),
      sukta: parseInt(rik.classification.sukta),
      rik: parseInt(rik.classification.rik),
      id: rik.id
    });
  }
  
  // Sort by name (Sanskrit alphabetical)
  const result = Array.from(attrMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'sa'));
  _attrIndexCache.set(type, result);
  return result;
}

export function getVersesByAttribute(type: 'rishi' | 'devata' | 'chandas', value: string): Map<number, Map<number, number[]>> {
  const allRiks = getAllRiks();
  const grouped = new Map<number, Map<number, number[]>>();
  
  for (const rik of allRiks) {
    if (rik.attribute[type] === value) {
      const m = parseInt(rik.classification.mandala);
      const s = parseInt(rik.classification.sukta);
      const r = parseInt(rik.classification.rik);
      
      if (!grouped.has(m)) grouped.set(m, new Map());
      if (!grouped.get(m)!.has(s)) grouped.get(m)!.set(s, []);
      grouped.get(m)!.get(s)!.push(r);
    }
  }
  
  // Sort riks within each sukta
  for (const [_, suktas] of grouped) {
    for (const [_, riks] of suktas) {
      riks.sort((a, b) => a - b);
    }
  }
  
  return grouped;
}

// Samanapada mantras
let _samanapadaSet: Set<string> | null = null;

export function getSamanapadaSet(): Set<string> {
  if (_samanapadaSet) return _samanapadaSet;
  
  const filePath = path.join(process.cwd(), 'src/data/samanapada_list.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  const list: string[] = JSON.parse(content);
  _samanapadaSet = new Set(list);
  return _samanapadaSet;
}

export function isSamanapada(mandala: number, sukta: number, rik: number): boolean {
  const set = getSamanapadaSet();
  return set.has(`${mandala}.${sukta}.${rik}`);
}

export function getSamanapadaList(): string[] {
  const filePath = path.join(process.cwd(), 'src/data/samanapada_list.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export function getSamanapadaByMandala(): Map<number, { sukta: number; rik: number }[]> {
  const list = getSamanapadaList();
  const grouped = new Map<number, { sukta: number; rik: number }[]>();
  
  for (const id of list) {
    const [m, s, r] = id.split('.').map(Number);
    if (!grouped.has(m)) grouped.set(m, []);
    grouped.get(m)!.push({ sukta: s, rik: r });
  }
  
  return grouped;
}
