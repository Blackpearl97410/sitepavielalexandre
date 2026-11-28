import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { protectPage } from './security.mjs';

const hash = body => `'sha256-${createHash('sha256').update(body).digest('base64')}'`;
const policy = html => html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/)?.[1];

test('la CSP précède les ressources et autorise uniquement les scripts inline exacts', () => {
  const body = '\nconsole.log("é");\n';
  const html = protectPage(`<html><head><meta charset="utf-8"><script>${body}</script></head></html>`);
  const csp = policy(html);
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script>'));
  assert.ok(csp.includes(hash(body)));
  assert.ok(!csp.includes(hash(body + 'alert(1)')));
  assert.ok(!csp.split('; ').find(d => d.startsWith('script-src ')).includes('unsafe-inline'));
  assert.ok(!csp.includes('unsafe-eval'));
  assert.ok(csp.includes("script-src-attr 'none'"));
});

test('les fins de ligne Windows et Unicode produisent les empreintes du HTML livré', () => {
  const html = protectPage('<html><head><meta charset="utf-8"><script>\r\nconst prénom = "Éloïse";\r\n</script></head></html>');
  const body = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.ok(!html.includes('\r'));
  assert.ok(policy(html).includes(hash(body)));
});

test('une CSP existante et un document mal formé échouent explicitement', () => {
  assert.throws(() => protectPage('<head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src none"></head>'), /CSP existe/);
  assert.throws(() => protectPage('<head><script>test()</script></head>'), /charset/);
});

test('la politique conserve le contact et YouTube sans autoriser les autres cadres', () => {
  const csp = policy(protectPage('<html><head><meta charset="utf-8"></head></html>'));
  assert.ok(csp.includes('form-action mailto:'));
  assert.ok(csp.includes('frame-src https://www.youtube-nocookie.com'));
  assert.ok(csp.includes("connect-src 'none'"));
  // These directives require real HTTP headers and must not be faked in a meta.
  assert.ok(!csp.includes('frame-ancestors'));
  assert.ok(!csp.includes('sandbox'));
});

test('le dossier publiable exclut gabarit, configuration et rapports', () => {
  const dist = fileURLToPath(new URL('../dist/', import.meta.url));
  for (const path of ['index.gsap.html', 'README.md', 'AGENTS.md', 'package.json', 'scripts', '.github']) {
    assert.equal(existsSync(dist + path), false, path);
  }
  assert.ok(existsSync(dist + 'index.html'));
  for (const name of readdirSync(dist).filter(name => name.endsWith('.html') && !name.startsWith('google'))) {
    const html = readFileSync(dist + name, 'utf8');
    const csp = policy(html);
    assert.ok(csp, name);
    assert.ok(html.includes('<meta name="referrer" content="strict-origin-when-cross-origin">'), name);
    for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
      if (!/\bsrc\s*=/i.test(attributes)) assert.ok(csp.includes(hash(body)), name);
    }
  }
  assert.match(readFileSync(dist + 'google4b7966b6d89d8450.html', 'utf8'), /^google-site-verification:/);
  const home = readFileSync(dist + 'index.html', 'utf8');
  assert.match(home, /<template><iframe[^>]*data-consent-src=/);
  assert.doesNotMatch(home, /<iframe\b[^>]*\ssrc=/);
});
