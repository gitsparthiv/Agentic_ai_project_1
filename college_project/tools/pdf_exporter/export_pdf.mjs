import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';
import katex from 'katex';
import { chromium } from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MERMAID_JS_PATH = path.join(__dirname, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');
const KATEX_CSS_PATH = path.join(__dirname, 'node_modules', 'katex', 'dist', 'katex.min.css');

const BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

function findBrowserExecutable() {
  for (const exe of BROWSER_CANDIDATES) {
    if (fs.existsSync(exe)) return exe;
  }
  throw new Error('No Chrome or Edge executable found on standard Windows paths.');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function cleanLocalFileLinks(mdText) {
  return mdText.replace(/\[([^\]]+)\]\(file:\/\/\/[^)]+\)/g, '**$1**');
}

function renderLatexAndProtectCode(mdText) {
  const codePlaceholders = [];
  let working = mdText.replace(/```[\s\S]*?```|`[^`\n]+`/g, (match) => {
    const token = `@@CODE_BLOCK_${codePlaceholders.length}@@`;
    codePlaceholders.push(match);
    return token;
  });

  working = working.replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) =>
    `<div class="math-display">${katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })}</div>`
  );

  working = working.replace(/(^|[^\\$])\$([^\n$]+?)\$(?!\$)/g, (_, prefix, expr) => {
    if (/^\d/.test(expr.trim()) && !/[=<>\\^_{}]/.test(expr)) {
      return `${prefix}$${expr}$`;
    }
    return `${prefix}${katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false })}`;
  });

  working = working.replace(/@@CODE_BLOCK_(\d+)@@/g, (_, idx) => codePlaceholders[Number(idx)]);
  return working;
}

function convertGithubAlerts(html) {
  const alertKinds = {
    NOTE: 'Note',
    TIP: 'Tip',
    IMPORTANT: 'Important',
    WARNING: 'Warning',
    CAUTION: 'Caution'
  };
  return html.replace(
    /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*?)<\/blockquote>/g,
    (_, kind, body) => {
      const lower = kind.toLowerCase();
      return `<div class="callout callout-${lower}"><div class="callout-title">${alertKinds[kind]}</div><p>${body}</div>`;
    }
  );
}

function markdownToHtmlBody(rawMarkdown) {
  let processed = cleanLocalFileLinks(rawMarkdown);
  processed = renderLatexAndProtectCode(processed);

  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }) => {
    if ((lang || '').trim().toLowerCase() === 'mermaid') {
      return `<div class="mermaid-wrapper"><pre class="mermaid">${escapeHtml(text)}</pre></div>`;
    }
    const languageClass = lang ? ` class="language-${escapeHtml(lang.trim())}"` : '';
    return `<pre><code${languageClass}>${escapeHtml(text)}</code></pre>`;
  };

  marked.setOptions({ gfm: true, breaks: true, renderer });
  const rawHtml = marked.parse(processed);
  return convertGithubAlerts(rawHtml);
}

function buildHtmlDocument({ sectionsHtml, title, katexCss }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    ${katexCss}
    @page {
      size: A4 portrait;
      margin: 18mm 14mm 18mm 14mm;
    }
    @page landscape {
      size: A4 landscape;
      margin: 12mm 12mm 15mm 12mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.48;
      color: #1f2328;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 17pt;
      border-bottom: 2px solid #d0d7de;
      padding-bottom: 6px;
      margin-top: 0;
      color: #0969da;
    }
    h2 {
      font-size: 13.5pt;
      border-bottom: 1px solid #d8dee4;
      padding-bottom: 4px;
      margin-top: 18px;
      break-after: avoid;
    }
    h3 {
      font-size: 11pt;
      margin-top: 14px;
      break-after: avoid;
    }
    hr {
      border: 0;
      border-top: 1px solid #d8dee4;
      margin: 12px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px 0;
      font-size: 9pt;
      break-inside: avoid;
    }
    th, td {
      border: 1px solid #d0d7de;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
      word-break: break-word;
    }
    th {
      background-color: #f6f8fa;
      font-weight: 600;
    }
    tr:nth-child(even) td {
      background-color: #fafbfc;
    }
    code {
      font-family: Consolas, "Courier New", monospace;
      font-size: 8.6pt;
      background-color: #eff1f3;
      padding: 1px 4px;
      border-radius: 4px;
    }
    pre {
      background-color: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 10px 12px;
      overflow-x: auto;
      font-size: 8pt;
      line-height: 1.38;
      white-space: pre-wrap;
      word-break: break-word;
      break-inside: auto;
    }
    pre code {
      background: transparent;
      padding: 0;
    }
    .mermaid-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 10px 0;
      padding: 6px;
      border: 1px solid #eaeef2;
      border-radius: 6px;
      background: #ffffff;
      break-inside: avoid;
    }
    .landscape-block {
      page: landscape;
      break-inside: avoid;
    }
    .landscape-block .mermaid-wrapper {
      margin: 4px 0;
      border: 0;
      padding: 0;
    }
    pre.mermaid {
      background: transparent;
      border: 0;
      padding: 0;
      margin: 0;
      width: 100%;
      text-align: center;
      white-space: normal;
    }
    .mermaid svg {
      max-width: 100% !important;
      height: auto !important;
      max-height: 230mm;
    }
    .landscape-block .mermaid svg {
      max-height: 162mm !important;
      max-width: 100% !important;
    }
    .callout {
      border-left: 4px solid #0969da;
      background: #f6f8fa;
      padding: 8px 12px;
      margin: 10px 0;
      border-radius: 0 6px 6px 0;
      break-inside: avoid;
    }
    .callout-warning { border-left-color: #9a6700; background: #fff8c5; }
    .callout-caution { border-left-color: #cf222e; background: #ffebe9; }
    .callout-tip { border-left-color: #1a7f37; background: #dafbe1; }
    .callout-important { border-left-color: #8250df; background: #fbefff; }
    .callout-title { font-weight: 700; margin-bottom: 4px; font-size: 9.5pt; }
    .page-break { page-break-before: always; break-before: page; }
    .math-display { margin: 10px 0; text-align: center; }
  </style>
</head>
<body>
  ${sectionsHtml}
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node export_pdf.mjs <input.md> [output.pdf] [--title "Custom Title"]');
    process.exit(1);
  }

  let titleOverride = null;
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--title' && args[i + 1]) {
      titleOverride = args[i + 1];
      i += 1;
    } else {
      positional.push(args[i]);
    }
  }

  const inputPaths = [path.resolve(positional[0])];
  const defaultOutDir = path.resolve(path.dirname(inputPaths[0]), 'exports');
  const outputPath = positional[1]
    ? path.resolve(positional[1])
    : path.join(defaultOutDir, `${path.basename(inputPaths[0], '.md')}.pdf`);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const sectionsHtml = inputPaths
    .map((filePath) => markdownToHtmlBody(fs.readFileSync(filePath, 'utf-8')))
    .join('\n<div class="page-break"></div>\n');

  const docTitle = titleOverride || path.basename(inputPaths[0], '.md').replace(/_/g, ' ');
  const katexCss = fs.readFileSync(KATEX_CSS_PATH, 'utf-8')
    .replace(/url\(fonts\//g, `url(${pathToFileURL(path.join(path.dirname(KATEX_CSS_PATH), 'fonts')).href}/`);

  const html = buildHtmlDocument({ sectionsHtml, title: docTitle, katexCss });
  const tempHtmlPath = path.join(path.dirname(outputPath), `${path.basename(outputPath, '.pdf')}.preview.html`);
  fs.writeFileSync(tempHtmlPath, html, 'utf-8');

  const browserExe = findBrowserExecutable();
  const browser = await chromium.launch({
    executablePath: browserExe,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
    await page.goto(pathToFileURL(tempHtmlPath).href, { waitUntil: 'load' });
    await page.addScriptTag({ path: MERMAID_JS_PATH });

    const mermaidResult = await page.evaluate(async () => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: { useMaxWidth: true, htmlLabels: true },
        er: { useMaxWidth: true }
      });
      await mermaid.run({ querySelector: '.mermaid' });
      const svgs = Array.from(document.querySelectorAll('.mermaid svg'));
      const errors = Array.from(document.querySelectorAll('.mermaid svg[aria-roledescription="error"]')).length;
      let landscapeCount = 0;
      for (const svg of svgs) {
        const vb = svg.viewBox && svg.viewBox.baseVal;
        const w = (vb && vb.width) || svg.getBoundingClientRect().width;
        const h = (vb && vb.height) || svg.getBoundingClientRect().height;
        if (w > 0 && h > 0 && w / h > 1.25) {
          const wrapper = svg.closest('.mermaid-wrapper');
          if (wrapper) {
            const container = document.createElement('div');
            container.className = 'landscape-block';
            wrapper.parentNode.insertBefore(container, wrapper);
            container.appendChild(wrapper);
            landscapeCount += 1;
          }
        }
      }
      return { renderedCount: svgs.length, errorCount: errors, landscapeCount };
    });

    console.log('Mermaid render status:', JSON.stringify(mermaidResult));
    if (mermaidResult.errorCount > 0) {
      throw new Error(`Mermaid reported ${mermaidResult.errorCount} diagram syntax error(s).`);
    }

    await page.pdf({
      path: outputPath,
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:8px;color:#6e7781;width:100%;padding:0 14mm;display:flex;justify-content:space-between;"><span>LegalAdvisor AI — NSEC Capstone Documentation</span><span>${escapeHtml(docTitle)}</span></div>`,
      footerTemplate: '<div style="font-size:8px;color:#6e7781;width:100%;padding:0 14mm;display:flex;justify-content:space-between;"><span>Generated from Verified Blueprint</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
      margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' }
    });

    console.log('PDF exported successfully:', outputPath);
  } finally {
    await browser.close();
    if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
