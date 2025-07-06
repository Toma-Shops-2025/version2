import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const { setUser, showToast } = useAppContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }
      if (result.error) {
        setError(result.error.message);
        showToast(result.error.message, 'error');
      } else if (result.data.user) {
        setUser({
          id: result.data.user.id,
          name: result.data.user.email?.split('@')[0] || 'User',
          email: result.data.user.email || '',
        });
        showToast(isSignUp ? 'Sign up successful!' : 'Login successful!');
        navigate('/');
      } else {
        setError('Unknown error.');
      }
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleAuth} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center mb-2">{isSignUp ? 'Sign Up' : 'Login'}</h2>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete={isSignUp ? "new-password" : "current-password"}
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (isSignUp ? 'Signing up...' : 'Logging in...') : (isSignUp ? 'Sign Up' : 'Login')}
        </Button>
        <div className="text-center text-sm">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button type="button" className="text-blue-600 underline" onClick={() => setIsSignUp(false)}>
                Login
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" className="text-blue-600 underline" onClick={() => setIsSignUp(true)}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default AuthPage; 