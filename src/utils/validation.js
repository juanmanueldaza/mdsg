/**
 * Comprehensive Input Validation Utility for MDSG
 * Provides secure validation for all user inputs
 */

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  MARKDOWN: 1024 * 1024, // 1MB for markdown content
  REPOSITORY_NAME: 100, // 100 characters max
  TOKEN: 255, // GitHub tokens can be up to 255 characters (fine-grained tokens are longer)
  DESCRIPTION: 500, // 500 characters for descriptions
};

/**
 * Suspicious patterns that should be flagged in markdown content
 */
const SUSPICIOUS_PATTERNS = [
  // Script injection attempts
  /<script[^>]*>/i,
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,
  
  // Event handlers
  /on\w+\s*=/i,
  
  // Dangerous elements
  /<iframe[^>]*>/i,
  /<object[^>]*>/i,
  /<embed[^>]*>/i,
  /<form[^>]*>/i,
  /<input[^>]*>/i,
  
  // Data exfiltration attempts
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /\.send\s*\(/i,
  
  // Base64 encoded scripts (common bypass technique)
  /data:.*base64.*script/i,
  
  // CSS injection
  /@import/i,
  /expression\s*\(/i,
  
  // SVG-based attacks
  /<svg[^>]*onload/i,
];

/**
 * Validation utility class
 */
export class InputValidator {
  /**
   * Validate GitHub token format and security
   * @param {string} token - GitHub token to validate
   * @returns {object} - Validation result with isValid and errors
   */
  static validateGitHubToken(token) {
    const errors = [];
    
    if (!token || typeof token !== 'string') {
      errors.push('Token is required and must be a string');
      return { isValid: false, errors };
    }
    
    // Check token length
    if (token.length < 20) {
      errors.push('Token is too short (minimum 20 characters)');
    }
    
    if (token.length > FILE_SIZE_LIMITS.TOKEN) {
      errors.push(`Token is too long (maximum ${FILE_SIZE_LIMITS.TOKEN} characters)`);
    }
    
    // Check token format (GitHub personal access tokens)
    if (!/^[a-zA-Z0-9_]+$/.test(token)) {
      errors.push('Token contains invalid characters (only alphanumeric and underscore allowed)');
    }
    
    // Check for suspicious patterns
    if (/[<>'"&]/.test(token)) {
      errors.push('Token contains potentially dangerous characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? token.trim() : null
    };
  }

  /**
   * Validate repository name
   * @param {string} repoName - Repository name to validate
   * @returns {object} - Validation result with isValid and errors
   */
  static validateRepositoryName(repoName) {
    const errors = [];
    
    if (!repoName || typeof repoName !== 'string') {
      errors.push('Repository name is required and must be a string');
      return { isValid: false, errors };
    }
    
    const trimmed = repoName.trim();
    
    // Check length
    if (trimmed.length === 0) {
      errors.push('Repository name cannot be empty');
    }
    
    if (trimmed.length > FILE_SIZE_LIMITS.REPOSITORY_NAME) {
      errors.push(`Repository name is too long (maximum ${FILE_SIZE_LIMITS.REPOSITORY_NAME} characters)`);
    }
    
    // Check format (GitHub repository naming rules)
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
      errors.push('Repository name can only contain letters, numbers, dots, hyphens, and underscores');
    }
    
    // GitHub-specific rules
    if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
      errors.push('Repository name cannot start or end with a dot');
    }
    
    if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
      errors.push('Repository name cannot start or end with a hyphen');
    }
    
    // Reserved names
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    if (reservedNames.includes(trimmed.toUpperCase())) {
      errors.push('Repository name cannot be a reserved system name');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? trimmed : null
    };
  }

  /**
   * Validate markdown content with size limits and suspicious pattern detection
   * @param {string} markdown - Markdown content to validate
   * @returns {object} - Validation result with isValid, errors, and warnings
   */
  static validateMarkdownContent(markdown) {
    const errors = [];
    const warnings = [];
    
    if (typeof markdown !== 'string') {
      errors.push('Markdown content must be a string');
      return { isValid: false, errors, warnings };
    }
    
    // Check size limits
    const contentSize = new Blob([markdown]).size;
    if (contentSize > FILE_SIZE_LIMITS.MARKDOWN) {
      errors.push(`Markdown content is too large (${(contentSize / 1024).toFixed(1)}KB, maximum ${FILE_SIZE_LIMITS.MARKDOWN / 1024}KB)`);
    }
    
    // Check for suspicious patterns
    const suspiciousFindings = [];
    SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(markdown)) {
        suspiciousFindings.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    });
    
    if (suspiciousFindings.length > 0) {
      warnings.push(...suspiciousFindings);
      // For now, we'll allow the content but warn - DOMPurify will sanitize
      console.warn('Suspicious patterns detected in markdown:', suspiciousFindings);
    }
    
    // Check for excessive repetition (potential DoS)
    const lines = markdown.split('\n');
    if (lines.length > 10000) {
      warnings.push('Markdown content has a very large number of lines, which may affect performance');
    }
    
    // Check for extremely long lines (potential DoS)
    const longLines = lines.filter(line => line.length > 10000);
    if (longLines.length > 0) {
      warnings.push(`${longLines.length} lines exceed 10,000 characters, which may affect performance`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: errors.length === 0 ? markdown : null,
      size: contentSize,
      stats: {
        lines: lines.length,
        characters: markdown.length,
        bytes: contentSize
      }
    };
  }

  /**
   * Validate site description
   * @param {string} description - Site description to validate
   * @returns {object} - Validation result
   */
  static validateSiteDescription(description) {
    const errors = [];
    
    if (description && typeof description !== 'string') {
      errors.push('Description must be a string');
      return { isValid: false, errors };
    }
    
    if (!description) {
      return { isValid: true, errors: [], sanitizedValue: '' };
    }
    
    const trimmed = description.trim();
    
    if (trimmed.length > FILE_SIZE_LIMITS.DESCRIPTION) {
      errors.push(`Description is too long (maximum ${FILE_SIZE_LIMITS.DESCRIPTION} characters)`);
    }
    
    // Check for HTML/script injection
    if (/<[^>]*>/.test(trimmed)) {
      errors.push('Description cannot contain HTML tags');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? trimmed : null
    };
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {object} - Validation result
   */
  static validateURL(url) {
    const errors = [];
    
    if (!url || typeof url !== 'string') {
      errors.push('URL is required and must be a string');
      return { isValid: false, errors };
    }
    
    try {
      const parsedURL = new URL(url);
      
      // Only allow HTTP and HTTPS
      if (!['http:', 'https:'].includes(parsedURL.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol');
      }
      
      // Validate hostname
      if (!parsedURL.hostname || parsedURL.hostname.length === 0) {
        errors.push('URL must have a valid hostname');
      }
      
    } catch (error) {
      errors.push('Invalid URL format');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? url.trim() : null
    };
  }

  /**
   * Validate all inputs for site creation
   * @param {object} inputs - Object containing all inputs to validate
   * @returns {object} - Combined validation result
   */
  static validateSiteCreation(inputs) {
    const {
      token,
      repositoryName,
      markdownContent,
      description = '',
    } = inputs;

    const validations = {
      token: this.validateGitHubToken(token),
      repositoryName: this.validateRepositoryName(repositoryName),
      markdownContent: this.validateMarkdownContent(markdownContent),
      description: this.validateSiteDescription(description),
    };

    const allErrors = [];
    const allWarnings = [];
    const sanitizedInputs = {};

    for (const [field, validation] of Object.entries(validations)) {
      if (!validation.isValid) {
        allErrors.push(...validation.errors.map(error => `${field}: ${error}`));
      } else {
        sanitizedInputs[field] = validation.sanitizedValue;
      }
      
      if (validation.warnings) {
        allWarnings.push(...validation.warnings.map(warning => `${field}: ${warning}`));
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      sanitizedInputs,
      validations
    };
  }

  /**
   * Get validation summary for debugging
   * @param {object} validationResult - Result from validation function
   * @returns {string} - Human-readable summary
   */
  static getValidationSummary(validationResult) {
    const { isValid, errors, warnings } = validationResult;
    
    let summary = `Validation ${isValid ? 'PASSED' : 'FAILED'}\n`;
    
    if (errors && errors.length > 0) {
      summary += `Errors (${errors.length}):\n`;
      errors.forEach((error, index) => {
        summary += `  ${index + 1}. ${error}\n`;
      });
    }
    
    if (warnings && warnings.length > 0) {
      summary += `Warnings (${warnings.length}):\n`;
      warnings.forEach((warning, index) => {
        summary += `  ${index + 1}. ${warning}\n`;
      });
    }
    
    return summary;
  }
}

// Export individual validation functions for convenience
export const {
  validateGitHubToken,
  validateRepositoryName,
  validateMarkdownContent,
  validateSiteDescription,
  validateURL,
  validateSiteCreation,
  getValidationSummary
} = InputValidator;

// Default export
export default InputValidator;
