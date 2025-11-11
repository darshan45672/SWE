"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verification_1 = require("../controllers/verification");
const router = express_1.default.Router();
// Send verification email
router.post('/send', verification_1.sendVerification);
// Verify email with token
router.post('/verify', verification_1.verifyEmail);
// Resend verification email
router.post('/resend', verification_1.resendVerification);
// Check verification status
router.get('/status/:email', verification_1.checkVerificationStatus);
exports.default = router;
//# sourceMappingURL=verification.js.map