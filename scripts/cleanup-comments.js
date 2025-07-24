#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function removeComments(content) {
  // Remove multi-line JSDoc comments (/** ... */)
  content = content.replace(/\/\*\*[\s\S]*?\*\//g, '');

  // Remove multi-line comments (/* ... */)
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove single-line comments (//) but preserve URLs and strings
  const lines = content.split('\n');
  const cleanedLines = lines.map(line => {
    // Skip if line is inside a string (basic check)
    const singleQuoteCount = (line.match(/'/g) || []).length;
    const doubleQuoteCount = (line.match(/"/g) || []).length;
    const backtickCount = (line.match(/`/g) || []).length;

    // If odd number of quotes, likely inside a string
    if (
      singleQuoteCount % 2 === 1 ||
      doubleQuoteCount % 2 === 1 ||
      backtickCount % 2 === 1
    ) {
      return line;
    }

    // Remove // comments but preserve // in URLs
    if (
      line.includes('//') &&
      !line.includes('http://') &&
      !line.includes('https://')
    ) {
      const commentIndex = line.indexOf('//');
      // Check if // is at the start of the line (full line comment)
      if (line.substring(0, commentIndex).trim() === '') {
        return ''; // Remove entire line if it's just a comment
      } else {
        // Remove inline comment
        return line.substring(0, commentIndex).trimEnd();
      }
    }

    return line;
  });

  // Remove empty lines that were left by comment removal
  return cleanedLines
    .filter((line, index, array) => {
      // Keep line if it's not empty
      if (line.trim() !== '') return true;

      // Remove consecutive empty lines (keep only one)
      if (index === 0) return false;
      if (index === array.length - 1) return false;

      const prevLine = array[index - 1];
      const nextLine = array[index + 1];

      // Keep empty line if it separates non-empty content
      return prevLine.trim() !== '' && nextLine.trim() !== '';
    })
    .join('\n');
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = removeComments(content);
    fs.writeFileSync(filePath, cleaned);
    console.log(`✓ Cleaned: ${filePath}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function findJSFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findJSFiles(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const jsFiles = findJSFiles(srcDir);

console.log(`Found ${jsFiles.length} JavaScript files to process...\n`);

for (const file of jsFiles) {
  processFile(file);
}

console.log('\n🎉 Comment cleanup complete!');
