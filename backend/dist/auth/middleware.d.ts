import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from './jwt';
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export interface AuthenticatedRequest extends Request {
    user: JwtPayload;
}
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
export declare function optionalAuth(req: Request, res: Response, next: NextFunction): void;
export declare function isAuthenticated(req: Request): req is AuthenticatedRequest;
//# sourceMappingURL=middleware.d.ts.map