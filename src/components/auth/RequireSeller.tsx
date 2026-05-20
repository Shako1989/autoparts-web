import { type ReactElement, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';

export function RequireSeller({ children }: { children: ReactNode }): ReactElement {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  if (user?.role !== 'SELLER' && user?.role !== 'STAFF' && user?.role !== 'ADMIN') {
    return <Navigate to="/sell/onboarding" replace />;
  }
  return <>{children}</>;
}
