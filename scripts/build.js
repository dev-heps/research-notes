const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

const SECTIONS = [
  { id: 'papers', title: 'Papers', lede: 'Literature reviews, paper summaries, methodologies, and open questions across digital healthcare and mathematical sciences.' },
  { id: 'ideas', title: 'Ideas', lede: 'Early research hypotheses, theoretical sketches, and potential project directions.' },
  { id: 'experiments', title: 'Experiments', lede: 'Reproducible computational experiments, benchmark setups, and observations.' }
];

function getHeaderNav(activeSection, depth = 1) {
  const isDev = process.env.NODE_ENV === 'development';
  const prefix = depth === 2 ? '../../' : (depth === 1 ? '../' : './');
  const portfolioUrl = isDev ? 'http://localhost:3000/' : 'https://dev-heps.github.io/';

  return `
    <header class="site-header">
      <div class="shell">
        <nav class="nav" aria-label="Primary navigation">
          <a href="${portfolioUrl}" class="nav-back"><span>←</span><span>Portfolio</span></a>
          <div class="nav-divider" aria-hidden="true"></div>
          <a href="${prefix}" class="${activeSection === 'home' ? 'nav-active' : ''}">Research Notes</a>
          <a href="${prefix}papers/" class="${activeSection === 'papers' ? 'nav-active' : ''}">Papers</a>
          <a href="${prefix}ideas/" class="${activeSection === 'ideas' ? 'nav-active' : ''}">Ideas</a>
          <a href="${prefix}experiments/" class="${activeSection === 'experiments' ? 'nav-active' : ''}">Experiments</a>
        </nav>
      </div>
    </header>
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
          const key = line.substring(0, colonIdx).trim().toLowerCase();
          const val = line.substring(colonIdx + 1).trim();
          frontmatter[key] = val;
        }
      });
    }
  }

  if (!frontmatter.title) {
    const titleMatch = body.match(/^#\s+(.+)$/m);
    frontmatter.title = titleMatch ? titleMatch[1].trim() : 'Untitled Note';
  }

  let html = body
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

  const blocks = html.split(/\n\s*\n/);
  html = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<pre') || block.startsWith('<blockquote')) {
      return block;
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return { frontmatter, html };
}

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
      url: `./${htmlFileName}`
    });
  }

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

console.log('[build:research] Compiling research-notes with unified design...');
SECTIONS.forEach(buildSection);

// Update docs/index.html (Home)
const homeIndexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Research Notes - Dongwoo Lee</title>
    <meta name="description" content="Research notes on digital healthcare, mathematics, and quantum computing.">
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    ${getHeaderNav('home', 0)}
    <main class="shell">
      <section class="hero">
        <p class="eyebrow">Research Archive</p>
        <h1>Research Notes</h1>
        <p class="lede">Working notes for literature reviews, early hypotheses, and computational experiments across digital healthcare, mathematics, and quantum computing.</p>
      </section>
      <section class="grid" aria-label="Research categories">
        <a class="card" href="./papers/">
          <span class="status">Literature</span>
          <h2>Papers</h2>
          <p>Key claims, methods, limitations, and critical summaries of relevant literature.</p>
        </a>
        <a class="card" href="./ideas/">
          <span class="status">Hypotheses</span>
          <h2>Ideas</h2>
          <p>Early research questions, mathematical sketches, and conceptual project roadmaps.</p>
        </a>
        <a class="card" href="./experiments/">
          <span class="status">Logs</span>
          <h2>Experiments</h2>
          <p>Computational reproducibility logs, parameter sweeps, and benchmark data.</p>
        </a>
      </section>
    </main>
    <footer>&copy; 2026 Dongwoo Lee. Research Notes Archive.</footer>
  </body>
</html>`;

fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), homeIndexHtml, 'utf-8');
console.log('[build:research] Complete!');
