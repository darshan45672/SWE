import { Request, Response } from 'express';
export declare const getIssueById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getIssuesByProjectId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createIssue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateIssue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteIssue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const assignIssue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const unassignIssue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=issue.d.ts.map