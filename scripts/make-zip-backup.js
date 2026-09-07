import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function createZipBackup() {
  const zip = new JSZip();
  const baseDir = process.cwd();
  const backupDir = path.join(baseDir, 'backup');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const includeDirs = ['src', 'public'];
  const includeFiles = ['index.html', 'package.json', 'metadata.json', 'tsconfig.json', 'vite.config.ts', 'AGENTS.md', 'GEMINI.md'];

  function addFolderToZip(folderPath, zipFolder) {
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
      const fullPath = path.join(folderPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
          addFolderToZip(fullPath, zipFolder.folder(item));
        }
      } else {
        zipFolder.file(item, fs.readFileSync(fullPath));
      }
    }
  }

  for (const dir of includeDirs) {
    const fullDirPath = path.join(baseDir, dir);
    if (fs.existsSync(fullDirPath)) {
      addFolderToZip(fullDirPath, zip.folder(dir));
    }
  }

  for (const file of includeFiles) {
    const fullFilePath = path.join(baseDir, file);
    if (fs.existsSync(fullFilePath)) {
      zip.file(file, fs.readFileSync(fullFilePath));
    }
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const zipPath = path.join(backupDir, `iprint-backup-${timestamp}.zip`);

  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(zipPath, content);
  console.log(`Backup ZIP created successfully: ${zipPath}`);
}

createZipBackup().catch(err => {
  console.error('Backup ZIP creation error:', err);
});
