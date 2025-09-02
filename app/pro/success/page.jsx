// frontend/app/pro/success/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet } from "../../../lib/api";

export default function ProSuccess() {
  const sp = useSearchParams();
  const [ok, setOk] = useState(false);
  const sessionId = sp.get("session_id");

  useEffect(() => {
    (async () => {
      if (!sessionId) return;
      try {
        const r = await fetch(`/api/billing/claim?session_id=${encodeURIComponent(sessionId)}`, {
          credentials: "include",
        });
        const j = await r.json();
        if (j?.ok) setOk(true);
      } catch {}
    })();
  }, [sessionId]);

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-3xl font-extrabold">Thanks for upgrading! 🎉</h1>
      <p className="mt-3 opacity-80">
        {ok ? "Your device is now PRO. You can close this tab." : "Finalizing your upgrade…"}
      </p>
      <a className="btn mt-6" href="/">Back to app</a>
    </div>
  );
}
