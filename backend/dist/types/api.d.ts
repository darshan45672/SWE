export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface CreateUserRequest {
    email: string;
    name: string;
    avatar?: string;
    bio?: string;
    phone?: string;
    location?: string;
    website?: string;
    timezone?: string;
    language?: string;
    company?: string;
    jobTitle?: string;
}
export interface UpdateUserRequest extends Partial<CreateUserRequest> {
}
export interface CreateWorkspaceRequest {
    name: string;
    icon?: string;
    color?: string;
}
export interface CreateProjectRequest {
    name: string;
    description?: string;
    workspaceId: string;
}
export interface CreateIssueRequest {
    title: string;
    description: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    type?: 'BUG' | 'FEATURE' | 'TASK' | 'IMPROVEMENT';
    assigneeId?: string;
    reporterId: string;
    projectId: string;
    dueDate?: string;
    tags?: string[];
}
export interface UpdateIssueRequest {
    title?: string;
    description?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    type?: 'BUG' | 'FEATURE' | 'TASK' | 'IMPROVEMENT';
    assigneeId?: string;
    dueDate?: string;
    tags?: string[];
}
export interface PaginationQuery {
    page?: string;
    limit?: string;
}
export interface IssueFilters extends PaginationQuery {
    status?: string;
    priority?: string;
    type?: string;
    assigneeId?: string;
    reporterId?: string;
    projectId?: string;
    workspaceId?: string;
}
export interface UserFilters extends PaginationQuery {
    workspaceId?: string;
    role?: string;
}
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    isOperational: boolean;
    constructor(statusCode: number, message: string, isOperational?: boolean);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
//# sourceMappingURL=api.d.ts.map