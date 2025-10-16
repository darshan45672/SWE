import { Request, Response } from "express";
import { RequestUser } from "@projectmanager/types";
import { UserService } from "../services/user.service";
import { BadRequestError, NotFoundError } from "@projectmanager/common";

const userService = new UserService();

declare module "express-serve-static-core" {
  interface Request {
    user?: RequestUser;
  }
}

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const user = await userService.getUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json(user);
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const updateData = req.body;

  // Validate that email changes go through verification process
  if (updateData.email && updateData.email !== req.user!.email) {
    throw new BadRequestError(
      "Email changes require verification. Use the change email endpoint."
    );
  }

  const updatedUser = await userService.updateProfile(userId, updateData);

  res.json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new BadRequestError("Current password and new password are required");
  }

  await userService.changePassword(userId, currentPassword, newPassword);

  res.json({
    message: "Password changed successfully",
  });
};

/**
 * Request email change (sends verification email)
 */
export const requestEmailChange = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { newEmail, password } = req.body;

  if (!newEmail || !password) {
    throw new BadRequestError("New email and password are required");
  }

  await userService.requestEmailChange(userId, newEmail, password);

  res.json({
    message: "Verification email sent to new email address",
  });
};

/**
 * Enable 2FA
 */
export const enable2FA = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const { secret, qrCode } = await userService.setup2FA(userId);

  res.json({
    message: "2FA setup initiated. Scan the QR code with your authenticator app.",
    secret,
    qrCode,
  });
};

/**
 * Verify and activate 2FA
 */
export const verify2FA = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { token } = req.body;

  if (!token) {
    throw new BadRequestError("2FA token is required");
  }

  const backupCodes = await userService.enable2FA(userId, token);

  res.json({
    message: "2FA enabled successfully",
    backupCodes,
  });
};

/**
 * Disable 2FA
 */
export const disable2FA = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { password } = req.body;

  if (!password) {
    throw new BadRequestError("Password is required to disable 2FA");
  }

  await userService.disable2FA(userId, password);

  res.json({
    message: "2FA disabled successfully",
  });
};

/**
 * Upload avatar
 */
export const uploadAvatar = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { avatarUrl } = req.body;

  if (!avatarUrl) {
    throw new BadRequestError("Avatar URL is required");
  }

  const updatedUser = await userService.updateProfile(userId, {
    avatar: avatarUrl,
  });

  res.json({
    message: "Avatar updated successfully",
    user: updatedUser,
  });
};

/**
 * Delete account
 */
export const deleteAccount = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { password } = req.body;

  if (!password) {
    throw new BadRequestError("Password is required to delete account");
  }

  await userService.deleteAccount(userId, password);

  res.json({
    message: "Account deleted successfully",
  });
};
