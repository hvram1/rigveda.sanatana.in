// Audio configuration
// For local testing: '/audio'
// For Cloudflare R2: 'https://rigveda-audio.rigveda.workers.dev'
export const AUDIO_BASE_URL = 'https://rigveda-audio.rigveda.workers.dev';

// Helper to construct audio URL for a verse
export function getAudioUrl(mandala: number, sukta: number, rik: number): string {
  const m = String(mandala).padStart(3, '0');
  const s = String(sukta).padStart(3, '0');
  const r = String(rik).padStart(3, '0');
  return `${AUDIO_BASE_URL}/${m}/${s}/${r}.mp3`;
}
