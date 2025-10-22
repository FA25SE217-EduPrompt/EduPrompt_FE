// JWT utility functions
export interface JWTPayload {
  sub: string; // email
  role: string; // USER_ROLE
  jti: string; // unique token ID
  iat: number; // issued at
  exp: number; // expiration
}

// Decode JWT token without verification (client-side only)
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.warn('Failed to decode JWT token:', error);
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

// Get time until token expires (in seconds)
export function getTokenTimeUntilExpiry(token: string): number {
  const payload = decodeJWT(token);
  if (!payload) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - currentTime);
}

// Check if token should be refreshed (5 minutes before expiry)
export function shouldRefreshToken(token: string): boolean {
  const timeUntilExpiry = getTokenTimeUntilExpiry(token);
  return timeUntilExpiry < 300; // 5 minutes
}
