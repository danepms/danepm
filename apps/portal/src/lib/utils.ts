/**
 * Resolves a raw User-Agent string into a clean, human-readable device name.
 * Strips out the browser engine jargon (Mozilla, Gecko, AppleWebKit).
 */
export function resolveDeviceName(ua: string | null): string {
  if (!ua) return "Unknown Device";
  
  const lowerUA = ua.toLowerCase();
  
  // Mobile Devices
  if (lowerUA.includes('iphone')) return "iPhone";
  if (lowerUA.includes('ipad')) return "iPad";
  if (lowerUA.includes('android')) {
    if (lowerUA.includes('samsung')) return "Samsung Android";
    if (lowerUA.includes('pixel')) return "Google Pixel";
    return "Android Device";
  }
  
  // Desktop OS
  if (lowerUA.includes('macintosh') || lowerUA.includes('mac os x')) return "MacBook / iMac";
  if (lowerUA.includes('windows')) return "Windows PC";
  if (lowerUA.includes('linux')) return "Linux Workstation";
  
  // Browser fallback if OS not detected
  if (lowerUA.includes('chrome')) return "Chrome Browser";
  if (lowerUA.includes('firefox')) return "Firefox Browser";
  if (lowerUA.includes('safari')) return "Safari Browser";

  return "Web Terminal";
}
