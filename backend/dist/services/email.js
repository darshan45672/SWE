"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmailConfiguration = exports.sendWorkspaceInvitationEmail = exports.sendPasswordResetEmail = exports.sendVerificationSuccessEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Create email transporter
const createTransporter = () => {
    // For development, use ethereal.email or configured SMTP
    const config = {
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    };
    return nodemailer_1.default.createTransport(config);
};
// Email templates
const emailTemplates = {
    verification: (name, verificationUrl) => ({
        subject: 'Verify Your Email Address',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ProjectManager!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for registering with ProjectManager! We're excited to have you on board.</p>
              <p>To complete your registration and start using all features, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with ProjectManager, you can safely ignore this email.</p>
              <p>Best regards,<br>The ProjectManager Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ProjectManager. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
        text: `
Hi ${name},

Thank you for registering with ProjectManager!

To complete your registration, please verify your email address by visiting:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
The ProjectManager Team
    `.trim(),
    }),
    verificationSuccess: (name) => ({
        subject: 'Email Verified Successfully',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verified!</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <p>Hi ${name},</p>
              <p>Your email address has been successfully verified!</p>
              <p>You now have full access to all ProjectManager features:</p>
              <ul>
                <li>Create and manage workspaces</li>
                <li>Collaborate on projects</li>
                <li>Track issues and tasks</li>
                <li>Engage with team chat</li>
              </ul>
              <p>Ready to get started?</p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/signin" class="button">Sign In Now</a>
              </div>
              <p>Best regards,<br>The ProjectManager Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ProjectManager. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
        text: `
Hi ${name},

Your email address has been successfully verified!

You now have full access to all ProjectManager features.

Sign in at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/signin

Best regards,
The ProjectManager Team
    `.trim(),
    }),
    passwordReset: (name, resetUrl) => ({
        subject: 'Reset Your Password',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>We received a request to reset your password for your ProjectManager account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.
              </div>
              <p>Best regards,<br>The ProjectManager Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ProjectManager. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
        text: `
Hi ${name},

We received a request to reset your password for your ProjectManager account.

Reset your password by visiting:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

Best regards,
The ProjectManager Team
    `.trim(),
    }),
    workspaceInvitation: (inviterName, workspaceName, invitationUrl, isNewUser) => ({
        subject: `${inviterName} invited you to join ${workspaceName}`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .workspace-badge { background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; }
            .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Workspace Invitation</h1>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p><strong>${inviterName}</strong> has invited you to join:</p>
              <div style="text-align: center;">
                <span class="workspace-badge">📁 ${workspaceName}</span>
              </div>
              ${isNewUser ? `
              <div class="info-box">
                <strong>📝 New to ProjectManager?</strong>
                <p>You'll need to create an account and verify your email before you can accept this invitation. Don't worry, it only takes a minute!</p>
              </div>
              ` : `
              <p>Click the button below to accept this invitation and start collaborating!</p>
              `}
              <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">
                  ${isNewUser ? 'Create Account & Accept' : 'Accept Invitation'}
                </a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${invitationUrl}</p>
              <p style="color: #666; font-size: 14px;"><strong>Note:</strong> This invitation will expire in 7 days.</p>
              <p>Best regards,<br>The ProjectManager Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ProjectManager. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
        text: `
Hi there!

${inviterName} has invited you to join ${workspaceName} on ProjectManager.

${isNewUser ?
            'You\'ll need to create an account and verify your email before you can accept this invitation.' :
            'Click the link below to accept this invitation and start collaborating!'}

Accept invitation:
${invitationUrl}

This invitation will expire in 7 days.

Best regards,
The ProjectManager Team
    `.trim(),
    }),
};
// Send verification email
const sendVerificationEmail = async (email, name, token) => {
    console.log('📧 Attempting to send verification email to:', email);
    console.log('📧 SMTP Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    });
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
    const template = emailTemplates.verification(name, verificationUrl);
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'ProjectManager'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
            to: email,
            subject: template.subject,
            text: template.text,
            html: template.html,
        });
        console.log('✅ Verification email sent successfully:', info.messageId);
        console.log('📧 Preview URL:', nodemailer_1.default.getTestMessageUrl(info));
    }
    catch (error) {
        console.error('❌ Error sending verification email:', error);
        throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
// Send verification success email
const sendVerificationSuccessEmail = async (email, name) => {
    const transporter = createTransporter();
    const template = emailTemplates.verificationSuccess(name);
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'ProjectManager'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
            to: email,
            subject: template.subject,
            text: template.text,
            html: template.html,
        });
        console.log('Success email sent:', info.messageId);
    }
    catch (error) {
        console.error('Error sending success email:', error);
        // Don't throw here as verification is already complete
    }
};
exports.sendVerificationSuccessEmail = sendVerificationSuccessEmail;
// Send password reset email
const sendPasswordResetEmail = async (email, name, token) => {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    const template = emailTemplates.passwordReset(name, resetUrl);
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'ProjectManager'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
            to: email,
            subject: template.subject,
            text: template.text,
            html: template.html,
        });
        console.log('Password reset email sent:', info.messageId);
        if (process.env.SMTP_HOST?.includes('ethereal')) {
            console.log('Preview URL:', nodemailer_1.default.getTestMessageUrl(info));
        }
    }
    catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
// Send workspace invitation email
const sendWorkspaceInvitationEmail = async (email, inviterName, workspaceName, token, isNewUser) => {
    const transporter = createTransporter();
    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`;
    const template = emailTemplates.workspaceInvitation(inviterName, workspaceName, invitationUrl, isNewUser);
    try {
        console.log('📧 Sending workspace invitation email to:', email);
        console.log('📧 SMTP Config:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER
        });
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'ProjectManager'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
            to: email,
            subject: template.subject,
            text: template.text,
            html: template.html,
        });
        console.log('✅ Workspace invitation email sent:', info.messageId);
        if (process.env.SMTP_HOST?.includes('mailtrap') || process.env.SMTP_HOST?.includes('ethereal')) {
            console.log('📬 Preview URL:', nodemailer_1.default.getTestMessageUrl(info));
        }
    }
    catch (error) {
        console.error('❌ Error sending workspace invitation email:', error);
        throw new Error('Failed to send workspace invitation email');
    }
};
exports.sendWorkspaceInvitationEmail = sendWorkspaceInvitationEmail;
// Test email configuration
const testEmailConfiguration = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email configuration is valid');
        return true;
    }
    catch (error) {
        console.error('❌ Email configuration error:', error);
        return false;
    }
};
exports.testEmailConfiguration = testEmailConfiguration;
//# sourceMappingURL=email.js.map