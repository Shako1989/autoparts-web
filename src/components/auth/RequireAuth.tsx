import { type ReactElement, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';

export function RequireAuth({ children }: { children: ReactNode }): ReactElement {
  const token = useAuthStore((s) => s.accessToken);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  return <>{children}</>;
}
