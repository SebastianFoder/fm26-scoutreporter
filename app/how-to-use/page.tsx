"use client";

import Link from "next/link";
import { useState } from "react";

function Step({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  return (
    <div className="rounded-2xl border border-[oklch(var(--text))]/40 bg-[oklch(var(--text))]/10 px-5 py-4 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between cursor-pointer gap-4 text-left"
        aria-expanded={open}
      >
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="text-xs text-[oklch(var(--text))/0.65]">
          {open ? "Collapse" : "Expand"}
        </span>
      </button>

      <div
        className={[
          "mt-3 grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 text-sm text-[oklch(var(--text))/0.9]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStep({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/5 p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-2 text-sm text-[oklch(var(--text))/0.85]">
        {children}
      </div>
    </div>
  );
}

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-[oklch(var(--background))] text-[oklch(var(--text))]">
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            FM26 Player Exporter — Setup Guide
          </h1>
          <p className="text-sm text-[oklch(var(--text))/0.8]">
            Follow these steps to export a player list from Football Manager 26
            and import it into this app.
          </p>
          <div className="text-sm">
            <Link
              href="/"
              className="text-[oklch(var(--primary))] hover:underline"
            >
              Go to the importer
            </Link>
          </div>
        </header>

        <div className="space-y-4">
          <Step title="STEP 1: Install BepInEx" defaultOpen>
            <MiniStep title="1.1 Download BepInEx">
              <p>
                Go to{" "}
                <a
                  href="https://new.thunderstore.io/c/football-manager-26/p/BepInEx/BepInExPack_FootballManager26/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[oklch(var(--primary))] hover:underline"
                >
                  BepInExPack_FootballManager26
                </a>
                , click Download, and unzip the file.
              </p>
            </MiniStep>

            <MiniStep title="1.2 Copy files to your FM26 folder">
              <p className="mb-2">Open your FM26 installation folder.</p>
              <div className="rounded-xl border border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/5 p-3 font-mono text-xs">
                <div className="text-[oklch(var(--text))/0.8]">
                  Steam: Right-click FM26 → Properties → Installed Files →
                  Browse
                </div>
              </div>
              <p className="mt-3">
                Paste the unzipped files there. Your folder should look like:
              </p>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/5 p-3 text-xs">
                {`.../Steam/steamapps/common/Football Manager 26/
├── BepInEx/
├── changelog.txt
├── fm.exe
├── fm_data/
├── dotnet/
├── libdoorstop.so
└── run_bepinex.sh`}
              </pre>
            </MiniStep>

            <MiniStep title="1.3 Linux only — Set launch options">
              <p className="mb-2">
                Right-click FM26 in Steam → Properties → Launch Options, and
                paste:
              </p>
              <pre className="overflow-x-auto rounded-xl border border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/5 p-3 text-xs">
                {`WINEDLLOVERRIDES="winhttp=n,b" %command%`}
              </pre>
            </MiniStep>

            <MiniStep title="1.4 First launch">
              <p>
                Launch FM26 once so BepInEx can initialize. Confirm that the{" "}
                <code className="font-mono">BepInEx/plugins/</code> folder now
                exists before continuing.
              </p>
            </MiniStep>
          </Step>

          <Step title="STEP 2: Install the Plugin">
            <p>
              Download the plugin from{" "}
              <a
                href="https://www.fmscout.com/a-fm26-player-csv-export.html"
                target="_blank"
                rel="noreferrer"
                className="text-[oklch(var(--primary))] hover:underline"
              >
                FM26 Player CSV Export
              </a>
              .
            </p>
            <p className="mt-2">
              Copy <code className="font-mono">FMDataExport.dll</code> from the
              ZIP into:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-xl border border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/5 p-3 text-xs">
              {`.../Steam/steamapps/common/Football Manager 26/BepInEx/plugins/`}
            </pre>
          </Step>

          <Step title="STEP 3: Install the View">
            <p className="mb-2">Download the view file:</p>
            <a
              href="/scouting-exporter.fmf"
              className="inline-flex items-center rounded-full bg-[oklch(var(--primary))] px-4 py-2 text-sm font-medium text-[oklch(var(--text))] hover:bg-[oklch(var(--primary))]/85"
            >
              Download scouting-exporter.fmf
            </a>
            <p className="mt-3">Move it to:</p>
            <pre className="mt-2 overflow-x-auto rounded-xl border border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/5 p-3 text-xs">
              {`Documents\\Sports Interactive\\Football Manager 26\\views\\`}
            </pre>
          </Step>

          <Step title="STEP 4: Export Players from FM26">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Open your FM26 save and go to{" "}
                <span className="font-medium">
                  Recruitment → Player Database
                </span>
              </li>
              <li>
                Right-click any column header and select{" "}
                <span className="font-medium">Import View</span>
              </li>
              <li>Import the view you downloaded in Step 3</li>
              <li>
                Select that view from the{" "}
                <span className="font-medium">Custom Views</span> dropdown
                (top-right of the player list)
              </li>
              <li>Select the players you want to export</li>
              <li>
                Press <span className="font-medium">F9</span> to export
              </li>
            </ol>
          </Step>

          <Step title="STEP 5: Import the CSV">
            <p>
              Go to{" "}
              <Link
                href="/"
                className="text-[oklch(var(--primary))] hover:underline"
              >
                this site’s importer
              </Link>{" "}
              and click <span className="font-medium">Choose CSV file</span>.
            </p>
            <p className="mt-2">Navigate to:</p>
            <pre className="mt-2 overflow-x-auto rounded-xl border border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/5 p-3 text-xs">
              {`Documents\\Sports Interactive\\Football Manager 26\\FM26PlayerExport by vinteset\\Exports CSV\\`}
            </pre>
            <p className="mt-2">Select your exported file and import.</p>
            <p className="mt-3 text-[oklch(var(--text))/0.85]">
              You&apos;re done — enjoy your scouting data!
            </p>
          </Step>
        </div>
      </main>
    </div>
  );
}
