import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ReferenceArea, ResponsiveContainer,
} from "recharts";

export default function IssuerPanel({ data, xC, xI, xII, smin }) {
  const xCf = xC ? +xC.toFixed(4) : null;

  return (
    <div style={card}>
      <div style={titleRow}>
        <span style={title}>Issuer Preference</span>
        <span style={sub}>Π<sup>I*</sup>(x) vs Π<sup>II</sup>(x, σ_min)</span>
      </div>
      <p style={caption}>
        Issuer prefers Regime II only when x ≥ x<sub>C</sub>.
        Below x<sub>C</sub>: surplus too thin to afford σ_min — conflict with patients.
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="x" tick={{ fontSize: 11 }}
            label={{ value: "x  (portfolio share)", position: "insideBottomRight", offset: -4, fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            formatter={(v, name) => [v.toFixed(5), name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />

          {xCf && <ReferenceArea x1={0} x2={xCf} fill="#fee2e2" fillOpacity={0.35} />}
          {xCf && <ReferenceArea x1={xCf} x2={1} fill="#dcfce7" fillOpacity={0.25} />}

          <Line type="monotone" dataKey="piI" stroke="#2563eb" strokeWidth={2.5}
            dot={false} name="Π^{I*}(x)" />
          <Line type="monotone" dataKey="piII_c" stroke="#dc2626" strokeWidth={2.5}
            dot={false} name="Π^{II}(x, σ_min)" />

          {xCf && (
            <ReferenceLine x={xCf} stroke="#374151" strokeDasharray="4 3"
              label={{ value: `x_C = ${xCf}`, fontSize: 10, position: "insideTopLeft" }} />
          )}
          <ReferenceLine x={+xI.toFixed(4)} stroke="#2563eb" strokeDasharray="2 4"
            label={{ value: `x^{I*}=${xI.toFixed(3)}`, fontSize: 9, position: "top" }} />
          <ReferenceLine x={+xII.toFixed(4)} stroke="#dc2626" strokeDasharray="2 4"
            label={{ value: `x^{II*}=${xII.toFixed(3)}`, fontSize: 9, position: "top" }} />
        </LineChart>
      </ResponsiveContainer>

      <div style={footer}>
        <Tag color="#dbeafe" border="#93c5fd" text="#1d4ed8">
          x<sup>I*</sup> = r(R−1)/(R−r) = {xI.toFixed(4)}
        </Tag>
        <Tag color="#fee2e2" border="#fca5a5" text="#b91c1c">
          x<sup>II*</sup> = β(R−1)/(1−β−η) = {xII.toFixed(4)}
        </Tag>
        <Tag color="#fef9c3" border="#fbbf24" text="#92400e">
          x<sub>C</sub> = {xCf ?? "none"}
        </Tag>
      </div>
    </div>
  );
}

function Tag({ color, border, text, children }) {
  return (
    <span style={{
      background: color, border: `1px solid ${border}`, color: text,
      borderRadius: 5, padding: "3px 9px", fontSize: 11, fontFamily: "monospace",
    }}>
      {children}
    </span>
  );
}

const card = { background: "white", borderRadius: 10, padding: "16px 16px 12px", border: "1px solid #e5e7eb" };
const titleRow = { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 };
const title = { fontSize: 15, fontWeight: 700, fontFamily: "Georgia, serif" };
const sub = { fontSize: 12, color: "#666" };
const caption = { fontSize: 12, color: "#555", margin: "0 0 12px" };
const footer = { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" };
