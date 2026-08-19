import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const notesRoot = path.join(projectRoot, 'public', 'notes');
const outputPath = path.join(projectRoot, 'src', 'generated-notes.js');

const semesterInfo = {
  '大一上': { year: 1, semester: '大一上' },
  '大一下': { year: 1, semester: '大一下' },
  '大二上': { year: 2, semester: '大二上' },
  '大二下': { year: 2, semester: '大二下' },
};

async function findPdfs(folder, relativeFolder = '') {
  const entries = await readdir(folder, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeFolder, entry.name);
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) files.push(...await findPdfs(fullPath, relativePath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) files.push(relativePath);
  }
  return files;
}

const allNotes = [];
for (const [folderName, info] of Object.entries(semesterInfo)) {
  try {
    const pdfFiles = await findPdfs(path.join(notesRoot, folderName));
    for (const relativePdf of pdfFiles.sort((a, b) => a.localeCompare(b, 'zh-Hant'))) {
      const parts = relativePdf.split(path.sep);
      const filename = parts.at(-1);
      const course = parts.length > 1 ? parts[0] : '未分類課程';
      const title = path.basename(filename, '.pdf');
      const pdf = `/notes/${folderName}/${relativePdf.split(path.sep).join('/')}`;
      allNotes.push({ year: info.year, course, semester: info.semester, title, description: `${info.semester}・${course}`, pdf });
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

const source = `// 此檔案由 scripts/generate-notes.mjs 自動產生，請勿手動編輯。\nexport const notes = ${JSON.stringify(allNotes, null, 2)};\n`;
await writeFile(outputPath, source, 'utf8');
console.log(`已找到 ${allNotes.length} 份 PDF 筆記。`);
