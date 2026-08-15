function wordUnits(text) {
  const latin = text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) || [];
  const cjk = text.match(/[\u3400-\u9FFF]/g) || [];
  return latin.length + cjk.length;
}

function extractTextRuns(xml) {
  return Array.from(
    xml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g),
    (match) => match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  );
}

function geometryIssues(xml) {
  const issues = [];
  for (const match of xml.matchAll(/<a:ext\b([^>]*)\/?\s*>/g)) {
    const attributes = match[1];
    const cx = /\bcx="([^"]+)"/.exec(attributes);
    const cy = /\bcy="([^"]+)"/.exec(attributes);
    for (const [axis, valueMatch] of [['cx', cx], ['cy', cy]]) {
      if (!valueMatch) continue;
      const value = Number(valueMatch[1]);
      if (!Number.isFinite(value) || value < 0) issues.push(`${axis}=${valueMatch[1]}`);
    }
  }
  return issues;
}

function wordBudgetForDensity(density) {
  const normalized = String(density || '').trim().toLowerCase();
  if (['high', 'dense', 'compact'].includes(normalized)) return 220;
  if (['low', 'airy', 'sparse'].includes(normalized)) return 100;
  return 150;
}

module.exports = { extractTextRuns, geometryIssues, wordBudgetForDensity, wordUnits };
