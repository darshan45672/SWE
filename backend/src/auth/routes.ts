import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { requireAuth } from '../auth/middleware';
import { 
  registerValidation, 
  loginValidation
} from '../validators/auth';
import { 
  updateProfileValidation,
  deleteAccountValidation,
  updatePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} from '../validators/profile';
import { handleValidationErrors } from '../validators/middleware';

const router = Router();

// Public routes
router.post('/register', 
  registerValidation,
  handleValidationErrors,
  AuthController.register
);

router.post('/login',
  loginValidation,
  handleValidationErrors,
  AuthController.login
);

router.post('/logout', AuthController.logout);

// Protected routes
router.get('/profile', requireAuth, AuthController.getProfile);

router.put('/profile',
  requireAuth,
  updateProfileValidation,
  handleValidationErrors,
  AuthController.updateProfile
);

router.delete('/account', 
  requireAuth, 
  deleteAccountValidation,
  handleValidationErrors,
  AuthController.deleteAccount
);

router.put('/password',
  requireAuth,
  updatePasswordValidation,
  handleValidationErrors,
  AuthController.updatePassword
);

router.post('/forgot-password',
  forgotPasswordValidation,
  handleValidationErrors,
  AuthController.forgotPassword
);

router.post('/reset-password',
  resetPasswordValidation,
  handleValidationErrors,
  AuthController.resetPassword
);

router.get('/verify', requireAuth, AuthController.verifyToken);

export default router;