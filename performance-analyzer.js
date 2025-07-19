#!/usr/bin/env node

// MDSG Performance Analyzer
// Comprehensive performance monitoring and analysis tool

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { gzipSync } = require('zlib');

class PerformanceAnalyzer {
  constructor() {
    this.metrics = {
      bundleSize: {},
      loadTime: 0,
      lighthouse: {},
      dependencies: {},
      recommendations: [],
    };
    this.thresholds = {
      jsBundle: 50 * 1024, // 50KB gzipped
      cssBundle: 20 * 1024, // 20KB gzipped
      loadTime: 2000, // 2 seconds
      performance: 90, // Lighthouse performance score
      accessibility: 90,
      bestPractices: 90,
      seo: 80,
    };
  }

  async analyze() {
    console.log('🔍 MDSG Performance Analysis Starting...\n');

    try {
      await this.checkBundleSize();
      await this.analyzeDependencies();
      await this.runLighthouse();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  async checkBundleSize() {
    console.log('📦 Analyzing bundle sizes...');

    const distDir = path.join(process.cwd(), 'dist', 'assets');

    if (!fs.existsSync(distDir)) {
      console.log('⚠️  Building application first...');
      execSync('npm run build', { stdio: 'inherit' });
    }

    const files = fs.readdirSync(distDir);

    for (const file of files) {
      const filePath = path.join(distDir, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath);
      const gzipped = gzipSync(content);

      const fileInfo = {
        name: file,
        size: stats.size,
        gzipped: gzipped.length,
        type: path.extname(file).slice(1),
      };

      this.metrics.bundleSize[file] = fileInfo;

      const sizeKB = (stats.size / 1024).toFixed(1);
      const gzippedKB = (gzipped.length / 1024).toFixed(1);

      let status = '✅';
      let threshold = 0;

      if (file.endsWith('.js')) {
        threshold = this.thresholds.jsBundle;
        status = gzipped.length > threshold ? '❌' : '✅';
      } else if (file.endsWith('.css')) {
        threshold = this.thresholds.cssBundle;
        status = gzipped.length > threshold ? '❌' : '✅';
      }

      console.log(`  ${status} ${file}: ${sizeKB}KB (${gzippedKB}KB gzipped)`);

      if (gzipped.length > threshold && threshold > 0) {
        this.metrics.recommendations.push({
          type: 'bundle-size',
          severity: 'warning',
          message: `${file} exceeds size threshold (${gzippedKB}KB > ${(threshold / 1024).toFixed(1)}KB)`,
          suggestions: this.getBundleSizeRecommendations(file),
        });
      }
    }

    const totalSize = Object.values(this.metrics.bundleSize).reduce(
      (sum, file) => sum + file.gzipped,
      0,
    );
    const totalSizeKB = (totalSize / 1024).toFixed(1);

    console.log(`\n📊 Total gzipped size: ${totalSizeKB}KB`);
    console.log('');
  }

  async analyzeDependencies() {
    console.log('📚 Analyzing dependencies...');

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const depCount = Object.keys(deps).length;
      console.log(`  📦 Total dependencies: ${depCount}`);

      // Check for heavy dependencies
      const heavyDeps = [
        'react',
        'vue',
        'angular',
        'lodash',
        'moment',
        'axios',
      ];

      const foundHeavy = Object.keys(deps).filter(dep =>
        heavyDeps.some(heavy => dep.includes(heavy)),
      );

      if (foundHeavy.length > 0) {
        this.metrics.recommendations.push({
          type: 'dependencies',
          severity: 'info',
          message: `Consider lighter alternatives for: ${foundHeavy.join(', ')}`,
          suggestions: [
            'Use native browser APIs where possible',
            'Consider tree-shaking to reduce bundle size',
            'Evaluate if all dependencies are necessary',
          ],
        });
      }

      // Check for security vulnerabilities
      try {
        const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
        const audit = JSON.parse(auditResult);

        if (audit.metadata.vulnerabilities.total > 0) {
          this.metrics.recommendations.push({
            type: 'security',
            severity: 'error',
            message: `Found ${audit.metadata.vulnerabilities.total} security vulnerabilities`,
            suggestions: ['Run "npm audit fix" to resolve vulnerabilities'],
          });
        } else {
          console.log('  ✅ No security vulnerabilities found');
        }
      } catch (error) {
        console.log('  ⚠️  Could not check security vulnerabilities');
      }

      this.metrics.dependencies = {
        total: depCount,
        production: Object.keys(packageJson.dependencies || {}).length,
        development: Object.keys(packageJson.devDependencies || {}).length,
      };
    } catch (error) {
      console.log('  ⚠️  Could not analyze dependencies:', error.message);
    }

    console.log('');
  }

  async runLighthouse() {
    console.log('🚨 Running Lighthouse performance audit...');

    try {
      // Start preview server
      const server = spawn('npm', ['run', 'preview'], {
        stdio: 'pipe',
        detached: false,
      });

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Run Lighthouse
      const lighthouseCmd = [
        'npx',
        'lighthouse',
        'http://localhost:3001',
        '--only-categories=performance,accessibility,best-practices,seo',
        '--output=json',
        '--output-path=lighthouse-results.json',
        '--chrome-flags=--headless',
        '--quiet',
      ].join(' ');

      try {
        execSync(lighthouseCmd, { stdio: 'pipe' });

        if (fs.existsSync('lighthouse-results.json')) {
          const results = JSON.parse(
            fs.readFileSync('lighthouse-results.json', 'utf8'),
          );

          this.metrics.lighthouse = {
            performance: Math.round(results.categories.performance.score * 100),
            accessibility: Math.round(
              results.categories.accessibility.score * 100,
            ),
            bestPractices: Math.round(
              results.categories['best-practices'].score * 100,
            ),
            seo: Math.round(results.categories.seo.score * 100),
            metrics: {
              fcp: results.audits['first-contentful-paint'].numericValue,
              lcp: results.audits['largest-contentful-paint'].numericValue,
              cls: results.audits['cumulative-layout-shift'].numericValue,
              fid: results.audits['max-potential-fid']?.numericValue || 0,
            },
          };

          // Check against thresholds
          Object.entries(this.thresholds).forEach(([key, threshold]) => {
            if (
              this.metrics.lighthouse[key] &&
              this.metrics.lighthouse[key] < threshold
            ) {
              this.metrics.recommendations.push({
                type: 'lighthouse',
                severity: 'warning',
                message: `${key} score (${this.metrics.lighthouse[key]}) below threshold (${threshold})`,
                suggestions: this.getLighthouseRecommendations(key),
              });
            }
          });

          console.log('  ✅ Lighthouse audit completed');

          // Clean up results file
          fs.unlinkSync('lighthouse-results.json');
        }
      } catch (lighthouseError) {
        console.log('  ⚠️  Lighthouse audit failed:', lighthouseError.message);
      }

      // Stop server
      server.kill('SIGTERM');

      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log('  ⚠️  Could not run Lighthouse:', error.message);
    }

    console.log('');
  }

  async generateReport() {
    console.log('📊 Performance Analysis Report');
    console.log('================================\n');

    // Bundle Size Report
    console.log('📦 Bundle Analysis:');
    const totalGzipped = Object.values(this.metrics.bundleSize).reduce(
      (sum, file) => sum + file.gzipped,
      0,
    );

    console.log(`  Total Size: ${(totalGzipped / 1024).toFixed(1)}KB gzipped`);

    const jsFiles = Object.values(this.metrics.bundleSize).filter(
      f => f.type === 'js',
    );
    const cssFiles = Object.values(this.metrics.bundleSize).filter(
      f => f.type === 'css',
    );

    if (jsFiles.length > 0) {
      const jsSize = jsFiles.reduce((sum, f) => sum + f.gzipped, 0);
      const status = jsSize <= this.thresholds.jsBundle ? '✅' : '❌';
      console.log(`  JavaScript: ${(jsSize / 1024).toFixed(1)}KB ${status}`);
    }

    if (cssFiles.length > 0) {
      const cssSize = cssFiles.reduce((sum, f) => sum + f.gzipped, 0);
      const status = cssSize <= this.thresholds.cssBundle ? '✅' : '❌';
      console.log(`  CSS: ${(cssSize / 1024).toFixed(1)}KB ${status}`);
    }

    // Lighthouse Report
    if (Object.keys(this.metrics.lighthouse).length > 0) {
      console.log('\n🚨 Lighthouse Scores:');
      const scores = this.metrics.lighthouse;

      console.log(
        `  Performance: ${scores.performance}/100 ${this.getScoreEmoji(scores.performance)}`,
      );
      console.log(
        `  Accessibility: ${scores.accessibility}/100 ${this.getScoreEmoji(scores.accessibility)}`,
      );
      console.log(
        `  Best Practices: ${scores.bestPractices}/100 ${this.getScoreEmoji(scores.bestPractices)}`,
      );
      console.log(`  SEO: ${scores.seo}/100 ${this.getScoreEmoji(scores.seo)}`);

      if (scores.metrics) {
        console.log('\n⚡ Core Web Vitals:');
        console.log(
          `  First Contentful Paint: ${(scores.metrics.fcp / 1000).toFixed(2)}s`,
        );
        console.log(
          `  Largest Contentful Paint: ${(scores.metrics.lcp / 1000).toFixed(2)}s`,
        );
        console.log(
          `  Cumulative Layout Shift: ${scores.metrics.cls.toFixed(3)}`,
        );
        if (scores.metrics.fid > 0) {
          console.log(
            `  First Input Delay: ${scores.metrics.fid.toFixed(0)}ms`,
          );
        }
      }
    }

    // Dependencies Report
    if (this.metrics.dependencies.total) {
      console.log('\n📚 Dependencies:');
      console.log(`  Total: ${this.metrics.dependencies.total}`);
      console.log(`  Production: ${this.metrics.dependencies.production}`);
      console.log(`  Development: ${this.metrics.dependencies.development}`);
    }

    // Recommendations
    if (this.metrics.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');

      this.metrics.recommendations.forEach((rec, index) => {
        const icon =
          rec.severity === 'error'
            ? '❌'
            : rec.severity === 'warning'
              ? '⚠️'
              : 'ℹ️';

        console.log(`\n  ${icon} ${rec.message}`);

        if (rec.suggestions && rec.suggestions.length > 0) {
          rec.suggestions.forEach(suggestion => {
            console.log(`     • ${suggestion}`);
          });
        }
      });
    } else {
      console.log('\n✅ No performance issues detected!');
    }

    // Overall Score
    this.generateOverallScore();
  }

  generateOverallScore() {
    console.log('\n🎯 Overall Performance Score:');

    let score = 100;
    let maxDeductions = 0;

    // Bundle size deductions
    const totalGzipped = Object.values(this.metrics.bundleSize).reduce(
      (sum, file) => sum + file.gzipped,
      0,
    );

    if (totalGzipped > 70 * 1024) {
      // 70KB total
      score -= 20;
      maxDeductions += 20;
    }

    // Lighthouse score deductions
    if (this.metrics.lighthouse.performance) {
      const perfScore = this.metrics.lighthouse.performance;
      if (perfScore < 90) score -= (90 - perfScore) / 2;
      maxDeductions += 25;
    }

    // Security deductions
    const securityIssues = this.metrics.recommendations.filter(
      r => r.type === 'security',
    );
    if (securityIssues.length > 0) {
      score -= 30;
      maxDeductions += 30;
    }

    score = Math.max(0, Math.min(100, score));

    const grade =
      score >= 90
        ? 'A'
        : score >= 80
          ? 'B'
          : score >= 70
            ? 'C'
            : score >= 60
              ? 'D'
              : 'F';
    const emoji =
      score >= 90
        ? '🎉'
        : score >= 80
          ? '👍'
          : score >= 70
            ? '👌'
            : score >= 60
              ? '⚠️'
              : '💥';

    console.log(`  ${emoji} Score: ${score.toFixed(0)}/100 (Grade: ${grade})`);

    if (score < 80) {
      console.log(
        '\n🔧 Focus on the recommendations above to improve your score!',
      );
    }
  }

  getScoreEmoji(score) {
    if (score >= 90) return '✅';
    if (score >= 75) return '⚠️';
    return '❌';
  }

  getBundleSizeRecommendations(filename) {
    const recommendations = [
      'Enable tree-shaking in your build process',
      'Use dynamic imports for code splitting',
      'Remove unused dependencies',
      'Optimize images and compress assets',
    ];

    if (filename.endsWith('.js')) {
      recommendations.push(
        'Consider using a lighter alternative library',
        'Remove console.log statements in production',
        'Use terser for better minification',
      );
    }

    if (filename.endsWith('.css')) {
      recommendations.push(
        'Remove unused CSS rules',
        'Use CSS-in-JS for component-scoped styles',
        'Consider critical CSS inlining',
      );
    }

    return recommendations;
  }

  getLighthouseRecommendations(category) {
    const recommendations = {
      performance: [
        'Optimize images (use WebP format)',
        'Enable text compression (gzip/brotli)',
        'Minimize main-thread work',
        'Reduce unused JavaScript',
        'Use efficient cache policies',
      ],
      accessibility: [
        'Add alt text to images',
        'Ensure sufficient color contrast',
        'Add ARIA labels where needed',
        'Make sure all interactive elements are keyboard accessible',
      ],
      bestPractices: [
        'Use HTTPS',
        'Remove console logs from production',
        'Avoid deprecated APIs',
        'Fix security vulnerabilities',
      ],
      seo: [
        'Add meta descriptions',
        'Use descriptive link text',
        'Ensure text is readable',
        'Add structured data markup',
      ],
    };

    return recommendations[category] || [];
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.analyze().catch(error => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceAnalyzer;
