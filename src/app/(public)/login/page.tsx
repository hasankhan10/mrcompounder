'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client'; // Import the new helper
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient(); // Use the new helper

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message || 'Could not sign in.');
      }

      if (!signInData.user) {
        throw new Error('Login failed, please try again.');
      }

      // After successful login, fetch the user's profile to determine their role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, clinic_id')
        .eq('id', signInData.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not retrieve user profile. Please contact support.');
      }

      // Redirect based on role
      if (profile.role === 'super_admin') {
        router.push('/admin');
      } else if (profile.role === 'compounder') {
        if (!profile.clinic_id) {
          await supabase.auth.signOut();
          throw new Error('No clinic associated with this account.');
        }

        // Check if clinic is active
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .select('is_active')
          .eq('id', profile.clinic_id)
          .single();

        if (clinicError || !clinicData) {
          await supabase.auth.signOut();
          throw new Error('Could not verify clinic status.');
        }

        if (!clinicData.is_active) {
          await supabase.auth.signOut();
          throw new Error('Your clinic account has been suspended. Please contact support.');
        }

        router.push('/dashboard');
      } else {
        // Default redirect if role is not recognized
        router.push('/');
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="text-3xl font-bold text-blue-700 drop-shadow-sm">
            Clinic Line
          </Link>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white pr-10" // Add padding to the right for the icon
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button
              type="submit"
              className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
