import { AuthenticationService } from '@auth';
import { GitHubAPIService } from '@github';
import { DeploymentService } from '@deployment';

export class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.initialized = false;
  }
  initialize() {
    if (this.initialized) {
      return;
    }

    const authService = new AuthenticationService();
    const githubService = new GitHubAPIService(authService);
    const deploymentService = new DeploymentService(authService, githubService);

    this.services.set('authentication', authService);
    this.services.set('github', githubService);
    this.services.set('deployment', deploymentService);

    this.initialized = true;
  }
  get(serviceName) {
    if (!this.initialized) {
      this.initialize();
    }

    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }
    return service;
  }
  getAuthenticationService() {
    return this.get('authentication');
  }
  getGitHubService() {
    return this.get('github');
  }
  getDeploymentService() {
    return this.get('deployment');
  }
  setProgressCallback(callback) {
    const deploymentService = this.getDeploymentService();
    deploymentService.setProgressCallback(callback);
  }
  async healthCheck() {
    if (!this.initialized) {
      return { healthy: false, error: 'Services not initialized' };
    }

    try {
      const authService = this.getAuthenticationService();
      const githubService = this.getGitHubService();

      const authStatus = authService.getAuthenticationStatus();

      let connectionTest = { connected: false };
      if (authStatus.authenticated) {
        connectionTest = await githubService.testConnection();
      }

      return {
        healthy: true,
        services: {
          authentication: {
            initialized: true,
            authenticated: authStatus.authenticated,
            user: authStatus.user?.login,
            demoMode: authStatus.demoMode,
          },
          github: {
            initialized: true,
            connected: connectionTest.connected,
            rateLimit: connectionTest.rateLimit,
          },
          deployment: {
            initialized: true,
            ready: authStatus.authenticated && connectionTest.connected,
          },
        },
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        services: {
          authentication: { error: 'Failed to check' },
          github: { error: 'Failed to check' },
          deployment: { error: 'Failed to check' },
        },
      };
    }
  }
  reset() {
    this.services.clear();
    this.initialized = false;
  }
}

export const serviceRegistry = new ServiceRegistry();

export const getAuthService = () => serviceRegistry.getAuthenticationService();
export const getGitHubService = () => serviceRegistry.getGitHubService();
export const getDeploymentService = () =>
  serviceRegistry.getDeploymentService();
