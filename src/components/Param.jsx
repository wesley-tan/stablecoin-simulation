export default function Param({ label, value, onChange, min, max, step, description }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label style={{ fontWeight: 600, fontSize: 13, fontFamily: "Georgia, serif" }}>
          {label}
        </label>
        <span style={{ fontFamily: "monospace", fontSize: 13, color: "#1a56db" }}>
          {typeof value === "number" ? value.toFixed(step < 0.01 ? 3 : 2) : value}
        </span>
      </div>
      {description && (
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>{description}</div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#1a56db" }}
      />
    </div>
  );
}
