"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet } from "../../../lib/api";

/** Inner client that reads search params. Must be inside <Suspense>. */
function ClaimContent() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");
  const [state, setState] = useState({ loading: true, ok: false, error: "" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!sessionId) {
        setState({ loading: false, ok: false, error: "Missing session_id" });
        return;
      }
      try {
        const res = await apiGet(
          `/api/billing/claim?session_id=${encodeURIComponent(sessionId)}`,
          { noCache: true }
        );
        if (!cancelled) {
          setState({
            loading: false,
            ok: !!res?.ok,
            error: res?.ok ? "" : res?.error || "Unknown error",
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            loading: false,
            ok: false,
            error: e?.message || String(e),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-3xl font-extrabold">Thanks for upgrading! 🎉</h1>
      <p className="mt-3 opacity-80">
        {state.loading
          ? "Finalizing your upgrade…"
          : state.ok
          ? "Your device is now PRO. You can close this tab."
          : `We couldn’t verify the payment${
              state.error ? `: ${state.error}` : ""
            }.`}
      </p>
      <a className="btn mt-6" href="/">Back to app</a>
    </div>
  );
}

export default function ProSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-8 text-center">
          <h1 className="text-3xl font-extrabold">Thanks for upgrading! 🎉</h1>
          <p className="mt-3 opacity-80">Finalizing your upgrade…</p>
        </div>
      }
    >
      <ClaimContent />
    </Suspense>
  );
}
