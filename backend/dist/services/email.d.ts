export declare const sendVerificationEmail: (email: string, name: string, token: string) => Promise<void>;
export declare const sendVerificationSuccessEmail: (email: string, name: string) => Promise<void>;
export declare const sendPasswordResetEmail: (email: string, name: string, token: string) => Promise<void>;
export declare const sendWorkspaceInvitationEmail: (email: string, inviterName: string, workspaceName: string, token: string, isNewUser: boolean) => Promise<void>;
export declare const testEmailConfiguration: () => Promise<boolean>;
//# sourceMappingURL=email.d.ts.map