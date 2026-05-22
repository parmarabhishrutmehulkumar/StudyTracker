'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus, Loader2, ArrowRight } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  school: z.string().min(2, 'School name is required'),
  parentContact: z.string().min(10, 'Parent contact must be at least 10 digits'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          class: 'Class 10',
          board: 'ICSE',
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Registration failed');
        setIsLoading(false);
      } else {
        toast.success('Registration successful! Please log in.');
        router.push('/login');
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-8 shadow-sm">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-md mb-3">
            <span className="font-hanken font-bold text-2xl">S</span>
          </div>
          <h2 className="font-hanken font-bold text-2xl text-primary tracking-tight">Create Student Account</h2>
          <p className="text-slate-500 text-sm mt-1">Sign up for StudyPulse to track your academic progress</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Abhishrut Parmar"
                {...register('name')}
                className={`w-full px-4 py-2 bg-background border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.name ? 'border-critical' : 'border-border'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-critical mt-1.5 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                placeholder="student@school.com"
                {...register('email')}
                className={`w-full px-4 py-2 bg-background border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.email ? 'border-critical' : 'border-border'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-critical mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                {...register('password')}
                className={`w-full px-4 py-2 bg-background border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.password ? 'border-critical' : 'border-border'
                }`}
              />
              {errors.password && (
                <p className="text-xs text-critical mt-1.5 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                {...register('confirmPassword')}
                className={`w-full px-4 py-2 bg-background border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.confirmPassword ? 'border-critical' : 'border-border'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-critical mt-1.5 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Your Mobile Number</label>
              <input
                type="tel"
                placeholder="10 digit number"
                {...register('mobile')}
                className={`w-full px-4 py-2 bg-background border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.mobile ? 'border-critical' : 'border-border'
                }`}
              />
              {errors.mobile && (
                <p className="text-xs text-critical mt-1.5 font-medium">{errors.mobile.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Parent Contact Number</label>
              <input
                type="tel"
                placeholder="10 digit number"
                {...register('parentContact')}
                className={`w-full px-4 py-2 bg-background border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.parentContact ? 'border-critical' : 'border-border'
                }`}
              />
              {errors.parentContact && (
                <p className="text-xs text-critical mt-1.5 font-medium">{errors.parentContact.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">School Name</label>
            <input
              type="text"
              placeholder="e.g., St. Xavier's High School"
              {...register('school')}
              className={`w-full px-4 py-2 bg-background border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                errors.school ? 'border-critical' : 'border-border'
              }`}
            />
            {errors.school && (
              <p className="text-xs text-critical mt-1.5 font-medium">{errors.school.message}</p>
            )}
          </div>

          {/* Locked fields */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-medium text-slate-600">
            <div>
              <span className="block text-slate-400 font-semibold mb-0.5">STANDARD</span>
              <span className="text-primary font-bold">Class 10 (Locked)</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="block text-slate-400 font-semibold mb-0.5">SYLLABUS BOARD</span>
              <span className="text-primary font-bold">ICSE (Locked)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Student Profile</span>
              </>
            )}
          </button>
        </form>

        {/* Redirect */}
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-slate-500 font-medium">
          Already registered?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold inline-flex items-center space-x-0.5">
            <span>Log in here</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
