import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";

// Patient preference (§4):
//   Fixed σ:          prefer II iff σ > σ_min  (bribe cost only covered if carry ≥ σ_min)
//   Across equilibria: always prefer II under (BW)
//                      Δ = (σ_min − σ^I*) · S^I > 0  because carry gain O(x) > bribe cost O(x²)

export default function PatientPanel({ data, xC, smin }) {
  const fC = xC ? +xC.toFixed(4) : null;
  // x ≤ 0.3: the O(x) vs O(x²) asymptotic argument is clearest here
  const smallX = data.filter((d) => d.x <= 0.3);

  return (
    <div style={card}>
      <div style={row}>
        <div>
          <div style={title}>Chart 2 — Patient Welfare Gain Across Equilibria</div>
          <div style={sub}>
            Δ(x) = (σ_min − σ<sup>I*</sup>) · S<sup>I</sup>(x) &gt; 0 everywhere under (BW).
            Patients always prefer the Regime II equilibrium.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left: Δ across all x */}
        <div>
          <div style={chartTitle}>Patient welfare gain Δ(x)</div>
          <div style={chartNote}>Positive where S^I &gt; 0 (Regime I viable). Zero beyond.</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={data} margin={{ top: 4, right: 10, bottom: 16, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" tick={{ fontSize: 10 }}
                label={{ value: "x", position: "insideBottom", offset: -8, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} width={46} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => v.toFixed(5)} />
              <ReferenceLine y={0} stroke="#374151" strokeWidth={1.5} />
              {fC && <ReferenceLine x={fC} stroke="#888" strokeDasharray="3 3"
                label={{ value: "x_C", fontSize: 9, position: "insideTopLeft" }} />}
              <Line type="monotone" dataKey="pd" stroke="#7c3aed" strokeWidth={2.5}
                dot={false} name="Δ = (σ_min−σ^I*)·S^I" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Right: carry gain vs bribe cost */}
        <div>
          <div style={chartTitle}>Carry gain vs bribe cost (x ≤ 0.3)</div>
          <div style={chartNote}>Carry gain O(x) exceeds bribe cost O(x²) for small x under (BW)</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={smallX} margin={{ top: 4, right: 10, bottom: 16, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" tick={{ fontSize: 10 }}
                label={{ value: "x", position: "insideBottom", offset: -8, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} width={46} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v, n) => [v.toFixed(5), n]} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="carryGain" stroke="#059669" strokeWidth={2}
                dot={false} name="Carry gain  O(x)" />
              <Line type="monotone" dataKey="bribeCost" stroke="#dc2626" strokeWidth={2}
                dot={false} name="Bribe cost  O(x²)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={footNote}>
        At σ = σ_min = {smin.toFixed(4)}: patients are indifferent between regimes (fixed σ comparison).
        Across equilibria: switching raises σ from σ<sup>I*</sup> to σ_min,
        so the carry increase outweighs the bribe cost.
      </div>
    </div>
  );
}

const card = { background: "white", borderRadius: 10, padding: "14px 16px 12px", border: "1px solid #e5e7eb" };
const row = { marginBottom: 10 };
const title = { fontSize: 14, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 3 };
const sub = { fontSize: 11, color: "#555" };
const chartTitle = { fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 1 };
const chartNote = { fontSize: 10, color: "#888", marginBottom: 6 };
const footNote = { fontSize: 11, color: "#777", marginTop: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6", lineHeight: 1.6 };
