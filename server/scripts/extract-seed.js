// Extraction script for A2Z sheet data from RSC payload with escaped quotes
const fs = require('fs');

const inputFile = process.argv[2] || 'scraped.md';
const outputFile = process.argv[3] || '../src/data/a2z-sheet.json';

const content = fs.readFileSync(inputFile, 'utf8');

// The RSC payload uses escaped quotes: \\\" becomes \"
// First, find the sections payload and unescape it
const sectionsMarker = 'sections\\":[';
const idx = content.indexOf(sectionsMarker);
if (idx === -1) {
  console.error('Could not find sections marker');
  process.exit(1);
}

// Extract from sections start, tracking bracket depth with proper escape handling
const startPos = idx + 'sections\\":'.length;
let depth = 0;
let endPos = startPos;
let inStr = false;

for (let i = startPos; i < content.length; i++) {
  const ch = content[i];
  const prev = i > 0 ? content[i-1] : '';
  const prev2 = i > 1 ? content.substring(i-2, i) : '';
  
  // Handle the escaped quote pattern: \\\"
  if (content.substring(i, i+4) === '\\\\\\"' || content.substring(i, i+3) === '\\"') {
    // This is an escaped quote in the RSC format, skip
    continue;
  }
  
  if (!inStr) {
    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) {
        endPos = i + 1;
        break;
      }
    }
  }
}

let raw = content.substring(startPos, endPos);

// Unescape: \\\" -> "
raw = raw.replace(/\\\\\\"/g, '"');
// Also handle: \\" -> "  
raw = raw.replace(/\\"/g, '"');
// Handle \\n -> newline
raw = raw.replace(/\\\\n/g, ' ');
raw = raw.replace(/\\n/g, ' ');
// Handle $undefined
raw = raw.replace(/"\$undefined"/g, 'null');

try {
  const sections = JSON.parse(raw);
  
  const result = sections.map(section => ({
    category_id: section.category_id,
    category_name: section.category_name,
    subcategories: (section.subcategories || []).map(sub => ({
      subcategory_id: sub.subcategory_id,
      subcategory_name: (sub.subcategory_name || '').replace(/\s+/g, ' ').trim(),
      problems: (sub.problems || []).map(prob => ({
        problem_id: prob.problem_id,
        problem_name: prob.problem_name,
        difficulty: prob.difficulty || 'Medium',
        leetcode: prob.leetcode || null,
        youtube: prob.youtube || null,
        article: prob.article || null,
      }))
    }))
  }));

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  
  let totalProblems = 0;
  result.forEach(s => s.subcategories.forEach(sub => totalProblems += sub.problems.length));
  console.log(`Extracted ${result.length} topics with ${totalProblems} problems`);
  
} catch (e) {
  console.error('JSON parse error:', e.message);
  // Try a different approach: regex-based extraction from unescaped content  
  console.log('Attempting regex-based extraction...');
  
  // Unescape the entire file content
  let unescaped = content.replace(/\\\\\\"/g, '"').replace(/\\"/g, '"').replace(/\\n/g, ' ');
  
  const catRegex = /"category_id":"(\d+)","category_name":"([^"]+)"/g;
  const subRegex = /"subcategory_id":"(\d+)","subcategory_name":"([^"]*?)"/g;
  const probRegex = /"problem_id":"(\d+)","problem_name":"([^"]*?)","article":(?:"([^"]*?)"|null),"youtube":(?:"([^"]*?)"|null),"leetcode":(?:"([^"]*?)"|null),"plus":(?:"[^"]*?"|null),"editorial":(?:"[^"]*?"|null),"link":(?:"[^"]*?"|null),"difficulty":"([^"]*?)"/g;
  
  const categories = [];
  let m;
  while ((m = catRegex.exec(unescaped)) !== null) {
    categories.push({ id: m[1], name: m[2], pos: m.index, subcategories: [] });
  }
  
  const subs = [];
  while ((m = subRegex.exec(unescaped)) !== null) {
    subs.push({ id: m[1], name: m[2].replace(/\s+/g, ' ').trim(), pos: m.index, problems: [] });
  }
  
  const probs = [];
  while ((m = probRegex.exec(unescaped)) !== null) {
    probs.push({
      problem_id: m[1],
      problem_name: m[2],
      article: m[3] || null,
      youtube: m[4] || null,
      leetcode: m[5] || null,
      difficulty: m[6] || 'Medium',
      pos: m.index
    });
  }
  
  console.log(`Regex found: ${categories.length} cats, ${subs.length} subs, ${probs.length} probs`);
  
  // Assign by position
  for (const prob of probs) {
    let best = null;
    for (const sub of subs) {
      if (sub.pos < prob.pos) best = sub;
    }
    if (best) best.problems.push(prob);
  }
  
  for (const sub of subs) {
    let best = null;
    for (const cat of categories) {
      if (cat.pos < sub.pos) best = cat;
    }
    if (best) best.subcategories.push(sub);
  }
  
  const result = categories
    .filter(c => c.subcategories.length > 0)
    .map(c => ({
      category_id: c.id,
      category_name: c.name,
      subcategories: c.subcategories.map(s => ({
        subcategory_id: s.id,
        subcategory_name: s.name,
        problems: s.problems.map(p => ({
          problem_id: p.problem_id,
          problem_name: p.problem_name,
          difficulty: p.difficulty,
          leetcode: p.leetcode,
          youtube: p.youtube,
          article: p.article
        }))
      }))
    }));
    
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  let total = 0;
  result.forEach(s => s.subcategories.forEach(sub => total += sub.problems.length));
  console.log(`Written ${result.length} topics with ${total} problems`);
}
