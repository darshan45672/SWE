/**
 * TwoFactorVerificationDialog Component
 * 
 * A dialog for verifying 2FA codes during login.
 * Supports both TOTP codes (6 digits) and backup codes.
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Loader2, ShieldCheck } from 'lucide-react';

interface TwoFactorVerificationDialogProps {
  open: boolean;
  onVerify: (code: string, isBackupCode: boolean) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function TwoFactorVerificationDialog({
  open,
  onVerify,
  loading = false,
  error,
}: TwoFactorVerificationDialogProps) {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validation
    if (!code.trim()) {
      setLocalError('Please enter a verification code');
      return;
    }

    if (!useBackupCode && code.length !== 6) {
      setLocalError('TOTP code must be 6 digits');
      return;
    }

    if (!useBackupCode && !/^\d{6}$/.test(code)) {
      setLocalError('TOTP code must contain only digits');
      return;
    }

    try {
      await onVerify(code.trim(), useBackupCode);
      // Reset form on success
      setCode('');
      setLocalError('');
    } catch {
      setLocalError('Verification failed. Please try again.');
    }
  };

  const handleToggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    setCode('');
    setLocalError('');
  };

  const displayError = error || localError;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <DialogTitle>Two-Factor Authentication</DialogTitle>
          </div>
          <DialogDescription>
            {useBackupCode
              ? 'Enter one of your backup codes to verify your identity.'
              : 'Enter the 6-digit code from your authenticator app to verify your identity.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">
              {useBackupCode ? 'Backup Code' : 'Verification Code'}
            </Label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                // For TOTP: only allow digits, max 6 characters
                // For backup code: allow alphanumeric
                if (!useBackupCode) {
                  if (/^\d{0,6}$/.test(value)) {
                    setCode(value);
                  }
                } else {
                  setCode(value);
                }
              }}
              placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
              maxLength={useBackupCode ? 16 : 6}
              autoComplete="off"
              autoFocus
              disabled={loading}
              className="text-center text-lg tracking-widest font-mono"
            />
          </div>

          {displayError && (
            <Alert variant="destructive">
              <p className="text-sm">{displayError}</p>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleToggleBackupCode}
              disabled={loading}
              className="w-full"
            >
              {useBackupCode
                ? 'Use authenticator app instead'
                : 'Use backup code instead'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            {useBackupCode ? (
              <p>
                Backup codes are one-time use only. After using a code, it will be
                invalidated.
              </p>
            ) : (
              <p>
                Open your authenticator app (Google Authenticator, Authy, etc.) to
                get your verification code.
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
