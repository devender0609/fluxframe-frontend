"use client";

import { useEffect, useRef, useState } from "react";
import { getApiBase } from "../../../lib/api.js";

export default function ResultPage({ params }) {
  const { id } = params || {};
  const [status, setStatus] = useState("starting");
  const [error, setError] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(null);

  // debug helpers so we can see EXACTLY what came back, if it fails
  const [lastCode, setLastCode] = useState(null);
  const [lastUrl, setLastUrl] = useState(null);
  const [lastRaw, setLastRaw] = useState(null);

  const pollRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    setStatus("queued");
    setError(null);

    const base = getApiBase();              // "/rrapi" in the browser via Next rewrite
    const url = `${base}/api/status/${id}`; // -> backend /api/status/:id
    setLastUrl(url);

    const poll = async () => {
      try {
        const r = await fetch(url, { method: "GET", cache: "no-store" });
        const txt = await r.text();
        setLastCode(r.status);
        setLastRaw(txt.slice(0, 220)); // keep a short preview for debugging

        let data;
        try {
          data = JSON.parse(txt);
        } catch {
          throw new Error(
            `Non-JSON from status endpoint (HTTP ${r.status}). Body preview: ${txt.slice(
              0,
              120
            )}…`
          );
        }

        if (!r.ok) {
          throw new Error(data?.error || `HTTP ${r.status}`);
        }

        const st = data?.status || "unknown";
        setStatus(st);

        if (st === "completed" && data?.mediaUrl) {
          // serve through the rewrite so it's same-origin
          setMediaUrl(`/rrapi${data.mediaUrl}`);
          clearInterval(pollRef.current);
          pollRef.current = null;
        } else if (st === "error") {
          throw new Error(data?.error || "Processing error");
        }
      } catch (e) {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setError(String(e.message || e));
        setStatus(null);
      }
    };

    // kick off polling
    poll(); // immediate first poll
    pollRef.current = setInterval(poll, 1200);

    // cleanup on unmount
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">Remix Status</h1>

      <div className="mt-2 text-sm text-gray-300">
        <strong>Job ID:</strong>{" "}
        <code className="break-all">{id || "(missing)"}</code>
      </div>

      {status && (
        <div className="mt-3 text-gray-200">
          Status: <strong>{status}</strong>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-sm break-words">
          <div className="font-semibold mb-1">Error: {error}</div>
          {/* tiny debugger to make issues obvious */}
          <div className="text-xs opacity-80 space-y-1">
            {lastUrl && (
              <div>
                <span className="opacity-70">URL:</span> <code>{lastUrl}</code>
              </div>
            )}
            {lastCode != null && (
              <div>
                <span className="opacity-70">HTTP:</span> {lastCode}
              </div>
            )}
            {lastRaw && (
              <div className="break-words">
                <span className="opacity-70">Body:</span> <code>{lastRaw}</code>
              </div>
            )}
            <div className="opacity-70">
              Tip: If the backend restarted, the in-memory job store is cleared. Re-upload to get a fresh Job ID.
            </div>
          </div>
        </div>
      )}

      {mediaUrl && (
        <div className="mt-6 card p-4">
          <video src={mediaUrl} controls className="w-full rounded-lg" />
          <div className="text-xs text-gray-400 mt-2">
            Served via: <code>{mediaUrl}</code>
          </div>
          <div className="mt-3 flex gap-2">
            <a className="btn" href={mediaUrl} download>
              Download
            </a>
            <a className="btn secondary" href="/">
              Make Another
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
