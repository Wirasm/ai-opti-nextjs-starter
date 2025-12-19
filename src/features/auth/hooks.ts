"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { createClient } from "@/core/supabase/client";

/**
 * Hook to get and subscribe to the current user in client components.
 * Returns null while loading, undefined if not authenticated, or the User object.
 */
export function useUser() {
  const [user, setUser] = useState<User | null | undefined>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser ?? undefined);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? undefined);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading: user === null,
    isAuthenticated: user !== null && user !== undefined,
  };
}
