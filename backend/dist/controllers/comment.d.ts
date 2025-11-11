import { Request, Response } from 'express';
export declare const createComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCommentsByIssueId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=comment.d.ts.map