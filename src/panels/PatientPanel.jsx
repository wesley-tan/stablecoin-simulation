import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer, ComposedChart, Area,
} from "recharts";

export default function PatientPanel({ data, xC, smin }) {
  const xCf = xC ? +xC.toFixed(4) : null;

  // Split carry gain vs bribe cost for the small-x region
  const smallX = data.filter((d) => d.x <= 0.5);

  return (
    <div style={card}>
      <div style={titleRow}>
        <span style={title}>Patient Preference</span>
        <span style={sub}>Δ = (σ_min − σ<sup>I*</sup>) · S<sup>I</sup>(x)</span>
      </div>
      <p style={caption}>
        Δ &gt; 0 everywhere under (BW): patients always prefer the Regime II equilibrium.
        The carry gain (O(x)) dominates the bribe cost (O(x²)) at all x.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left: welfare diff */}
        <div>
          <div style={chartLabel}>Welfare gain across equilibria</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" tick={{ fontSize: 10 }}
                label={{ value: "x", position: "insideBottomRight", offset: -4, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => v.toFixed(5)} />
              <ReferenceLine y={0} stroke="#333" strokeWidth={1.5} />
              {xCf && <ReferenceLine x={xCf} stroke="#888" strokeDasharray="4 3"
                label={{ value: `x_C`, fontSize: 9, position: "insideTopLeft" }} />}
              <Line type="monotone" dataKey="pd" stroke="#7c3aed" strokeWidth={2.5}
                dot={false} name="Δ patient welfare" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Right: carry gain vs bribe cost */}
        <div>
          <div style={chartLabel}>Carry gain O(x) vs bribe cost O(x²) — x ≤ 0.5</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={smallX} margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" tick={{ fontSize: 10 }}
                label={{ value: "x", position: "insideBottomRight", offset: -4, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => v.toFixed(5)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="carryGain" stroke="#059669" strokeWidth={2}
                dot={false} name="Carry gain" />
              <Line type="monotone" dataKey="bribeCost" stroke="#dc2626" strokeWidth={2}
                dot={false} name="Bribe cost" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={note}>
        At σ_min = {smin.toFixed(4)}: patients are indifferent between regimes at fixed σ = σ_min.
        Across equilibria (comparing σ_min vs σ<sup>I*</sup>), patients always gain because the carry
        increase (σ_min − σ<sup>I*</sup>)·S<sup>I</sup> outweighs the bribe cost under (BW).
      </div>
    </div>
  );
}

const card = { background: "white", borderRadius: 10, padding: "16px 16px 12px", border: "1px solid #e5e7eb" };
const titleRow = { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 };
const title = { fontSize: 15, fontWeight: 700, fontFamily: "Georgia, serif" };
const sub = { fontSize: 12, color: "#666" };
const caption = { fontSize: 12, color: "#555", margin: "0 0 12px" };
const chartLabel = { fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 6 };
const note = { fontSize: 11, color: "#777", marginTop: 10, lineHeight: 1.6 };
