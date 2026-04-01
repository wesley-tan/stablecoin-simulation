import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ReferenceArea, ResponsiveContainer,
} from "recharts";

// Patient's regime choice (§4):
//   Patients directly prefer higher deposit rate σ.
//   Regime II pays σ_min (constant) vs Regime I pays σ^{I*}(x) (issuer optimal).
//   Under (BW): σ_min > σ^{I*}(x) for all x  →  patients always prefer Regime II.
//   In conflict zone (x < x_C): issuer prefers Regime I despite patients wanting II.

export default function PatientChoicePanel({ data, xC, smin, BW }) {
  const fC = xC ? +xC.toFixed(4) : null;

  return (
    <div style={card}>
      <div style={row}>
        <div>
          <div style={title}>Chart 2 — Patient's Regime Choice</div>
          <div style={sub}>
            Patients prefer higher deposit rate σ. σ_min (Regime II) &gt; σ<sup>I*</sup>(x) (Regime I) everywhere.
            {fC
              ? <> Below x<sub>C</sub> = {fC}: issuer disagrees — conflict zone.</>
              : " No crossover found."}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {fC && <Chip bg="#fee2e2" bd="#fca5a5" tx="#b91c1c">x_C = {fC}</Chip>}
          <Chip bg="#ede9fe" bd="#c4b5fd" tx="#6d28d9">σ_min = {smin.toFixed(4)}</Chip>
          {!BW && <Chip bg="#fef2f2" bd="#fca5a5" tx="#dc2626">(BW) fails</Chip>}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 6, right: 12, bottom: 16, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="x" tick={{ fontSize: 11 }}
            label={{ value: "x  (portfolio share)", position: "insideBottom", offset: -8, fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={50} domain={[0, 1]}
            tickFormatter={(v) => v.toFixed(2)} />
          <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v, n) => [v.toFixed(4), n]} />

          {/* Same region shading as Chart 1 for direct comparison */}
          {fC && <ReferenceArea x1={0} x2={fC} fill="#fee2e2" fillOpacity={0.5} />}
          {fC
            ? <ReferenceArea x1={fC} x2={1} fill="#dcfce7" fillOpacity={0.4} />
            : <ReferenceArea x1={0} x2={1} fill="#dcfce7" fillOpacity={0.4} />}

          {/* σ_min horizontal line — what patients receive in Regime II */}
          <ReferenceLine y={+smin.toFixed(4)} stroke="#7c3aed" strokeWidth={2}
            strokeDasharray="6 3"
            label={{ value: `σ_min = ${smin.toFixed(3)}`, fontSize: 9, position: "insideTopLeft", fill: "#7c3aed" }} />

          {/* σ^{I*}(x) curve — what patients receive in Regime I */}
          <Line type="monotone" dataKey="sigmaI" stroke="#2563eb" strokeWidth={2.5}
            dot={false} name="σ^{I*}(x) — deposit rate, Regime I" />

          {fC && (
            <ReferenceLine x={fC} stroke="#374151" strokeDasharray="4 3"
              label={{ value: "x_C", fontSize: 9, position: "insideTopRight" }} />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div style={legendRow}>
        <LegItem color="#fee2e2" border="#fca5a5">
          x &lt; x_C — <strong>Conflict</strong>: patients prefer II (σ_min &gt; σ<sup>I*</sup>), issuer prefers I
        </LegItem>
        <LegItem color="#dcfce7" border="#86efac">
          x ≥ x_C — <strong>Aligned</strong>: both prefer Regime II
        </LegItem>
        <LegItem color="#ede9fe" border="#c4b5fd">
          <span style={{ fontFamily: "monospace" }}>- - -</span> σ_min = {smin.toFixed(4)} — deposit rate in Regime II (constant)
        </LegItem>
      </div>
      <div style={footNote}>
        σ_min − σ<sup>I*</sup>(x) &gt; 0 everywhere under (BW). The blue line (σ<sup>I*</sup>) may sit at 0
        if S<sup>I</sup>&lt;φ₀ with current params — raise r_b to see non-zero σ<sup>I*</sup>.
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
const sub = { fontSize: 11, color: "#666", maxWidth: 500 };
const legendRow = { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6" };
const footNote = { fontSize: 11, color: "#777", marginTop: 6, lineHeight: 1.6 };
