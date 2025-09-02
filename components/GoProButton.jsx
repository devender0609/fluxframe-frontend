// frontend/components/GoProButton.jsx
"use client";

import { apiPost } from "../lib/api";

export default function GoProButton({ children = "Go Pro", className = "" }) {
  async function handleClick() {
    try {
      const j = await apiPost("/api/billing/checkout", {}); // backend returns { ok, url }
      if (!j?.url) throw new Error(j?.error || "Checkout failed");
      window.location.href = j.url; // Stripe Checkout
    } catch (e) {
      alert(e?.message || "Checkout error");
    }
  }

  return (
    <button type="button" className={`btn secondary ${className}`} onClick={handleClick}>
      {children}
    </button>
  );
}
