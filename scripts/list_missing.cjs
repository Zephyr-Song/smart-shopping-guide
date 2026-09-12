const fs = require('fs');
const txt = fs.readFileSync('src/data/mockData.ts', 'utf8');
const re = /\{\s*id:\s*'((?:s|n)\d+)'[^}]*?name:\s*['"]([^'"]+)['"][^}]*?category:\s*['"]([^'"]+)['"]/g;
const HAVE = new Set(['PHANTACI','Wolford','新荣记','泰珍荟','白茸','小米','老吉堂','晴空','DA Vittorio Shanghai','NUMATA·SOU 沼田双','上海滩餐厅','莆田','隐溪茶馆 SPA','莱珀妮 La Prairie','高桌','火星宠物超市','PET MART','AirPark','青鹤荟','橘炭胡同·乌喜','PET WISH']);
const missing = [];
let m; while ((m = re.exec(txt)) !== null) { if (!HAVE.has(m[2])) missing.push({ name: m[2], cat: m[3] }); }
const foodCats = ['精致餐饮','品质中餐','网红餐饮','茶馆SPA','咖啡茶饮','快餐轻食'];
missing.sort((a,b)=> (foodCats.includes(b.cat)?1:0)-(foodCats.includes(a.cat)?1:0));
console.log('缺数据店总数:', missing.length);
const byCat = {};
for (const s of missing) (byCat[s.cat] = byCat[s.cat] || []).push(s.name);
for (const c in byCat) console.log(`\n[${c}] (${byCat[c].length}):`, byCat[c].join('、'));
fs.writeFileSync('/tmp/missing_stores.json', JSON.stringify(missing, null, 2));
