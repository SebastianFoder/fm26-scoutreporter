import type { Metadata } from "next";
import { Roboto, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import {
  AttributeColorConfig,
  AttributeColorProvider,
} from "./components/AttributeColorConfig";
import Link from "next/link";
import { WeightProvider } from "./components/WeightConfig";
import { PlayersDataProvider } from "./components/PlayersDataProvider";
import { HighlightedAttributesProvider } from "./components/HighlightedAttributesConfig";
import {
  AnalyticsConsentProvider,
  AnalyticsPreferencesLink,
} from "./components/AnalyticsConsent";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FM26 Scout Reporter",
    template: "%s · FM26 Scout Reporter",
  },
  description:
    "Import Football Manager 26 player CSV exports, score players with weighted attributes, and compare them with configurable highlights and colour thresholds.",
  applicationName: "FM26 Scout Reporter",
  keywords: [
    "Football Manager 26",
    "FM26",
    "scouting",
    "player export",
    "CSV",
    "comparison",
    "analytics",
  ],
  authors: [{ name: "Sebastian Foder", url: "https://github.com/SebastianFoder" }],
  creator: "Sebastian Foder",
  publisher: "Sebastian Foder",
  openGraph: {
    title: "FM26 Scout Reporter",
    description:
      "Import FM26 player CSV exports, score players with weights, and compare attributes with highlights.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FM26 Scout Reporter",
    description:
      "Import FM26 player CSV exports, score players with weights, and compare attributes.",
    creator: "@F1ngs",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${geistMono.variable} antialiased`}>
        <AttributeColorProvider>
          <AnalyticsConsentProvider>
            <WeightProvider>
              <PlayersDataProvider>
                <HighlightedAttributesProvider>
                  <div className="flex min-h-screen flex-col">
                    <header className="flex items-center justify-end gap-2 border-b border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/10 px-4 py-2">
                      <Link
                        href="/"
                        className="rounded-full px-3 py-1 text-sm text-[oklch(var(--text))/0.85] hover:bg-[oklch(var(--text))]/10"
                      >
                        Home
                      </Link>
                      <Link
                        href="/how-to-use"
                        className="rounded-full px-3 py-1 text-sm text-[oklch(var(--text))/0.85] hover:bg-[oklch(var(--text))]/10"
                      >
                        How to use
                      </Link>
                      <AttributeColorConfig />
                      <ThemeSwitcher />
                    </header>
                    <main className="flex-1">{children}</main>
                    <footer className="border-t border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/5 px-4 py-4">
                      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-[oklch(var(--text))/0.75] sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          Developed by{" "}
                          <span className="font-medium text-[oklch(var(--text))/0.9]">
                            Sebastian Foder
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href="https://github.com/SebastianFoder"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline text-[oklch(var(--primary))]"
                          >
                            GitHub
                          </a>
                          <a
                            href="https://x.com/F1ngs"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline text-[oklch(var(--primary))]"
                          >
                            Twitter
                          </a>
                          <AnalyticsPreferencesLink className="hover:underline text-[oklch(var(--primary))]" />
                        </div>
                      </div>
                    </footer>
                  </div>
                </HighlightedAttributesProvider>
              </PlayersDataProvider>
            </WeightProvider>
          </AnalyticsConsentProvider>
        </AttributeColorProvider>
      </body>
    </html>
  );
}
