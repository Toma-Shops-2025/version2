import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Eye, Smartphone, Shield } from 'lucide-react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

interface BiometricAuthProps {
  onSuccess: (credentials: any) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({ onSuccess, onError, loading = false }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'unknown'>('unknown');

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check if biometric authentication is available
      const result = await NativeBiometric.isAvailable();
      setIsSupported(result.isAvailable);

      if (result.isAvailable) {
        // Determine biometric type based on available biometry
        setBiometricType(result.biometryType === 'face' ? 'face' : 'fingerprint');

        // Check if user has biometric credentials stored
        const hasCredentials = await checkForStoredCredentials();
        setIsAvailable(hasCredentials);
      }
    } catch (error) {
      console.error('Biometric support check failed:', error);
      setIsSupported(false);
    }
  };

  const checkForStoredCredentials = async (): Promise<boolean> => {
    try {
      // Check if there are stored credentials for this domain
      const storedCredentials = localStorage.getItem('tomashops_biometric_credentials');
      return !!storedCredentials;
    } catch (error) {
      console.error('Error checking stored credentials:', error);
      return false;
    }
  };

  const handleBiometricAuth = async () => {
    try {
      // Verify biometric authentication
      await NativeBiometric.verifyIdentity({
        reason: 'Please authenticate to access your account',
        title: 'Biometric Authentication',
        subtitle: 'Use your biometric to sign in',
        description: 'Authenticate using your fingerprint or face ID'
      });

      // If we reach here, authentication was successful
      // Get stored credentials
      const storedCredentials = localStorage.getItem('tomashops_biometric_credentials');
      
      if (storedCredentials) {
        const credentials = JSON.parse(storedCredentials);
        onSuccess(credentials);
      } else {
        onError('No biometric credentials found. Please log in with email and password first.');
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      onError('Biometric authentication failed. Please try again or use email and password.');
    }
  };

  const setupBiometricAuth = async () => {
    try {
      // Verify biometric authentication first
      await NativeBiometric.verifyIdentity({
        reason: 'Please authenticate to set up biometric login',
        title: 'Setup Biometric Auth',
        subtitle: 'Verify your identity to enable biometric login',
        description: 'Use your fingerprint or face ID to complete setup'
      });

      // Store demo credentials (in a real app, you'd store actual user credentials)
      const demoCredentials = {
        email: 'demo@tomashops.com',
        userId: 'demo-user-id',
        setupDate: new Date().toISOString()
      };
      
      localStorage.setItem('tomashops_biometric_credentials', JSON.stringify(demoCredentials));
      setIsAvailable(true);
      
      onSuccess(demoCredentials);
    } catch (error) {
      console.error('Biometric setup failed:', error);
      onError('Failed to setup biometric authentication. Please try again.');
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4">
        <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-400">
          Biometric authentication is not supported on this device.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center mb-2">
          {biometricType === 'fingerprint' ? (
            <Fingerprint className="w-8 h-8 text-cyan-400" />
          ) : biometricType === 'face' ? (
            <Eye className="w-8 h-8 text-cyan-400" />
          ) : (
            <Smartphone className="w-8 h-8 text-cyan-400" />
          )}
        </div>
        <p className="text-sm text-gray-300 mb-4">
          {isAvailable 
            ? `Use ${biometricType === 'fingerprint' ? 'fingerprint' : biometricType === 'face' ? 'Face ID' : 'biometric'} to sign in`
            : `Set up ${biometricType === 'fingerprint' ? 'fingerprint' : biometricType === 'face' ? 'Face ID' : 'biometric'} authentication`
          }
        </p>
      </div>

      {isAvailable ? (
        <Button
          onClick={handleBiometricAuth}
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Authenticating...
            </div>
          ) : (
            <div className="flex items-center">
              {biometricType === 'fingerprint' ? (
                <Fingerprint className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {biometricType === 'fingerprint' ? 'Use Fingerprint' : biometricType === 'face' ? 'Use Face ID' : 'Use Biometric'}
            </div>
          )}
        </Button>
      ) : (
        <Button
          onClick={setupBiometricAuth}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Setting up...
            </div>
          ) : (
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Setup Biometric Auth
            </div>
          )}
        </Button>
      )}

      <div className="text-center">
        <div className="w-full border-t border-gray-700 my-4"></div>
        <p className="text-xs text-gray-400">
          or continue with email and password
        </p>
      </div>
    </div>
  );
};

export default BiometricAuth; 