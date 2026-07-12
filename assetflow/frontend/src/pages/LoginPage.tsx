import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Lock, Box } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      showToast('Login successful! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      showToast(error.response?.data?.message || error.message || 'Invalid credentials', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-surface-950 via-surface-900 to-brand-950 p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.1),transparent_40%)] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/25 mb-3">
            <Box size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome to AssetFlow
          </h2>
          <p className="mt-2 text-surface-400 text-sm">
            Sign in to manage enterprise assets & resources
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. admin@assetflow.com"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              disabled={isLoading}
              {...register('email')}
            />

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-surface-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 transition"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full rounded-xl border border-surface-300 py-2.5 pl-10 pr-3 bg-white text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition duration-200 ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  disabled={isLoading}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-red-500 font-medium mt-1.5 block">
                  {errors.password.message}
                </span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl font-bold cursor-pointer"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center mt-6 pt-6 border-t border-surface-100">
            <p className="text-sm text-surface-500">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-brand-600 hover:text-brand-700 transition"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
