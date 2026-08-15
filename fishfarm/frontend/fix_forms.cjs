const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/fish');
const files = ['StockingForm.tsx', 'MortalityLogForm.tsx', 'GrowthSampleForm.tsx'];

for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace focus states
  content = content.replace(/focus:ring-blue-500/g, 'focus:ring-sky-500');
  content = content.replace(/focus:border-blue-500/g, 'focus:border-sky-500');

  // Replace light amber backgrounds
  content = content.replace(/bg-amber-50\b/g, 'bg-amber-500/10 text-white');
  content = content.replace(/bg-amber-100\b/g, 'bg-amber-500/20 text-amber-400');
  
  // Replace light blue hover backgrounds
  content = content.replace(/hover:bg-blue-50\b/g, 'hover:bg-sky-500/20');
  
  // Fix inputs missing bg-slate-800 and text-white
  // Look for `border rounded-md` or `border border-slate-600 rounded-md` that don't have bg-slate-800
  content = content.replace(/className="(.*?)border rounded-md(.*?)focus:ring-sky-500/g, (match, p1, p2) => {
    let newP1 = p1;
    if (!newP1.includes('bg-slate-800')) newP1 += 'bg-slate-800 text-white ';
    return `className="${newP1}border rounded-md${p2}focus:ring-sky-500`;
  });

  content = content.replace(/className="(.*?)border border-slate-600 rounded-md(.*?)focus:ring-sky-500/g, (match, p1, p2) => {
    let newP1 = p1;
    if (!newP1.includes('bg-slate-800')) newP1 += 'bg-slate-800 text-white ';
    return `className="${newP1}border border-slate-600 rounded-md${p2}focus:ring-sky-500`;
  });

  // Also replace some general classNames inside those files just in case
  content = content.replace(/className=\{`(.*?)border rounded-md(.*?)focus:ring-sky-500/g, (match, p1, p2) => {
    let newP1 = p1;
    if (!newP1.includes('bg-slate-800')) newP1 += 'bg-slate-800 text-white ';
    return `className={\`${newP1}border rounded-md${p2}focus:ring-sky-500`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log('Form inputs fixed.');
