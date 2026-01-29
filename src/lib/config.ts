// Audio configuration
// For local testing: '/audio'
// For Cloudflare R2: 'https://rigveda-audio.rigveda.workers.dev'
export const AUDIO_BASE_URL = 'https://rigveda-audio.rigveda.workers.dev';

// GitHub repository for issue reporting
export const GITHUB_REPO = 'hvram1/rigveda.sanatana.in';

// Feature flags - toggle features on/off
export const FEATURES = {
  audioPlayer: true,          // Basic audio player on verse pages
  svaranugami: true,          // Synced audio-text overlay player
  syncReportButton: true,     // Show "Report Timing Issue" button in overlay
};

// Helper to construct audio URL for a verse
export function getAudioUrl(mandala: number, sukta: number, rik: number): string {
  const m = String(mandala).padStart(3, '0');
  const s = String(sukta).padStart(3, '0');
  const r = String(rik).padStart(3, '0');
  return `${AUDIO_BASE_URL}/${m}/${s}/${r}.mp3`;
}

// Helper to generate GitHub issue URL for sync corrections
export function getSyncIssueUrl(mandala: number, sukta: number, rik: number, issueType?: string): string {
  const title = encodeURIComponent(`[Sync] Mandala ${mandala} / Sukta ${sukta} / Rik ${rik} - Pada timing issue`);
  const body = encodeURIComponent(`**Verse:** ${mandala}.${sukta}.${rik}
**Mandala:** ${mandala}
**Sukta:** ${sukta}
**Rik:** ${rik}

**Issue Type:** ${issueType || 'Pada boundary misaligned'}

**Description:** (Please describe the issue)

---
_Audio: ${getAudioUrl(mandala, sukta, rik)}_`);
  
  return `https://github.com/${GITHUB_REPO}/issues/new?title=${title}&labels=sync-correction&body=${body}`;
}
