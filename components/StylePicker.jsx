// frontend/app/components/StylePicker.jsx
"use client";

const DEFAULTS = [
  // FREE
  { key: "anime", label: "Anime", proOnly: false, color: { from: "#a78bfa", to: "#6366f1" } },
  { key: "cartoon", label: "Cartoon", proOnly: false, color: { from: "#f59e0b", to: "#ef4444" } },
  { key: "cin_lite", label: "Cinematic (Lite)", proOnly: false, color: { from: "#64748b", to: "#334155" } },
  { key: "cool", label: "Cool Tone", proOnly: false, color: { from: "#06b6d4", to: "#3b82f6" } },
  { key: "warm", label: "Warm Film", proOnly: false, color: { from: "#f97316", to: "#f43f5e" } },
  { key: "noir", label: "Noir", proOnly: false, color: { from: "#9ca3af", to: "#4b5563" } },
  { key: "vhs", label: "VHS", proOnly: false, color: { from: "#f43f5e", to: "#f59e0b" } },
  { key: "pop", label: "Pop Color", proOnly: false, color: { from: "#67e8f9", to: "#0ea5e9" } },

  // PRO (make sure **more than FREE**)
  { key: "anime_plus", label: "Anime+", proOnly: true, color: { from: "#8b5cf6", to: "#22d3ee" } },
  { key: "scifi_hud", label: "Sci-Fi HUD", proOnly: true, color: { from: "#00e5ff", to: "#0061ff" } },
  { key: "neonwave", label: "Neonwave", proOnly: true, color: { from: "#ff00cc", to: "#3333ff" } },
  { key: "cin_pro", label: "Cinematic Pro", proOnly: true, color: { from: "#b08d57", to: "#6b4f2a" } },
  { key: "hdr_glow", label: "HDR Glow", proOnly: true, color: { from: "#facc15", to: "#fb7185" } },
  { key: "bokeh_dream", label: "Bokeh Dream", proOnly: true, color: { from: "#22c55e", to: "#06b6d4" } },
  { key: "cyberpunk", label: "Cyberpunk", proOnly: true, color: { from: "#00ffa3", to: "#a100ff" } },
  { key: "rotoscope", label: "Rotoscope", proOnly: true, color: { from: "#ef4444", to: "#3b82f6" } },
];

export default function StylePicker({ styles = [], value, onChange, isPro }) {
  // Merge incoming styles (e.g., from backend) with defaults, dedupe by key
  const map = new Map();
  [...DEFAULTS, ...styles].forEach((s) => {
    if (!s?.key) return;
    map.set(s.key, { ...s });
  });

  const all = Array.from(map.values());

  // If user is FREE, show FREE + locked PRO tiles (clicking locked upsells)
  // If user is PRO, show **all** (PRO has more options).
  const display = all;

  function pick(k, locked) {
    if (locked && !isPro) {
      window.location.href = "/pro";
      return;
    }
    onChange?.(k);
  }

  return (
    <div>
      <h4 className="text-lg font-semibold mb-3">Choose a style</h4>

      <div className="style-grid">
        {display.map((s) => {
          const locked = !!s.proOnly && !isPro;
          const selected = value === s.key;
          const from = s?.color?.from || "#4f46e5";
          const to = s?.color?.to || "#06b6d4";

          return (
            <button
              key={s.key}
              type="button"
              className={`style-chip ${selected ? "is-selected" : ""} ${
                locked ? "is-locked" : ""
              }`}
              style={{
                // colorful gradient per tile
                backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
              }}
              onClick={() => pick(s.key, locked)}
              title={s.label}
            >
              <span className="chip-label" aria-label={s.label}>
                {s.label}
              </span>

              {s.proOnly && (
                <span className="chip-pro" aria-hidden>
                  PRO
                </span>
              )}

              {/* lock overlay for FREE users */}
              {locked && <span className="chip-lock">🔒</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
