"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../auth/middleware");
const twoFactorController = __importStar(require("../controllers/twoFactor"));
const router = (0, express_1.Router)();
/**
 * 2FA Routes
 * All routes require authentication except verify (used during login)
 */
// Get 2FA status
router.get('/status', middleware_1.requireAuth, twoFactorController.get2FAStatus);
// Setup 2FA - Generate QR code
router.post('/setup', middleware_1.requireAuth, twoFactorController.setup2FA);
// Enable 2FA - Verify and activate
router.post('/enable', middleware_1.requireAuth, twoFactorController.enable2FA);
// Disable 2FA - Requires password
router.post('/disable', middleware_1.requireAuth, twoFactorController.disable2FA);
// Verify 2FA code (public - used during login)
router.post('/verify', twoFactorController.verify2FA);
// Regenerate backup codes
router.post('/regenerate-backup-codes', middleware_1.requireAuth, twoFactorController.regenerateBackupCodes);
exports.default = router;
//# sourceMappingURL=twoFactor.js.map