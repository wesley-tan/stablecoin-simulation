import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import ChartTooltip from "../components/ChartTooltip";

export default function PatientWelfarePanel({ data, filing }) {
  return (
    <div style={card}>
      <h2 style={h2}>Chart 2 — Patient Welfare Gain Across Equilibria</h2>
      <p style={caption}>
        {filing
          ? <>
              Δ = E[w<sub>pat</sub><sup>II</sup>(x, σ_min)] − E[w<sub>pat</sub><sup>I</sup>(x, σ<sup>I*</sup>)].
              Equals (σ_min − σ<sup>I*</sup>)·E[S<sup>I</sup>(x)] per the algebraic identity in §4.
              Positive everywhere under (BW): patients universally prefer Regime II across equilibria.
            </>
          : "δ ≤ β+η: Regime NR only — no filing/blocking trade-off. Patient welfare comparison not applicable."
        }
      </p>
      {filing ? (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="x" tick={{ fontSize: 11 }}
              label={{ value: "x", position: "insideBottomRight", offset: -5, fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={0} stroke="#333" strokeWidth={1.5} />
            <Line type="monotone" dataKey="patDiff" stroke="#7c3aed" strokeWidth={2.5}
              dot={false} name="Δ patient welfare" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center",
          color: "#999", fontSize: 13, fontStyle: "italic" }}>
          Regime NR — no divergence to display
        </div>
      )}
      {filing && (
        <p style={note}>
          The identity holds because the bribe cost (1−β−η)x²/(2β) in the old model is now
          (δ−β−η)x²/(2β), and σ_min = (δ−β−η)r / [βδ(R−r)] adjusts accordingly.
        </p>
      )}
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
