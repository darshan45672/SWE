import { Request, Response } from 'express';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<void>;
    static login(req: Request, res: Response): Promise<void>;
    static logout(req: Request, res: Response): Promise<void>;
    static getProfile(req: Request, res: Response): Promise<void>;
    static updateProfile(req: Request, res: Response): Promise<void>;
    static deleteAccount(req: Request, res: Response): Promise<void>;
    static verifyToken(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.d.ts.map