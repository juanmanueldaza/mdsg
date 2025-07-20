// Quick validation test
import { InputValidator } from './src/utils/validation.js';

console.log('Testing GitHub token validation...');
const tokenTest = InputValidator.validateGitHubToken('ghp_1234567890abcdefghijklmnopqrstuvwxyz');
console.log('Token validation result:', tokenTest);

console.log('\nTesting repository name validation...');
const repoTest = InputValidator.validateRepositoryName('my-awesome-site');
console.log('Repo validation result:', repoTest);

console.log('\nTesting markdown content validation...');
const markdownTest = InputValidator.validateMarkdownContent('# Hello World\n\nThis is a test.');
console.log('Markdown validation result:', markdownTest);

console.log('\nAll validation tests completed successfully!');
