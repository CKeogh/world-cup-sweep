import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..', '..', '..');

const htmlPath = join(root, '.opencode', 'skills', 'get-card-data', 'references', 'cardsTable.html');
const cardsPath = join(root, 'src', 'data', 'cards.json');

const html = readFileSync(htmlPath, 'utf-8');
const cards = JSON.parse(readFileSync(cardsPath, 'utf-8'));

const nameMap = {
  'Czechia': 'Czech Republic',
  'Congo DR': 'Democratic Republic of the Congo',
  'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
  'Türkiye': 'Turkey',
};

const rowRegex = /<tr class="Table__TR Table__TR--sm Table__even" data-idx="(\d+)">[\s\S]*?<\/tr>/g;
let rowMatch;
const rows = [];

while ((rowMatch = rowRegex.exec(html)) !== null) {
  rows.push({ idx: parseInt(rowMatch[1], 10), html: rowMatch[0] });
}

rows.sort((a, b) => a.idx - b.idx);

for (const { html: row } of rows) {
  const tdMatch = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
  if (!tdMatch || tdMatch.length < 6) continue;

  const nameRaw = row.match(/<a[^>]*>([\s\S]*?)<\/a\s*>/)?.[1]?.trim();
  if (!nameRaw) continue;

  const getSpanTar = (td) => {
    const m = td.match(/<span class="tar">([\s\S]*?)<\/span>/);
    return m ? m[1].trim() : '-';
  };

  const gamesRaw = getSpanTar(tdMatch[2]);
  const yellowRaw = getSpanTar(tdMatch[3]);
  const redRaw = getSpanTar(tdMatch[4]);

  const key = nameMap[nameRaw] || nameRaw;

  if (!cards[key]) {
    cards[key] = { yellow: 0, red: 0 };
  }

  const isDash = gamesRaw === '-';

  cards[key].yellow = isDash ? 0 : parseInt(yellowRaw, 10);
  cards[key].red = isDash ? 0 : parseInt(redRaw, 10);
  cards[key].points = isDash ? null : cards[key].yellow * 1 + cards[key].red * 4;
}

const played = Object.entries(cards)
  .filter(([, v]) => v.points !== null)
  .sort((a, b) => {
    if (b[1].points !== a[1].points) return b[1].points - a[1].points;
    return 0;
  });

played.forEach(([, v], i) => {
  v.rank = i + 1;
});

for (const v of Object.values(cards)) {
  if (v.rank === undefined) {
    v.rank = null;
  }
}

writeFileSync(cardsPath, JSON.stringify(cards, null, 2) + '\n');
console.log('Updated cards.json');
