import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";
import ChartTooltip from "../components/ChartTooltip";

export default function AsymptoticPanel({ data, filing }) {
  const smallX = data.filter((d) => d.x <= 0.4);

  if (!filing) {
    return (
      <div style={card}>
        <h2 style={h2}>Chart 3 — Asymptotic Decomposition</h2>
        <div style={{ padding: "20px", color: "#999", fontStyle: "italic", fontSize: 13 }}>
          Regime NR (δ ≤ β+η) — no filing or bribe costs. Asymptotic analysis not applicable.
        </div>
      </div>
    );
  }

  return (
    <div style={card}>
      <h2 style={h2}>Chart 3 — Asymptotic Decomposition: Carry Gain vs Bribe Cost</h2>
      <p style={caption}>
        Bribe cost = (δ−β−η)x²/(2β) scales as <em>O(x²)</em>.
        Carry gain ≈ (σ_min − σ<sup>I*</sup>) · x(R−1) scales as <em>O(x)</em> for small x.
        The ratio diverges as x → 0, confirming the patient-welfare dominance result.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={subTitle}>Carry gain vs bribe cost (x ≤ 0.4)</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={smallX} margin={{ top: 5, right: 16, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="carryGain" stroke="#059669" strokeWidth={2}
                dot={false} name="Carry gain O(x)" />
              <Line type="monotone" dataKey="bribeCost" stroke="#dc2626" strokeWidth={2}
                dot={false} name="Bribe cost O(x²)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div style={subTitle}>Ratio carry gain / bribe cost (x ≤ 0.4)</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart
              data={smallX.filter((d) => d.bribeCost > 1e-7).map((d) => ({
                ...d,
                ratio: d.carryGain / d.bribeCost,
              }))}
              margin={{ top: 5, right: 16, bottom: 5, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={1} stroke="#888" strokeDasharray="4 3"
                label={{ value: "ratio = 1", fontSize: 10, position: "insideTopRight" }} />
              <Line type="monotone" dataKey="ratio" stroke="#7c3aed" strokeWidth={2}
                dot={false} name="carry / bribe" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p style={note}>
        Under (BW), the ratio stays &gt; 1 for all x where S^I &gt; 0. Any dip below 1 would falsify
        the patient-preference claim.
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
const note = { fontSize: 11, color: "#777", marginLeft: 4, marginTop: 8 };
const subTitle = { fontSize: 12, fontWeight: 600, marginLeft: 4, marginBottom: 6, color: "#444" };
