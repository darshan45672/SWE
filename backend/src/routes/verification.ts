import express from 'express';
import {
  sendVerification,
  verifyEmail,
  resendVerification,
  checkVerificationStatus,
} from '../controllers/verification';

const router = express.Router();

// Send verification email
router.post('/send', sendVerification);

// Verify email with token
router.post('/verify', verifyEmail);

// Resend verification email
router.post('/resend', resendVerification);

// Check verification status
router.get('/status/:email', checkVerificationStatus);

export default router;
