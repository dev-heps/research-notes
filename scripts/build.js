const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

const SECTIONS = [
  { id: 'papers', title: 'Papers', lede: 'A place for paper summaries, methods, limitations, and questions that connect back to ongoing research.' },
  { id: 'ideas', title: 'Ideas', lede: 'Early research questions, sketches, hypotheses, and project directions.' },
  { id: 'experiments', title: 'Experiments', lede: 'Experiment logs, setup details, reproducible notes, and observations.' }
];

function parseMarkdown(md) {
  let frontmatter = {};
  let body = md;

  // Extract YAML-like frontmatter
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

  // Parse title if not in frontmatter
  if (!frontmatter.title) {
    const titleMatch = body.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      frontmatter.title = titleMatch[1].trim();
    } else {
      frontmatter.title = 'Untitled Note';
    }
  }

  // Simple Markdown to HTML parser
  let html = body
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  // Code blocks
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // Lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

  // Paragraphs
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

  if (!fs.existsSync(sectionContentDir)) {
    return;
  }

  const files = fs.readdirSync(sectionContentDir).filter(f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md');
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
    <header class="site-header">
      <div class="shell">
        <nav class="nav" aria-label="Primary navigation">
          <a href="https://dev-heps.github.io/">Portfolio</a>
          <a href="../../">Research Notes</a>
          <a href="../">${section.title}</a>
          <strong>${frontmatter.title}</strong>
        </nav>
      </div>
    </header>
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
    <footer class="shell">&copy; 2026 Dongwoo Lee. Back to <a href="../">${section.title}</a>.</footer>
  </body>
</html>`;

    fs.writeFileSync(path.join(sectionDocsDir, htmlFileName), notePageHtml, 'utf-8');

    entries.push({
      title: frontmatter.title,
      slug,
      status: frontmatter.status || 'Active',
      summary: frontmatter.summary || 'Click to read note details.',
      url: `./${htmlFileName}`
    });
  }

  // Generate index.html for the section
  const cardsHtml = entries.length > 0 ? entries.map(e => `
        <article class="card">
          <p class="status">${e.status}</p>
          <h3><a href="${e.url}">${e.title}</a></h3>
          <p>${e.summary}</p>
        </article>`).join('\n') : `
        <article class="card">
          <p class="status">empty shell</p>
          <h3>No entries yet</h3>
          <p>Add markdown notes in <code>content/${section.id}/</code> and run build to generate.</p>
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
    <header class="site-header">
      <div class="shell">
        <nav class="nav" aria-label="Primary navigation">
          <a href="https://dev-heps.github.io/">Portfolio</a>
          <a href="../">Research Notes</a>
          <strong>${section.title}</strong>
          ${SECTIONS.filter(s => s.id !== section.id).map(s => `<a href="../${s.id}/">${s.title}</a>`).join('\n          ')}
        </nav>
      </div>
    </header>
    <main class="shell">
      <section class="hero">
        <p class="eyebrow">Research Notes</p>
        <h1>${section.title}</h1>
        <p class="lede">${section.lede}</p>
      </section>
      <section class="list">
        ${cardsHtml}
      </section>
    </main>
    <footer class="shell">&copy; 2026 Dongwoo Lee. Back to <a href="../">Research Notes</a>.</footer>
  </body>
</html>`;

  fs.writeFileSync(path.join(sectionDocsDir, 'index.html'), sectionIndexHtml, 'utf-8');
  console.log(`[build:research] Built ${section.title}: ${entries.length} notes processed.`);
}

console.log('[build:research] Compiling research-notes...');
SECTIONS.forEach(buildSection);
console.log('[build:research] Complete!');