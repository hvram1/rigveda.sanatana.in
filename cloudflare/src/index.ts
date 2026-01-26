/**
 * Cloudflare Worker for Rigveda Audio Streaming
 * 
 * This worker proxies requests to a private R2 bucket,
 * validating that requests come from allowed domains.
 */

interface Env {
  AUDIO_BUCKET: R2Bucket;
}

// Allowed domains - update with your actual domain(s)
const ALLOWED_DOMAINS = [
  'rigveda.sanatana.in',      // Production domain
  'hvram1.github.io',          // GitHub Pages preview
  'localhost',                 // Local development
  '127.0.0.1'                  // Local development
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1); // Remove leading slash
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }
    
    // Validate referer
    const referer = request.headers.get('Referer') || '';
    const origin = request.headers.get('Origin') || '';
    
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      referer.includes(domain) || origin.includes(domain)
    );
    
    if (!isAllowed) {
      return new Response('Forbidden: Invalid origin', { 
        status: 403,
        headers: getCORSHeaders(request)
      });
    }
    
    // Validate path format (must be like 001/001/001.mp3)
    if (!isValidAudioPath(key)) {
      return new Response('Bad Request: Invalid path format', { 
        status: 400,
        headers: getCORSHeaders(request)
      });
    }
    
    // Fetch from R2
    const object = await env.AUDIO_BUCKET.get(key);
    
    if (!object) {
      return new Response('Not Found', { 
        status: 404,
        headers: getCORSHeaders(request)
      });
    }
    
    // Handle range requests for seeking
    const range = request.headers.get('Range');
    
    if (range) {
      return handleRangeRequest(object, range, request);
    }
    
    // Return full file
    const headers = new Headers({
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(object.size),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      ...getCORSHeaders(request)
    });
    
    return new Response(object.body, { headers });
  }
};

function isValidAudioPath(path: string): boolean {
  // Expected format: 001/001/001.mp3
  const pattern = /^\d{3}\/\d{3}\/\d{3}\.mp3$/;
  return pattern.test(path);
}

function getCORSHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    'Access-Control-Max-Age': '86400'
  };
}

function handleCORS(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(request)
  });
}

async function handleRangeRequest(
  object: R2ObjectBody, 
  range: string,
  request: Request
): Promise<Response> {
  const size = object.size;
  const match = range.match(/bytes=(\d*)-(\d*)/);
  
  if (!match) {
    return new Response('Invalid Range', { status: 416 });
  }
  
  let start = match[1] ? parseInt(match[1], 10) : 0;
  let end = match[2] ? parseInt(match[2], 10) : size - 1;
  
  // Clamp values
  start = Math.max(0, start);
  end = Math.min(size - 1, end);
  
  if (start > end) {
    return new Response('Range Not Satisfiable', { 
      status: 416,
      headers: { 'Content-Range': `bytes */${size}` }
    });
  }
  
  const contentLength = end - start + 1;
  
  // For range requests, we need to re-fetch with range
  // R2 doesn't support streaming partial content directly from R2ObjectBody
  // So we read the full body and slice it
  const arrayBuffer = await object.arrayBuffer();
  const slicedBuffer = arrayBuffer.slice(start, end + 1);
  
  const headers = new Headers({
    'Content-Type': 'audio/mpeg',
    'Content-Length': String(contentLength),
    'Content-Range': `bytes ${start}-${end}/${size}`,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000',
    ...getCORSHeaders(request)
  });
  
  return new Response(slicedBuffer, { 
    status: 206,
    headers 
  });
}
