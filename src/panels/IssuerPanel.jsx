import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ReferenceArea, ResponsiveContainer,
} from "recharts";

// Three regions (§5 Equilibrium Partition):
//   (0, x_C)     — Regime I: issuer won't pay σ_min  [conflict zone]
//   [x_C, x_H)   — Regime II constrained at σ = σ_min  [aligned]
//   [x_H, 1]     — Regime II unconstrained at σ^{II*}  [aligned]

export default function IssuerPanel({ data, xC, xH, xI, xII }) {
  const fC = xC ? +xC.toFixed(4) : null;
  const fH = xH ? +xH.toFixed(4) : null;

  return (
    <div style={card}>
      <div style={row}>
        <div>
          <div style={title}>Chart 1 — Issuer's Regime Choice</div>
          <div style={sub}>
            Issuer picks whichever regime yields higher profit.
            Below x<sub>C</sub>: prefers Regime I (conflict). Above: Regime II wins.
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {fC && <Chip bg="#fee2e2" bd="#fca5a5" tx="#b91c1c">x_C = {fC}</Chip>}
          {fH && <Chip bg="#fef9c3" bd="#fbbf24" tx="#92400e">x_H = {fH}</Chip>}
          <Chip bg="#dbeafe" bd="#93c5fd" tx="#1d4ed8">x^I* = {xI.toFixed(3)}</Chip>
          <Chip bg="#fce7f3" bd="#f9a8d4" tx="#9d174d">x^II* = {xII.toFixed(3)}</Chip>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 6, right: 12, bottom: 16, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="x" tick={{ fontSize: 11 }}
            label={{ value: "x  (portfolio share)", position: "insideBottom", offset: -8, fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={50} />
          <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v, n) => [v.toFixed(5), n]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />

          {/* Region shading — no labels (shown in legend below) */}
          {fC && <ReferenceArea x1={0} x2={fC} fill="#fee2e2" fillOpacity={0.4} />}
          {fC && fH && <ReferenceArea x1={fC} x2={fH} fill="#fef9c3" fillOpacity={0.5} />}
          {fH && <ReferenceArea x1={fH} x2={1} fill="#dcfce7" fillOpacity={0.4} />}
          {!fH && fC && <ReferenceArea x1={fC} x2={1} fill="#dcfce7" fillOpacity={0.4} />}

          <Line type="monotone" dataKey="piI" stroke="#2563eb" strokeWidth={2.5}
            dot={false} name="Π^{I*}(x) — Regime I" />
          <Line type="monotone" dataKey="piII_c" stroke="#dc2626" strokeWidth={2.5}
            dot={false} name="Π^{II}(x, σ_min) — constrained II" />
          <Line type="monotone" dataKey="piII_opt" stroke="#f97316" strokeWidth={1.5}
            strokeDasharray="5 3" dot={false} name="Π^{II*}(x) — free II" />

          {fC && <ReferenceLine x={fC} stroke="#374151" strokeDasharray="4 3"
            label={{ value: `x_C`, fontSize: 9, position: "insideTopRight" }} />}
          {fH && <ReferenceLine x={fH} stroke="#92400e" strokeDasharray="4 3"
            label={{ value: `x_H`, fontSize: 9, position: "insideTopRight" }} />}
          <ReferenceLine x={+xI.toFixed(4)} stroke="#2563eb" strokeDasharray="2 4" strokeOpacity={0.6}
            label={{ value: `x^I*`, fontSize: 9, position: "top" }} />
          <ReferenceLine x={+xII.toFixed(4)} stroke="#9333ea" strokeDasharray="2 4" strokeOpacity={0.6}
            label={{ value: `x^II*`, fontSize: 9, position: "top" }} />
        </LineChart>
      </ResponsiveContainer>

      <div style={legend}>
        <LegItem color="#fee2e2" border="#fca5a5">x &lt; x_C — Issuer chooses Regime I; patients want II</LegItem>
        <LegItem color="#fef9c3" border="#fbbf24">x_C ≤ x &lt; x_H — Issuer in Regime II at σ = σ_min (constrained)</LegItem>
        <LegItem color="#dcfce7" border="#86efac">{"x ≥ x_H — Issuer in Regime II at σ^{II*} (unconstrained)"}</LegItem>
      </div>
    </div>
  );
}

function Chip({ bg, bd, tx, children }) {
  return (
    <span style={{
      background: bg, border: `1px solid ${bd}`, color: tx,
      borderRadius: 5, padding: "2px 8px", fontSize: 11, fontFamily: "monospace",
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function LegItem({ color, border, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#555" }}>
      <div style={{ width: 12, height: 12, background: color, border: `1px solid ${border}`, borderRadius: 2, flexShrink: 0 }} />
      {children}
    </div>
  );
}

const card = { background: "white", borderRadius: 10, padding: "14px 16px 12px", border: "1px solid #e5e7eb" };
const row = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" };
const title = { fontSize: 14, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 3 };
const sub = { fontSize: 11, color: "#666", maxWidth: 420 };
const legend = { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6" };
