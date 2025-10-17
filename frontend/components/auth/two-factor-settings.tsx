/**
 * TwoFactorSettings Component
 * 
 * Comprehensive 2FA settings management component with:
 * - Enable/Disable 2FA
 * - QR code display for setup
 * - Backup codes management
 * - Password verification for sensitive operations
 */

'use client';

import { useState, useEffect } from 'react';
import { Shield, Copy, Download, RefreshCw, Loader2, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function TwoFactorSettings() {
  const { get2FAStatus, setup2FA, enable2FA, disable2FA, regenerateBackupCodes } = useAuth();
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Setup flow state
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnabling, setIsEnabling] = useState(false);
  
  // Disable flow state
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  
  // Regenerate codes flow state
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [regeneratePassword, setRegeneratePassword] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load 2FA status on mount
  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Please log in to manage two-factor authentication');
        setIsLoading(false);
        return;
      }
      
      const response = await get2FAStatus();
      if (response.success && response.data) {
        setIs2FAEnabled(response.data.enabled);
      } else if (response.error?.includes('Authentication') || response.error?.includes('token')) {
        setError('Your session has expired. Please log in again.');
      }
    } catch {
      console.error('Failed to load 2FA status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSetup = async () => {
    try {
      setError('');
      setIsEnabling(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('You need to be logged in to enable 2FA. Please refresh the page or log in again.');
        setIsEnabling(false);
        return;
      }
      
      const response = await setup2FA();
      
      if (response.success && response.data) {
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
        setBackupCodes(response.data.backupCodes);
        setShowSetupDialog(true);
      } else {
        const errorMsg = response.error || response.message || 'Failed to setup 2FA';
        setError(errorMsg);
      }
    } catch {
      setError('An error occurred while setting up 2FA');
    } finally {
      setIsEnabling(false);
    }
  };

  const handleEnableComplete = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setError('');
      setIsEnabling(true);
      
      const response = await enable2FA(secret, verificationCode, backupCodes);
      
      if (response.success) {
        setSuccess('Two-Factor Authentication enabled successfully!');
        setIs2FAEnabled(true);
        setShowSetupDialog(false);
        
        // Reset state
        setVerificationCode('');
        setQrCode('');
        setSecret('');
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(response.message || 'Invalid verification code');
      }
    } catch {
      setError('Failed to enable 2FA');
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisable = async () => {
    if (!disablePassword) {
      setError('Password is required to disable 2FA');
      return;
    }

    try {
      setError('');
      setIsDisabling(true);
      
      const response = await disable2FA(disablePassword);
      
      if (response.success) {
        setSuccess('Two-Factor Authentication disabled successfully');
        setIs2FAEnabled(false);
        setShowDisableDialog(false);
        setDisablePassword('');
        
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(response.message || 'Failed to disable 2FA');
      }
    } catch {
      setError('Failed to disable 2FA');
    } finally {
      setIsDisabling(false);
    }
  };

  const handleRegenerateCodes = async () => {
    if (!regeneratePassword) {
      setError('Password is required to regenerate backup codes');
      return;
    }

    try {
      setError('');
      setIsRegenerating(true);
      
      const response = await regenerateBackupCodes(regeneratePassword);
      
      if (response.success && response.data) {
        setNewBackupCodes(response.data.backupCodes);
        setSuccess('Backup codes regenerated successfully');
        setRegeneratePassword('');
        
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(response.error || 'Failed to regenerate backup codes');
      }
    } catch {
      setError('Failed to regenerate backup codes');
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyToClipboard = (text: string, codeId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(codeId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadBackupCodes = (codes: string[]) => {
    const text = codes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="mt-2">
                Add an extra layer of security to your account
              </CardDescription>
            </div>
            <Badge variant={is2FAEnabled ? 'default' : 'secondary'}>
              {is2FAEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication (2FA) adds an additional layer of security to your account
              by requiring a verification code from your authenticator app in addition to your password.
            </p>

            {!is2FAEnabled ? (
              <div className="space-y-3">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="font-medium mb-2">How it works:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Scan a QR code with your authenticator app</li>
                    <li>Enter the 6-digit code to verify</li>
                    <li>Save your backup codes in a safe place</li>
                    <li>Use codes from your app to sign in</li>
                  </ol>
                </div>

                <Button 
                  onClick={handleStartSetup}
                  disabled={isEnabling}
                  className="w-full sm:w-auto"
                >
                  {isEnabling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Enable 2FA
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border bg-green-50 dark:bg-green-950 p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✓ Your account is protected with two-factor authentication
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRegenerateDialog(true)}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Backup Codes
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => setShowDisableDialog(true)}
                    className="w-full sm:w-auto"
                  >
                    Disable 2FA
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Follow these steps to enable 2FA on your account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Step 1: Scan QR Code */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  1
                </div>
                <h4 className="font-medium">Scan QR Code</h4>
              </div>
              
              <div className="pl-8 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                
                {qrCode && (
                  <div className="flex justify-center p-4 bg-white rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Can&apos;t scan? Enter this key manually: <code className="px-1 py-0.5 bg-muted rounded text-xs">{secret}</code>
                </p>
              </div>
            </div>

            {/* Step 2: Verify Code */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  2
                </div>
                <h4 className="font-medium">Verify Code</h4>
              </div>
              
              <div className="pl-8 space-y-2">
                <Label htmlFor="verification-code">Enter 6-digit code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setVerificationCode(value);
                    }
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest font-mono"
                />
              </div>
            </div>

            {/* Step 3: Save Backup Codes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  3
                </div>
                <h4 className="font-medium">Save Backup Codes</h4>
              </div>
              
              <div className="pl-8 space-y-2">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Save these backup codes in a secure place. Each code can only be used once.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 p-2 bg-background rounded">
                      <span>{code}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(code, code)}
                      >
                        {copiedCode === code ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadBackupCodes(backupCodes)}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Backup Codes
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSetupDialog(false);
                setVerificationCode('');
                setError('');
              }}
              disabled={isEnabling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnableComplete}
              disabled={isEnabling || verificationCode.length !== 6}
            >
              {isEnabling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enabling...
                </>
              ) : (
                'Enable 2FA'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This will make your account less secure. You&apos;ll only need your password to sign in.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="disable-password">Enter your password to confirm</Label>
                <Input
                  id="disable-password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Your password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDisablePassword('');
              setError('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable}
              disabled={isDisabling || !disablePassword}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDisabling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                'Disable 2FA'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate Backup Codes Dialog */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Backup Codes</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {!newBackupCodes.length ? (
                <>
                  <p>
                    This will invalidate your old backup codes and generate new ones.
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regenerate-password">Enter your password to confirm</Label>
                    <Input
                      id="regenerate-password"
                      type="password"
                      value={regeneratePassword}
                      onChange={(e) => setRegeneratePassword(e.target.value)}
                      placeholder="Your password"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <>
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      New backup codes generated successfully!
                    </AlertDescription>
                  </Alert>

                  <p className="font-medium">Your new backup codes:</p>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                    {newBackupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between gap-2 p-2 bg-background rounded">
                        <span>{code}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(code, `new-${code}`)}
                        >
                          {copiedCode === `new-${code}` ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadBackupCodes(newBackupCodes)}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Backup Codes
                  </Button>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Make sure to save these codes in a secure place. Your old backup codes will no longer work.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRegeneratePassword('');
              setNewBackupCodes([]);
              setError('');
            }}>
              {newBackupCodes.length ? 'Close' : 'Cancel'}
            </AlertDialogCancel>
            {!newBackupCodes.length && (
              <AlertDialogAction
                onClick={handleRegenerateCodes}
                disabled={isRegenerating || !regeneratePassword}
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  'Regenerate Codes'
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
