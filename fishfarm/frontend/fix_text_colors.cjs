const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'src/components/tasks')
];

// Files we manually perfected
const excludedFiles = ['TaskForm.tsx', 'TaskCompletionForm.tsx'];

const replacements = [
  { from: /\btext-slate-900\b/g, to: 'text-white' },
  { from: /\btext-slate-800\b/g, to: 'text-white' },
  { from: /\btext-slate-700\b/g, to: 'text-slate-300' },
  { from: /\btext-slate-600\b/g, to: 'text-slate-300' },
  { from: /\btext-slate-500\b/g, to: 'text-slate-400' },
  { from: /\bborder-slate-100\b/g, to: 'border-slate-700' },
  { from: /\bborder-slate-200\b/g, to: 'border-slate-700' },
  { from: /\bbg-slate-100\b/g, to: 'bg-slate-800' },
  { from: /\bbg-green-50\b/g, to: 'bg-green-500/20' },
  { from: /\btext-green-700\b/g, to: 'text-green-400' },
  { from: /\btext-red-600\b/g, to: 'text-red-400' },
  { from: /\btext-fuchsia-700\b/g, to: 'text-fuchsia-400' },
  { from: /\bbg-fuchsia-100\b/g, to: 'bg-fuchsia-500/20' },
  { from: /\bborder-fuchsia-200\b/g, to: 'border-fuchsia-500/30' },
  { from: /\bborder-green-200\b/g, to: 'border-green-500/30' }
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && !excludedFiles.includes(f));

  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    for (const { from, to } of replacements) {
      content = content.replace(from, to);
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}
console.log('Text color fix completed.');
