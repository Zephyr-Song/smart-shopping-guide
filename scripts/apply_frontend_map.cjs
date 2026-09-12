// 把 dataset.json 的品牌名对齐到前端 STORES 的 store.name
// 仅给需要改名的条目加 frontend 字段；孤儿条目（前端未收录该店）保持原 brand。
const fs = require('fs');
const DATA = 'scripts/dianping-ingest/dataset.json';

// dataset.brand -> 前端 store.name
const MAP = {
  'LA PRAIRIE': '莱珀妮 La Prairie',
  'DA VITTORIO SHANGHAI': 'DA Vittorio Shanghai',
  'NUMATASOU 沼田双': 'NUMATA·SOU 沼田双',
  '上海滩': '上海滩餐厅',
  '莆田餐厅': '莆田',
  '隐溪茶馆': '隐溪茶馆 SPA',
  '高桌牛排馆': '高桌',
  'MARSMART 火星宠物超市': '火星宠物超市',
  '阿飞和巴弟 PET MART': 'PET MART',
  'AIRPARK 人类友好公园': 'AirPark',
  '菁禧荟': '青鹤荟',
  '橘焱胡同烧肉夜食': '橘炭胡同·乌喜',
  '宠物愿望 PET WISH': 'PET WISH',
};
// 前端未收录的孤儿品牌（保留原 brand，仍显示不出，仅记录）
const ORPHANS = ['AHAVA SPA','美丽田园','Carr Barbershop','京都之家','aaddd','遇外滩','蝶园海鲜酒馆','M Stand','巴黎蜜语','Whites','Le Jardin de JR','Pet&Fresh 派特鲜生','K·1 PET','松鹤楼苏式汤面','Baker&Spice'];

const data = JSON.parse(fs.readFileSync(DATA, 'utf-8'));
let mapped = 0;
for (const r of data) {
  if (MAP[r.brand]) { r.frontend = MAP[r.brand]; mapped++; }
  else if (ORPHANS.includes(r.brand)) { r.frontend = null; }
}
fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log('已处理', data.length, '条；新增 frontend 映射', mapped, '条；孤儿(前端未收录)', ORPHANS.length, '条');
console.log('对齐的 brand -> frontend:');
for (const r of data) if (r.frontend) console.log('  ', r.brand, '->', r.frontend);
