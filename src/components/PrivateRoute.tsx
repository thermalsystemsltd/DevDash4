import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      if ((!isAuthenticated || !user) && location.pathname !== '/login') {
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
              return; // Keep user on current page
            }
          }
          // Session invalid, redirect to login
          localStorage.clear();
          sessionStorage.clear();
          navigate('/login', { replace: true });
        } catch (error) {
          console.error('Error checking session:', error);
          navigate('/login', { replace: true });
        }
      }
    };

    checkSession();
  }, [isAuthenticated, user, location.pathname, navigate, setUser]);

  if ((!isAuthenticated || !user) && location.pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}