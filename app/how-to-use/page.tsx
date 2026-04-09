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
    <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-5 py-4 shadow-[4px_4px_0_oklch(var(--border))]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between cursor-pointer gap-4 text-left"
        aria-expanded={open}
      >
        <h2 className="text-base font-black uppercase tracking-wide">{title}</h2>
        <span className="rounded-lg border-2 border-[oklch(var(--border))] px-2 py-0.5 text-xs font-bold">
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
    <div className="rounded-lg border-2 border-[oklch(var(--border))]/50 bg-[oklch(var(--background))] p-4">
      <h3 className="text-sm font-bold">{title}</h3>
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
          <h1 className="text-4xl font-black uppercase tracking-tight">
            Setup Guide
          </h1>
          <p className="text-sm text-[oklch(var(--text))/0.75]">
            Follow these steps to export a player list from Football Manager 26
            and import it into this app.
          </p>
          <div className="text-sm">
            <Link
              href="/attribute"
              className="font-bold text-[oklch(var(--primary))] underline decoration-2 underline-offset-2 hover:decoration-[oklch(var(--alt))]"
            >
              Go to the importer
            </Link>
          </div>
        </header>

        <div className="space-y-4">
          <Step title="Step 1: Install BepInEx" defaultOpen>
            <MiniStep title="1.1 Download BepInEx">
              <p>
                Go to{" "}
                <a
                  href="https://new.thunderstore.io/c/football-manager-26/p/BepInEx/BepInExPack_FootballManager26/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[oklch(var(--primary))] underline decoration-2 underline-offset-2 hover:decoration-[oklch(var(--alt))]"
                >
                  BepInExPack_FootballManager26
                </a>
                , click Download, and unzip the file.
              </p>
            </MiniStep>

            <MiniStep title="1.2 Copy files to your FM26 folder">
              <p className="mb-2">Open your FM26 installation folder.</p>
              <div className="rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] p-3 font-mono text-xs">
                <div className="text-[oklch(var(--text))/0.8]">
                  Steam: Right-click FM26 → Properties → Installed Files →
                  Browse
                </div>
              </div>
              <p className="mt-3">
                Paste the unzipped files there. Your folder should look like:
              </p>
              <pre className="mt-2 overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] p-3 font-mono text-xs">
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
              <pre className="overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] p-3 font-mono text-xs">
                {`WINEDLLOVERRIDES="winhttp=n,b" %command%`}
              </pre>
            </MiniStep>

            <MiniStep title="1.4 First launch">
              <p>
                Launch FM26 once so BepInEx can initialize. Confirm that the{" "}
                <code className="font-mono font-bold">BepInEx/plugins/</code> folder now
                exists before continuing.
              </p>
            </MiniStep>
          </Step>

          <Step title="Step 2: Install the Plugin">
            <p>
              Download the plugin from{" "}
              <a
                href="https://www.fmscout.com/a-fm26-player-csv-export.html"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[oklch(var(--primary))] underline decoration-2 underline-offset-2 hover:decoration-[oklch(var(--alt))]"
              >
                FM26 Player CSV Export
              </a>
              .
            </p>
            <p className="mt-2">
              Copy <code className="font-mono font-bold">FMDataExport.dll</code> from the
              ZIP into:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] p-3 font-mono text-xs">
              {`.../Steam/steamapps/common/Football Manager 26/BepInEx/plugins/`}
            </pre>
          </Step>

          <Step title="Step 3: Install the View">
            <p className="mb-2">Download the view file:</p>
            <a
              href="/scouting-exporter.fmf"
              className="inline-flex items-center rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--primary))] px-4 py-2 text-sm font-bold text-[oklch(var(--background))] shadow-[2px_2px_0_oklch(var(--border))] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_oklch(var(--border))]"
            >
              Download scouting-exporter.fmf
            </a>
            <p className="mt-3">Move it to:</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] p-3 font-mono text-xs">
              {`Documents\\Sports Interactive\\Football Manager 26\\views\\`}
            </pre>
          </Step>

          <Step title="Step 4: Export Players from FM26">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Open your FM26 save and go to{" "}
                <span className="font-bold">
                  Recruitment → Player Database
                </span>
              </li>
              <li>
                Right-click any column header and select{" "}
                <span className="font-bold">Import View</span>
              </li>
              <li>Import the view you downloaded in Step 3</li>
              <li>
                Select that view from the{" "}
                <span className="font-bold">Custom Views</span> dropdown
                (top-right of the player list)
              </li>
              <li>Select the players you want to export</li>
              <li>
                Press <span className="font-mono font-bold">F9</span> to export
              </li>
            </ol>
          </Step>

          <Step title="Step 5: Import the CSV">
            <p>
              Go to{" "}
              <Link
                href="/attribute"
                className="font-bold text-[oklch(var(--primary))] underline decoration-2 underline-offset-2 hover:decoration-[oklch(var(--alt))]"
              >
                this site&apos;s importer
              </Link>{" "}
              and click <span className="font-bold">Choose CSV file</span>.
            </p>
            <p className="mt-2">Navigate to:</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] p-3 font-mono text-xs">
              {`Documents\\Sports Interactive\\Football Manager 26\\FM26PlayerExport by vinteset\\Exports CSV\\`}
            </pre>
            <p className="mt-2">Select your exported file and import.</p>
            <p className="mt-3 font-bold text-[oklch(var(--text))/0.85]">
              You&apos;re done — enjoy your scouting data!
            </p>
          </Step>
        </div>
      </main>
    </div>
  );
}
