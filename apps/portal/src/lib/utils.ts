
/**
 * Safely parses a configuration field (JSONB) which may arrive as a string or an object.
 */
export function parseConfig(config: any): any {
  if (!config) return {};
  if (typeof config === 'object') return config;
  try {
    return JSON.parse(config);
  } catch (e) {
    console.error("Forensic: Configuration parse failed", e);
    return {};
  }
}

/**
 * Resolves a human-readable device name from a User Agent string.
 */
export function resolveDeviceName(userAgent?: string): string {
  if (!userAgent) return 'Unknown Device';
  
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) {
    if (userAgent.includes('Mobile')) return 'Android Phone';
    return 'Android Tablet';
  }
  if (userAgent.includes('Macintosh')) return 'Mac';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Linux')) return 'Linux PC';
  
  return 'Unknown Device';
}
