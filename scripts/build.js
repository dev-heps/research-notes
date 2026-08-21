const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

const SECTIONS = [
  { 
    id: 'papers', 
    title: 'Papers', 
    lede: 'Literature reviews, paper summaries, methodologies, and critical open questions across digital healthcare, mathematics, and quantum computing.' 
  }
];

function getHeaderNav(activeSection, depth = 1) {
  const isDev = process.env.NODE_ENV === 'development';
  const prefix = depth === 2 ? '../../' : (depth === 1 ? '../' : './');
  const portfolioUrl = isDev ? 'http://localhost:3000/' : 'https://dev-dwlee.github.io/';

  return `
    <header class="site-header">
      <div class="shell">
        <nav class="nav" aria-label="Primary navigation">
          <a href="${portfolioUrl}" class="nav-back"><span>←</span><span>Home</span></a>
          <div class="nav-divider" aria-hidden="true"></div>
          <a href="${prefix}" class="${activeSection === 'home' ? 'nav-active' : ''}">Research</a>
          <a href="${prefix}papers/" class="${activeSection === 'papers' ? 'nav-active' : ''}">Papers</a>
        </nav>
      </div>
    </header>
  `;
}

function getKaTeXHead() {
  return `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body, {delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}]});"></script>
  `;
}

function getAmbientCanvasScript() {
  return `
    <script>
      (function() {
        var canvas = document.getElementById('ambient-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;
        var W, H, frame = 0;
        
        function resize() {
          var rect = canvas.parentElement.getBoundingClientRect();
          W = rect.width;
          H = rect.height;
          canvas.width = W * dpr;
          canvas.height = H * dpr;
          canvas.style.width = W + 'px';
          canvas.style.height = H + 'px';
          ctx.scale(dpr, dpr);
        }
        resize();
        window.addEventListener('resize', resize);

        function draw() {
          frame++;
          ctx.clearRect(0, 0, W, H);
          var baseline = H * 0.7;
          
          for (var l = 0; l < 3; l++) {
            ctx.beginPath();
            ctx.strokeStyle = l === 0 ? 'rgba(37, 99, 235, 0.25)' : 'rgba(9, 9, 11, 0.08)';
            ctx.lineWidth = l === 0 ? 1.4 : 0.8;
            for (var px = 0; px <= W; px += 3) {
              var xNorm = px / W;
              var y = baseline + Math.sin(xNorm * Math.PI * 3 + frame * 0.015 + l * 0.8) * 14
                             + Math.cos(xNorm * Math.PI * 6 - frame * 0.01) * 6;
              if (px === 0) ctx.moveTo(px, y);
              else ctx.lineTo(px, y);
            }
            ctx.stroke();
          }
          requestAnimationFrame(draw);
        }
        draw();
      })();
    </script>
  `;
}

function parseMarkdown(md) {
  let frontmatter = {};
  let body = md;

  if (md.startsWith('---')) {
    const end = md.indexOf('---', 3);
    if (end !== -1) {
      const yamlStr = md.substring(3, end).trim();
      body = md.substring(end + 3).trim();
      yamlStr.split('\n').forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const key = line.substring(0, colonIdx).trim();
          const val = line.substring(colonIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
          frontmatter[key] = val;
        }
      });
    }
  }

  let codeBlocks = [];
  let mathBlocks = [];

  body = body.replace(/```([\s\S]*?)```/g, (match, code) => {
    codeBlocks.push(`<pre><code>${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  body = body.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
    mathBlocks.push(`$$${math}$$`);
    return `__MATH_BLOCK_${mathBlocks.length - 1}__`;
  });

  let html = body
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (match) => {
    const lines = match.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return match;
    const isHeaderSeparator = lines[1].replace(/[\s|:-]/g, '').length === 0;
    if (!isHeaderSeparator) return match;

    const parseRow = (row, tag) => {
      const cells = row.split('|').slice(1, -1).map(c => c.trim());
      return `<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
    };

    const header = `<thead>${parseRow(lines[0], 'th')}</thead>`;
    const bodyRows = lines.slice(2).map(r => parseRow(r, 'td')).join('');
    return `<div class="table-wrap"><table>${header}<tbody>${bodyRows}</tbody></table></div>`;
  });

  html = html.replace(/^\s*-\s+\[ \]\s+(.*$)/gim, '<li class="task-item"><input type="checkbox" disabled> $1</li>');
  html = html.replace(/^\s*-\s+\[x\]\s+(.*$)/gim, '<li class="task-item"><input type="checkbox" checked disabled> $1</li>');
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>(\s*<li>[\s\S]*?<\/li>)*)/gim, '<ul>$1</ul>');

  const blocks = html.split(/\n\s*\n/);
  html = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    if (
      block.startsWith('<h') || 
      block.startsWith('<ul') || 
      block.startsWith('<pre') || 
      block.startsWith('<blockquote') || 
      block.startsWith('<hr') || 
      block.startsWith('<div class="table-wrap"') || 
      block.startsWith('__CODE_BLOCK_') || 
      block.startsWith('__MATH_BLOCK_')
    ) {
      return block;
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  codeBlocks.forEach((cb, idx) => {
    html = html.replace(`__CODE_BLOCK_${idx}__`, () => cb);
  });

  mathBlocks.forEach((mb, idx) => {
    html = html.replace(`__MATH_BLOCK_${idx}__`, () => `<div class="math-display">${mb}</div>`);
  });

  return { frontmatter, html };
}

let allPaperEntries = [];

function buildSection(section) {
  const sectionContentDir = path.join(CONTENT_DIR, section.id);
  const sectionDocsDir = path.join(DOCS_DIR, section.id);

  if (!fs.existsSync(sectionDocsDir)) {
    fs.mkdirSync(sectionDocsDir, { recursive: true });
  }

  const files = fs.existsSync(sectionContentDir) 
    ? fs.readdirSync(sectionContentDir).filter(f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
    : [];
  
  const entries = [];

  for (const file of files) {
    const filePath = path.join(sectionContentDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, html } = parseMarkdown(raw);
    const slug = path.basename(file, '.md');
    const htmlFileName = `${slug}.html`;

    const notePageHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${frontmatter.title} - ${section.title} - Research Notes</title>
    <meta name="description" content="${frontmatter.summary || frontmatter.title}">
    <link rel="stylesheet" href="../../styles.css">
    <link rel="stylesheet" href="/research/styles.css">
    ${getKaTeXHead()}
  </head>
  <body>
    ${getHeaderNav(section.id, 2)}
    <main class="shell">
      <article class="article-content">
        <header class="hero">
          <p class="eyebrow">${section.title} / ${frontmatter.status || 'Note'}</p>
          <h1>${frontmatter.title}</h1>
          ${frontmatter.authors ? `<p class="authors"><strong>Authors:</strong> ${frontmatter.authors}</p>` : ''}
          ${frontmatter.year ? `<p class="meta"><strong>Year:</strong> ${frontmatter.year}</p>` : ''}
          ${frontmatter.link ? `<p class="link"><a href="${frontmatter.link}" target="_blank" rel="noreferrer">Original Source ↗</a></p>` : ''}
        </header>
        <div class="content-body">
          ${html}
        </div>
      </article>
    </main>
    <footer>&copy; 2026 Dongwoo Lee. Research Notes Archive.</footer>
  </body>
</html>`;

    fs.writeFileSync(path.join(sectionDocsDir, htmlFileName), notePageHtml, 'utf-8');

    entries.push({
      title: frontmatter.title,
      slug,
      status: frontmatter.status || 'Note',
      summary: frontmatter.summary || 'Click to read note details.',
      url: `./${htmlFileName}`,
      homeUrl: `./${section.id}/${htmlFileName}`
    });
  }

  allPaperEntries = entries;

  const cardsHtml = entries.length > 0 ? entries.map(e => `
        <a class="card" href="${e.url}">
          <span class="status">${e.status}</span>
          <h3>${e.title}</h3>
          <p>${e.summary}</p>
        </a>`).join('\n') : `
        <article class="card">
          <span class="status">active queue</span>
          <h3>No notes published yet</h3>
          <p>Add markdown notes in <code>content/${section.id}/</code> to auto-generate.</p>
        </article>`;

  const sectionIndexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${section.title} - Research Notes</title>
    <meta name="description" content="${section.title} for Research Notes.">
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="/research/styles.css">
    ${getKaTeXHead()}
  </head>
  <body>
    ${getHeaderNav(section.id, 1)}
    <main class="shell">
      <section class="hero">
        <p class="eyebrow">Research Section</p>
        <h1>${section.title}</h1>
        <p class="lede">${section.lede}</p>
      </section>
      <section class="list">
        ${cardsHtml}
      </section>
    </main>
    <footer>&copy; 2026 Dongwoo Lee. Research Notes Archive.</footer>
  </body>
</html>`;

  fs.writeFileSync(path.join(sectionDocsDir, 'index.html'), sectionIndexHtml, 'utf-8');
  console.log(`[build:research] Built ${section.title}: ${entries.length} notes.`);
}

console.log('[build:research] Compiling research-notes (Papers focus)...');
SECTIONS.forEach(buildSection);

// Update docs/index.html (Home)
const homeCardsHtml = allPaperEntries.length > 0 ? allPaperEntries.map(e => `
      <a class="card" href="${e.homeUrl}">
        <span class="status">${e.status}</span>
        <h3>${e.title}</h3>
        <p>${e.summary}</p>
      </a>`).join('\n') : `
      <article class="card">
        <span class="status">Literature</span>
        <h3>No paper reviews yet</h3>
        <p>Add markdown notes in <code>content/papers/</code> to publish.</p>
      </article>`;

const homeIndexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Research Notes - Dongwoo Lee</title>
    <meta name="description" content="Research notes on digital healthcare, mathematics, and quantum computing.">
    <link rel="stylesheet" href="./styles.css">
    <link rel="stylesheet" href="/research/styles.css">
    ${getKaTeXHead()}
  </head>
  <body>
    ${getHeaderNav('home', 0)}
    <main class="shell">
      <section class="hero" style="position: relative; overflow: hidden;">
        <canvas id="ambient-canvas" style="position: absolute; inset: 0; pointer-events: none; opacity: 0.85; z-index: 0;"></canvas>
        <div style="position: relative; z-index: 1;">
          <p class="eyebrow">Research Archive</p>
          <h1>Research Notes</h1>
          <p class="lede">Working archive for academic paper reviews, literature summaries, and theoretical methodologies across digital healthcare, mathematics, and quantum computing.</p>
        </div>
      </section>
      <section class="list" aria-label="Paper reviews">
        ${homeCardsHtml}
      </section>
    </main>
    <footer>&copy; 2026 Dongwoo Lee. Research Notes Archive.</footer>
    ${getAmbientCanvasScript()}
  </body>
</html>`;

fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), homeIndexHtml, 'utf-8');
console.log('[build:research] Complete!');
