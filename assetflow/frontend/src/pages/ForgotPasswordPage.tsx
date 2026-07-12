import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';
import { useToast } from '../contexts/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Box, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
      showToast('If the account exists, a reset link has been logged/sent.', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || error.message || 'Something went wrong', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-surface-950 via-surface-900 to-brand-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.1),transparent_40%)] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/25 mb-3">
            <Box size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-surface-400 text-sm">
            Recover access to your AssetFlow account
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
          {!submitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <p className="text-sm text-surface-600">
                Enter your email address and we'll log a recovery link to the dev server console.
              </p>

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. employee@assetflow.com"
                icon={<Mail size={18} />}
                error={errors.email?.message}
                disabled={isLoading}
                {...register('email')}
              />

              <Button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl font-bold cursor-pointer"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-surface-900">Email Sent!</h3>
              <p className="mt-2 text-sm text-surface-500">
                If the email is registered in the system, a recovery link has been logged to the dev server console terminal.
              </p>
            </div>
          )}

          <div className="text-center mt-6 pt-6 border-t border-surface-100">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition"
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
