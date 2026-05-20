"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useCallback } from "react";

interface RegisterData {
  email: string;
  name?: string;
  password: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    createdAt: string;
  };
}

interface AuthError {
  error: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(
    async (data: RegisterData): Promise<RegisterResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = (await res.json()) as RegisterResponse | AuthError;

        if (!res.ok) {
          const errResult = result as AuthError;
          setError(errResult.error);
          return null;
        }

        // Auto-sign in after successful registration
        const signInResult = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError("Registration succeeded but auto-login failed. Please sign in manually.");
        }

        return result as RegisterResponse;
      } catch {
        setError("Network error. Please try again.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password");
          return false;
        }

        return true;
      } catch {
        setError("Network error. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading,
    error,
    register,
    login,
    logout,
    clearError,
  };
}
