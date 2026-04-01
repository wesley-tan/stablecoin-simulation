import { useState, useMemo } from "react";
import { computeSeries, sigmaMin, isBW, xI_opt, xII_opt } from "./model";
import Param from "./components/Param";
import IssuerPanel from "./panels/IssuerPanel";
import PatientPanel from "./panels/PatientPanel";
import SweepPanel from "./panels/SweepPanel";

const TABS = [
  { id: "main", label: "Regime Preferences" },
  { id: "sweep", label: "Parameter Sweep" },
];

export default function App() {
  const [R, setR] = useState(1.5);
  const [r, setr] = useState(0.5);
  const [beta, setBeta] = useState(0.4);
  const [eta, setEta] = useState(0.02);
  const [r_b, setRb] = useState(0.85);
  const [r_g, setRg] = useState(1.15);
  const [tab, setTab] = useState("main");

  const { data, smin, BW, xI, xII, xC, xH } = useMemo(
    () => computeSeries(R, r, beta, eta, r_b, r_g),
    [R, r, beta, eta, r_b, r_g]
  );

  const filing = beta + eta < 1;

  return (
    <div style={root}>
      {/* ── Header ── */}
      <div style={header}>
        <div>
          <h1 style={h1}>Regime Preference Simulation</h1>
          <p style={h1sub}>Wesley Tan & R. Izumi — δ = 1 fixed</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge ok={filing} yes="β+η < 1 ✓ filing rational" no="β+η ≥ 1 — no filing" />
          <Badge ok={BW} yes="(BW) ✓" no="(BW) ✗" />
          <div style={pill}>σ_min = {filing ? smin.toFixed(4) : "N/A"}</div>
          <div style={{ ...pill, background: xC ? "#fee2e2" : "#f3f4f6" }}>
            x<sub>C</sub> = {xC ? xC.toFixed(4) : "none"}
          </div>
          <div style={{ ...pill, background: xH ? "#fef9c3" : "#f3f4f6" }}>
            x<sub>H</sub> = {xH ? xH.toFixed(4) : "none"}
          </div>
        </div>
      </div>

      {/* ── Parameters ── */}
      <div style={paramBox}>
        <div style={paramGrid}>
          <Param label="R" value={R} onChange={setR} min={1.01} max={4} step={0.01}
            description="Illiquid return" />
          <Param label="r" value={r} onChange={setr} min={0.05} max={0.99} step={0.01}
            description="Fire-sale price" />
          <Param label="β" value={beta} onChange={setBeta} min={0.05} max={0.89} step={0.01}
            description="Impatient discount" />
          <Param label="η" value={eta} onChange={setEta} min={0.001} max={0.3} step={0.001}
            description="Service value" />
          <Param label="r_b" value={r_b} onChange={setRb} min={0} max={1.4} step={0.01}
            description="Outside option min" />
          <Param label="r_g" value={r_g} onChange={setRg} min={0.5} max={2} step={0.01}
            description="Outside option max" />
        </div>
        <div style={deltaNote}>δ = 1 (fixed) · φ₀ = {(1 + eta / 2 - r_b).toFixed(4)}</div>
      </div>

      {/* ── Preference summary table ── */}
      {filing && (
        <div style={tableWrap}>
          <table style={tbl}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["", "Prefers Regime II", "Prefers Regime I", "Status"].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}><strong>Patients</strong> — fixed σ</td>
                <td style={td}>σ &gt; σ_min ({smin.toFixed(4)})</td>
                <td style={td}>σ &lt; σ_min</td>
                <td style={td}><span style={badge("#dcfce7","#16a34a")}>Analytic ✓</span></td>
              </tr>
              <tr style={{ background: "#fafafa" }}>
                <td style={td}><strong>Patients</strong> — across equilibria</td>
                <td style={td}>Always (under BW)</td>
                <td style={td}>—</td>
                <td style={td}>
                  {BW ? <span style={badge("#dcfce7","#16a34a")}>Chart 2 ✓</span>
                      : <span style={badge("#f3f4f6","#6b7280")}>(BW) fails</span>}
                </td>
              </tr>
              <tr>
                <td style={td}><strong>Issuer</strong> — across equilibria</td>
                <td style={td}>x ≥ x<sub>C</sub>{xC ? ` = ${xC.toFixed(3)}` : ""}</td>
                <td style={td}>x &lt; x<sub>C</sub></td>
                <td style={td}>
                  {xC ? <span style={badge("#dcfce7","#16a34a")}>Chart 1 ✓</span>
                      : <span style={badge("#f3f4f6","#6b7280")}>No crossover</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {!filing && (
        <div style={warnBox}>β+η ≥ 1 — no filing threat. Increase β or η to enter the relevant parameter region.</div>
      )}

      {/* ── Tabs ── */}
      <div style={tabBar}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={tabBtn(tab === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Main tab ── */}
      {tab === "main" && filing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <IssuerPanel data={data} xC={xC} xH={xH} xI={xI} xII={xII} smin={smin} />
          <PatientPanel data={data} xC={xC} smin={smin} />
        </div>
      )}

      {/* ── Sweep tab ── */}
      {tab === "sweep" && (
        <SweepPanel r={r} eta={eta} r_b={r_b} r_g={r_g} />
      )}
    </div>
  );
}

// ── Badge helpers ──────────────────────────────────────────────────────────────
function Badge({ ok, yes, no }) {
  return (
    <div style={{
      fontSize: 12, padding: "5px 10px", borderRadius: 6, fontWeight: 600,
      background: ok ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${ok ? "#86efac" : "#fca5a5"}`,
      color: ok ? "#15803d" : "#dc2626",
    }}>
      {ok ? yes : no}
    </div>
  );
}

function badge(bg, color) {
  return {
    background: bg, color, borderRadius: 4,
    padding: "2px 8px", fontSize: 11, fontWeight: 600,
  };
}

// ── Styles ────────────────────────────────────────────────────────────────────
const root = {
  maxWidth: 960, margin: "0 auto", padding: "22px 18px",
  fontFamily: "Georgia, serif", color: "#1a1a1a",
  background: "#fafafa", minHeight: "100vh",
};
const header = {
  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  marginBottom: 16, flexWrap: "wrap", gap: 12,
};
const h1 = { margin: 0, fontSize: 19, fontFamily: "Georgia, serif", letterSpacing: -0.4 };
const h1sub = { margin: "3px 0 0", fontSize: 12, color: "#888" };
const pill = {
  fontSize: 12, padding: "5px 10px", borderRadius: 6,
  background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#374151",
};
const paramBox = {
  background: "white", borderRadius: 10, padding: "14px 18px 10px",
  marginBottom: 16, border: "1px solid #e5e7eb",
};
const paramGrid = {
  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px 18px",
};
const deltaNote = { fontSize: 11, color: "#888", marginTop: 8, fontStyle: "italic" };
const tableWrap = {
  background: "white", borderRadius: 10, padding: "12px 14px",
  marginBottom: 16, border: "1px solid #e5e7eb", overflowX: "auto",
};
const tbl = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const th = {
  padding: "8px 12px", textAlign: "left", fontFamily: "Georgia, serif",
  fontSize: 12, borderBottom: "1px solid #e5e7eb",
};
const td = { padding: "9px 12px", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" };
const tabBar = {
  display: "flex", borderBottom: "1px solid #e5e7eb",
  marginBottom: 16, gap: 0,
};
const tabBtn = (active) => ({
  padding: "8px 18px", border: "none",
  borderBottom: active ? "2px solid #1a56db" : "2px solid transparent",
  background: "transparent", cursor: "pointer",
  fontSize: 13, fontFamily: "Georgia, serif",
  color: active ? "#1a56db" : "#555",
  fontWeight: active ? 700 : 400,
});
const warnBox = {
  background: "#fef2f2", border: "1px solid #fca5a5",
  borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13,
};
