# ऋग्वेद (Rigveda) - Feature Guide

A comprehensive digital platform for exploring the ancient Rigveda with modern navigation, search, and audio capabilities.

---

## Table of Contents

1. [Homepage](#homepage)
2. [Navigation System](#navigation-system)
3. [Sukta (Hymn) Pages](#sukta-hymn-pages)
4. [Rik (Verse) Detail Pages](#rik-verse-detail-pages)
5. [Search Functionality](#search-functionality)
6. [Attribute Indices](#attribute-indices)
7. [Classification Systems](#classification-systems)
8. [Auxiliary Texts](#auxiliary-texts)
9. [Audio Streaming](#audio-streaming)
10. [Mobile Accessibility](#mobile-accessibility)

---

## Homepage

![Homepage](screenshots/01-homepage.png)

The homepage serves as the central hub for navigating the Rigveda. It features:

### Header Banner
- Traditional design with the Rigveda emblem
- Sanskrit title "ऋग्वेद" with English transliteration "Ṛgvēda - The Ancient Vedic Hymns"

### Mandala Navigation Grid
- **10 Mandalas** displayed as interactive cards
- Each card shows:
  - Mandala number (1-10)
  - Sanskrit name (e.g., "प्रथमं मण्डलम्")
  - Number of suktas in that mandala
- Click any mandala to directly access its first sukta

### Quick Access Sections

**अन्य वर्गीकरणम् (Other Classifications)**
- अष्टकवर्गीकरणम् (Ashtaka Classification)
- ऋषयः (Rishis)
- देवताः (Devatas)
- छन्दांसि (Chandas/Meters)
- समानपदमन्त्राः (Samanapada Mantras)

**अनुक्रमणिकाः (Indices)**
- पदानुक्रमणिका (Word Index)
- मन्त्रानुक्रमणिका (Mantra Index)
- अन्वेषणम् (Search)

**सहायग्रन्थाः (Auxiliary Texts)**
- बृहद्देवता (Brihaddevata)
- ऐतरेय ब्राह्मणम् (Aitareya Brahmana)

---

## Navigation System

### Persistent Sidebar

![Sukta Page with Sidebar](screenshots/02-sukta-page.png)

The sidebar provides seamless navigation across the entire Rigveda:

#### Mandala Selector
- Grid of numbers 1-10
- Currently selected mandala is highlighted
- Click to switch between mandalas

#### Sukta Selector
- Shows all suktas in the current mandala
- Scrollable grid for mandalas with many suktas
- Active sukta is highlighted

#### Rik Selector
- Appears when viewing a sukta
- Shows all verses (riks) in the current sukta
- **Samanapada Indicators**: Golden dots (●) mark verses that are samanapada mantras

#### Quick Jump
- Text input for direct navigation
- Enter "1.45" to jump to Sukta 1.45
- Enter "1.45.3" to jump to Rik 1.45.3
- Enter just "5" to jump to Mandala 5, Sukta 1

#### Quick Links
- Search link with icon
- Links to homepage, rishis, devatas, chandas

---

## Sukta (Hymn) Pages

![Sukta Page](screenshots/02-sukta-page.png)

Each sukta page displays all verses of a hymn with:

### Sukta Header
- Sukta identifier (e.g., "सूक्तम् 1.1")
- Rishi, Devata, and Chandas information

### Playlist Player
- Play all verses sequentially
- Controls: Play/Pause, Previous, Next, Stop
- Progress bar with seeking capability
- Track counter showing current position
- Collapsible track list

### Verse Cards
Each verse displays:
- **Verse ID** (e.g., "1.1.1") - clickable link to detail page
- **Samhita text** with svara marks (Vedic accents)
- **Samanapada badge** for eligible verses
- Collapsible **पदपाठः** (Padapatha - word-by-word analysis)
- **Metadata footer**: Rishi, Devata, Chandas (all clickable links)

---

## Rik (Verse) Detail Pages

![Rik Detail Page](screenshots/03-rik-detail.png)

Individual verse pages provide comprehensive information:

### Verse Display
- Large, clear Sanskrit text with svara marks
- Svara notation using Unicode diacritics:
  - उदात्त (Udatta): ॑
  - अनुदात्त (Anudatta): ॒  
  - स्वरित (Svarita): ᳚

### Collapsible Sections
- **पदपाठः (Padapatha)**: Word-by-word breakdown
- **सायणभाष्यम् (Sayana Commentary)**: Traditional Sanskrit commentary

### Audio Player
- HTML5 audio player for verse recitation
- Streaming from Cloudflare R2

### Verse Classification
- Mandala, Adhyaya, Varga, Anuvaka information
- Alternative classification system details

### Navigation
- Previous/Next verse buttons
- Full sidebar for jumping to any verse

---

## Search Functionality

![Search Results](screenshots/04-search-results.png)

### Phonetic Search
The search system supports **phonetic matching** for Sanskrit:

- Aspirated/unaspirated pairs: द/ध, त/थ, क/ख, etc.
- Sibilants: स/श/ष
- Nasals: न/ण/ङ/ञ
- Vowel length: इ/ई, उ/ऊ, etc.

### Features
- **10,552 verses** indexed for instant search
- Checkbox to toggle phonetic matching
- **Dual-color highlighting**:
  - Yellow: Exact matches
  - Blue: Phonetic variant matches

### Search Results
- Maximum 20 results displayed
- Each result shows:
  - Verse ID (clickable link)
  - First line of the verse with highlights
  - Rishi and Devata metadata
- Golden left border for visual distinction
- Hover effects for interactivity

### Quick Links
- Direct access to attribute pages from search

---

## Attribute Indices

### Rishi Index (ऋषयः)

![Rishi Index](screenshots/05-rishi-index.png)

- **485+ unique rishis** catalogued
- **Top 20 rishis** by verse count displayed prominently
- **Alphabetical navigation** by Devanagari letter
- Each rishi page shows:
  - Total verse count
  - Verses grouped by mandala and sukta
  - Direct links to each verse

### Devata Index (देवताः)
- Similar organization to Rishi index
- Top deities with verse counts
- Complete alphabetical listing

### Chandas Index (छन्दांसि)
- All Vedic meters listed
- Visual frequency bars showing usage
- Sorted by popularity

---

## Classification Systems

### Ashtaka Classification (अष्टकवर्गीकरणम्)

![Ashtaka Index](screenshots/06-ashtaka-index.png)

An alternative organization of the Rigveda into:
- **8 Ashtakas** (eighths)
- **8 Adhyayas** per Ashtaka (64 total)
- Multiple **Vargas** per Adhyaya

Each Adhyaya page shows verses grouped by Varga with navigation between sections.

### Pada Index (पदानुक्रमणिका)

![Pada Index](screenshots/07-pada-index.png)

Comprehensive word index extracted from Padapatha:
- **29,811 unique words** indexed
- Organized by **36 Devanagari letters**
- Each word shows:
  - Occurrence count
  - Links to verses containing it
- Top 10 most frequent words highlighted

### Mantra Index (मन्त्रानुक्रमणिका)
- All **10,552 mantras** listed alphabetically
- Organized by first letter of each verse
- Quick navigation between letter sections

---

## Samanapada Mantras (समानपदमन्त्राः)

![Samanapada Page](screenshots/08-samanapada.png)

Special mantras that have equal syllables in each pada (quarter), enabling all 8 vikṛtis (recitation variations):

- **1,539 samanapada mantras** identified
- Organized by mandala
- Visual indicators:
  - Golden dots in sidebar navigation
  - "समानपद" badge on verse cards
- Direct links to each verse

---

## Auxiliary Texts

### Brihaddevata (बृहद्देवता)

![Brihaddevata](screenshots/09-brihaddevata.png)

A treatise by Shaunaka explaining the deities of each Rigvedic hymn:
- **8 Adhyayas** (chapters)
- **1,236 verses** total
- Essential context for ritual application
- Navigation between chapters

### Aitareya Brahmana (ऐतरेय ब्राह्मणम्)
- **10 Adhyayas** containing **71 Khandas**
- **636 passages** with Sayana Bhashya
- Each passage shows:
  - Original Brahmana text
  - Sayana's Sanskrit commentary
- Chapter and Khanda navigation

---

## Audio Streaming

### Features
- Professional Vedic recitation audio
- Streaming via Cloudflare R2 CDN
- Private access restricted to the website

### Single Verse Player
- Standard HTML5 audio controls
- Play/Pause, seeking, volume control
- Available on every verse detail page

### Sukta Playlist Player
- Sequential playback of all verses in a sukta
- Full playback controls:
  - Play/Pause
  - Previous/Next track
  - Stop
- Progress bar with seeking
- Track counter (e.g., "1 / 9")
- Expandable track list for jumping

---

## Mobile Accessibility

![Mobile Homepage](screenshots/11-mobile-homepage.png)

The site is fully responsive and optimized for mobile devices:

### Responsive Layout
- Single-column layout on small screens
- Touch-friendly tap targets (44px minimum)
- Readable typography that scales appropriately

### Mobile Navigation
- Hamburger menu button (bottom-right)
- Slide-out navigation drawer
- Full sidebar functionality on mobile
- Overlay for focused navigation

### Mobile-Optimized Features
- Collapsible sections reduce scrolling
- Swipe-friendly verse navigation
- Optimized audio player controls
- Quick jump remains accessible

### Performance
- Static site generation for instant loading
- Optimized images and fonts
- Gzipped search index (1.3MB from 8.6MB)
- CDN-served audio for low latency

---

## Technical Specifications

### Content Statistics
- **10 Mandalas**
- **1,028 Suktas**
- **10,552 Riks (verses)**
- **12,678 total pages** generated

### Typography
- **AdiShila Vedic** font for authentic Sanskrit rendering
- Proper svara mark display
- Devanagari optimized for web

### Data Sources
- Verse data from structured JSON files
- Samanapada analysis from traditional sources
- Audio from professional Vedic reciters

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Execute search |
| / | Focus search input (on search page) |

---

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome for Android)

---

*ॐ असतो मा सद्गमय ।*
*तमसो मा ज्योतिर्गमय ।*
*मृत्योर्मा अमृतं गमय ॥*

---

© Rigveda Sanatana - Preserving Ancient Wisdom
