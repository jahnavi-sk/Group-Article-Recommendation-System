
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
  onSuccess: () => void;
}

export function AuthDialog({ open, onOpenChange, mode, onModeChange, onSuccess }: AuthDialogProps) {
  const isLogin = mode === 'login';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? 'Log In' : 'Sign Up'}</DialogTitle>
          <DialogDescription>
            {isLogin ? "Enter your credentials to access your account." : "Create an account to get started."}
          </DialogDescription>
        </DialogHeader>
        {isLogin ? (
          <LoginForm onSuccess={onSuccess} />
        ) : (
          <SignUpForm onSuccess={onSuccess} />
        )}
        <div className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => onModeChange(isLogin ? 'signup' : 'login')}
            className="ml-1 underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
