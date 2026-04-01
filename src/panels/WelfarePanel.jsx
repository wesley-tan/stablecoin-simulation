import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import ChartTooltip from "../components/ChartTooltip";

export default function WelfarePanel({ data, filing }) {
  return (
    <div style={card}>
      <h2 style={h2}>Chart 4 — Total Welfare W<sup>k*</sup>(x)</h2>
      <p style={caption}>
        W<sup>k*</sup>(x) = 3F<sup>k</sup>(x)² / [8(r_g−r_b)] + (r_g+r_b)/2.
        Under (BW), W<sup>II*</sup> &gt; W<sup>I*</sup> ≥ W<sup>NR*</sup> at every viable x.
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="x" tick={{ fontSize: 11 }}
            label={{ value: "x", position: "insideBottomRight", offset: -5, fontSize: 12 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="WNR" stroke="#94a3b8" strokeWidth={1.5}
            strokeDasharray="4 2" dot={false} name="W^{NR*}(x)" />
          {filing && (
            <Line type="monotone" dataKey="WI" stroke="#2563eb" strokeWidth={2}
              dot={false} name="W^{I*}(x)" />
          )}
          {filing && (
            <Line type="monotone" dataKey="WII" stroke="#dc2626" strokeWidth={2}
              dot={false} name="W^{II*}(x)" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const card = {
  background: "white", borderRadius: 10, padding: "16px 14px 10px",
  marginBottom: 20, border: "1px solid #e5e7eb",
};
const h2 = { fontSize: 14, marginBottom: 6, marginLeft: 4, fontFamily: "Georgia, serif" };
const caption = { fontSize: 12, color: "#555", marginLeft: 4, marginBottom: 10, marginTop: 0 };
