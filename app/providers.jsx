// frontend/app/providers.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { UserCtx } from "../lib/user.js";

export default function Providers({ children }) {
  // Start as FREE so server HTML and first client render match
  const [user, setUser] = useState({ isPro: false });

  // After mount, read localStorage and URL params (?pro=1 or ?tier=pro)
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const saved = localStorage.getItem("dev_isPro");
      let next = { isPro: saved === "true" };

      if (q.get("pro") === "1" || q.get("tier") === "pro") {
        next = { isPro: true };
        localStorage.setItem("dev_isPro", "true");
      }

      setUser(next);
    } catch {
      /* ignore */
    }
  }, []);

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem("dev_isPro", String(!!user?.isPro));
    } catch {
      /* ignore */
    }
  }, [user?.isPro]);

  // Hotkey: Alt+P toggles PRO/FREE (dev only)
  useEffect(() => {
    function onKey(e) {
      if (e.altKey && e.key.toLowerCase() === "p") {
        setUser((u) => ({ ...u, isPro: !u?.isPro }));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
}
