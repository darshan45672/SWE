interface CreateCommentData {
    content: string;
    issueId: string;
}
interface UpdateCommentData {
    content: string;
}
export declare const createComment: (commentData: CreateCommentData, userId: string) => Promise<{
    author: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    authorId: string;
    issueId: string;
}>;
export declare const getCommentsByIssueId: (issueId: string, userId: string) => Promise<({
    author: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    authorId: string;
    issueId: string;
})[]>;
export declare const updateComment: (commentId: string, commentData: UpdateCommentData, userId: string) => Promise<{
    author: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    authorId: string;
    issueId: string;
}>;
export declare const deleteComment: (commentId: string, userId: string) => Promise<{
    success: boolean;
    message: string;
}>;
export {};
//# sourceMappingURL=comment.d.ts.map