import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ReferenceArea, ResponsiveContainer,
} from "recharts";
import ChartTooltip from "../components/ChartTooltip";
import { fmt } from "../model";

export default function IssuerProfitPanel({ data, xC, xI, xII, xNR, showOptimal, filing }) {
  const activeOptX = filing ? xI : xNR;

  return (
    <div style={card}>
      <h2 style={h2}>
        Chart 1 — Issuer Profit: Π<sup>I*</sup>(x) vs Π<sup>II</sup>(x, σ_min)
        {!filing && " [Regime NR active — no filing threat]"}
      </h2>
      <p style={caption}>
        {filing
          ? "Issuer compares unconstrained Regime I against Regime II at the binding σ_min. Below x_C: conflict zone. Above x_C: aligned."
          : "δ ≤ β+η: no filing threat. Only Regime NR is relevant."}
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="x" tick={{ fontSize: 11 }}
            label={{ value: "x (portfolio share)", position: "insideBottomRight", offset: -5, fontSize: 12 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />

          {filing && xC && (
            <ReferenceArea x1={0} x2={fmt(xC)} fill="#fee2e2" fillOpacity={0.4}
              label={{ value: "Divergence", fontSize: 10, fill: "#dc2626" }} />
          )}
          {filing && xC && (
            <ReferenceArea x1={fmt(xC)} x2={1} fill="#dcfce7" fillOpacity={0.3}
              label={{ value: "Aligned", fontSize: 10, fill: "#16a34a" }} />
          )}

          {/* Always show NR as reference */}
          <Line type="monotone" dataKey="PiNR" stroke="#94a3b8" strokeWidth={1.5}
            strokeDasharray="4 2" dot={false} name="Π^{NR*}(x)" />

          {filing && (
            <Line type="monotone" dataKey="PiI" stroke="#2563eb" strokeWidth={2.5}
              dot={false} name="Π^{I*}(x)" />
          )}
          {filing && (
            <Line type="monotone" dataKey="PiII_smin" stroke="#dc2626" strokeWidth={2.5}
              dot={false} name="Π^{II}(x, σ_min)" />
          )}
          {filing && showOptimal && (
            <Line type="monotone" dataKey="PiII" stroke="#f97316" strokeWidth={1.8}
              strokeDasharray="6 3" dot={false} name="Π^{II*}(x) opt" />
          )}

          {filing && xC && (
            <ReferenceLine x={fmt(xC)} stroke="#555" strokeDasharray="4 3"
              label={{ value: `x_C ≈ ${xC.toFixed(3)}`, fontSize: 10, position: "insideTopLeft" }} />
          )}
          {activeOptX !== null && (
            <ReferenceLine x={fmt(activeOptX)} stroke="#2563eb" strokeDasharray="2 4"
              label={{ value: `x* = ${(activeOptX ?? 0).toFixed(3)}`, fontSize: 10, position: "insideTopRight" }} />
          )}
        </LineChart>
      </ResponsiveContainer>
      <p style={note}>
        x<sup>I*</sup> = {(xI ?? xNR ?? 0).toFixed(4)},{" "}
        x<sup>II*</sup> = {(xII ?? xNR ?? 0).toFixed(4)},{" "}
        x<sup>NR*</sup> = {(xNR ?? 0).toFixed(4)}.
        These are interior optima; capped at 1 if the slope is positive everywhere.
      </p>
    </div>
  );
}

const card = {
  background: "white", borderRadius: 10, padding: "16px 14px 10px",
  marginBottom: 20, border: "1px solid #e5e7eb",
};
const h2 = { fontSize: 14, marginBottom: 6, marginLeft: 4, fontFamily: "Georgia, serif" };
const caption = { fontSize: 12, color: "#555", marginLeft: 4, marginBottom: 10, marginTop: 0 };
const note = { fontSize: 11, color: "#777", marginLeft: 4, marginTop: 6 };
