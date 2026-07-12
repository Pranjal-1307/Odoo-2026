import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Lock, User, Phone, Box } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const { signup, isLoading } = useAuth();
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
      await signup(data);
      showToast('Registration successful! Welcome.', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      showToast(error.response?.data?.message || error.message || 'Signup failed', 'error');
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
            Create an Account
          </h2>
          <p className="mt-2 text-surface-400 text-sm">
            Join AssetFlow resource management ERP
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Sneha Reddy"
              icon={<User size={18} />}
              error={errors.name?.message}
              disabled={isLoading}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. sneha@assetflow.com"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              disabled={isLoading}
              {...register('email')}
            />

            <Input
              label="Phone Number (Optional)"
              type="text"
              placeholder="e.g. +91 98765 43210"
              icon={<Phone size={18} />}
              error={errors.phone?.message}
              disabled={isLoading}
              {...register('phone')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.password?.message}
              disabled={isLoading}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full py-3 mt-4 rounded-xl font-bold cursor-pointer"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-surface-100">
            <p className="text-sm text-surface-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-brand-600 hover:text-brand-700 transition"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
