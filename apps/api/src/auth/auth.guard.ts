import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { eq } from 'drizzle-orm';
import { session, user } from '@dane/database';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check various possible cookie names from better-auth
    let token = request.cookies['better-auth.session_token'] || 
                request.cookies['__Secure-better-auth.session_token'] ||
                request.cookies['dane.session_token'];

    // Fallback to Authorization header
    if (!token && request.headers.authorization) {
      const parts = request.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      console.warn('[AuthGuard] Missing token. Cookies:', request.cookies, 'Headers:', request.headers.authorization);
      throw new UnauthorizedException('No session token found');
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/get-session`, {
        headers: {
          Cookie: Object.entries(request.cookies).map(([k, v]) => `${k}=${v}`).join('; '),
          ...(request.headers.authorization ? { Authorization: request.headers.authorization } : {})
        }
      });

      if (!response.ok) {
        throw new Error('Session invalid');
      }

      const dbSession = await response.json();
      
      if (!dbSession || !dbSession.session) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      request.user = dbSession.user;
      return true;
    } catch (e) {
      console.warn('[AuthGuard] Validation failed:', e.message);
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
