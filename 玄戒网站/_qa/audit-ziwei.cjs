/* 检查紫微盘结构：13 个格子（12 宫 + 中心）与显式行列定位 */
const fs = require('fs');
const path = require('path');
const h = fs.readFileSync(path.join(__dirname, 'page-ziwei.html'), 'utf8');
const cells = h.match(/class="zw-cell[^"]*"/g) || [];
console.log('zw-cell count:', cells.length);
const board = h.slice(h.indexOf('class="zw-board"'), h.indexOf('class="zw-board"') + 260);
console.log('board head:', board.replace(/\s+/g, ' '));
const placed = [...h.matchAll(/grid-row:(\d);grid-column:(\d)/g)].map(m => m[1] + ',' + m[2]);
console.log('explicit placements:', placed.length, placed.join(' | '));
