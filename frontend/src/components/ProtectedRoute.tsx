import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/authStore";
import { api, getToken } from "@/lib/api";
import { Role } from "@/lib/types";
import { Spinner } from "@/components/ui";

export function ProtectedRoute({
  children,
  roles,
  redirect,
}: {
  children: ReactNode;
  roles: Role[];
  redirect: string;
}) {
  const { user, token, setUser, logout } = useAuth();
  const [checking, setChecking] = useState(!user && !!getToken());

  useEffect(() => {
    if (user || !getToken()) return;
    api("/api/auth/me", { auth: true })
      .then((u) => setUser({ id: u._id, name: u.name, email: u.email, role: u.role, slug: u.slug }))
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [user, setUser, logout]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!token || !user) return <Navigate to={redirect} replace />;
  if (!roles.includes(user.role)) return <Navigate to={redirect} replace />;
  return <>{children}</>;
}
