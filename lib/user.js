// frontend/lib/user.js
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * User = { isPro: boolean }
 * We default to { isPro:false } to match the server-rendered HTML (FREE).
 */
export const UserCtx = createContext({ user: { isPro: false }, setUser: () => {} });

export function UserProvider({ children }) {
  const [user, setUser] = useState({ isPro: false });

  // After mount, load any saved value (or you could fetch /api/user here).
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rr_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser({ isPro: !!parsed.isPro });
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist whenever user changes (dev-only behavior).
  useEffect(() => {
    try {
      localStorage.setItem("rr_user", JSON.stringify(user));
    } catch {
      /* ignore */
    }
  }, [user]);

  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
}

export function useUser() {
  return useContext(UserCtx);
}
