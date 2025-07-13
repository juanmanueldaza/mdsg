/**
 * Environment Configuration System for daza.ar ecosystem (UMD)
 * Provides environment-specific URLs for production and local development
 * Usage: <script src="lib/env-config.umd.js"></script>
 * Access via: window.DazaEnvConfig
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory();
  } else {
    // Browser globals
    root.DazaEnvConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  // Environment detection
  const isLocalDevelopment = () => {
    return (
      window.location.hostname.includes('.local') ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.port !== '' ||
      window.location.protocol === 'file:'
    );
  };

  // Site configuration mapping
  const SITE_CONFIG = {
    cv: { port: 3001, host: 'cv.local' },
    onepager: { port: 3002, host: 'onepager.local' },
    start: { port: 3003, host: 'start.local' },
    navbar: { port: 3004, host: 'navbar.local' },
    mdsite: { port: 3005, host: 'mdsite.local' },
    data: { port: 3006, host: 'data.local' },
    wallpapers: { port: 3007, host: 'wallpapers.local' },
    laboratoriodeprogramacioncreativa: {
      port: 3008,
      host: 'laboratoriodeprogramacioncreativa.local',
    },
    spanishlessons: { port: 3009, host: 'spanishlessons.local' },
  };

  // URL mapping for production to local development
  const URL_MAPPING = {
    // Production URLs -> Local Development URLs
    'https://mdsite.daza.ar': () => 'http://mdsite.local:3005',
    'https://navbar.daza.ar': () => 'http://navbar.local:3004',
    'https://data.daza.ar': () => 'http://data.local:3006',
    'https://cv.daza.ar': () => 'http://cv.local:3001',
    'https://onepager.daza.ar': () => 'http://onepager.local:3002',
    'https://start.daza.ar': () => 'http://start.local:3003',
    'https://wallpapers.daza.ar': () => 'http://wallpapers.local:3007',
    'https://laboratoriodeprogramacioncreativa.daza.ar': () =>
      'http://laboratoriodeprogramacioncreativa.local:3008',
    'https://spanishlessons.daza.ar': () => 'http://spanishlessons.local:3009',

    // External URLs that should remain the same
    'https://wallpapers.ultravietnamita.com.ar': () =>
      'https://wallpapers.ultravietnamita.com.ar',
    'https://roofsonfire.github.io': () => 'https://roofsonfire.github.io',
  };

  // Configuration for fallback behavior
  const FALLBACK_CONFIG = {
    // Force fallback to production for specific resources when local dev servers might not be running
    forceProductionFallback: true,
    // List of resources that should always try production first if local fails
    productionFallbackResources: [
      'mdsite.js',
      'navbar.js',
      'navbar.css',
      'downloadPdf.js',
      'utils/',
      'config/',
      'md/',
      'data.daza.ar',
      '.js',
      '.css',
      '.json',
    ],
  };

  /**
   * Get the appropriate URL based on environment
   * @param {string} productionUrl - The production URL
   * @param {boolean} forceLocal - Force local URL even if fallback is enabled
   * @returns {string} - The environment-appropriate URL
   */
  const getUrl = (productionUrl, forceLocal = false) => {
    if (!isLocalDevelopment()) {
      return productionUrl;
    }

    // Check if we should use production fallback FIRST (before any URL transformation)
    if (!forceLocal && FALLBACK_CONFIG.forceProductionFallback) {
      const resourceName = productionUrl.split('/').pop();
      const isDataResource =
        productionUrl.includes('data.daza.ar') ||
        productionUrl.includes('/md/');

      const isCrossOriginResource =
        productionUrl.includes('/utils/') ||
        productionUrl.includes('/config/') ||
        (resourceName &&
          (resourceName.endsWith('.js') ||
            resourceName.endsWith('.css') ||
            resourceName.endsWith('.json')));

      if (
        isDataResource ||
        isCrossOriginResource ||
        FALLBACK_CONFIG.productionFallbackResources.some(
          resource => resourceName && resourceName.includes(resource)
        )
      ) {
        const reason = isDataResource
          ? 'data resource'
          : isCrossOriginResource
            ? 'cross-origin resource'
            : resourceName;
        console.log(`🔄 Using production fallback for: ${reason}`);
        return productionUrl;
      }
    }

    // Check if we have a mapping for this URL
    for (const [prodUrl, localUrlFunction] of Object.entries(URL_MAPPING)) {
      if (productionUrl.startsWith(prodUrl)) {
        const localUrl = productionUrl.replace(prodUrl, localUrlFunction());
        console.log(`🏠 Using local URL: ${localUrl}`);
        return localUrl;
      }
    }

    // If no mapping found, return the original URL
    return productionUrl;
  };

  /**
   * Get the base URL for a specific site
   * @param {string} siteName - The name of the site (e.g., 'mdsite', 'navbar')
   * @returns {string} - The base URL for the site
   */
  const getSiteUrl = siteName => {
    if (!isLocalDevelopment()) {
      return `https://${siteName}.daza.ar`;
    }

    const config = SITE_CONFIG[siteName];
    if (!config) {
      console.warn(`No configuration found for site: ${siteName}`);
      return `https://${siteName}.daza.ar`;
    }

    return `http://${config.host}:${config.port}`;
  };

  /**
   * Get current environment information
   * @returns {object} - Environment details
   */
  const getEnvironmentInfo = () => {
    const isDev = isLocalDevelopment();
    return {
      isDevelopment: isDev,
      isProduction: !isDev,
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      environment: isDev ? 'development' : 'production',
    };
  };

  /**
   * Helper function to replace all URLs in a configuration object
   * @param {object} config - Configuration object with URLs
   * @returns {object} - Configuration object with environment-appropriate URLs
   */
  const transformUrlsInConfig = config => {
    const transform = obj => {
      if (typeof obj === 'string') {
        return getUrl(obj);
      }

      if (Array.isArray(obj)) {
        return obj.map(transform);
      }

      if (obj && typeof obj === 'object') {
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
          newObj[key] = transform(value);
        }
        return newObj;
      }

      return obj;
    };

    return transform(config);
  };

  /**
   * Initialize environment configuration and log environment info
   */
  const initEnvironmentConfig = () => {
    const envInfo = getEnvironmentInfo();
    console.log(`🌍 Environment: ${envInfo.environment}`);
    console.log(
      `📍 Running on: ${envInfo.hostname}${envInfo.port ? ':' + envInfo.port : ''}`
    );

    if (envInfo.isDevelopment) {
      console.log('🔧 Development mode: Using local URLs');
      if (FALLBACK_CONFIG.forceProductionFallback) {
        console.log(
          '⚠️  Production fallback enabled for critical resources (including data)'
        );
      }
    } else {
      console.log('🚀 Production mode: Using production URLs');
    }
  };

  /**
   * Enable or disable production fallback for development
   * @param {boolean} enabled - Whether to enable production fallback
   */
  const setProductionFallback = enabled => {
    FALLBACK_CONFIG.forceProductionFallback = enabled;
    console.log(`🔧 Production fallback ${enabled ? 'enabled' : 'disabled'}`);
  };

  // Common URL helpers for frequently used resources
  const urls = {
    // MDSite resources
    mdsite: {
      js: () => getUrl('https://mdsite.daza.ar/mdsite.js'),
      css: () => getUrl('https://mdsite.daza.ar/mdsite.css'),
    },

    // Navbar resources
    navbar: {
      js: () => getUrl('https://navbar.daza.ar/navbar.js'),
      css: () => getUrl('https://navbar.daza.ar/navbar.css'),
    },

    // Data resources
    data: {
      cv: () => getUrl('https://data.daza.ar/md/cv.md'),
      base: () => getUrl('https://data.daza.ar'),
    },

    // Site URLs
    sites: {
      cv: () => getSiteUrl('cv'),
      start: () => getSiteUrl('start'),
      onepager: () => getSiteUrl('onepager'),
      mdsite: () => getSiteUrl('mdsite'),
      navbar: () => getSiteUrl('navbar'),
      data: () => getSiteUrl('data'),
      wallpapers: () => getSiteUrl('wallpapers'),
      laboratoriodeprogramacioncreativa: () =>
        getSiteUrl('laboratoriodeprogramacioncreativa'),
      spanishlessons: () => getSiteUrl('spanishlessons'),
    },
  };

  // Auto-initialize when loaded
  if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initEnvironmentConfig);
    } else {
      initEnvironmentConfig();
    }
  }

  // Public API
  return {
    getUrl,
    getSiteUrl,
    getEnvironmentInfo,
    transformUrlsInConfig,
    initEnvironmentConfig,
    isLocalDevelopment,
    setProductionFallback,
    urls,
  };
});
