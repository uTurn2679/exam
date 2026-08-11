const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        searchDir(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('.update(') || content.includes('prisma.')) {
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (line.includes('.update(')) {
            console.log(`${fullPath}:${i + 1} => ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir(path.resolve(__dirname, '../src'));
