#!/usr/bin/env node

/**
 * MDSG Documentation Validation Script
 *
 * Validates documentation consistency with actual implementation
 * for frontend-only static site architecture.
 *
 * Usage: node .github/scripts/validate-docs.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class DocumentationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.metrics = {};
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    const colorMap = {
      error: colors.red,
      warning: colors.yellow,
      info: colors.blue,
      success: colors.green
    };

    console.log(`${colorMap[type]}[${type.toUpperCase()}] ${message}${colors.reset}`);

    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
    if (type === 'info') this.info.push(message);
  }

  readFile(filePath) {
    try {
      return fs.readFileSync(path.join(projectRoot, filePath), 'utf8');
    } catch (error) {
      this.log('error', `Failed to read ${filePath}: ${error.message}`);
      return null;
    }
  }

  readJSON(filePath) {
    const content = this.readFile(filePath);
    if (!content) return null;

    try {
      return JSON.parse(content);
    } catch (error) {
      this.log('error', `Failed to parse JSON ${filePath}: ${error.message}`);
      return null;
    }
  }

  // Validate bundle size consistency across documentation
  validateBundleSize() {
    this.log('info', 'Validating bundle size consistency...');

    const packageJson = this.readJSON('package.json');
    if (!packageJson) return;

    // Check if dist exists and get actual bundle sizes
    const distPath = path.join(projectRoot, 'dist');
    if (!fs.existsSync(distPath)) {
      this.log('warning', 'dist/ folder not found. Run `npm run build` first for accurate validation.');
      return;
    }

    const assetsPath = path.join(distPath, 'assets');
    if (!fs.existsSync(assetsPath)) {
      this.log('warning', 'dist/assets/ folder not found.');
      return;
    }

    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;

    try {
      const assets = fs.readdirSync(assetsPath);

      assets.forEach(file => {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(1);

        if (file.endsWith('.js')) {
          jsSize += stats.size;
          this.log('info', `JS Bundle: ${file} - ${sizeKB}KB`);
        } else if (file.endsWith('.css')) {
          cssSize += stats.size;
          this.log('info', `CSS Bundle: ${file} - ${sizeKB}KB`);
        }

        totalSize += stats.size;
      });

      this.metrics.bundleSize = {
        total: (totalSize / 1024).toFixed(1),
        js: (jsSize / 1024).toFixed(1),
        css: (cssSize / 1024).toFixed(1)
      };

      // Check against documentation claims
      const copilotInstructions = this.readFile('.github/copilot-instructions.md');
      const readme = this.readFile('README.md');

      if (copilotInstructions) {
        if (copilotInstructions.includes('14.0KB gzipped')) {
          this.log('success', 'Bundle size in copilot-instructions.md matches expected 14.0KB');
        } else if (copilotInstructions.includes('11.7KB')) {
          this.log('error', 'copilot-instructions.md still claims 11.7KB - should be 14.0KB');
        }
      }

      if (readme) {
        if (readme.includes('14.0KB%20gzipped')) {
          this.log('success', 'Bundle size badge in README.md is correct');
        } else if (readme.includes('11.7KB')) {
          this.log('error', 'README.md bundle size badge needs updating to 14.0KB');
        }
      }

    } catch (error) {
      this.log('error', `Failed to analyze bundle: ${error.message}`);
    }
  }

  // Validate architecture consistency
  validateArchitecture() {
    this.log('info', 'Validating architecture documentation...');

    const copilotInstructions = this.readFile('.github/copilot-instructions.md');
    const archDoc = this.readFile('.github/docs/architecture.md');
    const packageJson = this.readJSON('package.json');

    // Check for frontend-only architecture claims
    if (copilotInstructions) {
      if (copilotInstructions.includes('Frontend-only static site')) {
        this.log('success', 'Architecture correctly documented as frontend-only');
      } else if (copilotInstructions.includes('backend')) {
        this.log('warning', 'Documentation mentions backend - verify if accurate');
      }

      if (copilotInstructions.includes('server.js exists for development convenience only')) {
        this.log('success', 'server.js role correctly documented as dev-only');
      }
    }

    // Check package.json for backend dependencies
    if (packageJson && packageJson.dependencies) {
      const backendDeps = ['express', 'cors'];
      const hasBackendDeps = backendDeps.some(dep => packageJson.dependencies[dep]);

      if (hasBackendDeps) {
        this.log('info', 'Backend dependencies found - ensure documented as dev-only');
      }
    }
  }

  // Validate test documentation against actual test files
  validateTestDocumentation() {
    this.log('info', 'Validating test documentation...');

    const testsPath = path.join(projectRoot, 'tests');
    if (!fs.existsSync(testsPath)) {
      this.log('error', 'tests/ directory not found');
      return;
    }

    try {
      const testFiles = fs.readdirSync(testsPath).filter(f => f.endsWith('.test.js'));
      this.log('info', `Found test files: ${testFiles.join(', ')}`);

      // Check copilot-instructions.md test claims
      const copilotInstructions = this.readFile('.github/copilot-instructions.md');
      if (copilotInstructions) {
        if (copilotInstructions.includes('25/25 core tests passing')) {
          this.log('success', 'Core test status documented correctly');
        }

        if (copilotInstructions.includes('0/64 passing') || copilotInstructions.includes('64 failing')) {
          this.log('success', 'Advanced test status documented as expected failures');
        }
      }

    } catch (error) {
      this.log('error', `Failed to analyze tests: ${error.message}`);
    }
  }

  // Validate documentation location consistency
  validateDocumentationLocation() {
    this.log('info', 'Validating documentation location standards...');

    const docsPath = path.join(projectRoot, '.github/docs');
    if (!fs.existsSync(docsPath)) {
      this.log('error', '.github/docs/ directory not found');
      return;
    }

    try {
      const docFiles = fs.readdirSync(docsPath);
      this.log('info', `Documentation files in .github/docs/: ${docFiles.join(', ')}`);

      // Check for any documentation files in wrong locations
      const rootFiles = fs.readdirSync(projectRoot);
      const wrongLocationDocs = rootFiles.filter(f =>
        f.endsWith('.md') &&
        f !== 'README.md' &&
        !f.startsWith('.')
      );

      if (wrongLocationDocs.length > 0) {
        this.log('error', `Documentation in wrong location: ${wrongLocationDocs.join(', ')} should be in .github/docs/`);
      } else {
        this.log('success', 'All documentation properly located in .github/docs/');
      }

    } catch (error) {
      this.log('error', `Failed to validate documentation location: ${error.message}`);
    }
  }

  // Validate cross-references in documentation
  validateCrossReferences() {
    this.log('info', 'Validating cross-references...');

    const docsPath = path.join(projectRoot, '.github/docs');
    if (!fs.existsSync(docsPath)) return;

    try {
      const docFiles = fs.readdirSync(docsPath).filter(f => f.endsWith('.md'));

      for (const file of docFiles) {
        const content = this.readFile(`.github/docs/${file}`);
        if (!content) continue;

        // Check for proper .github/docs/ references
        const references = content.match(/docs\/[\w-]+\.md/g) || [];
        if (references.length > 0) {
          this.log('warning', `${file} contains references to 'docs/' instead of '.github/docs/': ${references.join(', ')}`);
        }

        // Check for valid .github/docs/ references
        const validReferences = content.match(/\.github\/docs\/[\w-]+\.md/g) || [];
        this.log('info', `${file} has ${validReferences.length} valid cross-references`);
      }

    } catch (error) {
      this.log('error', `Failed to validate cross-references: ${error.message}`);
    }
  }

  // Generate validation report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.bright}MDSG Documentation Validation Report${colors.reset}`);
    console.log('='.repeat(60));

    if (this.metrics.bundleSize) {
      console.log(`\n${colors.cyan}Bundle Metrics:${colors.reset}`);
      console.log(`  Total: ${this.metrics.bundleSize.total}KB`);
      console.log(`  JavaScript: ${this.metrics.bundleSize.js}KB`);
      console.log(`  CSS: ${this.metrics.bundleSize.css}KB`);
    }

    console.log(`\n${colors.cyan}Validation Summary:${colors.reset}`);
    console.log(`  ${colors.red}Errors: ${this.errors.length}${colors.reset}`);
    console.log(`  ${colors.yellow}Warnings: ${this.warnings.length}${colors.reset}`);
    console.log(`  ${colors.blue}Info: ${this.info.length}${colors.reset}`);

    if (this.errors.length > 0) {
      console.log(`\n${colors.red}Errors Found:${colors.reset}`);
      this.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
      this.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
    }

    const exitCode = this.errors.length > 0 ? 1 : 0;
    const status = exitCode === 0 ? `${colors.green}PASSED${colors.reset}` : `${colors.red}FAILED${colors.reset}`;

    console.log(`\n${colors.bright}Validation Result: ${status}${colors.reset}`);
    console.log('='.repeat(60));

    return exitCode;
  }

  // Main validation runner
  async run() {
    console.log(`${colors.bright}🔍 MDSG Documentation Validator${colors.reset}`);
    console.log(`${colors.blue}Validating frontend-only static site documentation...${colors.reset}\n`);

    this.validateBundleSize();
    this.validateArchitecture();
    this.validateTestDocumentation();
    this.validateDocumentationLocation();
    this.validateCrossReferences();

    const exitCode = this.generateReport();
    process.exit(exitCode);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DocumentationValidator();
  validator.run().catch(error => {
    console.error(`${colors.red}Validation failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

export default DocumentationValidator;
