"use client";

import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

type Consent = "opt_in" | "opt_out" | null;

const STORAGE_KEY = "analytics_consent";

function readConsent(): Consent {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "opt_in" || v === "opt_out" ? v : null;
}

function writeConsent(value: Exclude<Consent, null>) {
  window.localStorage.setItem(STORAGE_KEY, value);
}

function initPostHogIfPossible() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
  if (!key) return false;

  if (!posthog.__loaded) {
    posthog.init(key, {
      api_host: host,
      // We'll explicitly capture the events we care about.
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage",
    });
  }

  return true;
}

function shutdownPostHog() {
  try {
    posthog.opt_out_capturing();
    posthog.reset();
    (posthog as any).shutdown?.();
  } catch {
    // ignore
  }
}

function capturePageView(url: string) {
  try {
    posthog.capture("$pageview", { $current_url: url });
  } catch {
    // ignore
  }
}

type AnalyticsConsentContextValue = {
  openPreferences: () => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  consent: Consent;
};

const AnalyticsConsentContext =
  createContext<AnalyticsConsentContextValue | null>(null);

export function AnalyticsPreferencesLink({
  className,
}: {
  className?: string;
}) {
  const ctx = useContext(AnalyticsConsentContext);
  if (!ctx) return null;
  return (
    <button type="button" onClick={ctx.openPreferences} className={className}>
      Analytics preferences
    </button>
  );
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsConsentContext);
  if (!ctx) {
    return {
      consent: null as Consent,
      capture: (_event: string, _properties?: Record<string, unknown>) => {},
    };
  }
  return { consent: ctx.consent, capture: ctx.capture };
}

export function AnalyticsConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<Consent>(null);
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    const c = readConsent();
    setConsent(c);
    if (c === null) setOpen(true);
    if (c === "opt_out") shutdownPostHog();
    if (c === "opt_in") initPostHogIfPossible();
  }, []);

  useEffect(() => {
    if (consent !== "opt_in") return;
    if (!posthog.__loaded) return;
    capturePageView(url);
  }, [consent, url]);

  const accept = () => {
    writeConsent("opt_in");
    setConsent("opt_in");
    initPostHogIfPossible();
    try {
      posthog.opt_in_capturing();
    } catch {
      // ignore
    }
    setOpen(false);
  };

  const decline = () => {
    writeConsent("opt_out");
    setConsent("opt_out");
    shutdownPostHog();
    setOpen(false);
  };

  return (
    <AnalyticsConsentContext.Provider
      value={{
        consent,
        openPreferences: () => setOpen(true),
        capture: (event, properties) => {
          if (consent !== "opt_in") return;
          if (!posthog.__loaded) return;
          try {
            posthog.capture(event, properties);
          } catch {
            // ignore
          }
        },
      }}
    >
      {children}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Analytics preference"
        description="Help improve Scout Reporter by allowing anonymous usage analytics (PostHog). You can change this any time in the footer."
        size="md"
        closeOnOverlayClick={false}
      >
        <div className="space-y-4 text-sm text-[oklch(var(--text))/0.85]">
          <p>
            If you opt in, we collect anonymous events like page views and UI
            interactions to improve features and usability.
          </p>
          <p className="text-xs text-[oklch(var(--text))/0.7]">
            If you opt out, analytics are disabled on this device and we won’t
            send events.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button color="alt" variant="outline" onClick={decline}>
              Opt out
            </Button>
            <Button color="primary" variant="solid" onClick={accept}>
              Opt in
            </Button>
          </div>
        </div>
      </Modal>
    </AnalyticsConsentContext.Provider>
  );
}
