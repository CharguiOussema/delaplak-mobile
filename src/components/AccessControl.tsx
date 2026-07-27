import React from 'react';
import { NoAccess } from './NoAccess';

interface AccessControlProps {
  allowed: boolean;
  children: React.ReactNode;
}

/**
 * Mobile equivalent of the web app's `ProtectedModuleRoute` / `AccessControl`: a per-screen
 * guard that renders NoAccess instead of the screen when the current role can't use it.
 * The real enforcement always happens server-side; this is UX only.
 */
export const AccessControl: React.FC<AccessControlProps> = ({ allowed, children }) => {
  if (!allowed) return <NoAccess />;
  return <>{children}</>;
};
