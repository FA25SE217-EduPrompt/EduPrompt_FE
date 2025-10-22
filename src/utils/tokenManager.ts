import { decodeJWT, isTokenExpired as jwtIsTokenExpired } from '@/utils/jwt';

// Token management utilities
export class TokenManager {
  private static readonly TOKEN_KEY = 'eduprompt.access_token';

  //Laterwe will use httpOnly, Secure, SameSite cookies (access short‑lived; refresh rotating) and read them in middleware/server.

  // Get token from localStorage
  static getToken(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(this.TOKEN_KEY);
      }
      return null;
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
      return null;
    }
  }

  // Set token in localStorage
  static setToken(token: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.TOKEN_KEY, token);
      }
    } catch (error) {
      console.warn('Failed to set token in localStorage:', error);
    }
  }

  // Check if token is expired using JWT payload
  static hasExpired(token?: string): boolean {
        const t = token ?? this.getToken();
        if (!t) return true;
        return jwtIsTokenExpired(t);
    }

  // Clear all tokens
  static clearTokens(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.TOKEN_KEY);
      }
    } catch (error) {
      console.warn('Failed to clear tokens from localStorage:', error);
    }
  }

  // Get authorization header
  static getAuthHeader(): string | null {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.hasExpired(token ?? undefined);
  }

  // Get user info from token
  static getUserFromToken(): { email: string; role: string } | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = decodeJWT(token);
    if (!payload) return null;

    return {
      email: String(payload.sub ?? ''),
      role: String(payload.role ?? ''),
    };
  }
}
