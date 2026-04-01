import { useMemo } from "react";
import { sweepBW } from "../model";

export default function SweepPanel({ r, eta, r_b, r_g }) {
  const { cells, betas, Rs } = useMemo(
    () => sweepBW(r, eta, r_b, r_g),
    [r, eta, r_b, r_g]
  );

  function cellColor(cell) {
    if (!cell || cell.type === "invalid") return "#f3f4f6";
    if (cell.type === "nobw") return "#e5e7eb";
    if (cell.patOK) return "#bbf7d0";
    return "#fca5a5";
  }

  const S = 18; // cell px

  return (
    <div style={card}>
      <div style={titleRow}>
        <span style={title}>Parameter Sweep</span>
        <span style={sub}>(β, R) — fixed r={r.toFixed(2)}, η={eta.toFixed(3)}</span>
      </div>
      <p style={caption}>
        Green = (BW) holds and patient welfare gain Δ ≥ 0 confirmed numerically.
        Grey = (BW) fails. Red = patient claim violated (should not appear).
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", marginBottom: 2, marginLeft: 32 }}>
            {Rs.filter((_, i) => i % 6 === 0).map((v) => (
              <div key={v} style={{ width: S * 6, fontSize: 9, color: "#666", textAlign: "center" }}>
                R={v}
              </div>
            ))}
          </div>
          {betas.map((beta, ib) => (
            <div key={ib} style={{ display: "flex", alignItems: "center" }}>
              {ib % 5 === 0
                ? <div style={{ width: 28, fontSize: 9, color: "#666", textAlign: "right", marginRight: 4 }}>β={beta}</div>
                : <div style={{ width: 32 }} />}
              {Rs.map((_, iR) => (
                <div key={iR}
                  title={`β=${betas[ib]}, R=${Rs[iR]}`}
                  style={{
                    width: S, height: S,
                    background: cellColor(cells[ib][iR]),
                    border: "0.5px solid rgba(0,0,0,0.06)",
                    boxSizing: "border-box",
                  }}
                />
              ))}
            </div>
          ))}
          <div style={{ marginLeft: 32, fontSize: 9, color: "#666", marginTop: 4 }}>
            R (1.05 → 3.5) →
          </div>
        </div>

        <div style={{ fontSize: 12 }}>
          {[
            ["#bbf7d0", "#86efac", "(BW) holds — patient Δ ≥ 0 ✓"],
            ["#e5e7eb", "#d1d5db", "(BW) fails — blocking not worthwhile"],
            ["#f3f4f6", "#d1d5db", "β+η ≥ 1 — invalid region"],
            ["#fca5a5", "#f87171", "Patient Δ < 0 — should not appear"],
          ].map(([bg, bd, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 14, height: 14, background: bg, border: `1px solid ${bd}`, borderRadius: 3 }} />
              <span style={{ color: "#444" }}>{label}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, fontSize: 11, color: "#777", maxWidth: 240, lineHeight: 1.6 }}>
            Uniformly green inside (BW) region confirms the patient preference result is robust across all β and R.
          </div>
        </div>
      </div>
    </div>
  );
}

const card = { background: "white", borderRadius: 10, padding: "16px 16px 12px", border: "1px solid #e5e7eb" };
const titleRow = { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 };
const title = { fontSize: 15, fontWeight: 700, fontFamily: "Georgia, serif" };
const sub = { fontSize: 12, color: "#666" };
const caption = { fontSize: 12, color: "#555", margin: "0 0 12px" };
