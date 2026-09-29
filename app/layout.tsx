import type { Metadata, Viewport } from "next";
import { Syne, Space_Grotesk, Space_Mono } from "next/font/google";
import { LocaleProvider } from "@/hooks/useLocale";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-syne" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-space-grotesk" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://nosoytufan.com"),
  title: "nosoytufan.com — ¿Quién no te sigue de vuelta?",
  description:
    "Descubre quién no te sigue de vuelta en Instagram. 100% en tu navegador: sin contraseña, sin login, sin servidores.",
  openGraph: {
    title: "nosoytufan.com",
    description: "¿Quién no te sigue de vuelta? Sin contraseña. Sin login. Sin drama.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0A0A0A", colorScheme: "dark" };

// Static site: the CSP ships as a meta tag. 'unsafe-inline' in script-src is required by the Next
// runtime (inline hydration scripts) since there is no server to generate nonces.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${syne.variable} ${grotesk.variable} ${mono.variable}`}>
      <head>
        {process.env.NODE_ENV === "production" && <meta httpEquiv="Content-Security-Policy" content={CSP} />}
      </head>
      <body className="min-h-dvh antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
