const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/fish');

const replacements = [
  { from: /\bbg-white\b/g, to: 'bg-slate-800' },
  { from: /\bbg-gray-50\b/g, to: 'bg-slate-750' },
  { from: /\bbg-slate-100\b/g, to: 'bg-slate-800' },
  { from: /\btext-gray-900\b/g, to: 'text-white' },
  { from: /\btext-gray-800\b/g, to: 'text-slate-200' },
  { from: /\btext-gray-700\b/g, to: 'text-slate-300' },
  { from: /\btext-gray-600\b/g, to: 'text-slate-300' },
  { from: /\btext-gray-500\b/g, to: 'text-slate-400' },
  { from: /\btext-gray-400\b/g, to: 'text-slate-500' },
  { from: /\bborder-gray-100\b/g, to: 'border-slate-700/50' },
  { from: /\bborder-gray-200\b/g, to: 'border-slate-700' },
  { from: /\bborder-gray-300\b/g, to: 'border-slate-600' },
  { from: /\bborder-slate-300\b/g, to: 'border-slate-700' },
  { from: /\bdivide-gray-200\b/g, to: 'divide-slate-700' },
  { from: /\bbg-gray-100\b/g, to: 'bg-slate-700' },
  { from: /\bbg-gray-200\b/g, to: 'bg-slate-700' },
  { from: /\bhover:bg-gray-50\b/g, to: 'hover:bg-slate-700' },
  { from: /\bhover:bg-gray-100\b/g, to: 'hover:bg-slate-700' },
  { from: /\bhover:text-gray-900\b/g, to: 'hover:text-white' },
  { from: /\btext-blue-600\b/g, to: 'text-sky-400' },
  { from: /\bborder-blue-600\b/g, to: 'border-sky-500' },
  { from: /\bhover:text-blue-900\b/g, to: 'hover:text-sky-300' },
  { from: /\bbg-blue-600\b/g, to: 'bg-sky-500' },
  { from: /\bhover:bg-blue-700\b/g, to: 'hover:bg-sky-600' },
  { from: /\btext-blue-800\b/g, to: 'text-sky-300' },
  { from: /\bbg-blue-100\b/g, to: 'bg-sky-500/20' },
  { from: /\btext-blue-500\b/g, to: 'text-sky-400' },
  { from: /\btext-red-800\b/g, to: 'text-red-300' },
  { from: /\bbg-red-100\b/g, to: 'bg-red-500/20' },
  { from: /\btext-green-800\b/g, to: 'text-green-300' },
  { from: /\bbg-green-100\b/g, to: 'bg-green-500/20' },
  { from: /\bbg-yellow-100\b/g, to: 'bg-yellow-500/20' },
  { from: /\btext-yellow-800\b/g, to: 'text-yellow-300' },
  { from: /\bbg-purple-100\b/g, to: 'bg-purple-500/20' },
  { from: /\btext-purple-800\b/g, to: 'text-purple-300' },
  { from: /\bshadow-sm\b/g, to: '' }, // Remove light shadows, dark theme uses borders mostly
];

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }

  // A couple of manual tweaks for FishTracking.tsx specific classes
  content = content.replace(/bg-slate-800 rounded-xl p-4 sm:p-6 text-white border border-slate-700/g, 'bg-slate-800 rounded-xl p-4 sm:p-6 text-white border border-slate-700'); 
  // Wait, I mapped bg-slate-100 -> bg-slate-800, border-slate-300 -> border-slate-700

  // Recharts text colors
  content = content.replace(/fill="#4b5563"/g, 'fill="#94a3b8"'); // text-gray-600 to text-slate-400 for charts
  content = content.replace(/stroke="#e5e7eb"/g, 'stroke="#334155"'); // border-gray-200 to slate-700 for charts
  content = content.replace(/stroke="#d1d5db"/g, 'stroke="#475569"'); // border-gray-300 to slate-600

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log('Theme fix completed.');
