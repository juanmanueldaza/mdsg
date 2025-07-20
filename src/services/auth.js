import { MinimalSecurity } from '@security';

export class AuthenticationService {
  constructor() {
    this.csrfToken = this.generateCSRFToken();
  }
  isAuthenticated() {
    const tokenData = MinimalSecurity.getToken();
    return !!(
      tokenData &&
      tokenData.token &&
      this.isValidToken(tokenData.token)
    );
  }
  getCurrentUser() {
    const tokenData = MinimalSecurity.getToken();
    return tokenData?.user || null;
  }
  getCurrentToken() {
    const tokenData = MinimalSecurity.getToken();
    return tokenData?.token || null;
  }
  isValidToken(token) {
    return MinimalSecurity.validateToken(token);
  }
  setAuthenticated(userData, token) {
    if (!userData || !token) {
      throw new Error('User data and token are required for authentication');
    }

    if (!this.isValidToken(token)) {
      throw new Error('Invalid token format provided');
    }

    const enhancedUser = {
      ...userData,
      displayName: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      profileUrl: userData.html_url,
      tokenValid: true,
      lastAuthenticated: new Date().toISOString(),
      demoMode: false,
    };

    MinimalSecurity.storeToken(token, enhancedUser);
  }
  setDemoMode() {
    const demoUser = {
      login: 'demo-user',
      name: 'Demo User',
      avatar_url: 'https://github.com/github.png',
      html_url: 'https://github.com/demo-user',
      email: 'demo@example.com',
      displayName: 'Demo User',
      avatarUrl: 'https://github.com/github.png',
      profileUrl: 'https://github.com/demo-user',
      tokenValid: true,
      lastAuthenticated: new Date().toISOString(),
      demoMode: true,
    };

    MinimalSecurity.storeToken('demo-token', demoUser);

    return demoUser;
  }
  logout() {
    MinimalSecurity.clearToken();
  }
  async validateTokenWithGitHub(token) {
    if (!this.isValidToken(token)) {
      throw new Error('Invalid token format');
    }

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'MDSG-App',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'Invalid token - please check your GitHub personal access token',
          );
        }
        if (response.status === 403) {
          throw new Error(
            'Token does not have required permissions - please ensure "repo" and "user" scopes are enabled',
          );
        }
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`,
        );
      }

      const userData = await response.json();

      if (!userData.login) {
        throw new Error(
          'Unable to fetch user information - token may be invalid',
        );
      }

      return userData;
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error(
          'Unable to connect to GitHub API - please check your internet connection',
        );
      }
      throw error;
    }
  }
  generateCSRFToken() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  getCSRFToken() {
    return this.csrfToken;
  }
  validateCSRFToken(token) {
    return token === this.csrfToken;
  }
  getAuthenticationStatus() {
    const isAuth = this.isAuthenticated();
    const user = this.getCurrentUser();
    const token = this.getCurrentToken();

    return {
      authenticated: isAuth,
      user,
      hasToken: !!token,
      tokenValid: token ? this.isValidToken(token) : false,
      demoMode: user?.demoMode || false,
      lastAuthenticated: user?.lastAuthenticated || null,
      csrfToken: this.csrfToken,
    };
  }
  getAuthenticationErrorMessage(error) {
    if (error.message.includes('Invalid token')) {
      return 'Unable to sign in. Please check that your token is valid and has "repo" and "user" permissions.';
    }
    if (error.message.includes('permissions')) {
      return 'Token permissions insufficient. Please ensure "repo" and "user" scopes are enabled.';
    }
    if (error.message.includes('connect')) {
      return 'Unable to connect to GitHub. Please check your internet connection.';
    }
    return 'Authentication failed. Please try again or check your token.';
  }
}
