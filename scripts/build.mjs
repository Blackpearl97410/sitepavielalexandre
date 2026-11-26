import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
const requiredPages = ['index.html', 'mentions-legales.html', 'cgv.html', 'cgu.html', 'confidentialite.html', 'cookies.html'];
const rootFiles = new Set(['.nojekyll', 'CNAME', 'LICENSE', 'CREDITS.md']);
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const files = tracked.filter(file => rootFiles.has(file) || file.startsWith('assets/') || (
  !file.includes('/') && file !== 'index.gsap.html' && /\.(?:html|xml|txt|ico|png|jpe?g|webp|avif|gif|svg|webmanifest)$/i.test(file)
));
const pages = files.filter(file => !file.includes('/') && file.endsWith('.html'));
let scripts = 0;

function checkJavaScript(source, filename, module = false) {
  try {
    if (module) {
      execFileSync(process.execPath, ['--check', '--input-type=module'], { input: source, stdio: ['pipe', 'pipe', 'pipe'] });
    } else {
      new Script(source, { filename });
    }
  } catch (error) {
    throw new Error(`${filename} : ${error.message}`);
  }
  scripts++;
}

function checkReference(file, value) {
  const url = new URL(value, `https://site.invalid/${file}`);
  if (url.origin !== 'https://site.invalid' || value.startsWith('#')) return;
  const target = decodeURIComponent(url.pathname.slice(1));
  if (!existsSync(resolve(output, target))) throw new Error(`${file} : fichier requis absent (${value})`);
}

try {
  for (const page of requiredPages) {
    if (!files.includes(page)) throw new Error(`Page requise non suivie par Git : ${page}`);
  }
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  for (const file of files) {
    const target = resolve(output, file);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(resolve(root, file), target);
  }
  const modules = new Set();
  for (const page of pages) {
    const source = readFileSync(resolve(output, page), 'utf8');
    for (const [, attributes, body] of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
      const type = attributes.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() || '';
      const src = attributes.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
      if (src) {
        if (type === 'module') modules.add(new URL(src, `https://site.invalid/${page}`).pathname.slice(1));
      } else if (['', 'text/javascript', 'application/javascript', 'module'].includes(type)) {
        checkJavaScript(body, `${page} (script inline ${scripts + 1})`, type === 'module');
      }
    }
    for (const [, , value] of source.matchAll(/\b(?:src|href|poster)\s*=\s*(["'])(.*?)\1/gi)) checkReference(page, value);
  }
  for (const file of files) {
    if (/\.m?js$/.test(file)) checkJavaScript(readFileSync(resolve(output, file), 'utf8'), file, modules.has(file) || file.endsWith('.mjs'));
    if (file.endsWith('.css')) {
      const source = readFileSync(resolve(output, file), 'utf8');
      for (const match of source.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)/gi)) checkReference(file, match[1] ?? match[2] ?? match[3]);
    }
  }
  console.log(`Build statique réussi : ${pages.length} pages, ${scripts} scripts, ${files.length} fichiers dans dist/.`);
} catch (error) {
  console.error(`Échec du build : ${error.message}`);
  process.exitCode = 1;
}
