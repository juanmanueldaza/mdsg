# 🔧 MDSG API Reference

> Complete JavaScript API documentation for MDSG classes and services

## 🎯 Core Classes

### MDSG (Main Class)

**Location**: `src/main.js`  
**Purpose**: Main application controller and UI coordinator

```javascript
import { MDSG } from './src/main.js';

const mdsg = new MDSG();
```

#### Properties

| Property        | Type      | Description                   |
| --------------- | --------- | ----------------------------- |
| `authenticated` | `boolean` | Current authentication status |
| `user`          | `object`  | Current user data from GitHub |
| `token`         | `string`  | GitHub access token           |
| `content`       | `string`  | Current markdown content      |
| `repoName`      | `string`  | Current repository name       |

#### Methods

##### Authentication

```javascript
// Check if user is authenticated
mdsg.isAuthenticated(): boolean

// Get current user information
mdsg.getCurrentUser(): object | null

// Validate GitHub token format
mdsg.isValidToken(token: string): boolean

// Start demo mode (no authentication)
mdsg.startDemoMode(): void

// Clear authentication state
mdsg.logout(): void
```

##### Content Management

```javascript
// Get current markdown content
mdsg.getContent(): string

// Set markdown content
mdsg.setContent(content: string): void

// Convert markdown to HTML
mdsg.markdownToHTML(markdown: string): string

// Update word count display
mdsg.updateWordCount(): void

// Auto-save current content
mdsg.autoSave(): void
```

##### Site Management

```javascript
// Deploy site to GitHub Pages
mdsg.deploySite(content: string, repoName?: string): Promise<object>

// Show editor interface
mdsg.showEditor(): void

// Show welcome screen
mdsg.showWelcomeScreen(): void

// Reset for new site creation
mdsg.resetForNewSite(): void
```

## 🔐 Authentication Service

**Location**: `src/services/auth.js`  
**Purpose**: Handle GitHub authentication and token management

```javascript
import { AuthenticationService } from './src/services/auth.js';

const auth = new AuthenticationService();
```

#### Methods

```javascript
// Check authentication status
auth.isAuthenticated(): boolean

// Get current user data
auth.getCurrentUser(): object | null

// Get current token
auth.getCurrentToken(): string | null

// Validate token format
auth.isValidToken(token: string): boolean

// Set authenticated state
auth.setAuthenticated(userData: object, token: string): void

// Enable demo mode
auth.setDemoMode(): void

// Clear authentication
auth.logout(): void

// Validate token with GitHub API
auth.validateTokenWithGitHub(token: string): Promise<object>

// Generate CSRF token
auth.generateCSRFToken(): string

// Get authentication error message
auth.getAuthenticationErrorMessage(error: Error): string
```

## 🐙 GitHub API Service

**Location**: `src/services/github.js`  
**Purpose**: GitHub API integration and repository management

```javascript
import { GitHubAPIService } from './src/services/github.js';

const github = new GitHubAPIService(authService);
```

#### Methods

##### User Operations

```javascript
// Fetch current user data
github.fetchUser(): Promise<object>

// Test API connection
github.testConnection(): Promise<object>

// Check API rate limits
github.checkRateLimit(): Promise<object>
```

##### Repository Operations

```javascript
// Create new repository
github.createRepository(
  name: string,
  description?: string,
  options?: object
): Promise<object>

// Create repository with auto-naming
github.createRepositoryWithAutoNaming(
  baseName: string,
  description?: string,
  maxAttempts?: number
): Promise<object>

// Upload content to repository
github.uploadContent(
  repoName: string,
  filePath: string,
  content: string,
  commitMessage?: string
): Promise<object>

// Enable GitHub Pages
github.enableGitHubPages(
  repoName: string,
  options?: object
): Promise<object>
```

##### Utility Methods

```javascript
// Encode content for GitHub API
github.encodeBase64Unicode(str: string): string

// Get API headers with authentication
github.getAPIHeaders(): object

// Validate request origin
github.validateRequestOrigin(expectedOrigin?: string): void
```

## 🚀 Deployment Service

**Location**: `src/services/deployment.js`  
**Purpose**: Site deployment and GitHub Pages setup

```javascript
import { DeploymentService } from './src/services/deployment.js';

const deployment = new DeploymentService(authService, githubService);
```

#### Methods

```javascript
// Deploy site to GitHub Pages
deployment.deployToGitHubPages(
  content: string,
  repoName: string,
  options?: object
): Promise<object>

// Create deployment repository
deployment.createDeploymentRepository(
  baseName: string,
  options?: object
): Promise<object>

// Upload site content
deployment.uploadSiteContent(
  repoName: string,
  markdownContent: string
): Promise<void>

// Generate HTML for site
deployment.generateSiteHTML(markdownContent: string): string

// Enable GitHub Pages for site
deployment.enableSitePages(repoName: string): Promise<object>

// Set progress callback
deployment.setProgressCallback(callback: function): void

// Validate content for deployment
deployment.validateContentForDeployment(content: string): boolean
```

## 🔒 Security Service

**Location**: `src/utils/security-minimal.js`  
**Purpose**: XSS prevention and input validation

```javascript
import { MinimalSecurity } from './src/utils/security-minimal.js';
```

#### Methods

```javascript
// Sanitize HTML content
MinimalSecurity.sanitizeHTML(html: string): string

// Escape text for safe display
MinimalSecurity.escapeText(text: string): string

// Sanitize trusted UI content
MinimalSecurity.sanitizeTrustedUI(html: string): string

// Token management
MinimalSecurity.storeToken(token: string, userInfo?: object): boolean
MinimalSecurity.getToken(): object | null
MinimalSecurity.clearToken(): boolean
MinimalSecurity.validateToken(token: string): boolean

// Content validation
MinimalSecurity.validateContent(content: string): boolean
MinimalSecurity.storeContent(content: string): boolean
MinimalSecurity.isValidURL(url: string): boolean
```

## 🎯 Event System

**Location**: `src/events/observable.js`  
**Purpose**: Reactive programming and event handling

```javascript
import { Observable, Subject } from './src/events/observable.js';
```

#### Observable Class

```javascript
// Create new observable
const obs = new Observable(subscriberFunction);

// Subscribe to observable
obs.subscribe(observer): Subscription

// Transform observable
obs.map(transformFunction): Observable
obs.filter(predicateFunction): Observable
obs.debounce(delayMs): Observable
```

#### Subject Class

```javascript
// Create new subject
const subject = new Subject();

// Emit values
subject.next(value): void
subject.error(error): void
subject.complete(): void

// Subscribe to subject
subject.subscribe(observer): Subscription
```

## 📝 Markdown Processor

**Location**: `src/utils/markdown-processor.js`  
**Purpose**: Convert markdown to HTML with security

```javascript
import { MarkdownProcessor } from './src/utils/markdown-processor.js';
```

#### Methods

```javascript
// Process markdown to HTML
MarkdownProcessor.process(markdown: string): string

// Process specific elements
MarkdownProcessor._processHeaders(html: string): string
MarkdownProcessor._processCodeBlocks(html: string): string
MarkdownProcessor._processLists(html: string): string
MarkdownProcessor._processLinks(html: string): string
MarkdownProcessor._processImages(html: string): string
```

## 🏪 Service Registry

**Location**: `src/services/registry.js`  
**Purpose**: Service dependency injection and coordination

```javascript
import {
  serviceRegistry,
  getAuthService,
  getGitHubService,
  getDeploymentService,
} from './src/services/registry.js';
```

#### Methods

```javascript
// Initialize all services
serviceRegistry.initialize(): void

// Get specific service
serviceRegistry.get(serviceName: string): object

// Health check all services
serviceRegistry.healthCheck(): Promise<object>

// Reset all services
serviceRegistry.reset(): void

// Convenience getters
getAuthService(): AuthenticationService
getGitHubService(): GitHubAPIService
getDeploymentService(): DeploymentService
```

## 🎨 UI Components

**Location**: `src/components/ui-components.js`  
**Purpose**: Reusable UI building blocks

```javascript
import { UIComponentsService } from './src/components/ui-components.js';

const ui = new UIComponentsService();
```

#### Methods

```javascript
// Create loading spinner
ui.createLoadingSpinner(message?: string): HTMLElement

// Create error message
ui.createErrorMessage(message: string, type?: string): HTMLElement

// Create progress bar
ui.createProgressBar(percentage: number): HTMLElement

// Create modal dialog
ui.createModal(title: string, content: string): HTMLElement

// Show notification
ui.showNotification(message: string, type?: string, duration?: number): void
```

## 📊 State Management

**Location**: `src/utils/state-management.js`  
**Purpose**: Application state management

```javascript
import {
  ContentState,
  AuthenticationState,
} from './src/utils/state-management.js';
```

#### ContentState Class

```javascript
const contentState = new ContentState();

// Content management
contentState.getContent(): string
contentState.setContent(content: string): void
contentState.hasUnsavedChanges(): boolean
contentState.markSaved(): void

// Repository management
contentState.getRepoName(): string
contentState.setRepoName(name: string): void
```

#### AuthenticationState Class

```javascript
const authState = new AuthenticationState();

// Authentication status
authState.isAuthenticated(): boolean
authState.getUser(): object | null
authState.getToken(): string | null

// State management
authState.setAuthenticated(user: object, token: string): void
authState.clearAuthentication(): void
```

## 🔧 Event Handlers

**Location**: `src/events/handlers.js`  
**Purpose**: UI event coordination and management

```javascript
import { EventHandlerService } from './src/events/handlers.js';

const eventHandler = new EventHandlerService(
  authService,
  githubService,
  deploymentService,
  contentState,
  uiManager,
);
```

#### Methods

```javascript
// Initialize event handlers
eventHandler.initialize(container?: Element): void

// Setup specific event types
eventHandler.setupAuthenticationEvents(container: Element): void
eventHandler.setupEditorEvents(container: Element): void
eventHandler.setupNavigationEvents(container: Element): void
eventHandler.setupDeploymentEvents(container: Element): void

// Cleanup
eventHandler.cleanup(): void
eventHandler.reinitialize(): void

// Get statistics
eventHandler.getStats(): object
```

## 📚 Usage Examples

### Basic Site Creation

```javascript
// Initialize MDSG
const mdsg = new MDSG();

// Set content
mdsg.setContent('# My Site\n\nHello world!');

// Deploy site
const result = await mdsg.deploySite(mdsg.getContent());
console.log('Site URL:', result.siteUrl);
```

### Authentication Flow

```javascript
const auth = getAuthService();

// Validate token
if (auth.isValidToken(userToken)) {
  const userData = await auth.validateTokenWithGitHub(userToken);
  auth.setAuthenticated(userData, userToken);
}
```

### Custom Event Handling

```javascript
import { eventBus } from './src/events/observable.js';

// Listen for deployment events
eventBus.on('deployment.success', event => {
  console.log('Site deployed:', event.result.siteUrl);
});

// Emit custom events
eventBus.emit('custom.event', { data: 'value' });
```

## 🚀 Advanced Usage

### Service Extension

```javascript
// Extend existing services
class CustomGitHubService extends GitHubAPIService {
  async customMethod() {
    // Custom implementation
  }
}

// Register custom service
serviceRegistry.services.set('github', new CustomGitHubService(authService));
```

### Custom Markdown Processing

```javascript
// Extend markdown processor
class CustomMarkdownProcessor extends MarkdownProcessor {
  static process(markdown) {
    let html = super.process(markdown);
    // Add custom processing
    return html;
  }
}
```

## 🔍 Type Definitions

MDSG uses JSDoc for type annotations. Key types:

```javascript
/**
 * @typedef {Object} UserData
 * @property {string} login - GitHub username
 * @property {string} name - Display name
 * @property {string} email - Email address
 * @property {string} avatar_url - Avatar image URL
 */

/**
 * @typedef {Object} RepositoryData
 * @property {string} name - Repository name
 * @property {string} full_name - Full repository name
 * @property {string} html_url - Repository URL
 * @property {string} clone_url - Clone URL
 */

/**
 * @typedef {Object} DeploymentResult
 * @property {string} siteUrl - Live site URL
 * @property {RepositoryData} repository - Repository info
 * @property {Object} pagesInfo - GitHub Pages info
 */
```

## 🆘 Error Handling

All async methods can throw errors. Handle them appropriately:

```javascript
try {
  const result = await mdsg.deploySite(content);
  console.log('Success:', result);
} catch (error) {
  console.error('Deployment failed:', error.message);
  // Handle error appropriately
}
```

Common error types:

- `AuthenticationError` - Token issues
- `ValidationError` - Invalid input
- `NetworkError` - API connectivity
- `RateLimitError` - GitHub API limits

## 📚 Related Documentation

- 🚀 [Setup Guide](../../SETUP_GUIDE.md) - Development setup
- 🏗️ [Architecture Guide](architecture.md) - System design
- 🧪 [Testing Guide](../operations/testing.md) - Test patterns

**Build amazing things with MDSG!** 🚀
