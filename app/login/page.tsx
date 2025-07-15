'use client';

import { FormEvent, useState, useContext } from 'react';
import { SupabaseContext } from '@/components/SupabaseProvider'; // must expose `supabase`

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Mode = 'signIn' | 'signUp';

export default function AuthPage() {
  const { supabase } = useContext(SupabaseContext); // supabase-js client
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const toggleMode = () => setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (mode === 'signUp' && password !== confirm) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } =
      mode === 'signUp'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        mode === 'signUp'
          ? 'Check your inbox to confirm your email ✉️'
          : 'Successfully signed in! 🎉'
      );
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">
            {mode === 'signIn' ? 'Sign in' : 'Create account'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {message ? (
            <p className="py-12 text-center text-sm">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Confirm password (sign‑up only) */}
              {mode === 'signUp' && (
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    required
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? 'Please wait…'
                  : mode === 'signIn'
                  ? 'Sign in'
                  : 'Sign up'}
              </Button>
            </form>
          )}

          {/* Switch link */}
          {!message && (
            <p className="mt-4 text-center text-sm">
              {mode === 'signIn' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                className="underline font-medium"
                onClick={toggleMode}
              >
                {mode === 'signIn' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
