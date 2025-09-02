// frontend/app/page.jsx
"use client";

import { useEffect, useState } from "react";
import Uploader from "../components/Uploader.jsx";
import StylePicker from "../components/StylePicker.jsx";
import FeatureGrid from "../components/FeatureGrid.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import MiniGallery from "../components/MiniGallery.jsx";
import { getApiBase } from "../lib/api.js";
import { useUser } from "../lib/user.js";

export default function Home() {
  const [style, setStyle] = useState("anime");
  const [styles, setStyles] = useState([]);
  const { user } = useUser();

  // Resolve API base once; fallback matches backend default port
  const api = (getApiBase() || "http://localhost:8080").replace(/\/+$/, "");

  // Avoid SSR/client mismatches
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Load available styles from backend
  useEffect(() => {
    fetch(`${api}/api/styles`)
      .then((r) => r.json())
      .then((d) => setStyles(d.styles || []))
      .catch(() => {
        setStyles([
          { key: "anime", label: "Anime" },
          { key: "scifi", label: "Sci-Fi" },
          { key: "cartoon", label: "Cartoon" },
        ]);
      });
  }, [api]);

  const isPro = !!(hydrated && user?.isPro);

  return (
    <div className="px-6 pb-20">
      {/* Hero */}
      <section className="max-w-5xl mx-auto text-center mt-8">
        <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
          Make Your Moments <span className="opacity-90">Cinematic</span>
        </h2>
        <p className="text-gray-300 mt-3 text-lg">
          Upload a 5–15s video, pick a reality, and get a share-ready clip.
        </p>

        <div className="mt-3">
          <span className="badge" suppressHydrationWarning>
            {isPro ? "PRO" : "FREE"}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <a href="#uploader" className="btn">Start Remixing</a>
          <a href="/pro" className="btn secondary">Go Pro</a>
        </div>
      </section>

      {/* Uploader + Styles in one card for alignment */}
      <section id="uploader" className="max-w-7xl mx-auto mt-10">
        <div className="card p-6">
          {/* Pass backend base + user tier (controls watermark on server) */}
          <Uploader styleKey={style} apiBase={api} isPro={isPro} />

          <div className="mt-6">
            <StylePicker styles={styles} value={style} onChange={setStyle} />
            <div className="mt-4 text-xs text-gray-400">
              Free tier adds a watermark. PRO = HD + no watermark.
            </div>
          </div>
        </div>
      </section>

      {/* Extra sections (keep / edit as you wish) */}
      <HowItWorks />
      <FeatureGrid />
      <MiniGallery />

      <section id="cta" className="max-w-5xl mx-auto mt-16 text-center">
        <div className="card p-8">
          <h3 className="text-2xl font-semibold">Ready to go PRO?</h3>
          <p className="text-gray-300 mt-1">Unlimited remixes, HD output, no watermark.</p>
          <a href="/pro" className="btn mt-4">Upgrade</a>
        </div>
      </section>
    </div>
  );
}
