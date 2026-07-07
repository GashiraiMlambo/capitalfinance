const fs = require('fs');
const path = require('path');

const featuresDir = path.resolve(__dirname, 'src/app/features');
const appDir = path.resolve(__dirname, 'src/app');

// Keep track of all files we rename/split
// format: { absoluteOldPathWithoutExt: absoluteNewPathWithoutExt }
const renamedFiles = {};

// Helper to recursively get all files in a directory
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

// 1. Process and split all component files under featuresDir
console.log('Scanning features directory...');
const allFiles = getFiles(featuresDir);

allFiles.forEach((filePath) => {
  if (!filePath.endsWith('.ts')) return;
  // Skip already split component files (ends with .component.ts)
  if (filePath.endsWith('.component.ts')) return;

  const content = fs.readFileSync(filePath, 'utf8');

  // Check if it's an Angular component with inline template and styles
  const hasComponent = content.includes('@Component');
  const templateMatch = content.match(/template:\s*`([\s\S]*?)`\s*,?/);
  const stylesMatch = content.match(/styles:\s*\[\s*`([\s\S]*?)`\s*\]\s*,?/);

  if (hasComponent && templateMatch) {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);

    const htmlPath = path.join(dir, `${basename}.component.html`);
    const scssPath = path.join(dir, `${basename}.component.scss`);
    const tsPath = path.join(dir, `${basename}.component.ts`);

    console.log(`Splitting component: ${filePath}`);

    // Extract template content
    const templateContent = templateMatch[1];
    fs.writeFileSync(htmlPath, templateContent.trim(), 'utf8');

    // Extract styles content if present
    let stylesContent = '';
    if (stylesMatch) {
      stylesContent = stylesMatch[1];
    }
    fs.writeFileSync(scssPath, stylesContent.trim(), 'utf8');

    // Modify the TS file content
    let modifiedContent = content;
    // Replace template: `...` with templateUrl: './basename.component.html'
    modifiedContent = modifiedContent.replace(/template:\s*`([\s\S]*?)`\s*,?/, `templateUrl: './${basename}.component.html',`);
    
    // Replace styles: [`...`] with styleUrl: './basename.component.scss'
    if (stylesMatch) {
      modifiedContent = modifiedContent.replace(/styles:\s*\[\s*`([\s\S]*?)`\s*\]\s*,?/, `styleUrl: './${basename}.component.scss',`);
    }

    fs.writeFileSync(tsPath, modifiedContent, 'utf8');

    // Store renaming mapping
    const oldPathWithoutExt = filePath.slice(0, -3);
    const newPathWithoutExt = tsPath.slice(0, -3);
    renamedFiles[path.normalize(oldPathWithoutExt).toLowerCase()] = path.normalize(newPathWithoutExt);

    // Delete the old file
    fs.unlinkSync(filePath);
  }
});

console.log('Renamed files map:', renamedFiles);

// 2. Scan all TS files in the project and update import paths
console.log('Updating imports in workspace...');
const allTsFiles = getFiles(appDir).filter(f => f.endsWith('.ts'));

allTsFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Regex to match imports: static 'import ... from ...' and dynamic 'import(...)'
  const importRegex = /(import\s+[\s\S]*?\s+from\s+['"`])([^'"`]+)(['"`])|(import\(['"`])([^'"`]+)(['"`]\))/g;

  content = content.replace(importRegex, (match, p1, p2, p3, p4, p5, p6) => {
    const isDynamic = !!p4;
    const prefix = isDynamic ? p4 : p1;
    const importPath = isDynamic ? p5 : p2;
    const suffix = isDynamic ? p6 : p3;

    // Resolve the absolute path of the imported module
    const resolvedPath = path.resolve(path.dirname(filePath), importPath);
    const normalizedResolvedPath = path.normalize(resolvedPath).toLowerCase();

    if (renamedFiles[normalizedResolvedPath]) {
      // Find the relative path from the current file to the new component path
      const targetPath = renamedFiles[normalizedResolvedPath];
      let relativePath = path.relative(path.dirname(filePath), targetPath);
      
      // Convert Windows style backslashes to forward slashes for TypeScript imports
      relativePath = relativePath.replace(/\\/g, '/');

      // Ensure relative path starts with ./ or ../
      if (!relativePath.startsWith('.') && !relativePath.startsWith('..')) {
        relativePath = './' + relativePath;
      }

      console.log(`Updating import in ${path.basename(filePath)}: ${importPath} -> ${relativePath}`);
      return `${prefix}${relativePath}${suffix}`;
    }

    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('Done splitting all components under features!');
