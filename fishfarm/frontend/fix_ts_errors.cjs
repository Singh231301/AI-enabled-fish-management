const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, searchRegex, replacement) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(searchRegex, replacement);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. water.api.ts
replaceInFile('src/api/endpoints/water.api.ts', /import \{ axiosInstance \} from '\.\.\/axios';/, `import api from '../axios';`);
replaceInFile('src/api/endpoints/water.api.ts', /axiosInstance/g, `api`);

// 2. App.tsx
replaceInFile('src/App.tsx', /import \{ FishPage \} from '\.\/pages\/dashboard\/FishPage';\n/, '');
replaceInFile('src/App.tsx', /<Route path="fish" element={<FishPage \/>} \/>\n\s*/, '');
replaceInFile('src/App.tsx', /import \{ FeedingPage \} from '\.\/pages\/dashboard\/FeedingPage';/, `import { FeedingPage } from './pages/feeding/FeedingPage';`);

// 3. FeedingCalendar.tsx
replaceInFile('src/components/feeding/FeedingCalendar.tsx', /isDayCurrentMonth/g, 'isCurrentMonth');

// 4. FeedingScheduleCard.tsx
replaceInFile('src/components/feeding/FeedingScheduleCard.tsx', /schedule\.feedsPerDay/g, '(schedule.feedsPerDay || 0)');

// 5. ExpensePieChart.tsx
replaceInFile('src/components/financials/ExpensePieChart.tsx', /Record<Exclude<ExpenseCategory, 'TOTAL'>, /g, `Record<string, `);
replaceInFile('src/components/financials/ExpensePieChart.tsx', /Record<ExpenseCategory, /g, `Record<string, `);

// 6. EquipmentCard.tsx
replaceInFile('src/components/inventory/EquipmentCard.tsx', /Tool,/, `Wrench as Tool,`);

// 7. PurchaseForm.tsx
replaceInFile('src/components/inventory/PurchaseForm.tsx', /unitCost: parseFloat\(e\.target\.value\) \|\| null/g, `unitCost: parseFloat(e.target.value) || undefined`);
replaceInFile('src/components/inventory/PurchaseForm.tsx', /unitCost: null/g, `unitCost: undefined`);

// 8. DOChart, PHGauge, etc.
const constantsFile = 'src/utils/constants.ts';
replaceInFile(constantsFile, /export const DO_STATUS_CONFIG: Record<string, \{ label: string; color: string; bgColor: string \}>/g, `export const DO_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; emoji?: string } >`);
replaceInFile(constantsFile, /export const PH_STATUS_CONFIG: Record<string, \{ label: string; color: string; bgColor: string \}>/g, `export const PH_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; emoji?: string } >`);
replaceInFile(constantsFile, /export const WATER_COLOR_CONFIG: Record<string, \{ label: string; color: string; bgColor: string \}>/g, `export const WATER_COLOR_CONFIG: Record<string, { label: string; color: string; bgColor: string; emoji?: string; risk?: string; description?: string } >`);
replaceInFile(constantsFile, /export const WATER_SMELL_CONFIG: Record<string, \{ label: string; color: string \}>/g, `export const WATER_SMELL_CONFIG: Record<string, { label: string; color: string; emoji?: string; description?: string } >`);
replaceInFile(constantsFile, /export const CHEMICAL_TYPE_CONFIG: Record<string, \{ label: string; color: string \}>/g, `export const CHEMICAL_TYPE_CONFIG: Record<string, { label: string; color: string; emoji?: string } >`);
// I should also append properties if they don't exist: 
const constantsAppend = `
Object.values(DO_STATUS_CONFIG).forEach(c => c.emoji = '💧');
Object.values(PH_STATUS_CONFIG).forEach(c => c.emoji = '🧪');
Object.values(WATER_COLOR_CONFIG).forEach(c => { c.emoji = '🎨'; c.risk = 'Low'; c.description = 'Normal'; });
Object.values(WATER_SMELL_CONFIG).forEach(c => { c.emoji = '👃'; c.description = 'Normal'; });
Object.values(CHEMICAL_TYPE_CONFIG).forEach(c => c.emoji = '🧪');
`;
if(fs.existsSync(constantsFile)) {
  fs.appendFileSync(constantsFile, constantsAppend);
}
// Add borderColor to WATER_COLOR_CONFIG type
replaceInFile(constantsFile, /export const WATER_COLOR_CONFIG: Record<string, \{ label: string; color: string; bgColor: string; emoji\?: string; risk\?: string; description\?: string \} >/g, `export const WATER_COLOR_CONFIG: Record<string, { label: string; color: string; bgColor: string; emoji?: string; risk?: string; description?: string; borderColor?: string } >`);


// 9. Context paths
replaceInFile('src/pages/dashboard/FinancialsPage.tsx', /'\.\.\/\.\.\/context\/PondContext'/g, `'../../contexts/PondContext'`);
replaceInFile('src/pages/dashboard/InventoryPage.tsx', /'\.\.\/\.\.\/context\/PondContext'/g, `'../../contexts/PondContext'`);
replaceInFile('src/pages/dashboard/WaterPage.tsx', /'\.\.\/\.\.\/contexts\/AuthContext'/g, `'../../context/AuthContext'`); // It is context/AuthContext

// 10. InventoryPage Modal path
replaceInFile('src/pages/dashboard/InventoryPage.tsx', /'\.\.\/\.\.\/components\/ui\/Modal'/g, `'../../components/ui/modal'`);

// 11. getAllPonds
replaceInFile('src/pages/dashboard/WaterPage.tsx', /getAllPonds/g, `getUserPonds`);

// 12. Register.tsx phone
replaceInFile('src/pages/Register.tsx', /phone: formData\.phone/g, ``);
replaceInFile('src/pages/Register.tsx', /phone: '',\n/g, ``);

console.log("Done");
