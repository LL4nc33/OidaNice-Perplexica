/**
 * Masks sensitive data like API keys and URLs
 * Shows first 2 and last 4 characters, masks middle with asterisks
 */
export const maskApiKey = (value: string): string => {
  if (!value || value.length <= 8) {
    // If too short, just mask everything except first and last char
    if (value.length <= 2) return '*'.repeat(value.length);
    return (
      value[0] +
      '*'.repeat(Math.max(0, value.length - 2)) +
      value[value.length - 1]
    );
  }

  const start = value.slice(0, 2);
  const end = value.slice(-4);
  const middle = '*'.repeat(Math.max(4, value.length - 6)); // At least 4 asterisks

  return `${start}${middle}${end}`;
};

/**
 * Masks URLs by keeping protocol and domain visible, masking path/query
 */
export const maskUrl = (value: string): string => {
  if (!value) return value;

  try {
    const url = new URL(value);
    const visiblePart = `${url.protocol}//${url.hostname}`;

    if (url.pathname === '/' && !url.search && !url.hash) {
      // Just domain, no masking needed
      return value;
    }

    const pathAndQuery = url.pathname + url.search + url.hash;
    if (pathAndQuery.length <= 4) {
      return value; // Too short to mask meaningfully
    }

    const maskedPath =
      pathAndQuery.length > 8
        ? pathAndQuery.slice(0, 2) +
          '*'.repeat(Math.max(4, pathAndQuery.length - 4)) +
          pathAndQuery.slice(-2)
        : '*'.repeat(pathAndQuery.length);

    return `${visiblePart}${maskedPath}`;
  } catch {
    // Not a valid URL, treat as generic sensitive data
    return maskApiKey(value);
  }
};

/**
 * Determines if input should be masked based on field type
 */
export const shouldMaskInput = (
  inputType: string,
  fieldName: string,
): boolean => {
  const sensitiveTypes = ['password'];
  const sensitiveFields = [
    'apikey',
    'key',
    'token',
    'secret',
    'password',
    'auth',
    'openai',
    'anthropic',
    'gemini',
    'groq',
    'deepseek',
    'aiml',
    'elevenlabs',
    'ollama',
  ];

  if (sensitiveTypes.includes(inputType.toLowerCase())) {
    return true;
  }

  return sensitiveFields.some((field) =>
    fieldName.toLowerCase().includes(field),
  );
};

/**
 * Masks input value appropriately based on field type
 */
export const maskInputValue = (value: string, fieldName: string): string => {
  if (!value) return value;

  const lowerFieldName = fieldName.toLowerCase();

  // URLs should be masked differently than API keys
  if (lowerFieldName.includes('url') || lowerFieldName.includes('endpoint')) {
    return maskUrl(value);
  }

  // Everything else gets API key masking
  return maskApiKey(value);
};
