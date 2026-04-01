export default function InfoCard({ label, value, color, sub }) {
  return (
    <div
      style={{
        background: color || "#f8f9fa",
        borderRadius: 8,
        padding: "10px 14px",
        flex: 1,
        minWidth: 120,
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ fontSize: 11, color: "#666", fontFamily: "Georgia, serif", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "monospace", color: "#111" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
