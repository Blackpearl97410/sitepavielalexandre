import { createHash } from 'node:crypto';

export function protectPage(input) {
  // HTML normalizes line endings before computing inline script hashes.
  const source = input.replace(/\r\n?/g, '\n');
  if (/<meta\b[^>]*http-equiv\s*=\s*["']Content-Security-Policy["']/i.test(source)) {
    throw new Error('Une CSP existe déjà : réconcilier les politiques avant de compiler.');
  }
  const charset = /<meta\b[^>]*charset\s*=\s*["']utf-8["'][^>]*>/i;
  if (!/<head\b/i.test(source) || !charset.test(source)) {
    throw new Error('La page doit déclarer un head et un charset UTF-8.');
  }
  const hashes = new Set();
  for (const [, attributes, body] of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (/\bsrc\s*=/i.test(attributes)) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
  const policy = [
    "default-src 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    `script-src 'self' ${[...hashes].join(' ')}`.trim(),
    "script-src-attr 'none'",
    // The existing animations set inline CSS properties and use inline styles.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "media-src 'self'",
    "connect-src 'none'",
    'frame-src https://www.youtube-nocookie.com',
    "form-action 'self' https://formsubmit.co",
    'upgrade-insecure-requests'
  ].join('; ');
  const metadata = `\n<meta http-equiv="Content-Security-Policy" content="${policy}">\n<meta name="referrer" content="strict-origin-when-cross-origin">`;
  // Place the policy before any scripts, styles or resource loads.
  return source.replace(charset, match => match + metadata);
}
