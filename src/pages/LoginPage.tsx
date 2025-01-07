import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import Logo from '../components/Logo';
import { webAuthnApi } from '../services/webauthn';
import useAuthStore from '../store/authStore';
import { Fingerprint } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [credentials, setCredentials] = useState(() => ({
    companyName: localStorage.getItem('lastCompanyName') || '',
    email: '',
    password: '',
  }));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('https://auth.icespyonline.com/auth/verifyAccess', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.message === 'Valid Session' && data.data) {
            setUser({
              companyID: data.data.companyID,
              companyName: data.data.companyName,
              roles: ['user']
            });
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate, setUser]);

  useEffect(() => {
    // Check if WebAuthn is supported
    const checkBiometricsSupport = async () => {
      try {
        if (window.PublicKeyCredential) {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricsSupported(available);
        }
      } catch (error) {
        console.error('Error checking biometrics support:', error);
      }
    };

    checkBiometricsSupport();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem('lastCompanyName', credentials.companyName);
      setUser(response.userData);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Get authentication options
      const options = await webAuthnApi.getAuthenticationOptions();
      
      // Create credentials
      const credential = await navigator.credentials.get({
        publicKey: options
      }) as PublicKeyCredential;
      
      // Prepare and verify credential
      const preparedCredential = webAuthnApi.prepareAuthenticationCredential(credential);
      const response = await webAuthnApi.verifyAuthentication(preparedCredential);
      
      if (response.verified) {
        // Handle successful authentication
        setUser({
          companyID: response.user.companyId,
          companyName: response.user.companyName,
          email: response.user.email,
          roles: response.user.roles
        });
        localStorage.setItem('lastCompanyName', response.user.companyName);
        navigate('/');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Biometric login failed:', error);
      setError('Biometric authentication failed. Please try again or use password login.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Checking session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          <div className="flex justify-center">
            <Logo className="h-12 w-auto mb-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            TS1 Monitoring System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        {biometricsSupported && !showPasswordForm && (
          <div className="mt-8">
            <button
              onClick={handleBiometricLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Fingerprint className="w-5 h-5 mr-2" />
              Sign in with Biometrics
            </button>
          </div>
        )}
        {(showPasswordForm || !biometricsSupported) && <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                name="organization"
                autoComplete="organization company"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Company Name"
                value={credentials.companyName}
                onChange={(e) =>
                  setCredentials({ ...credentials, companyName: e.target.value })
                }
              />
            </div>
            <div>
              <input
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
              />
            </div>
            <div>
              <input
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {showPasswordForm ? 'Use Biometric Login' : 'Use Password Login'}
          </button>
        </div>
        <footer className="mt-8 text-center text-sm text-gray-500">
          <div className="space-y-2">
            <div>
              <a href="https://thermal-systems.co.uk" target="_blank" rel="noopener noreferrer" 
                className="hover:text-indigo-600">Thermal Systems Ltd</a>
            </div>
            <div>Tel: <a href="tel:02034881030" className="hover:text-indigo-600">020 3488 1030</a></div>
            <div className="pt-2 space-x-4">
              <a href="/terms" className="hover:text-indigo-600">Terms of Service</a>
              <span>·</span>
              <a href="/privacy" className="hover:text-indigo-600">Privacy Policy</a>
              <span>·</span>
              <a href="/contact" className="hover:text-indigo-600">Contact</a>
            </div>
            <div className="text-xs">
              © {new Date().getFullYear()} Thermal Systems Ltd. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}