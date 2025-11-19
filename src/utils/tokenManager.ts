import { decodeJWT, isTokenExpired as jwtIsTokenExpired } from '@/utils/jwt';
import Cookies from 'js-cookie';

// Token management utilities
export class TokenManager {
    private static readonly TOKEN_KEY = 'eduprompt.access_token';

    // Get token from cookies
    static getToken(): string | null {
        try {
            return Cookies.get(this.TOKEN_KEY) || null;
        } catch (error) {
            console.warn('Failed to get token from cookies:', error);
            return null;
        }
    }

    // Set token in cookies
    static setToken(token: string): void {
        try {
            // Set cookie with 7 days expiry
            Cookies.set(this.TOKEN_KEY, token, { expires: 7, secure: window.location.protocol === 'https:', sameSite: 'Strict' });
        } catch (error) {
            console.warn('Failed to set token in cookies:', error);
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
            Cookies.remove(this.TOKEN_KEY);
        } catch (error) {
            console.warn('Failed to clear tokens from cookies:', error);
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
