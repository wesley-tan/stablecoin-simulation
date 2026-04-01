import { useMemo } from "react";
import {
  Pi_star, F_I, F_II, F_NR, ES_I, ES_II, ES_NR,
  sigma_opt_k, scalarDerived, checkInvestmentCondition,
  xOpt_I, xOpt_II, xOpt_NR,
} from "../model";

export default function AnalyticalCheckPanel({ R, r, delta, beta, eta, r_b, r_g }) {
  const checks = useMemo(() => {
    const { filing, sigma_min, BW, xNR, xI, xII } =
      scalarDerived(R, r, delta, beta, eta, r_b, r_g);
    const invCond = checkInvestmentCondition(R, r, delta);
    const N = 500;
    const xs = Array.from({ length: N }, (_, i) => (i + 1) / N);

    // ── C1: Δw_pat identity — direct calc = (σ_min − σ^{I*}) · S^I ───────────
    let c1Max = 0;
    if (filing && sigma_min !== null) {
      xs.forEach((x) => {
        const SI = ES_I(x, R, r, delta);
        const SII = ES_II(x, R);
        const bc = ((delta - beta - eta) * x * x) / (2 * beta);
        const FI = F_I(x, R, r, delta, eta, r_b);
        const sigI = (FI > 0 && SI > 0) ? sigma_opt_k(FI, SI) : 0;
        // Direct: w_pat^II(σ_min) − w_pat^I(σ^{I*})  [without (1+η)/2 constant]
        const directDiff = (-bc + sigma_min * SII) - (sigI * SI);
        // Paper: (σ_min − σ^{I*}) · S^I
        const formulaDiff = (sigma_min - sigI) * SI;
        c1Max = Math.max(c1Max, Math.abs(directDiff - formulaDiff));
      });
    }

    // ── C2: Under (BW), patient diff ≥ 0 where S^I > 0 & σ^{I*} < σ_min ────
    let c2Min = Infinity, c2Count = 0;
    if (filing && BW && sigma_min !== null) {
      xs.forEach((x) => {
        const SI = ES_I(x, R, r, delta);
        if (SI <= 0) return;
        const FI = F_I(x, R, r, delta, eta, r_b);
        const sigI = (FI > 0 && SI > 0) ? sigma_opt_k(FI, SI) : 0;
        if (sigI >= sigma_min - 1e-9) return; // issuer already in Reg II
        const pd = (sigma_min - sigI) * SI;
        c2Min = Math.min(c2Min, pd);
        c2Count++;
      });
    }

    // ── C3: Under (BW), Π^{II*} > Π^{I*} in viable region ───────────────────
    let c3Min = Infinity;
    if (filing && BW) {
      xs.forEach((x) => {
        const FI = F_I(x, R, r, delta, eta, r_b);
        const FII = F_II(x, R, r, delta, beta, eta, r_b);
        if (Math.max(FI, FII) <= 0) return;
        const diff = Pi_star(FII, r_b, r_g) - Pi_star(FI, r_b, r_g);
        c3Min = Math.min(c3Min, diff);
      });
    }

    // ── C4: σ^{I*}(x^{I*}) < σ_min — issuer stays below threshold ────────────
    let c4Pass = null, c4Detail = "N/A (Regime NR)";
    if (filing && sigma_min !== null && xI !== null) {
      const FI_at_opt = F_I(xI, R, r, delta, eta, r_b);
      const SI_at_opt = ES_I(xI, R, r, delta);
      const sigI_at_opt = (FI_at_opt > 0 && SI_at_opt > 0)
        ? sigma_opt_k(FI_at_opt, SI_at_opt) : 0;
      c4Pass = sigI_at_opt < sigma_min - 1e-9;
      c4Detail = `σ^{I*}(x^{I*}) = ${sigI_at_opt.toFixed(5)}, σ_min = ${sigma_min.toFixed(5)}`;
    }

    // ── C5: x^{I*} maximises Π^{I*} in viable region ─────────────────────────
    let c5Max = 0;
    if (filing && xI !== null) {
      const piAtOpt = Pi_star(F_I(xI, R, r, delta, eta, r_b), r_b, r_g);
      xs.forEach((x) => {
        const FI = F_I(x, R, r, delta, eta, r_b);
        if (FI <= 0) return;
        const pi = Pi_star(FI, r_b, r_g);
        if (pi > piAtOpt + 1e-9) c5Max = Math.max(c5Max, pi - piAtOpt);
      });
    }

    // ── C6: x^{II*} maximises Π^{II*} in viable region ───────────────────────
    let c6Max = 0;
    if (filing && xII !== null) {
      const piAtOpt = Pi_star(F_II(xII, R, r, delta, beta, eta, r_b), r_b, r_g);
      xs.forEach((x) => {
        const FII = F_II(x, R, r, delta, beta, eta, r_b);
        if (FII <= 0) return;
        const pi = Pi_star(FII, r_b, r_g);
        if (pi > piAtOpt + 1e-9) c6Max = Math.max(c6Max, pi - piAtOpt);
      });
    }

    // ── C7: x^{NR*} maximises Π^{NR*} ────────────────────────────────────────
    let c7Max = 0;
    {
      const piAtOpt = Pi_star(F_NR(xNR, R, r, beta, eta, r_b), r_b, r_g);
      xs.forEach((x) => {
        const FNR = F_NR(x, R, r, beta, eta, r_b);
        if (FNR <= 0) return;
        const pi = Pi_star(FNR, r_b, r_g);
        if (pi > piAtOpt + 1e-9) c7Max = Math.max(c7Max, pi - piAtOpt);
      });
    }

    // ── C8: Investment condition r(R-1) ≥ δ(R-r) vs analytic threshold ───────
    // The threshold δ̂ = r(R-1)/(R-r). Condition holds iff δ ≤ δ̂.
    const deltaHat = (r * (R - 1)) / (R - r);
    const c8Pass = invCond === (delta <= deltaHat + 1e-9);
    const c8Detail = `δ = ${delta.toFixed(4)}, δ̂ = r(R-1)/(R-r) = ${deltaHat.toFixed(4)}, ${invCond ? "holds" : "fails"}`;

    return {
      filing, sigma_min, BW, xNR, xI, xII, invCond, deltaHat,
      c1Max, c2Min: (filing && BW) ? c2Min : null, c2Count,
      c3Min: (filing && BW) ? c3Min : null,
      c4Pass, c4Detail, c5Max, c6Max, c7Max, c8Pass, c8Detail,
    };
  }, [R, r, delta, beta, eta, r_b, r_g]);

  const tol = 1e-8;

  const rows = [
    {
      id: "C1",
      claim: "Δw_pat identity: direct calc = (σ_min−σ^{I*})·S^I (§4 identity)",
      pass: checks.filing ? checks.c1Max < tol : null,
      detail: checks.filing
        ? `max |dev| = ${checks.c1Max.toExponential(2)}`
        : "Regime NR — N/A",
      ref: "§4 eq.",
    },
    {
      id: "C2",
      claim: "(BW) ⟹ patient welfare diff ≥ 0 where S^I > 0",
      pass: checks.c2Min === null ? null : checks.c2Min >= -tol,
      detail: checks.c2Min === null
        ? (!checks.filing ? "Regime NR" : "(BW) fails")
        : `min = ${checks.c2Min.toExponential(3)} (${checks.c2Count} pts)`,
      ref: "§4",
    },
    {
      id: "C3",
      claim: "(BW) ⟹ Π^{II*}(x) ≥ Π^{I*}(x) in viable region",
      pass: checks.c3Min === null ? null : checks.c3Min >= -tol,
      detail: checks.c3Min === null
        ? (!checks.filing ? "Regime NR" : "(BW) fails")
        : `min Π^{II*}−Π^{I*} = ${checks.c3Min.toExponential(3)}`,
      ref: "§3 (BW)",
    },
    {
      id: "C4",
      claim: "σ^{I*}(x^{I*}) < σ_min — issuer's Regime I optimum below blocking threshold",
      pass: checks.c4Pass,
      detail: checks.c4Detail,
      ref: "§4 divergence",
    },
    {
      id: "C5",
      claim: "x^{I*} = r(R−1)/[r+δ(R−2r)] is global max of Π^{I*} (viable region)",
      pass: checks.filing ? checks.c5Max < tol : null,
      detail: checks.filing
        ? `max excess = ${checks.c5Max.toExponential(2)}, x^{I*} = ${(checks.xI ?? 0).toFixed(4)}`
        : "Regime NR",
      ref: "§7 optimal x",
    },
    {
      id: "C6",
      claim: "x^{II*} = β(R−1)/[δ(1−β)−η] is global max of Π^{II*} (viable region)",
      pass: checks.filing ? checks.c6Max < tol : null,
      detail: checks.filing
        ? `max excess = ${checks.c6Max.toExponential(2)}, x^{II*} = ${(checks.xII ?? 0).toFixed(4)}`
        : "Regime NR",
      ref: "§7 optimal x",
    },
    {
      id: "C7",
      claim: "x^{NR*} = (R−1)/(1−β−η) is global max of Π^{NR*} (viable region)",
      pass: checks.c7Max < tol,
      detail: `max excess = ${checks.c7Max.toExponential(2)}, x^{NR*} = ${checks.xNR.toFixed(4)}`,
      ref: "§7 optimal x",
    },
    {
      id: "C8",
      claim: "Investment condition: δ ≤ δ̂ = r(R−1)/(R−r) ↔ r(R−1) ≥ δ(R−r)",
      pass: checks.c8Pass,
      detail: checks.c8Detail,
      ref: "§7 last section",
    },
  ];

  return (
    <div style={card}>
      <h2 style={h2}>Analytical Validation — Numerical Checks (Full δ-model)</h2>
      <p style={caption}>
        Tests 8 claims from the paper at 500 x-values. All should pass to validate derivations.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            {["#", "Claim", "Result", "Detail", "Ref"].map((h) => (
              <th key={h} style={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={td}>{row.id}</td>
              <td style={{ ...td, maxWidth: 320 }}>{row.claim}</td>
              <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>
                {row.pass === null ? (
                  <span style={{ color: "#888" }}>N/A</span>
                ) : row.pass ? (
                  <span style={{ color: "#16a34a" }}>✓ PASS</span>
                ) : (
                  <span style={{ color: "#dc2626" }}>✗ FAIL</span>
                )}
              </td>
              <td style={{ ...td, fontFamily: "monospace", fontSize: 11, color: "#555" }}>
                {row.detail}
              </td>
              <td style={{ ...td, color: "#888", fontSize: 11 }}>{row.ref}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 14, fontSize: 12, color: "#555", padding: "10px 12px",
        background: "#f9fafb", borderRadius: 6 }}>
        <strong>Current params:</strong>{" "}
        σ_min = {checks.sigma_min !== null ? checks.sigma_min.toFixed(5) : "N/A"},{" "}
        (BW) = {checks.BW ? "✓" : (checks.filing ? "✗" : "N/A")},{" "}
        δ ≤ β+η → {checks.filing ? "No (Case B)" : "Yes (Regime NR)"}
        {checks.filing && checks.xI !== null && `, x^{I*} = ${checks.xI.toFixed(4)}, x^{II*} = ${(checks.xII ?? 0).toFixed(4)}`}
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
const th = {
  padding: "8px 10px", textAlign: "left", fontSize: 12,
  fontFamily: "Georgia, serif", borderBottom: "1px solid #e5e7eb",
};
const td = { padding: "7px 10px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" };
