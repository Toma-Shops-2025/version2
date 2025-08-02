import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import BiometricAuth from './BiometricAuth';

const AuthPage: React.FC = () => {
  const { setUser, showToast } = useAppContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const navigate = useNavigate();

  // Scroll to top when AuthPage mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        // Scroll to top before navigating to home page
        window.scrollTo(0, 0);
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

  const handleBiometricSuccess = async (credentials: any) => {
    setBiometricLoading(true);
    setError(null);
    try {
      // For demo purposes, we'll simulate a successful biometric login
      // In a real implementation, you would verify the biometric credentials with your backend
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set demo user data
      setUser({
        id: credentials.userId || 'demo-user-id',
        name: credentials.email?.split('@')[0] || 'Demo User',
        email: credentials.email || 'demo@tomashops.com',
      });
      
      showToast('Biometric authentication successful!');
      window.scrollTo(0, 0);
      navigate('/');
    } catch (err: any) {
      setError('Biometric authentication failed. Please try again.');
      showToast('Biometric authentication failed. Please try again.', 'error');
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleBiometricError = (error: string) => {
    setError(error);
    showToast(error, 'error');
    setBiometricLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
    }}>
      <div className="bg-gray-900 p-8 rounded shadow-md w-full max-w-sm space-y-6 flex flex-col items-center">
        <Link to="/" className="block w-full flex flex-col items-center mb-2">
          <h1 className="text-3xl font-bold text-white flex flex-col leading-tight text-center">
            <span>TomaShops™</span>
            <span className="text-cyan-400">Video 1st</span>
          </h1>
        </Link>
        <h2 className="text-2xl font-bold text-center mb-2">{isSignUp ? 'Sign Up' : 'Login'}</h2>
        
        {/* Biometric Authentication Section */}
        {!isSignUp && (
          <div className="w-full">
            <BiometricAuth
              onSuccess={handleBiometricSuccess}
              onError={handleBiometricError}
              loading={biometricLoading}
            />
          </div>
        )}

        {/* Traditional Email/Password Form */}
        <form onSubmit={handleAuth} className="w-full space-y-4">
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
        </form>

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
      </div>
    </div>
  );
};

export default AuthPage; 