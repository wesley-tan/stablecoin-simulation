import { useMemo } from "react";
import {
  scalarDerived, Pi_star, F_I, F_II, ES_I,
  sigma_opt_k, computeSigmaMin, checkBW,
} from "../model";

export default function SweepPanel({ r, delta, eta, r_b, r_g }) {
  const { cells, betas, Rs } = useMemo(() => {
    const nBeta = 25, nR = 25;
    const betas = Array.from({ length: nBeta }, (_, i) => 0.05 + (i / (nBeta - 1)) * 0.8);
    const Rs = Array.from({ length: nR }, (_, i) => 1.1 + (i / (nR - 1)) * 2.4);

    const cells = betas.map((beta) =>
      Rs.map((R) => {
        // Validity
        if (beta + eta >= 1) return { BW: false, patOK: null, piOK: null };
        // Regime NR?
        if (delta <= beta + eta) return { BW: false, patOK: null, piOK: null, isNR: true };

        const sigma_min = computeSigmaMin(delta, beta, eta, r, R);
        if (sigma_min === null || sigma_min < 0 || sigma_min > 1) {
          return { BW: false, patOK: null, piOK: null };
        }
        const BW = checkBW(delta, beta, eta, r, R);
        if (!BW) return { BW: false, patOK: null, piOK: null };

        let patOK = true, piOK = true;
        for (let i = 1; i <= 80; i++) {
          const x = i / 80;
          const SI = ES_I(x, R, r, delta);
          const FI = F_I(x, R, r, delta, eta, r_b);
          const FII = F_II(x, R, r, delta, beta, eta, r_b);

          if (SI > 0) {
            const sigI = (FI > 0 && SI > 0) ? sigma_opt_k(FI, SI) : 0;
            if (sigI < sigma_min - 1e-9) {
              const pd = (sigma_min - sigI) * SI;
              if (pd < -1e-9) patOK = false;
            }
          }
          if (Math.max(FI, FII) > 0) {
            const piII = Pi_star(FII, r_b, r_g);
            const piI = Pi_star(FI, r_b, r_g);
            if (piII < piI - 1e-9) piOK = false;
          }
        }
        return { BW: true, patOK, piOK };
      })
    );
    return { cells, betas: betas.map((b) => b.toFixed(3)), Rs: Rs.map((v) => v.toFixed(3)) };
  }, [r, delta, eta, r_b, r_g]);

  const cellSize = 22;

  function cellColor(cell) {
    if (cell?.isNR) return "#e0f2fe";           // light blue: Regime NR
    if (!cell?.BW) return "#e5e7eb";             // grey: (BW) fails
    if (cell.patOK && cell.piOK) return "#bbf7d0"; // green: validated
    if (cell.patOK && !cell.piOK) return "#fef08a"; // yellow
    return "#fca5a5";                              // red: patient claim fails
  }

  return (
    <div style={card}>
      <h2 style={h2}>Parameter Sweep — Robustness Across (β, R)</h2>
      <p style={caption}>
        Fixed r = {r.toFixed(2)}, δ = {delta.toFixed(3)}, η = {eta.toFixed(3)},
        r_b = {r_b.toFixed(2)}, r_g = {r_g.toFixed(2)}.
        Each cell runs 80 x-values and checks both the patient welfare and Π<sup>II*</sup> &gt; Π<sup>I*</sup> claims.
      </p>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex" }}>
            <div style={{ width: 48, fontSize: 10, color: "#888", writingMode: "vertical-rl",
              transform: "rotate(180deg)", textAlign: "center", marginRight: 4 }}>
              β →
            </div>
            <div>
              <div style={{ display: "flex", marginBottom: 2 }}>
                {Rs.filter((_, i) => i % 5 === 0).map((Rv) => (
                  <div key={Rv} style={{ width: cellSize * 5, fontSize: 9, color: "#666", textAlign: "center" }}>
                    R={Rv}
                  </div>
                ))}
              </div>
              {betas.map((beta, ib) => (
                <div key={ib} style={{ display: "flex", alignItems: "center" }}>
                  {ib % 5 === 0 ? (
                    <div style={{ width: 30, fontSize: 9, color: "#666", textAlign: "right", marginRight: 3 }}>
                      {beta}
                    </div>
                  ) : <div style={{ width: 33 }} />}
                  {Rs.map((_, iR) => {
                    const cell = cells[ib][iR];
                    return (
                      <div
                        key={iR}
                        title={`β=${beta}, R=${Rs[iR]}: BW=${cell?.BW}, pat=${cell?.patOK}, pi=${cell?.piOK}`}
                        style={{
                          width: cellSize, height: cellSize,
                          background: cellColor(cell),
                          border: "0.5px solid rgba(0,0,0,0.06)",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginLeft: 48, fontSize: 10, color: "#666", marginTop: 4 }}>
            R (1.1 → 3.5) →
          </div>
        </div>

        <div style={{ fontSize: 12, lineHeight: 2.1 }}>
          <div style={{ fontWeight: 600, marginBottom: 6, fontFamily: "Georgia, serif" }}>Legend</div>
          {[
            ["#e0f2fe", "Regime NR (δ ≤ β+η) — no filing threat"],
            ["#e5e7eb", "(BW) fails — no blocking incentive"],
            ["#bbf7d0", "(BW) holds, all claims validated ✓"],
            ["#fef08a", "(BW) holds, patient ✓ but Π^{II*} fails"],
            ["#fca5a5", "(BW) holds but patient claim fails"],
          ].map(([col, label]) => (
            <div key={col} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, background: col,
                border: "1px solid #ccc", borderRadius: 3, flexShrink: 0 }} />
              <span style={{ color: "#444" }}>{label}</span>
            </div>
          ))}
          <p style={{ marginTop: 10, fontSize: 11, color: "#777", maxWidth: 300 }}>
            Green everywhere inside the (BW) region confirms the paper's claims are robust to
            β and R. Any non-green cell in the (BW) region indicates a counterexample.
          </p>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "white", borderRadius: 10, padding: "16px 14px 12px",
  marginBottom: 20, border: "1px solid #e5e7eb",
};
const h2 = { fontSize: 14, marginBottom: 6, marginLeft: 4, fontFamily: "Georgia, serif" };
const caption = { fontSize: 12, color: "#555", marginLeft: 4, marginBottom: 12, marginTop: 0 };
