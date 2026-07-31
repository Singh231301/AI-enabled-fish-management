const fs = require('fs');
const path = require('path');

const modules = ['fish', 'feeding', 'water', 'financials', 'inventory', 'tasks', 'sales', 'ai', 'dashboard', 'reports'];

modules.forEach(mod => {
  // Types
  const typesContent = `export interface ${mod.charAt(0).toUpperCase() + mod.slice(1)}Stub { id: string; }\n`;
  const typeFile = path.join('fishfarm', 'frontend', 'src', 'types', `${mod}.types.ts`);
  fs.mkdirSync(path.dirname(typeFile), { recursive: true });
  if(!fs.existsSync(typeFile)) fs.writeFileSync(typeFile, typesContent);

  // API Endpoints
  const apiContent = `import api from '../axios';\nimport { ApiResponse } from '../../types/api.types';\n\nexport const get${mod.charAt(0).toUpperCase() + mod.slice(1)} = async (): Promise<ApiResponse<any>> => {\n  return { success: true, message: 'Stub', data: null };\n};\n`;
  const apiFile = path.join('fishfarm', 'frontend', 'src', 'api', 'endpoints', `${mod}.api.ts`);
  fs.mkdirSync(path.dirname(apiFile), { recursive: true });
  if(!fs.existsSync(apiFile)) fs.writeFileSync(apiFile, apiContent);
});

console.log('Frontend stubs generated');
