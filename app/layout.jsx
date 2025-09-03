// frontend/app/layout.jsx
import "./globals.css";
import "./ui.css";
import Providers from "./providers.jsx";
import GoProButton from "../components/GoProButton.jsx";

// App Router metadata (lets Next inject tags correctly)
export const metadata = {
  title: { default: "FluxFrame", template: "%s · FluxFrame" },
  description: "Remix your clips into cinematic realities",
  themeColor: "#0b0f17",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png" }],
  },
};

export default function RootLayout({ children }) {
  // Normalize the public API base once (empty = no shim)
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");

  return (
    <html lang="en">
      <head>
        {/* iOS PWA bits */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Small perf nudge when talking to your API */}
        {apiBase && apiBase.startsWith("https://") && (
          <>
            <link rel="preconnect" href={apiBase} crossOrigin="" />
            <link rel="dns-prefetch" href={apiBase} />
          </>
        )}

        {/* Register a minimal service worker for installability / offline shell.
           - If you use next-pwa, this still works (it generates /sw.js in public/).
           - If you roll your own, put a tiny sw at /public/sw.js (even an empty install handler). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    if ('serviceWorker' in navigator) {
      addEventListener('load', function () {
        // Try the common names in order
        var candidates = ['/sw.js','/service-worker.js'];
        (async function tryRegs(i){
          if(i>=candidates.length) return;
          try { await navigator.serviceWorker.register(candidates[i]); }
          catch(e){ tryRegs(i+1); }
        })(0);
      });
    }
  } catch (e) {}
})();`,
          }}
        />

        {/* Fetch shim: rewrite *relative* /api/* to absolute backend base.
           Calls that already use an absolute URL are left alone. */}
        {apiBase && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
(function () {
  try {
    var API_BASE = ${JSON.stringify(apiBase)};
    var origFetch = window.fetch;
    window.fetch = function (input, init) {
      try {
        var url = (typeof input === "string") ? input : (input && input.url) || "";
        // Only touch relative /api/... requests
        if (typeof url === "string" && url.indexOf("://") === -1 && url.startsWith("/api/")) {
          var absolute = API_BASE + url;
          if (typeof input === "string") {
            return origFetch(absolute, init || {});
          } else {
            // Recreate Request with absolute URL while preserving options
            var reqInit = Object.assign({}, input, init || {});
            return origFetch(absolute, reqInit);
          }
        }
      } catch (e) { /* fall through */ }
      return origFetch(input, init || {});
    };
  } catch (e) {}
})();`,
            }}
          />
        )}
      </head>

      <body className="bg-grid min-h-screen antialiased">
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
