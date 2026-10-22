const fs = require('fs'), path = require('path');
const files = ['bazi', 'liuyao', 'meihua', 'ziwei', 'heluo', 'palm', 'face', 'dream', 'daodejing', 'huangli', 'home', 'about'];
const strip = s => s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
files.forEach(f => {
  const p = path.join(__dirname, 'page-' + f + '.html');
  if (!fs.existsSync(p)) return;
  const html = fs.readFileSync(p, 'utf8');
  const outParts = [...html.matchAll(/<div class="OUT" data-id="([^"]+)">([\s\S]*?)<\/div>\s*(?=<div class="OUT"|$)/g)];
  console.log('\n\n########## ' + f + ' ##########');
  const last = outParts.length ? outParts[outParts.length - 1] : null;
  if (last) console.log('--[' + last[1] + ']--\n' + strip(last[2]).slice(0, 1400));
  else {
    const body = html.split('<div id="app">')[1] || html;
    console.log(strip(body).slice(0, 900));
  }
});
