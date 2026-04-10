"use client";

import Link from "next/link";
import { useState } from "react";

type Tab = "setup" | "attribute" | "moneyball" | "mustermann";

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

function InfoBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border-2 border-[oklch(var(--border))]/50 bg-[oklch(var(--background))] p-4">
      <p className="text-xs font-black uppercase tracking-wider text-[oklch(var(--text))]/60 mb-1">
        {label}
      </p>
      <div className="text-sm text-[oklch(var(--text))/0.85]">{children}</div>
    </div>
  );
}

function SetupGuideTab() {
  return (
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
        <p className="mb-2">Download the view file for your mode:</p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/SCOUT%20REPORTER%20Attributes%20v1.fmf"
            className="inline-flex items-center rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--primary))] px-4 py-2 text-sm font-bold text-[oklch(var(--background))] shadow-[2px_2px_0_oklch(var(--border))] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_oklch(var(--border))]"
          >
            Download Attribute View
          </a>
          <a
            href="/SCOUT%20REPORTER%20STATS%20V1.fmf"
            className="inline-flex items-center rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--alt))] px-4 py-2 text-sm font-bold text-[oklch(var(--background))] shadow-[2px_2px_0_oklch(var(--border))] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_oklch(var(--border))]"
          >
            Download Stats View (Moneyball + Mustermann)
          </a>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>Use Attribute View for Attribute mode imports.</li>
          <li>Use Stats View for Moneyball and Mustermann mode imports.</li>
        </ul>
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
          <li>Import the correct view you downloaded in Step 3 for your mode</li>
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
  );
}

function AttributeTab() {
  return (
    <div className="space-y-6">
      <Step title="How to Use — Attribute Mode" defaultOpen>
        <p>
          Attribute mode lets you import a player export and instantly rank players by
          a weighted average of their FM26 attributes. No baseline required — just
          import and score.
        </p>

        <MiniStep title="1. Download and import the Attribute View">
          <p className="mb-2">
            Download the Attribute View and place it in your FM26 views folder:
          </p>
          <a
            href="/SCOUT%20REPORTER%20Attributes%20v1.fmf"
            className="inline-flex items-center rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--primary))] px-4 py-2 text-sm font-bold text-[oklch(var(--background))] shadow-[2px_2px_0_oklch(var(--border))] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_oklch(var(--border))]"
          >
            Download Attribute View
          </a>
          <p className="mt-2 text-xs text-[oklch(var(--text))]/65">
            See the Setup Guide tab for full BepInEx + plugin install instructions.
          </p>
        </MiniStep>

        <MiniStep title="2. Export players from FM26">
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Open your save and go to{" "}
              <span className="font-bold">Recruitment → Player Database</span>
            </li>
            <li>
              Right-click a column header → <span className="font-bold">Import View</span> and
              load the Attribute View
            </li>
            <li>Select the Attribute View from the Custom Views dropdown</li>
            <li>Select the players you want, then press <span className="font-mono font-bold">F9</span></li>
          </ol>
        </MiniStep>

        <MiniStep title="3. Import the CSV">
          <p>
            Go to{" "}
            <Link
              href="/attribute"
              className="font-bold text-[oklch(var(--primary))] underline decoration-2 underline-offset-2 hover:decoration-[oklch(var(--alt))]"
            >
              Attribute Mode
            </Link>
            , click <span className="font-bold">Choose CSV file</span>, and navigate to:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] p-3 font-mono text-xs">
            {`Documents\\Sports Interactive\\Football Manager 26\\FM26PlayerExport by vinteset\\Exports CSV\\`}
          </pre>
          <p className="mt-2">
            Players are scored and sorted immediately after import.
          </p>
        </MiniStep>

        <MiniStep title="4. Tune weights and columns">
          <p>
            Click <span className="font-bold">Weights</span> to open the weight panel and drag
            each attribute importance slider. The player list re-ranks live. Click{" "}
            <span className="font-bold">Columns</span> to choose which attributes are highlighted
            in the table.
          </p>
        </MiniStep>

        <MiniStep title="5. Compare players">
          <p>
            Tick two or more players in the list and click{" "}
            <span className="font-bold">Compare selected</span> to open a side-by-side attribute
            breakdown view.
          </p>
        </MiniStep>
      </Step>

      <Step title="How it Works — Attribute Mode" defaultOpen>
        <p>
          Attribute mode scores players using a weighted average of their raw FM26
          attribute values (1–20 scale), then normalises that average to a 100-point scale.
        </p>

        <InfoBox label="Weighted attribute average">
          <p>
            For each attribute you assign a weight (0 = ignore, higher = more important).
            The score is the weighted mean of all attribute values across every attribute
            with a non-zero weight:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] p-3 font-mono text-xs">
            {`weighted_avg = Σ(attr_value × weight²) / Σ(weight²)`}
          </pre>
          <p className="mt-2">
            Weights are squared before use — this is the <span className="font-bold">weight emphasis</span> mechanic.
            It means doubling a weight more than doubles that attribute&apos;s influence, sharpening
            the separation between high-priority and low-priority attributes.
          </p>
        </InfoBox>

        <InfoBox label="100-point normalisation">
          <p>
            The weighted average sits on the FM 1–20 attribute scale. It is normalised so
            that a weighted average of <span className="font-mono font-bold">13</span> (considered
            a solid professional) maps to exactly <span className="font-mono font-bold">100</span>.
            Scores above 100 indicate above-average players for your weight profile; below 100
            means below average.
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] p-3 font-mono text-xs">
            {`score = (weighted_avg / 13) × 100`}
          </pre>
        </InfoBox>

        <InfoBox label="Attribute categories">
          <p>
            Attributes are grouped into four categories — Technical, Mental, Physical, and
            Goalkeeping — matching FM26&apos;s own groupings. You can weight attributes from any
            category in the same profile, so a goalkeeper weight set can include physical
            and mental attributes alongside GK-specific ones.
          </p>
        </InfoBox>

        <InfoBox label="Player detail & comparison">
          <p>
            Clicking a player opens their full attribute sheet with colour-coded values
            (excellent / good / average / low) based on your theme settings. The compare view
            places two or more players side-by-side with differences highlighted, making it
            easy to spot where one player outperforms another for your specific role needs.
          </p>
        </InfoBox>
      </Step>
    </div>
  );
}

function MoneyballTab() {
  return (
    <div className="space-y-6">
      <Step title="How to Use — Moneyball Mode" defaultOpen>
        <p>
          Moneyball mode ranks players by comparing their per-90 stats against a
          baseline population using weighted percentiles. Follow these steps:
        </p>

        <MiniStep title="1. Download and import the Stats View">
          <p className="mb-2">
            If you haven&apos;t already, download the Stats View and place it in your FM26 views folder:
          </p>
          <a
            href="/SCOUT%20REPORTER%20STATS%20V1.fmf"
            className="inline-flex items-center rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--alt))] px-4 py-2 text-sm font-bold text-[oklch(var(--background))] shadow-[2px_2px_0_oklch(var(--border))] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_oklch(var(--border))]"
          >
            Download Stats View
          </a>
          <p className="mt-2 text-xs text-[oklch(var(--text))]/65">
            See the Setup Guide tab for full install instructions.
          </p>
        </MiniStep>

        <MiniStep title="2. Build a baseline">
          <p>
            In FM26, export a large set of players using the Stats View — ideally an entire
            league or multiple leagues. This becomes your percentile baseline.
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Go to{" "}
              <Link
                href="/moneyball"
                className="font-bold text-[oklch(var(--primary))] underline decoration-2 underline-offset-2 hover:decoration-[oklch(var(--alt))]"
              >
                Moneyball Mode
              </Link>
            </li>
            <li>
              Click <span className="font-bold">Baseline Stats</span>
            </li>
            <li>Import one or more CSV files (you can combine multiple leagues)</li>
            <li>Set a minimum minutes threshold to filter out low-sample players</li>
            <li>
              Click <span className="font-bold">Calculate Percentiles</span> to lock in the baseline
            </li>
          </ol>
        </MiniStep>

        <MiniStep title="3. Import your player view CSV">
          <p>
            Export the specific players you want to evaluate (e.g. your scouting shortlist)
            using the same Stats View, then:
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Click <span className="font-bold">Choose CSV File</span> in the Player View section
            </li>
            <li>Select the exported CSV — the table populates immediately</li>
          </ol>
        </MiniStep>

        <MiniStep title="4. Configure weights">
          <p>
            Click <span className="font-bold">Weights</span> to open the weights panel. Select a
            role group (e.g. &quot;Striker&quot;, &quot;Box-to-Box&quot;) and adjust the importance of each
            stat group. Players are re-ranked live as you change weights.
          </p>
        </MiniStep>

        <MiniStep title="5. Read the table">
          <p>
            Players are sorted by their weighted percentile score. Click any player row to
            open a detail modal with a radar chart showing percentile breakdowns per stat group.
          </p>
        </MiniStep>
      </Step>

      <Step title="How it Works — Moneyball Mode" defaultOpen>
        <p>
          Moneyball mode applies a two-phase approach inspired by sabermetrics: build a
          reference distribution, then score targets against it.
        </p>

        <InfoBox label="Phase 1 — Percentile baseline">
          <p>
            For each stat tracked in the Stats View (goals/90, xG/90, key passes/90, press
            completions/90, etc.), the app calculates the <span className="font-bold">percentile rank</span> of
            every value across the baseline population. A player at the 80th percentile beats
            80 % of baseline players in that stat.
          </p>
          <p className="mt-2">
            Minimum minutes filtering is applied to the baseline only, so low-sample outliers
            don&apos;t skew the distribution. Target players are always scored regardless of minutes.
          </p>
        </InfoBox>

        <InfoBox label="Phase 2 — Weighted role scoring">
          <p>
            Stats are grouped into role-relevant buckets (e.g. &quot;Creation&quot;, &quot;Pressing&quot;,
            &quot;Shooting&quot;). Each group has a weight you control. The final score for a player is:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] p-3 font-mono text-xs">
            {`score = Σ (stat_percentile × group_weight × stat_multiplier)`}
          </pre>
          <p className="mt-2">
            Stat-level multipliers let you fine-tune within a group. All weights are integers;
            a group weight of 0 excludes that group entirely.
          </p>
        </InfoBox>

        <InfoBox label="Radar chart">
          <p>
            The per-player detail modal renders a polar chart with one axis per stat group.
            Each axis shows the player&apos;s average percentile within that group, making it easy
            to spot role fit at a glance.
          </p>
        </InfoBox>
      </Step>
    </div>
  );
}

function MustermannTab() {
  return (
    <div className="space-y-6">
      <Step title="How to Use — Mustermann Mode" defaultOpen>
        <p>
          Mustermann mode evaluates players using three composite scores — Control, Excitement,
          and Effort — derived from per-90 stats. It also adjusts for league strength via Opta
          power ratings.
        </p>

        <MiniStep title="1. Download and import the Stats View">
          <p className="mb-2">
            Mustermann mode uses the same Stats View as Moneyball:
          </p>
          <a
            href="/SCOUT%20REPORTER%20STATS%20V1.fmf"
            className="inline-flex items-center rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--alt))] px-4 py-2 text-sm font-bold text-[oklch(var(--background))] shadow-[2px_2px_0_oklch(var(--border))] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_oklch(var(--border))]"
          >
            Download Stats View
          </a>
          <p className="mt-2 text-xs text-[oklch(var(--text))]/65">
            See the Setup Guide tab for full install instructions.
          </p>
        </MiniStep>

        <MiniStep title="2. Configure Opta league ratings (optional)">
          <p>
            Click <span className="font-bold">Opta leagues</span> to view or adjust the power
            ratings assigned to each division. These ratings scale each player&apos;s scores to
            account for league difficulty — a goal in the Premier League is worth more than
            one in a lower division.
          </p>
        </MiniStep>

        <MiniStep title="3. Export and import players">
          <p>
            Export your target players from FM26 using the Stats View (F9), then in{" "}
            <Link
              href="/mustermann"
              className="font-bold text-[oklch(var(--primary))] underline decoration-2 underline-offset-2 hover:decoration-[oklch(var(--alt))]"
            >
              Mustermann Mode
            </Link>{" "}
            click <span className="font-bold">Choose CSV File</span> and select the export.
          </p>
          <p className="mt-2">
            The app expects per-90 stats in the export (Shot/90, KP/90, etc.). Make sure the
            Stats View is active in FM26 before pressing F9.
          </p>
        </MiniStep>

        <MiniStep title="4. Read the player cards">
          <p>
            Each player gets a card showing their <span className="font-bold">Control Score</span>,{" "}
            <span className="font-bold">Excitement Score</span>, and{" "}
            <span className="font-bold">Effort</span> rating alongside position group and
            asking price. Cards are grouped by position.
          </p>
        </MiniStep>
      </Step>

      <Step title="How it Works — Mustermann Mode" defaultOpen>
        <p>
          Mustermann mode computes three independent composite scores per player, each
          capturing a different dimension of on-pitch contribution.
        </p>

        <InfoBox label="Control Score">
          <p>
            Control measures how effectively a player dominates possession and creates / scores
            chances. It is the sum of four sub-indices:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><span className="font-bold">Creation index</span> — xA and open-play key passes/90</li>
            <li><span className="font-bold">Scoring index</span> — goals, xG, and shots/90</li>
            <li><span className="font-bold">Pressure index</span> — press completions and attempts/90</li>
            <li><span className="font-bold">Possession index</span> — possession won vs. lost rate</li>
          </ul>
          <p className="mt-2">
            Each sub-index is scaled to a common range. The final Control Score is the
            weighted sum of all four, then adjusted by the Opta league power rating.
          </p>
        </InfoBox>

        <InfoBox label="Excitement Score">
          <p>
            Excitement captures high-impact, crowd-pleasing actions: key tackles, shots
            blocked, progressive passes, dribbles, open-play key passes, and shots. A penalty
            is applied for high offside rates. The score is normalised against a league-average
            factor so players in stronger leagues don&apos;t get unfairly penalised.
          </p>
        </InfoBox>

        <InfoBox label="Effort Score">
          <p>
            Effort combines press attempts, press completions, and possession-won stats into a
            single rating that rewards high-work-rate players regardless of their creative or
            scoring output.
          </p>
        </InfoBox>

        <InfoBox label="Opta league adjustment">
          <p>
            Each division in FM26 is mapped to an Opta power rating. Stats from stronger
            leagues are weighted upward so a player&apos;s Control and Excitement scores reflect
            the quality of opposition faced. You can view and override ratings in the Opta
            leagues modal.
          </p>
        </InfoBox>

        <InfoBox label="Position grouping">
          <p>
            Players are grouped by their best position (GK, CB, FB, CM, AM, ST, W) using
            FM26&apos;s &quot;Best Pos&quot; column. Position groups determine which stat sub-indices are
            most relevant for context — e.g. Effort is weighted more heavily for defensive
            roles.
          </p>
        </InfoBox>
      </Step>
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "setup", label: "Setup Guide" },
  { id: "attribute", label: "Attribute" },
  { id: "moneyball", label: "Moneyball" },
  { id: "mustermann", label: "Mustermann" },
];

export default function HowToUsePage() {
  const [activeTab, setActiveTab] = useState<Tab>("setup");

  const headerInfo: Record<Tab, { title: string; description: string; link?: { href: string; label: string } }> = {
    setup: {
      title: "Setup Guide",
      description: "Follow these steps to export a player list from Football Manager 26 and import it into this app.",
      link: { href: "/attribute", label: "Go to the importer" },
    },
    attribute: {
      title: "Attribute Mode",
      description: "Score and rank players by a weighted average of their FM26 attributes — no baseline needed, just import and go.",
      link: { href: "/attribute", label: "Go to Attribute Mode" },
    },
    moneyball: {
      title: "Moneyball Mode",
      description: "Build percentile baselines from large player exports, then rank your targets using weighted role-group scores.",
      link: { href: "/moneyball", label: "Go to Moneyball" },
    },
    mustermann: {
      title: "Mustermann Mode",
      description: "Evaluate players with composite Control, Excitement, and Effort scores adjusted for league strength.",
      link: { href: "/mustermann", label: "Go to Mustermann" },
    },
  };

  const info = headerInfo[activeTab];

  return (
    <div className="min-h-screen bg-[oklch(var(--background))] text-[oklch(var(--text))]">
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <header className="space-y-3">
          <h1 className="text-4xl font-black uppercase tracking-tight">
            {info.title}
          </h1>
          <p className="text-sm text-[oklch(var(--text))/0.75]">
            {info.description}
          </p>
          {info.link && (
            <div className="text-sm">
              <Link
                href={info.link.href}
                className="font-bold text-[oklch(var(--primary))] underline decoration-2 underline-offset-2 hover:decoration-[oklch(var(--alt))]"
              >
                {info.link.label}
              </Link>
            </div>
          )}
        </header>

        {/* Tab bar */}
        <nav
          className="flex gap-1 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] p-1 shadow-[4px_4px_0_oklch(var(--border))]"
          aria-label="Page sections"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "flex-1 rounded-lg border-2 px-4 py-2 text-xs font-black uppercase tracking-wide transition-all",
                activeTab === tab.id
                  ? "border-[oklch(var(--border))] bg-[oklch(var(--primary))] text-[oklch(var(--background))] shadow-[2px_2px_0_oklch(var(--border))]"
                  : "border-transparent text-[oklch(var(--text))]/65 hover:border-[oklch(var(--border))]/50 hover:text-[oklch(var(--text))]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        {activeTab === "setup" && <SetupGuideTab />}
        {activeTab === "attribute" && <AttributeTab />}
        {activeTab === "moneyball" && <MoneyballTab />}
        {activeTab === "mustermann" && <MustermannTab />}
      </main>
    </div>
  );
}
