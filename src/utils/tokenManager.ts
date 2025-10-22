import { decodeJWT, isTokenExpired } from './jwt';

// Token management utilities
export class TokenManager {
  private static readonly TOKEN_KEY = 'token';

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
  static isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    return isTokenExpired(token);
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
    return token !== null && !this.isTokenExpired();
  }

  // Get user info from token
  static getUserFromToken(): { email: string; role: string } | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = decodeJWT(token);
    if (!payload) return null;

    return {
      email: payload.sub,
      role: payload.role,
    };
  }
}
