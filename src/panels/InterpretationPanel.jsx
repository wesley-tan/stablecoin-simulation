export default function InterpretationPanel({
  R, r, delta, beta, eta, r_b, r_g,
  BW, xC, xI, xII, xNR, sigma_min, filing, invCond,
}) {
  const bwLHS = (beta * delta * (R - r)).toFixed(4);
  const bwRHS = ((delta - beta - eta) * r).toFixed(4);
  const invLHS = (r * (R - 1)).toFixed(4);
  const invRHS = (delta * (R - r)).toFixed(4);
  const deltaHat = (r * (R - 1) / (R - r)).toFixed(4);

  return (
    <div style={card}>
      <h2 style={h2}>Interpretation — Full δ-Model</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
        {/* Regime indicator */}
        <div style={{ ...block, background: filing ? "#fef9c3" : "#f0fdf4",
          borderColor: filing ? "#fbbf24" : "#86efac" }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: filing ? "#92400e" : "#15803d" }}>
            {filing ? "Case B — δ > β+η" : "Case A / Regime NR — δ ≤ β+η"}
          </div>
          <div style={{ fontSize: 12, color: "#444" }}>
            δ = {delta.toFixed(4)}, β+η = {(beta + eta).toFixed(4)}.{" "}
            {filing ? "Filing is a threat — σ_min binding." : "No filing threat. σ_min irrelevant."}
          </div>
        </div>

        {/* Condition (BW) */}
        <div style={{ ...block, background: BW ? "#f0fdf4" : "#fef2f2",
          borderColor: BW ? "#86efac" : "#fca5a5" }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: BW ? "#15803d" : "#dc2626" }}>
            Condition (BW) {BW ? "✓ holds" : !filing ? "N/A" : "✗ fails"}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 11 }}>
            βδ(R−r) = {bwLHS} {BW ? ">" : "≤"} (δ−β−η)r = {bwRHS}
          </div>
          <div style={{ fontSize: 11, marginTop: 4, color: "#555" }}>
            {BW ? "Blocking saves more in fire sales than it costs in bribes." :
             filing ? "Bribe cost exceeds fire-sale saving." : "Not applicable."}
          </div>
        </div>

        {/* Investment condition */}
        <div style={{ ...block, background: invCond ? "#f0fdf4" : "#fef2f2",
          borderColor: invCond ? "#86efac" : "#fca5a5" }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: invCond ? "#15803d" : "#dc2626" }}>
            r(R−1) ≥ δ(R−r){" "}
            {invCond ? "✓ x*=1" : "✗ x*<1"}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 11 }}>
            {invLHS} {invCond ? "≥" : "<"} {invRHS}
          </div>
          <div style={{ fontSize: 11, marginTop: 4, color: "#555" }}>
            δ̂ = r(R−1)/(R−r) = {deltaHat}.{" "}
            {invCond
              ? "Full investment is optimal in every regime."
              : `Interior optima: x^{I*}=${(xI ?? 0).toFixed(3)}, x^{II*}=${(xII ?? 0).toFixed(3)}.`}
          </div>
        </div>
      </div>

      {filing && (
        <>
          <p style={para}>
            <strong>σ_min = {sigma_min?.toFixed(5)}.</strong>{" "}
            Formula: σ_min = (δ−β−η)r / [βδ(R−r)]. At this threshold, stayers are exactly
            indifferent between funding the bribe and letting deferred investors file.
            Below σ_min: Regime I (filing). At or above: Regime II (blocking).
          </p>

          {xC ? (
            <p style={para}>
              <strong>Crossover x_C = {xC.toFixed(4)}.</strong>{" "}
              For x ∈ (0, {xC.toFixed(3)}): issuer prefers Regime I while patients prefer
              Regime II — the divergence region.{" "}
              For x ≥ {xC.toFixed(3)}: both prefer Regime II (aligned region).
            </p>
          ) : (
            <p style={para}>No crossover found in (0, 1].</p>
          )}

          <p style={para}>
            <strong>Optimal portfolios.</strong>{" "}
            x<sup>I*</sup> = r(R−1)/[r+δ(R−2r)] = {(xI ?? 0).toFixed(4)},{" "}
            x<sup>II*</sup> = β(R−1)/[δ(1−β)−η] = {(xII ?? 0).toFixed(4)},{" "}
            x<sup>NR*</sup> = (R−1)/(1−β−η) = {xNR.toFixed(4)}.
            {xC && xI !== null && xI < xC
              ? ` x^{I*} = ${xI.toFixed(3)} lies inside the divergence region — core conflict.`
              : " x^{I*} lies in the aligned region."}
          </p>
        </>
      )}

      <div style={{ ...block, background: "#f8fafc", borderColor: "#e2e8f0", marginTop: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 8, fontFamily: "Georgia, serif" }}>
          Regime Summary (§5–§6)
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              {["Regime", "Condition", "Equilibrium", "Per-dep. welfare E[w]"].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["NR", "δ ≤ β+η", "σ*_{NR}, x*=1",
                `(1+β)/2 + η + (R−1)`],
              ["I", "δ>β+η, σ<σ_min", "σ*_I, x^{I*}",
                `(1+δ)/2 + η/2 + (R−1) − δ(R−r)/(2r)`],
              ["II", "δ>β+η, σ≥σ_min", "σ*_II, x^{II*}",
                `(1+δ)/2 + η/2 + (R−1) − (δ−β−η)/(2β)`],
            ].map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                {row.map((cell, j) => <td key={j} style={td}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...block, background: "#f8fafc", borderColor: "#e2e8f0", marginTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8, fontFamily: "Georgia, serif" }}>
          Investment Condition Analysis
        </div>
        <p style={{ fontSize: 12, margin: 0, color: "#444", lineHeight: 1.7 }}>
          The condition r(R−1) ≥ δ(R−r) is equivalent to δ ≤ δ̂ = r(R−1)/(R−r) = {deltaHat}.
          When it <strong>holds</strong>, the marginal-deferral profit (1−σ)[R−1−δ(R−r)/r] ≥ 0
          so increasing x always raises profit — x*=1. When it <strong>fails</strong>,
          the issuer pulls back investment to limit costly fire-sale liquidations:
          {" "}x<sup>I*</sup> = {(xI ?? 0).toFixed(4)} &lt; 1.
          The condition is most likely to fail when δ is high (generous courts) or R is low
          (thin illiquid premium). The boundary δ̂ is decreasing in R and increasing in r.
        </p>
      </div>
    </div>
  );
}

const card = {
  background: "white", borderRadius: 10, padding: "20px 18px",
  marginBottom: 20, border: "1px solid #e5e7eb",
};
const h2 = { fontSize: 14, marginBottom: 10, fontFamily: "Georgia, serif" };
const block = { padding: "12px 14px", borderRadius: 8, border: "1px solid" };
const para = { fontSize: 13, lineHeight: 1.7, color: "#333", margin: "10px 0" };
const th = {
  padding: "7px 10px", textAlign: "left", fontSize: 11,
  fontFamily: "Georgia, serif", borderBottom: "1px solid #e5e7eb",
};
const td = { padding: "6px 10px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top", fontSize: 12 };
