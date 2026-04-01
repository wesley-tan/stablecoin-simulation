// Model: δ = 1 throughout (Tan & Izumi, March 2026)
// Parameters: R > 1, r ∈ (0,1), β ∈ (0,1), η ∈ (0,1−β), r_b < r_g

// ── Scalar quantities ─────────────────────────────────────────────────────────

export function phi0(eta, r_b) {
  return 1 + eta / 2 - r_b;
}

// σ_min = (1−β−η)r / [β(R−r)]
export function sigmaMin(R, r, beta, eta) {
  return ((1 - beta - eta) * r) / (beta * (R - r));
}

// (BW): β(R−r) > r(1−β−η)
export function isBW(R, r, beta, eta) {
  return beta * (R - r) > r * (1 - beta - eta);
}

// ── Per-depositor surplus ─────────────────────────────────────────────────────

// E[S^I(x)] = x(R−1) − (R−r)x²/(2r)
export function SI(x, R, r) {
  return x * (R - 1) - ((R - r) * x * x) / (2 * r);
}

// E[S^II(x)] = x(R−1)  (no fire sales)
export function SII(x, R) {
  return x * (R - 1);
}

// Bribe cost per depositor = (1−β−η)x²/(2β)
export function bribeCost(x, beta, eta) {
  return ((1 - beta - eta) * x * x) / (2 * beta);
}

// ── Optimal σ within each regime ─────────────────────────────────────────────

// σ^{I*}(x) = [S^I − φ₀] / [2·S^I]
export function sigmaI_opt(x, R, r, eta, r_b) {
  const s = SI(x, R, r);
  if (s <= 0) return 0;
  const p0 = phi0(eta, r_b);
  const raw = (s - p0) / (2 * s);
  return Math.max(0, Math.min(1, raw));
}

// σ^{II*}(x) = [x(R−1) − φ₀ + bc] / [2·x(R−1)]
export function sigmaII_opt(x, R, r, beta, eta, r_b) {
  const s2 = SII(x, R);
  if (s2 <= 0) return 0;
  const bc = bribeCost(x, beta, eta);
  const p0 = phi0(eta, r_b);
  const raw = (s2 - p0 + bc) / (2 * s2);
  return Math.max(0, Math.min(1, raw));
}

// ── Economy-wide profit at optimal σ ─────────────────────────────────────────

// F^I(x) = φ₀ + S^I(x)
export function FI(x, R, r, eta, r_b) {
  return phi0(eta, r_b) + SI(x, R, r);
}

// F^II(x) = φ₀ + x(R−1) − bc(x)
export function FII(x, R, r, beta, eta, r_b) {
  return phi0(eta, r_b) + SII(x, R) - bribeCost(x, beta, eta);
}

// Π^{I*}(x) = F^I(x)² / [4(r_g−r_b)]
export function PiI_star(x, R, r, eta, r_b, r_g) {
  const f = FI(x, R, r, eta, r_b);
  return f > 0 ? (f * f) / (4 * (r_g - r_b)) : 0;
}

// Π^{II*}(x) = F^II(x)² / [4(r_g−r_b)]
export function PiII_star(x, R, r, beta, eta, r_b, r_g) {
  const f = FII(x, R, r, beta, eta, r_b);
  return f > 0 ? (f * f) / (4 * (r_g - r_b)) : 0;
}

// Π^{II}(x, σ_min) — constrained Regime II at σ_min
export function PiII_constrained(x, R, r, beta, eta, r_b, r_g) {
  const smin = sigmaMin(R, r, beta, eta);
  const bc = bribeCost(x, beta, eta);
  const p0 = phi0(eta, r_b);
  const numerator = (p0 - bc + smin * SII(x, R)) * (1 - smin) * SII(x, R);
  return Math.max(0, numerator / (r_g - r_b));
}

// ── Optimal portfolio ─────────────────────────────────────────────────────────

// x^{I*} = r(R−1)/(R−r)   — always < 1 since r < 1
export function xI_opt(R, r) {
  return (r * (R - 1)) / (R - r);
}

// x^{II*} = β(R−1)/(1−β−η)  capped at 1
export function xII_opt(R, beta, eta) {
  const denom = 1 - beta - eta;
  if (denom <= 0) return 1;
  return Math.min(1, (beta * (R - 1)) / denom);
}

// x_H: smallest x where σ^{II*}(x) = σ_min  (Regime II becomes unconstrained)
// Quadratic: A·x² + B·x + C = 0
//   A = 1−β−η
//   B = 2(R−1)[β(R−r) − 2r(1−β−η)] / (R−r)
//   C = −2β·φ₀
export function xH_compute(R, r, beta, eta, r_b) {
  const A = 1 - beta - eta;
  if (A <= 0) return null;
  const B = (2 * (R - 1) * (beta * (R - r) - 2 * r * (1 - beta - eta))) / (R - r);
  const C = -2 * beta * phi0(eta, r_b);
  const disc = B * B - 4 * A * C;
  if (disc < 0) return null;
  const root = (-B + Math.sqrt(disc)) / (2 * A);
  return root > 0 && root <= 1 ? root : (root > 1 ? 1 : null);
}

// ── Patient welfare difference across equilibria ──────────────────────────────
// Δ(x) = (σ_min − σ^{I*}(x)) · S^I(x)
// Positive whenever σ^{I*}(x) < σ_min and S^I(x) > 0 [always under BW]
// Returns 0 when S^I ≤ 0 (Regime I not viable — no meaningful comparison)
export function patientDiff(x, R, r, beta, eta, r_b) {
  const s = SI(x, R, r);
  if (s <= 0) return 0;
  const smin = sigmaMin(R, r, beta, eta);
  const sI = sigmaI_opt(x, R, r, eta, r_b);
  return (smin - sI) * s;
}

// ── Full series (N points) ────────────────────────────────────────────────────
export function computeSeries(R, r, beta, eta, r_b, r_g, N = 300) {
  const smin = sigmaMin(R, r, beta, eta);
  const BW = isBW(R, r, beta, eta);
  const xI = xI_opt(R, r);
  const xII = xII_opt(R, beta, eta);
  const xH = xH_compute(R, r, beta, eta, r_b);

  // crossover x_C: smallest x where Π^{II}(x,σ_min) ≥ Π^{I*}(x)
  let xC = null;
  let prevDiff = null;

  const data = [];
  for (let i = 1; i <= N; i++) {
    const x = i / N;
    const piI = PiI_star(x, R, r, eta, r_b, r_g);
    const piII_c = PiII_constrained(x, R, r, beta, eta, r_b, r_g);
    const piII_opt = PiII_star(x, R, r, beta, eta, r_b, r_g);
    const pd = patientDiff(x, R, r, beta, eta, r_b);
    const sI = sigmaI_opt(x, R, r, eta, r_b);
    const bc = bribeCost(x, beta, eta);
    const carryGain = Math.max(0, (smin - sI) * SI(x, R, r));

    const diff = piII_c - piI;
    if (prevDiff !== null && prevDiff < 0 && diff >= 0) {
      const xPrev = (i - 1) / N;
      xC = xPrev + (-prevDiff / (diff - prevDiff)) / N;
    }
    prevDiff = diff;

    data.push({
      x: +x.toFixed(4),
      piI: +piI.toFixed(6),
      piII_c: +piII_c.toFixed(6),
      piII_opt: +piII_opt.toFixed(6),
      pd: +pd.toFixed(6),
      carryGain: +carryGain.toFixed(6),
      bribeCost: +bc.toFixed(6),
      sigmaI: +sI.toFixed(4),
      issuerDiff: +(diff).toFixed(6),
    });
  }

  return { data, smin, BW, xI, xII, xC, xH };
}

// ── BW sweep over (β, R) ──────────────────────────────────────────────────────
export function sweepBW(r, eta, r_b, r_g, nBeta = 28, nR = 28) {
  const betas = Array.from({ length: nBeta }, (_, i) => 0.05 + (i / (nBeta - 1)) * 0.8);
  const Rs = Array.from({ length: nR }, (_, i) => 1.05 + (i / (nR - 1)) * 2.45);

  const cells = betas.map((beta) =>
    Rs.map((R) => {
      if (beta + eta >= 1) return { type: "invalid" };
      const BW = isBW(R, r, beta, eta);
      if (!BW) return { type: "nobw" };

      const smin = sigmaMin(R, r, beta, eta);
      let patOK = true, issuerOK = true;
      for (let i = 1; i <= 60; i++) {
        const x = i / 60;
        const s = SI(x, R, r);
        if (s <= 0) continue;
        const f = FI(x, R, r, eta, r_b);
        const sI = (f > 0 && s > 0) ? sigmaI_opt(x, R, r, eta, r_b) : 0;
        if (sI < smin - 1e-9) {
          const pd = (smin - sI) * s;
          if (pd < -1e-9) patOK = false;
        }
        const piI = PiI_star(x, R, r, eta, r_b, r_g);
        const piII_c = PiII_constrained(x, R, r, beta, eta, r_b, r_g);
        // issuerOK checks that x_C exists and is < 1 (some crossover)
        if (x > 0.5 && piII_c < piI - 1e-9) issuerOK = false;
      }
      return { type: "bw", patOK, issuerOK };
    })
  );

  return {
    cells,
    betas: betas.map((b) => +b.toFixed(3)),
    Rs: Rs.map((v) => +v.toFixed(3)),
  };
}
