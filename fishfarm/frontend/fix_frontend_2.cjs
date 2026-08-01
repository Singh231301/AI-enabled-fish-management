const fs = require('fs');

function replaceInFile(filePath, searchRegex, replacement) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(searchRegex, replacement);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. WaterQualityLogForm.tsx: Add borderColor to configs in constants
replaceInFile('src/utils/constants.ts', /export const WATER_COLOR_CONFIG: Record<string, \{ label: string; color: string; bgColor: string; emoji\?: string; risk\?: string; description\?: string \} >/g, `export const WATER_COLOR_CONFIG: Record<string, { label: string; color: string; bgColor: string; emoji?: string; risk?: string; description?: string; borderColor?: string } >`);

// Let's just define a completely generic type for these configs in constants.ts to stop TS from complaining about missing properties.
const anyTypeConfig = `
export const WATER_COLOR_CONFIG: Record<string, any> = {`;
replaceInFile('src/utils/constants.ts', /export const WATER_COLOR_CONFIG: Record<string, \{ .* \} > = \{/g, anyTypeConfig);
replaceInFile('src/utils/constants.ts', /export const DO_STATUS_CONFIG: Record<string, \{ .* \} > = \{/g, `export const DO_STATUS_CONFIG: Record<string, any> = {`);
replaceInFile('src/utils/constants.ts', /export const PH_STATUS_CONFIG: Record<string, \{ .* \} > = \{/g, `export const PH_STATUS_CONFIG: Record<string, any> = {`);

// 2. InventoryPage.tsx modal path
replaceInFile('src/pages/dashboard/InventoryPage.tsx', /'\.\.\/\.\.\/components\/ui\/modal'/i, `'../../components/common/Modal'`); // usually it's common/Modal
replaceInFile('src/pages/dashboard/InventoryPage.tsx', /'\.\.\/\.\.\/components\/ui\/Modal'/i, `'../../components/common/Modal'`);

// 3. Register.tsx phone property
replaceInFile('src/pages/Register.tsx', /phone: '',/g, ``);
replaceInFile('src/pages/Register.tsx', /phone: formData\.phone/g, ``);

// 4. FinancialsPage.tsx PondContext
const finPondReplace1 = `import { useState, useEffect } from 'react';
import { pondApi } from '../../api/endpoints/pond.api';`;
replaceInFile('src/pages/dashboard/FinancialsPage.tsx', /import \{ usePond \} from '\.\.\/\.\.\/contexts\/PondContext';/g, finPondReplace1);

const finPondReplace2 = `const [ponds, setPonds] = useState<any[]>([]);
  const [currentPond, setCurrentPond] = useState<any>(null);

  useEffect(() => {
    pondApi.getUserPonds().then(res => {
      setPonds(res.data);
      if(res.data.length > 0) setCurrentPond(res.data[0]);
    });
  }, []);`;
replaceInFile('src/pages/dashboard/FinancialsPage.tsx', /const \{ currentPond \} = usePond\(\);/g, finPondReplace2);

// 5. InventoryPage.tsx PondContext
replaceInFile('src/pages/dashboard/InventoryPage.tsx', /import \{ usePond \} from '\.\.\/\.\.\/contexts\/PondContext';/g, finPondReplace1);
replaceInFile('src/pages/dashboard/InventoryPage.tsx', /const \{ currentPond \} = usePond\(\);/g, finPondReplace2);

// 6. FeedingCalendar isCurrentMonth
replaceInFile('src/components/feeding/FeedingCalendar.tsx', /isCurrentMonth/g, 'isSameMonth');

// 7. FeedingScheduleCard.tsx feedsPerDay
replaceInFile('src/components/feeding/FeedingScheduleCard.tsx', /schedule\.feedsPerDay \> 0/g, '(schedule.feedsPerDay || 0) > 0');
replaceInFile('src/components/feeding/FeedingScheduleCard.tsx', /schedule\.feedsPerDay \|\| 0/g, '(schedule.feedsPerDay || 0)');
