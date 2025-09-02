// frontend/app/layout.jsx
export const metadata = {
  title: "FluxFrame",
  description: "Remix your clips into cinematic realities",
};

import "./globals.css";
import "./ui.css";
import Providers from "./providers.jsx";
import GoProButton from "../components/GoProButton.jsx";

export default function RootLayout({ children }) {
  // Read the public API base once and strip trailing slashes for safety
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");

  return (
    <html lang="en">
      <head>
        {/* PWA meta + manifest + icon */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b0f17" />
        <link rel="icon" href="/icons/icon-192.png" />

        {/* Register a minimal service worker for installability */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function(){});
      });
    }
  } catch (e) {}
})();`,
          }}
        />
      </head>
      <body className="bg-grid min-h-screen antialiased">
        {/* --- Fetch shim: rewrite relative /api/* to the backend base --- */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var API_BASE = ${JSON.stringify(apiBase)};
    if (!API_BASE) return; // nothing to do if not configured

    var origFetch = window.fetch;
    window.fetch = function (input, init) {
      try {
        var url = (typeof input === "string") ? input : (input && input.url) || "";
        if (url.startsWith("/api/")) {
          var absolute = API_BASE + url;
          if (typeof input === "string") {
            return origFetch(absolute, init || {});
          } else {
            // Recreate Request with absolute URL while preserving options
            var reqInit = Object.assign({}, input, init || {});
            return origFetch(absolute, reqInit);
          }
        }
      } catch (e) { /* fall through to original fetch */ }
      return origFetch(input, init || {});
    };
  } catch (e) { /* noop */ }
})();`,
          }}
        />

        <div className="min-h-screen flex flex-col">
          <header className="px-6 py-5 flex items-center justify-between">
            <a className="flex items-center gap-3" href="/">
              <img
                src="/logo-fluxframe-lockup.svg"
                alt="FluxFrame"
                width={164}
                height={28}
                loading="eager"
                fetchPriority="high"
                style={{ display: "block" }}
              />
            </a>
            <nav className="flex items-center gap-4 text-sm text-gray-300">
              <a className="hover:text-white" href="/">Home</a>
              <a className="hover:text-white" href="/auth/login">Login</a>
              <a className="hover:text-white" href="/auth/register">Register</a>
              <GoProButton className="ml-2" />
            </nav>
          </header>

          <main className="flex-1">
            <div id="__app">
              <Providers>{children}</Providers>
            </div>
          </main>

          <footer className="px-6 py-10 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} FluxFrame
          </footer>
        </div>
      </body>
    </html>
  );
}
