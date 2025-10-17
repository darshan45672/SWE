import { Response } from 'express';
export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export declare function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;
export declare function verifyToken(token: string): JwtPayload;
export declare function extractTokenFromHeader(authHeader: string | undefined): string | null;
export declare function setTokenCookie(res: Response, token: string): void;
export declare function clearTokenCookie(res: Response): void;
//# sourceMappingURL=jwt.d.ts.map