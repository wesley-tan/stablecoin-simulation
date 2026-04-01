import { useState, useMemo } from "react";
import { computeFullSeries, scalarDerived } from "./model";
import Param from "./components/Param";
import InfoCard from "./components/InfoCard";
import IssuerProfitPanel from "./panels/IssuerProfitPanel";
import PatientWelfarePanel from "./panels/PatientWelfarePanel";
import AsymptoticPanel from "./panels/AsymptoticPanel";
import WelfarePanel from "./panels/WelfarePanel";
import AnalyticalCheckPanel from "./panels/AnalyticalCheckPanel";
import SweepPanel from "./panels/SweepPanel";
import InterpretationPanel from "./panels/InterpretationPanel";
import InvestmentConditionPanel from "./panels/InvestmentConditionPanel";

const TABS = [
  { id: "charts", label: "Charts" },
  { id: "investment", label: "Investment Condition" },
  { id: "checks", label: "Analytical Checks" },
  { id: "sweep", label: "Parameter Sweep" },
  { id: "interp", label: "Interpretation" },
];

const DELTA = 1; // legal recovery rate — fixed at 1 throughout

export default function App() {
  const [R, setR] = useState(1.5);
  const [r, setr] = useState(0.5);
  const [beta, setBeta] = useState(0.4);
  const [eta, setEta] = useState(0.02);
  const [r_b, setRb] = useState(0.85);
  const [r_g, setRg] = useState(1.15);
  const [showWelfare, setShowWelfare] = useState(false);
  const [showOptimal, setShowOptimal] = useState(false);
  const [activeTab, setActiveTab] = useState("charts");

  const { data, filing, sigma_min, BW, invCond, xNR, xI, xII, xC } = useMemo(
    () => computeFullSeries(R, r, DELTA, beta, eta, r_b, r_g),
    [R, r, beta, eta, r_b, r_g]
  );

  const valid =
    R > 1 && r > 0 && r < 1 &&
    beta > 0 && beta < 1 && eta > 0 &&
    beta + eta < 1 && r_b < r_g && r_b >= 0;

  const regime = !filing ? "NR" : (BW ? "II preferred" : "I preferred");

  return (
    <div style={root}>
      {/* ── Header ── */}
      <div style={header}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontFamily: "Georgia, serif", letterSpacing: -0.5 }}>
            Regime Preference Simulation
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#777" }}>
            Full equilibrium via backward induction — Wesley Tan (March 2026)
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{
            fontSize: 12, background: filing ? "#fef9c3" : "#f0fdf4",
            border: `1px solid ${filing ? "#fbbf24" : "#86efac"}`,
            borderRadius: 6, padding: "5px 10px",
            color: filing ? "#92400e" : "#15803d", fontWeight: 600,
          }}>
            {filing ? "Case B: δ > β+η" : "Case A: Regime NR"}
          </div>
          {filing && (
            <div style={{
              fontSize: 12, background: BW ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${BW ? "#86efac" : "#fca5a5"}`,
              borderRadius: 6, padding: "5px 10px",
              color: BW ? "#15803d" : "#dc2626", fontWeight: 600,
            }}>
              (BW) {BW ? "✓" : "✗"}
            </div>
          )}
          <div style={{
            fontSize: 12, background: invCond ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${invCond ? "#86efac" : "#fca5a5"}`,
            borderRadius: 6, padding: "5px 10px",
            color: invCond ? "#15803d" : "#dc2626", fontWeight: 600,
          }}>
            r(R−1) ≥ (R−r) {invCond ? "✓ x*=1" : "✗ x*<1"}
          </div>
        </div>
      </div>

      {/* ── Parameter panel ── */}
      <div style={paramPanel}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px 18px" }}>
          <Param label="R" value={R} onChange={setR} min={1.01} max={4} step={0.01}
            description="Illiquid gross return" />
          <Param label="r" value={r} onChange={setr} min={0.05} max={0.99} step={0.01}
            description="Fire-sale liquidation price" />
          <Param label="β" value={beta} onChange={setBeta} min={0.05} max={0.89} step={0.01}
            description="Impatient discount factor" />
          <Param label="η" value={eta} onChange={setEta} min={0.001} max={0.3} step={0.001}
            description="Service value to patient stayers" />
          <Param label="r_b" value={r_b} onChange={setRb} min={0} max={1.4} step={0.01}
            description="Outside option lower bound" />
          <Param label="r_g" value={r_g} onChange={setRg} min={0.5} max={2} step={0.01}
            description="Outside option upper bound" />
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "#888", fontStyle: "italic" }}>
          δ (legal recovery rate) = 1 — fixed
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <InfoCard label="σ_min" value={sigma_min !== null ? sigma_min.toFixed(4) : "N/A"}
          sub="(1−β−η)r/[β(R−r)]" />
        <InfoCard label="x^{I*}" value={(xI ?? xNR).toFixed(4)}
          color={xC && xI !== null && xI < xC ? "#fef9c3" : "#f8f9fa"}
          sub="r(R−1)/(R−r)" />
        <InfoCard label="x^{II*}" value={(xII ?? xNR).toFixed(4)}
          sub="β(R−1)/[(1−β)−η]" />
        <InfoCard label="x^{NR*}" value={xNR.toFixed(4)}
          sub="(R−1)/(1−β−η)" />
        <InfoCard label="x_C" value={xC ? xC.toFixed(4) : "none"}
          color={xC ? "#fffbeb" : "#f8f9fa"}
          sub={xC ? "issuer crossover" : "no switch in (0,1]"} />
      </div>

      {!valid && (
        <div style={warn}>
          Parameter constraints violated. Ensure R &gt; 1, 0 &lt; r &lt; 1,
          β+η &lt; 1, r_b &lt; r_g.
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 0, marginBottom: 18,
        borderBottom: "1px solid #e5e7eb", paddingBottom: 0, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderBottom: activeTab === t.id ? "2px solid #1a56db" : "2px solid transparent",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "Georgia, serif",
              color: activeTab === t.id ? "#1a56db" : "#555",
              fontWeight: activeTab === t.id ? 700 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Charts tab ── */}
      {activeTab === "charts" && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <ToggleBtn active={showWelfare} onClick={() => setShowWelfare(!showWelfare)}>
              {showWelfare ? "Hide" : "Show"} Total Welfare
            </ToggleBtn>
            <ToggleBtn active={showOptimal} onClick={() => setShowOptimal(!showOptimal)}>
              {showOptimal ? "Hide" : "Show"} Π<sup>II*</sup> at optimal σ
            </ToggleBtn>
          </div>
          <IssuerProfitPanel
            data={data} xC={xC} xI={xI} xII={xII} xNR={xNR}
            showOptimal={showOptimal} filing={filing}
          />
          <PatientWelfarePanel data={data} filing={filing} />
          <AsymptoticPanel data={data} filing={filing} />
          {showWelfare && <WelfarePanel data={data} filing={filing} />}
        </>
      )}

      {/* ── Investment Condition tab ── */}
      {activeTab === "investment" && (
        <InvestmentConditionPanel
          R={R} r={r} delta={DELTA} beta={beta} eta={eta}
        />
      )}

      {/* ── Analytical Checks tab ── */}
      {activeTab === "checks" && (
        <AnalyticalCheckPanel
          R={R} r={r} delta={DELTA} beta={beta} eta={eta} r_b={r_b} r_g={r_g}
        />
      )}

      {/* ── Parameter Sweep tab ── */}
      {activeTab === "sweep" && (
        <SweepPanel r={r} delta={DELTA} eta={eta} r_b={r_b} r_g={r_g} />
      )}

      {/* ── Interpretation tab ── */}
      {activeTab === "interp" && (
        <InterpretationPanel
          R={R} r={r} delta={DELTA} beta={beta} eta={eta} r_b={r_b} r_g={r_g}
          BW={BW} xC={xC} xI={xI} xII={xII} xNR={xNR}
          sigma_min={sigma_min} filing={filing} invCond={invCond}
        />
      )}
    </div>
  );
}

function ToggleBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: 6,
        border: "1px solid #d1d5db",
        background: active ? "#1a56db" : "white",
        color: active ? "white" : "#333",
        cursor: "pointer", fontSize: 12,
        fontFamily: "Georgia, serif",
      }}
    >
      {children}
    </button>
  );
}

const root = {
  maxWidth: 1000, margin: "0 auto", padding: "24px 20px",
  fontFamily: "Georgia, serif", color: "#1a1a1a",
  background: "#fafafa", minHeight: "100vh",
};
const header = {
  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  marginBottom: 20, flexWrap: "wrap", gap: 12,
};
const paramPanel = {
  background: "white", borderRadius: 10, padding: "16px 20px",
  marginBottom: 18, border: "1px solid #e5e7eb",
};
const warn = {
  background: "#fef2f2", border: "1px solid #fca5a5",
  borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13,
};
