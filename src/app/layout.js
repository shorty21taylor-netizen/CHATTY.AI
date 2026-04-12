import "./globals.css";

export const metadata = {
  title: "Chatty.AI — Your AI Receptionist, Always On",
  description:
    "Chatty.AI is a low-ticket AI voice agent platform powered by ElevenLabs. Inbound qualification, outbound outreach, and a Telegram executive assistant — starting at $97/mo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap"
        />
      </head>
      <body style={{ background: "var(--bg)" }}>{children}</body>
    </html>
  );
}
