"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { DEFAULT_OPTA_RANK } from "./control-score";
import { decodeDivisionKey } from "./division-key";
import { useMoneyball } from "@/features/moneyball/MoneyballDataProvider";
import { lookupPowerRating } from "./opta-league-power-ratings";

export function MustermannOptaModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    discoveredDivisionKeys,
    optaRankings,
    setOptaRankForDivision,
    applyOptaPowerRatingDefaults,
  } = useMoneyball();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="League rankings"
      description={`Per competition, enter league ranking (1-99). Control Score uses ranking / 2.55 as league factor. Unknown leagues default to ${DEFAULT_OPTA_RANK}. Values persist across imports.`}
      size="xl"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Button type="button" color="alt" variant="solid" size="sm" onClick={() => applyOptaPowerRatingDefaults("gaps-only")}>
          Apply chart (fill gaps)
        </Button>
        <Button type="button" color="alt" variant="outline" size="sm" onClick={() => applyOptaPowerRatingDefaults("overwrite-matched")}>
          Re-apply matched leagues
        </Button>
      </div>
      <div className="max-h-[min(70vh,520px)] overflow-auto rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] shadow-[2px_2px_0_oklch(var(--border))]">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-[1] bg-[oklch(var(--surface))]">
            <tr className="border-b-2 border-[oklch(var(--border))]">
              <th className="px-3 py-2 text-left text-xs font-black uppercase tracking-wider">Based in</th>
              <th className="px-3 py-2 text-left text-xs font-black uppercase tracking-wider">Division</th>
              <th className="px-3 py-2 text-left text-xs font-black uppercase tracking-wider">Opta chart</th>
              <th className="px-3 py-2 text-left text-xs font-black uppercase tracking-wider">League ranking</th>
            </tr>
          </thead>
          <tbody>
            {discoveredDivisionKeys.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-xs text-[oklch(var(--text))]/65">
                  Import baseline or player CSV to list leagues.
                </td>
              </tr>
            ) : (
              discoveredDivisionKeys.map((key) => {
                const { basedIn, division } = decodeDivisionKey(key);
                const chartPr = lookupPowerRating(basedIn, division);
                const stored = optaRankings[key];
                const matchesChart = chartPr != null && stored !== undefined && Math.abs(stored - chartPr) < 1e-6;
                return (
                  <tr key={key} className="border-b border-[oklch(var(--border))]/60">
                    <td className="px-3 py-2 font-mono text-xs">{basedIn || "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs">{division || "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs text-[oklch(var(--text))]/80">
                      {chartPr != null ? (
                        <span className="font-bold text-[oklch(var(--text))]">
                          {chartPr.toFixed(1)}
                          {matchesChart ? (
                            <span className="ml-1 text-[10px] font-black uppercase tracking-wide text-[oklch(var(--alt))]">· applied</span>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-[oklch(var(--text))]/50">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0.01}
                        step={0.1}
                        placeholder={`default ${DEFAULT_OPTA_RANK}`}
                        className="w-full max-w-[140px] rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 font-mono text-xs font-bold shadow-[2px_2px_0_oklch(var(--border))]"
                        value={stored === undefined ? "" : String(stored)}
                        onChange={(e) => {
                          const raw = e.target.value.trim();
                          if (raw === "") {
                            setOptaRankForDivision(key, null);
                            return;
                          }
                          const n = Number(raw);
                          if (!Number.isFinite(n) || n <= 0) return;
                          setOptaRankForDivision(key, n);
                        }}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="button" color="primary" variant="solid" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}
