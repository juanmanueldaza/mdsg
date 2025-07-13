/**
 * Environment Configuration System for daza.ar ecosystem
 * Provides environment-specific URLs for production and local development
 */

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
  laboratoriodeprogramacioncreativa: { port: 3008, host: 'laboratoriodeprogramacioncreativa.local' },
  spanishlessons: { port: 3009, host: 'spanishlessons.local' }
};

// URL mapping for production to local development
const URL_MAPPING = {
  // Production URLs -> Local Development URLs
  'https://mdsite.daza.ar': () => `http://mdsite.local:3005`,
  'https://navbar.daza.ar': () => `http://navbar.local:3004`,
  'https://data.daza.ar': () => `http://data.local:3006`,
  'https://cv.daza.ar': () => `http://cv.local:3001`,
  'https://onepager.daza.ar': () => `http://onepager.local:3002`,
  'https://start.daza.ar': () => `http://start.local:3003`,
  'https://wallpapers.daza.ar': () => `http://wallpapers.local:3007`,
  'https://laboratoriodeprogramacioncreativa.daza.ar': () => `http://laboratoriodeprogramacioncreativa.local:3008`,
  'https://spanishlessons.daza.ar': () => `http://spanishlessons.local:3009`,

  // External URLs that should remain the same
  'https://wallpapers.ultravietnamita.com.ar': () => `https://wallpapers.ultravietnamita.com.ar`,
  'https://roofsonfire.github.io': () => `https://roofsonfire.github.io`
};

/**
 * Get the appropriate URL based on environment
 * @param {string} productionUrl - The production URL
 * @returns {string} - The environment-appropriate URL
 */
export const getUrl = (productionUrl) => {
  if (!isLocalDevelopment()) {
    return productionUrl;
  }

  // Check if we have a mapping for this URL
  for (const [prodUrl, localUrlFunction] of Object.entries(URL_MAPPING)) {
    if (productionUrl.startsWith(prodUrl)) {
      const localBaseUrl = localUrlFunction();
      return productionUrl.replace(prodUrl, localBaseUrl);
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
export const getSiteUrl = (siteName) => {
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
export const getEnvironmentInfo = () => {
  const isDev = isLocalDevelopment();
  return {
    isDevelopment: isDev,
    isProduction: !isDev,
    hostname: window.location.hostname,
    port: window.location.port,
    protocol: window.location.protocol,
    environment: isDev ? 'development' : 'production'
  };
};

/**
 * Helper function to replace all URLs in a configuration object
 * @param {object} config - Configuration object with URLs
 * @returns {object} - Configuration object with environment-appropriate URLs
 */
export const transformUrlsInConfig = (config) => {
  const transform = (obj) => {
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
export const initEnvironmentConfig = () => {
  const envInfo = getEnvironmentInfo();
  console.log(`🌍 Environment: ${envInfo.environment}`);
  console.log(`📍 Running on: ${envInfo.hostname}${envInfo.port ? ':' + envInfo.port : ''}`);

  if (envInfo.isDevelopment) {
    console.log('🔧 Development mode: Using local URLs');
  } else {
    console.log('🚀 Production mode: Using production URLs');
  }
};

// Common URL helpers for frequently used resources
export const urls = {
  // MDSite resources
  mdsite: {
    js: () => getUrl('https://mdsite.daza.ar/mdsite.js'),
    css: () => getUrl('https://mdsite.daza.ar/mdsite.css')
  },

  // Navbar resources
  navbar: {
    js: () => getUrl('https://navbar.daza.ar/navbar.js'),
    css: () => getUrl('https://navbar.daza.ar/navbar.css')
  },

  // Data resources
  data: {
    cv: () => getUrl('https://data.daza.ar/md/cv.md'),
    base: () => getUrl('https://data.daza.ar')
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
    laboratoriodeprogramacioncreativa: () => getSiteUrl('laboratoriodeprogramacioncreativa'),
    spanishlessons: () => getSiteUrl('spanishlessons')
  }
};

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  initEnvironmentConfig();
}
