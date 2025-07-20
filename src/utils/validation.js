export const FILE_SIZE_LIMITS = {
  MARKDOWN: 1024 * 1024,
  REPOSITORY_NAME: 100,
  TOKEN: 255,
  DESCRIPTION: 500,
};
const SUSPICIOUS_PATTERNS = [
  /<script[^>]*>/i,
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,

  /on\w+\s*=/i,

  /<iframe[^>]*>/i,
  /<object[^>]*>/i,
  /<embed[^>]*>/i,
  /<form[^>]*>/i,
  /<input[^>]*>/i,

  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /\.send\s*\(/i,

  /data:.*base64.*script/i,

  /@import/i,
  /expression\s*\(/i,

  /<svg[^>]*onload/i,
];
export class InputValidator {
  static validateGitHubToken(token) {
    const errors = [];

    if (!token || typeof token !== 'string') {
      errors.push('Token is required and must be a string');
      return { isValid: false, errors };
    }

    if (token.length < 20) {
      errors.push('Token is too short (minimum 20 characters)');
    }

    if (token.length > FILE_SIZE_LIMITS.TOKEN) {
      errors.push(
        `Token is too long (maximum ${FILE_SIZE_LIMITS.TOKEN} characters)`,
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(token)) {
      errors.push(
        'Token contains invalid characters (only alphanumeric and underscore allowed)',
      );
    }

    if (/[<>'"&]/.test(token)) {
      errors.push('Token contains potentially dangerous characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? token.trim() : null,
    };
  }
  static validateRepositoryName(repoName) {
    const errors = [];

    if (!repoName || typeof repoName !== 'string') {
      errors.push('Repository name is required and must be a string');
      return { isValid: false, errors };
    }

    const trimmed = repoName.trim();

    if (trimmed.length === 0) {
      errors.push('Repository name cannot be empty');
    }

    if (trimmed.length > FILE_SIZE_LIMITS.REPOSITORY_NAME) {
      errors.push(
        `Repository name is too long (maximum ${FILE_SIZE_LIMITS.REPOSITORY_NAME} characters)`,
      );
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
      errors.push(
        'Repository name can only contain letters, numbers, dots, hyphens, and underscores',
      );
    }

    if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
      errors.push('Repository name cannot start or end with a dot');
    }

    if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
      errors.push('Repository name cannot start or end with a hyphen');
    }

    const reservedNames = [
      'CON',
      'PRN',
      'AUX',
      'NUL',
      'COM1',
      'COM2',
      'COM3',
      'COM4',
      'COM5',
      'COM6',
      'COM7',
      'COM8',
      'COM9',
      'LPT1',
      'LPT2',
      'LPT3',
      'LPT4',
      'LPT5',
      'LPT6',
      'LPT7',
      'LPT8',
      'LPT9',
    ];
    if (reservedNames.includes(trimmed.toUpperCase())) {
      errors.push('Repository name cannot be a reserved system name');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? trimmed : null,
    };
  }
  static validateMarkdownContent(markdown) {
    const errors = [];
    const warnings = [];

    if (typeof markdown !== 'string') {
      errors.push('Markdown content must be a string');
      return { isValid: false, errors, warnings };
    }

    const contentSize = new Blob([markdown]).size;
    if (contentSize > FILE_SIZE_LIMITS.MARKDOWN) {
      errors.push(
        `Markdown content is too large (${(contentSize / 1024).toFixed(1)}KB, maximum ${FILE_SIZE_LIMITS.MARKDOWN / 1024}KB)`,
      );
    }

    const suspiciousFindings = [];
    SUSPICIOUS_PATTERNS.forEach(pattern => {
      if (pattern.test(markdown)) {
        suspiciousFindings.push(
          `Suspicious pattern detected: ${pattern.source}`,
        );
      }
    });

    if (suspiciousFindings.length > 0) {
      warnings.push(...suspiciousFindings);
    }

    const lines = markdown.split('\n');
    if (lines.length > 10000) {
      warnings.push(
        'Markdown content has a very large number of lines, which may affect performance',
      );
    }

    const longLines = lines.filter(line => line.length > 10000);
    if (longLines.length > 0) {
      warnings.push(
        `${longLines.length} lines exceed 10,000 characters, which may affect performance`,
      );
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
        bytes: contentSize,
      },
    };
  }
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
      errors.push(
        `Description is too long (maximum ${FILE_SIZE_LIMITS.DESCRIPTION} characters)`,
      );
    }

    if (/<[^>]*>/.test(trimmed)) {
      errors.push('Description cannot contain HTML tags');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? trimmed : null,
    };
  }
  static validateURL(url) {
    const errors = [];

    if (!url || typeof url !== 'string') {
      errors.push('URL is required and must be a string');
      return { isValid: false, errors };
    }

    try {
      const parsedURL = new URL(url);

      if (!['http:', 'https:'].includes(parsedURL.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol');
      }

      if (!parsedURL.hostname || parsedURL.hostname.length === 0) {
        errors.push('URL must have a valid hostname');
      }
    } catch (error) {
      errors.push('Invalid URL format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? url.trim() : null,
    };
  }
  static validateSiteCreation(inputs) {
    const { token, repositoryName, markdownContent, description = '' } = inputs;

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
        allWarnings.push(
          ...validation.warnings.map(warning => `${field}: ${warning}`),
        );
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      sanitizedInputs,
      validations,
    };
  }
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

export const {
  validateGitHubToken,
  validateRepositoryName,
  validateMarkdownContent,
  validateSiteDescription,
  validateURL,
  validateSiteCreation,
  getValidationSummary,
} = InputValidator;

export default InputValidator;
