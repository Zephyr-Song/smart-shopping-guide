const fs = require('fs');
const txt = fs.readFileSync('src/data/mockData.ts', 'utf8');
// 只抓顶层店铺对象：{ id: 's001' 或 'n001', name: '...' }
const re = /\{\s*id:\s*'((?:s|n)\d+)'[^}]*?name:\s*['"]([^'"]+)['"]/g;
const frontStores = [];
let m;
while ((m = re.exec(txt)) !== null) frontStores.push({ id: m[1], name: m[2] });
const frontNames = frontStores.map(s => s.name);

const ds = JSON.parse(fs.readFileSync('scripts/dianping-ingest/dataset.json', 'utf8'));
const dsBrands = ds.map(d => d.brand);

const norm = s => s.toLowerCase().replace(/\s+/g, '').replace(/['’·]/g, '');
const frontNorm = new Set(frontNames.map(norm));

const exact = [], fuzzy = [], missing = [];
for (const b of dsBrands) {
  if (frontNames.includes(b)) exact.push(b);
  else if (frontNorm.has(norm(b))) {
    const hit = frontNames.find(n => norm(n) === norm(b));
    fuzzy.push(`${b}  ->  ${hit}`);
  } else missing.push(b);
}

const frontMissing = frontNames.filter(n => !dsBrands.includes(n) && !dsBrands.some(b => norm(b) === norm(n)));

console.log('=== 前端顶层店铺数:', frontStores.length, '| dataset brand 数:', dsBrands.length, '===');
console.log('\n[精确命中] dataset 品牌名 == 前端 store.name (' + exact.length + '):');
console.log(exact.join(', ') || '(无)');
console.log('\n[需改名对齐] 同一家但命名不同 (' + fuzzy.length + '):');
console.log(fuzzy.join('\n') || '(无)');
console.log('\n[dataset 孤儿] dataset 有但前端无任何近似店 (' + missing.length + '):');
console.log(missing.join(', ') || '(无)');
console.log('\n[前端缺数据] 前端有但 dataset 完全无对应 (' + frontMissing.length + '):');
console.log(frontMissing.join(', ') || '(无)');
