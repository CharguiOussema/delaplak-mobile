import React from 'react';
import { RequireAuth } from '../components/RequireAuth';

// Wraps a screen component with the sign-in gate at registration time (in the
// navigator), so the screen itself stays oblivious to auth — same intent as the web
// app's <ProtectedRoute> wrapping a <Route element>.
export function withAuthGuard<P extends object>(Component: React.ComponentType<P>) {
  function Guarded(props: P) {
    return (
      <RequireAuth>
        <Component {...props} />
      </RequireAuth>
    );
  }
  Guarded.displayName = `withAuthGuard(${Component.displayName || Component.name || 'Component'})`;
  return Guarded;
}
