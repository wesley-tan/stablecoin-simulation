export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #ddd",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 12,
        fontFamily: "monospace",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#333" }}>x = {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(5) : p.value}
        </div>
      ))}
    </div>
  );
}
