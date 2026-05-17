/**
 * generate-sitemap.js
 * 扫描当前目录下的文件夹和HTML文件，生成 sitemap.json
 * 用法: node generate-sitemap.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUTPUT = path.join(ROOT, 'sitemap.json');
const EXCLUDE = new Set(['node_modules', '.git', '.github']);
const IGNORE_FILES = new Set(['sitemap.json', 'generate-sitemap.js', 'index.html']);

function scanDir(dirPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  const result = [];

  for (const item of items) {
    if (item.name.startsWith('.')) continue; // skip hidden
    const fullPath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      if (EXCLUDE.has(item.name)) continue;
      // Folder → menu group
      const files = scanDir(fullPath);
      // Flatten: if subfolder has files, add them to parent group
      // For simplicity: treat files directly in this folder
      const htmlFiles = [];
      const subdirFiles = fs.readdirSync(fullPath, { withFileTypes: true });
      for (const f of subdirFiles) {
        if (f.isFile() && f.name.endsWith('.html') && !IGNORE_FILES.has(f.name)) {
          htmlFiles.push({
            name: f.name.replace(/\.html$/, ''),
            path: path.relative(ROOT, path.join(fullPath, f.name)).replace(/\\/g, '/')
          });
        }
      }
      if (htmlFiles.length > 0) {
        result.push({
          name: item.name,
          files: htmlFiles
        });
      }
      // Recursively process subfolders
      const subs = fs.readdirSync(fullPath, { withFileTypes: true });
      for (const sub of subs) {
        if (sub.isDirectory() && !sub.name.startsWith('.') && !EXCLUDE.has(sub.name)) {
          const subFiles = [];
          const subItems = fs.readdirSync(path.join(fullPath, sub.name), { withFileTypes: true });
          for (const sf of subItems) {
            if (sf.isFile() && sf.name.endsWith('.html') && !IGNORE_FILES.has(sf.name)) {
              subFiles.push({
                name: sf.name.replace(/\.html$/, ''),
                path: path.relative(ROOT, path.join(fullPath, sub.name, sf.name)).replace(/\\/g, '/')
              });
            }
          }
          if (subFiles.length > 0) {
            result.push({
              name: sub.name,
              files: subFiles
            });
          }
        }
      }
    }
  }

  return result;
}

try {
  const siteMap = scanDir(ROOT);
  // Sort: maintain natural order, group non-股票交易 folder-first
  fs.writeFileSync(OUTPUT, JSON.stringify(siteMap, null, 2), 'utf-8');
  console.log('✅ sitemap.json 已生成');
  console.log(`📁 共 ${siteMap.length} 个文件夹/组`);
  let totalFiles = 0;
  siteMap.forEach(g => {
    console.log(`   📂 ${g.name} (${g.files.length} 个文件)`);
    g.files.forEach(f => console.log(`      📄 ${f.name}`));
    totalFiles += g.files.length;
  });
  console.log(`📊 共 ${totalFiles} 个文件`);
} catch (err) {
  console.error('❌ 生成失败:', err.message);
  process.exit(1);
}
