import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Legend, ResponsiveContainer,
} from "recharts";
import ChartTooltip from "../components/ChartTooltip";
import { checkInvestmentCondition, xOpt_I, xOpt_II, xOpt_NR, fmt } from "../model";

/**
 * Shows:
 *   1. The marginal-deferral slope (R-1) - δ(R-r)/r as a function of δ (for fixed R, r).
 *      The condition r(R-1) ≥ δ(R-r) is equivalent to this slope ≥ 0.
 *   2. A 2-D heat-map over (δ, R) showing where r(R-1) ≥ δ(R-r) holds/fails.
 *   3. Optimal x^{k*} curves as a function of δ.
 */
export default function InvestmentConditionPanel({ R, r, delta, beta, eta }) {
  const holds = checkInvestmentCondition(R, r, delta);
  const lhs = r * (R - 1);
  const rhs = delta * (R - r);

  // ── Panel A: marginal deferral slope across δ ─────────────────────────────
  const slopeData = useMemo(() => {
    const pts = [];
    for (let i = 1; i <= 100; i++) {
      const d = 0.01 + (i / 100) * 0.98;
      const slope = (R - 1) - (d * (R - r)) / r;
      pts.push({ delta: fmt(d, 3), slope: fmt(slope, 4) });
    }
    return pts;
  }, [R, r]);

  // ── Panel B: optimal x^{k*} as function of δ ─────────────────────────────
  const xOptData = useMemo(() => {
    const pts = [];
    for (let i = 1; i <= 100; i++) {
      const d = 0.01 + (i / 100) * 0.98;
      const xI = beta + eta < 1 && d > beta + eta ? xOpt_I(R, r, d) : null;
      const xII = beta + eta < 1 && d > beta + eta ? xOpt_II(R, d, beta, eta) : null;
      const xNR = xOpt_NR(R, beta, eta);
      pts.push({
        delta: fmt(d, 3),
        xI_opt: xI !== null ? fmt(xI, 4) : null,
        xII_opt: xII !== null ? fmt(xII, 4) : null,
        xNR_opt: fmt(xNR, 4),
      });
    }
    return pts;
  }, [R, r, beta, eta]);

  // ── Panel C: heat-map over (δ, R) ─────────────────────────────────────────
  const { grid, deltas, Rs } = useMemo(() => {
    const nD = 30, nR = 30;
    const deltas = Array.from({ length: nD }, (_, i) => 0.05 + (i / (nD - 1)) * 0.9);
    const Rs = Array.from({ length: nR }, (_, i) => 1.05 + (i / (nR - 1)) * 2.95);
    const grid = deltas.map((d) =>
      Rs.map((Rv) => ({
        holds: checkInvestmentCondition(Rv, r, d),
        xI: d > beta + eta ? fmt(xOpt_I(Rv, r, d), 3) : null,
      }))
    );
    return { grid, deltas, Rs };
  }, [r, beta, eta]);

  const cellSize = 20;

  return (
    <div style={card}>
      <h2 style={h2}>Investment Condition — Where does r(R−1) ≥ δ(R−r) Hold?</h2>
      <p style={caption}>
        When the deferral-region marginal profit (1−σ)[R−1 − δ(R−r)/r] is positive,
        x* = 1 is optimal. Below: r(R−1) = {lhs.toFixed(4)}, δ(R−r) = {rhs.toFixed(4)}.{" "}
        Condition is currently{" "}
        <strong style={{ color: holds ? "#16a34a" : "#dc2626" }}>
          {holds ? "✓ satisfied (x* = 1)" : "✗ violated (x* < 1)"}
        </strong>.
        {!holds && (
          <span> Interior optima: x<sup>I*</sup> = {xOpt_I(R, r, delta).toFixed(4)},
            {" "}x<sup>II*</sup> = {xOpt_II(R, delta, beta, eta).toFixed(4)}.</span>
        )}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Panel A: marginal slope vs δ */}
        <div>
          <div style={subTitle}>Marginal deferral slope vs δ (fixed R={R.toFixed(2)}, r={r.toFixed(2)})</div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>
            slope = (R−1) − δ(R−r)/r. Positive ↔ x*=1. Zero crossing marks the threshold δ̂.
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={slopeData} margin={{ top: 5, right: 16, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="delta" tick={{ fontSize: 10 }}
                label={{ value: "δ", position: "insideBottomRight", offset: -4, fontSize: 12 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#333" strokeWidth={1.5} />
              <ReferenceLine x={fmt(delta, 3)} stroke="#2563eb" strokeDasharray="3 3"
                label={{ value: "current δ", fontSize: 9, position: "top" }} />
              <Line type="monotone" dataKey="slope" stroke="#dc2626" strokeWidth={2}
                dot={false} name="R−1 − δ(R−r)/r" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Panel B: optimal x vs δ */}
        <div>
          <div style={subTitle}>Optimal x<sup>k*</sup> vs δ (capped at 1)</div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>
            Interior optima derived from dF<sup>k</sup>/dx = 0. Equals 1 when condition holds.
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={xOptData} margin={{ top: 5, right: 16, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="delta" tick={{ fontSize: 10 }}
                label={{ value: "δ", position: "insideBottomRight", offset: -4, fontSize: 12 }} />
              <YAxis domain={[0, 1.05]} tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine y={1} stroke="#888" strokeDasharray="3 3"
                label={{ value: "x=1", fontSize: 9, position: "insideTopLeft" }} />
              <ReferenceLine x={fmt(delta, 3)} stroke="#888" strokeDasharray="3 3"
                label={{ value: "current δ", fontSize: 9, position: "top" }} />
              <Line type="monotone" dataKey="xI_opt" stroke="#2563eb" strokeWidth={2}
                dot={false} name="x^{I*}" connectNulls={false} />
              <Line type="monotone" dataKey="xII_opt" stroke="#dc2626" strokeWidth={2}
                dot={false} name="x^{II*}" connectNulls={false} />
              <Line type="monotone" dataKey="xNR_opt" stroke="#94a3b8" strokeWidth={1.5}
                strokeDasharray="4 2" dot={false} name="x^{NR*}" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Panel C: heat-map */}
      <div style={subTitle}>Heat-map: r(R−1) ≥ δ(R−r) across (δ, R) — fixed r = {r.toFixed(2)}</div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>
        Green = condition holds (x*=1). Red = violated (interior optimum x* &lt; 1).
        The diagonal threshold δ̂(R) = r(R−1)/(R−r) is the boundary.
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex" }}>
            <div style={{ width: 36, fontSize: 9, color: "#888", writingMode: "vertical-rl",
              transform: "rotate(180deg)", textAlign: "center", marginRight: 4 }}>
              δ →
            </div>
            <div>
              <div style={{ display: "flex", marginBottom: 2 }}>
                {Rs.filter((_, i) => i % 5 === 0).map((Rv) => (
                  <div key={Rv} style={{ width: cellSize * 5, fontSize: 9, color: "#666", textAlign: "center" }}>
                    R={Rv.toFixed(1)}
                  </div>
                ))}
              </div>
              {deltas.map((d, id) => (
                <div key={id} style={{ display: "flex", alignItems: "center" }}>
                  {id % 5 === 0 ? (
                    <div style={{ width: 28, fontSize: 9, color: "#666", textAlign: "right", marginRight: 3 }}>
                      {d.toFixed(2)}
                    </div>
                  ) : <div style={{ width: 31 }} />}
                  {Rs.map((_, iR) => {
                    const cell = grid[id][iR];
                    const isCurrent = Math.abs(d - delta) < 0.03 && Math.abs(Rs[iR] - R) < 0.1;
                    return (
                      <div
                        key={iR}
                        title={`δ=${d.toFixed(3)}, R=${Rs[iR].toFixed(3)}: ${cell.holds ? "holds" : "fails"}, x^{I*}=${cell.xI ?? "NR"}`}
                        style={{
                          width: cellSize, height: cellSize,
                          background: cell.holds ? "#bbf7d0" : "#fecaca",
                          border: isCurrent ? "2px solid #1a56db" : "0.5px solid rgba(0,0,0,0.08)",
                          cursor: "default",
                          boxSizing: "border-box",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginLeft: 40, fontSize: 10, color: "#666", marginTop: 4 }}>R (1.05 → 4.0) →</div>
        </div>

        <div style={{ fontSize: 12, lineHeight: 2 }}>
          <div style={{ fontWeight: 600, marginBottom: 6, fontFamily: "Georgia, serif" }}>Legend</div>
          {[
            ["#bbf7d0", "r(R−1) ≥ δ(R−r) holds → x* = 1"],
            ["#fecaca", "condition fails → interior x* < 1"],
          ].map(([col, label]) => (
            <div key={col} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, background: col, border: "1px solid #ccc",
                borderRadius: 3, flexShrink: 0 }} />
              <span style={{ color: "#444" }}>{label}</span>
            </div>
          ))}
          <p style={{ marginTop: 10, fontSize: 11, color: "#777", maxWidth: 280 }}>
            The red region is where the marginal-deferral profit is negative: the issuer prefers
            to hold back investment to avoid triggering costly fire sales. For high δ (generous
            legal recovery) and low R (thin illiquid premium), this is very common.
          </p>
          <p style={{ fontSize: 11, color: "#555", maxWidth: 280 }}>
            Threshold: δ̂ = r(R−1)/(R−r). Current δ = {delta.toFixed(3)}, δ̂ = {(r*(R-1)/(R-r)).toFixed(3)}.
          </p>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "white", borderRadius: 10, padding: "16px 14px 16px",
  marginBottom: 20, border: "1px solid #e5e7eb",
};
const h2 = { fontSize: 14, marginBottom: 6, marginLeft: 4, fontFamily: "Georgia, serif" };
const caption = { fontSize: 12, color: "#555", marginLeft: 4, marginBottom: 12, marginTop: 0 };
const subTitle = { fontSize: 12, fontWeight: 600, marginLeft: 4, marginBottom: 4, color: "#444" };
