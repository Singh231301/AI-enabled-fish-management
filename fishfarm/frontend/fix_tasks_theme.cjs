const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'src/components/tasks'),
  path.join(__dirname, 'src/pages/dashboard')
];

const replacements = [
  { from: /\bbg-white\b/g, to: 'bg-slate-800' },
  { from: /\bbg-gray-50\b/g, to: 'bg-slate-750' },
  { from: /\bbg-slate-100\b/g, to: 'bg-slate-900' }, // For page backgrounds
  { from: /\bbg-slate-50\b/g, to: 'bg-slate-800/50' },
  { from: /\btext-gray-900\b/g, to: 'text-white' },
  { from: /\btext-gray-800\b/g, to: 'text-slate-200' },
  { from: /\btext-gray-700\b/g, to: 'text-slate-300' },
  { from: /\btext-gray-600\b/g, to: 'text-slate-300' },
  { from: /\btext-gray-500\b/g, to: 'text-slate-400' },
  { from: /\btext-gray-400\b/g, to: 'text-slate-500' },
  { from: /\bborder-gray-100\b/g, to: 'border-slate-700/50' },
  { from: /\bborder-gray-200\b/g, to: 'border-slate-700' },
  { from: /\bborder-gray-300\b/g, to: 'border-slate-600' },
  { from: /\bborder-slate-200\b/g, to: 'border-slate-700' },
  { from: /\bborder-slate-300\b/g, to: 'border-slate-600' },
  { from: /\bdivide-gray-200\b/g, to: 'divide-slate-700' },
  { from: /\bdivide-slate-200\b/g, to: 'divide-slate-700' },
  { from: /\bbg-gray-100\b/g, to: 'bg-slate-700' },
  { from: /\bbg-gray-200\b/g, to: 'bg-slate-600' },
  { from: /\bbg-slate-200\b/g, to: 'bg-slate-700' },
  { from: /\bhover:bg-gray-50\b/g, to: 'hover:bg-slate-700' },
  { from: /\bhover:bg-gray-100\b/g, to: 'hover:bg-slate-700' },
  { from: /\bhover:bg-slate-50\b/g, to: 'hover:bg-slate-700' },
  { from: /\bhover:text-gray-900\b/g, to: 'hover:text-white' },
  { from: /\btext-blue-600\b/g, to: 'text-sky-400' },
  { from: /\btext-blue-700\b/g, to: 'text-sky-400' },
  { from: /\bborder-blue-600\b/g, to: 'border-sky-500' },
  { from: /\bborder-blue-200\b/g, to: 'border-sky-500/30' },
  { from: /\bhover:text-blue-900\b/g, to: 'hover:text-sky-300' },
  { from: /\bbg-blue-600\b/g, to: 'bg-sky-500' },
  { from: /\bhover:bg-blue-700\b/g, to: 'hover:bg-sky-600' },
  { from: /\bhover:bg-blue-50\b/g, to: 'hover:bg-sky-500/20' },
  { from: /\btext-blue-800\b/g, to: 'text-sky-300' },
  { from: /\bbg-blue-100\b/g, to: 'bg-sky-500/20' },
  { from: /\bbg-blue-50\b/g, to: 'bg-sky-500/10' },
  { from: /\btext-blue-500\b/g, to: 'text-sky-400' },
  { from: /\btext-red-800\b/g, to: 'text-red-300' },
  { from: /\bbg-red-100\b/g, to: 'bg-red-500/20' },
  { from: /\btext-red-900\b/g, to: 'text-red-200' },
  { from: /\btext-green-800\b/g, to: 'text-green-300' },
  { from: /\bbg-green-100\b/g, to: 'bg-green-500/20' },
  { from: /\bbg-yellow-100\b/g, to: 'bg-yellow-500/20' },
  { from: /\btext-yellow-800\b/g, to: 'text-yellow-300' },
  { from: /\bbg-purple-100\b/g, to: 'bg-purple-500/20' },
  { from: /\btext-purple-800\b/g, to: 'text-purple-300' },
  { from: /\bbg-indigo-100\b/g, to: 'bg-indigo-500/20' },
  { from: /\btext-indigo-800\b/g, to: 'text-indigo-300' },
  { from: /\bshadow-sm\b/g, to: '' },
  { from: /\bfocus:ring-blue-500\b/g, to: 'focus:ring-sky-500' },
  { from: /\bfocus:border-blue-500\b/g, to: 'focus:border-sky-500' },
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && (dir.includes('tasks') || f === 'TasksPage.tsx'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    for (const { from, to } of replacements) {
      content = content.replace(from, to);
    }

    // Fix forms specifically for Task inputs
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
    
    // Some classes might use backticks
    content = content.replace(/className=\{`(.*?)border rounded-md(.*?)focus:ring-sky-500/g, (match, p1, p2) => {
      let newP1 = p1;
      if (!newP1.includes('bg-slate-800')) newP1 += 'bg-slate-800 text-white ';
      return `className={\`${newP1}border rounded-md${p2}focus:ring-sky-500`;
    });
    
    // Specific fix for page wrapper if it used bg-slate-50
    if (file === 'TasksPage.tsx') {
      content = content.replace(/bg-slate-900 min-h-screen/, 'bg-slate-900 min-h-screen text-white');
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}
console.log('Task theme fix completed.');
