import "./globals.css";

export const metadata = {
  title: "Chatty.AI — The Sales OS for Home Services",
  description:
    "Chatty.AI is the sales operating system for general contractors, remodelers, roofers, HVAC, and other home-service pros. Capture, convert, and reclaim every lead.",
};

// Anti-FOUC: apply saved theme (default light) before first paint.
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('chatty_theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body style={{ background: "var(--app-bg)" }}>{children}</body>
    </html>
  );
}
