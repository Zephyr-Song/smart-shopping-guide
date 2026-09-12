const fs = require('fs')
const s = fs.readFileSync('src/pages/BrandExplore.tsx', 'utf8')
// grab each brand object block
const re = /name:\s*["']([^"']+)["']/g
const names = []
let m
while ((m = re.exec(s)) !== null) names.push(m[1])
console.log('COUNT', names.length)
console.log(JSON.stringify(names, null, 0))
