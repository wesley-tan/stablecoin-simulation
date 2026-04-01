// ── Core model mathematics ─────────────────────────────────────────────────────
// Aligned with "Full Equilibrium via Backward Induction" (Wesley Tan, March 2026).
//
// Parameters: R, r, β, η, δ, r_b, r_g, x
//   R > 1          illiquid gross return
//   r ∈ (0,1)      fire-sale liquidation price
//   β ∈ (0,1)      impatient discount factor
//   η ∈ (0,1)      service value to patient stayers
//   δ ∈ (β, 1)     legal-recovery rate (new vs old model where δ=1)
//   r_b, r_g       outside-option support [r_b, r_g]
//   x ∈ [0,1]      investment fraction (issuer's choice)

export const fmt = (v, d = 4) => Number(v.toFixed(d));

// ── Regime determination ───────────────────────────────────────────────────────
// Case A: δ ≤ β + η  → Regime NR (no filing threat)
// Case B: δ > β + η  → filing is a threat; σ vs σ_min determines Regime I vs II

export function getRegime(delta, beta, eta) {
  if (delta <= beta + eta) return "NR";
  return "B"; // further split into I vs II by σ vs σ_min
}

// ── σ_min (blocking threshold) ─────────────────────────────────────────────────
// σ_min = (δ − β − η) r / [β δ (R − r)]
export function computeSigmaMin(delta, beta, eta, r, R) {
  if (delta <= beta + eta) return null; // no filing, blocking irrelevant
  return ((delta - beta - eta) * r) / (beta * delta * (R - r));
}

// ── Condition (BW): blocking worthwhile ────────────────────────────────────────
// β δ (R − r) > (δ − β − η) r   ↔   Π^{II*} > Π^{I*}
export function checkBW(delta, beta, eta, r, R) {
  return beta * delta * (R - r) > (delta - beta - eta) * r;
}

// ── Investment condition: x* = 1 is globally optimal ──────────────────────────
// From ∂π/∂x|_{x>1−λ} = (1−σ)[R−1 − δ(R−r)/r] ≥ 0
// Condition: r(R−1) ≥ δ(R−r)
export function checkInvestmentCondition(R, r, delta) {
  return r * (R - 1) >= delta * (R - r);
}

// ── F^k(x) functions ──────────────────────────────────────────────────────────
// F^k(x) = E[w^k(x)] − r_b
// These are the key objects: Π^{k*}(x) = F^k(x)²/[4(r_g−r_b)], W^{k*} = 3F²/8 + …

export function F_NR(x, R, r, beta, eta, r_b) {
  return 1 + eta / 2 - r_b + x * (R - 1) + ((beta + eta - 1) * x * x) / 2;
}

export function F_I(x, R, r, delta, eta, r_b) {
  return (
    1 + eta / 2 - r_b +
    x * (R - 1) +
    x * x * ((delta - 1) / 2 - (delta * (R - r)) / (2 * r))
  );
}

export function F_II(x, R, r, delta, beta, eta, r_b) {
  return (
    1 + eta / 2 - r_b +
    x * (R - 1) +
    ((delta - 1) * x * x) / 2 -
    ((delta - beta - eta) * x * x) / (2 * beta)
  );
}

// ── Economy-wide profit at optimal σ ──────────────────────────────────────────
// Π^{k*}(x) = F^k(x)² / [4(r_g−r_b)]   (clamped to 0 when F ≤ 0)
export function Pi_star(Fval, r_b, r_g) {
  if (Fval <= 0) return 0;
  return (Fval * Fval) / (4 * (r_g - r_b));
}

// ── Economy-wide total welfare at optimal σ ───────────────────────────────────
// W^{k*}(x) = 3 F^k(x)² / [8(r_g−r_b)] + (r_g+r_b)/2
export function W_star(Fval, r_b, r_g) {
  if (Fval <= 0) return (r_g + r_b) / 2;
  return (3 * Fval * Fval) / (8 * (r_g - r_b)) + (r_g + r_b) / 2;
}

// ── Optimal σ^* in each regime ────────────────────────────────────────────────
// σ^* = (Φ − a) / (2Φ)   where  M = (a + σΦ)/(r_g−r_b),  Φ = E[S]

// Per-depositor expected surplus (average over λ) in each regime:
// Regime NR / II (no fire sales): E[S^k(x)] = x(R−1)
// Regime I (fire sales): E[S^I(x)] = x(R−1) − δ(R−r)x²/(2r)
// — These are the Φ values.

export function ES_NR(x, R) { return x * (R - 1); }
export function ES_I(x, R, r, delta) {
  return x * (R - 1) - (delta * (R - r) * x * x) / (2 * r);
}
export function ES_II(x, R) { return x * (R - 1); }

// σ^* within a regime (from d Π/d σ = 0)
// σ^* = (Φ − a) / (2Φ)
// a = F^k(x) − Φ   (the σ-independent part of E[U_i] − r_b)
// → σ^* = (2Φ − F^k) / (2Φ)   ... wait: a + Φ = F^k  ⟹  a = F^k − Φ
// → σ^* = (Φ − a)/(2Φ) = (Φ − (F^k − Φ))/(2Φ) = (2Φ − F^k)/(2Φ)

export function sigma_opt_k(Fval, Phi) {
  if (Math.abs(Phi) < 1e-14) return 0;
  const s = (2 * Phi - Fval) / (2 * Phi);
  return Math.max(0, Math.min(1, s));
}

// ── Optimal x in each regime (interior solution) ──────────────────────────────
// Maximise F^k(x) over x ∈ [0,1].
// dF^k/dx = 0 gives the unconstrained optimum; clamp to [0,1].

// Regime NR: dF^NR/dx = (R−1) + x(β+η−1) = 0
//   x^{NR*} = (R−1) / (1−β−η)     [clamped at 1 if ≥ 1, 0 if ≤ 0]
export function xOpt_NR(R, beta, eta) {
  const denom = 1 - beta - eta;
  if (denom <= 0) return 1; // F^NR is increasing; x*=1
  return Math.min(1, Math.max(0, (R - 1) / denom));
}

// Regime I: dF^I/dx = (R−1) + x[δ−1 − δ(R−r)/r] = 0
//   x^{I*} = r(R−1) / [r(1−δ) + δ(R−r)]
//           = r(R−1) / [r + δ(R−2r)]
export function xOpt_I(R, r, delta) {
  const denom = r + delta * (R - 2 * r);
  if (denom <= 0) return 1; // slope always positive; x*=1
  return Math.min(1, Math.max(0, (r * (R - 1)) / denom));
}

// Regime II: dF^II/dx = (R−1) + x[δ−1 − (δ−β−η)/β] = 0
//   coefficient of x = (δ−1) − (δ−β−η)/β = [β(δ−1) − (δ−β−η)] / β
//                    = [βδ−β−δ+β+η] / β = [δ(β−1)+η] / β
//   x^{II*} = β(R−1) / [δ(1−β) − η]
export function xOpt_II(R, delta, beta, eta) {
  const denom = delta * (1 - beta) - eta;
  if (denom <= 0) return 1; // slope always positive; x*=1
  return Math.min(1, Math.max(0, (beta * (R - 1)) / denom));
}

// ── Per-depositor expected impatient welfare ───────────────────────────────────
// E[w_imp^k(x)] = 1/2 + (u_imp^k − 1) x²/2
// Regime NR: u_imp = β+η
// Regime I/II: u_imp = δ

export function Ew_imp(x, u_imp) {
  return 0.5 + ((u_imp - 1) * x * x) / 2;
}

// ── Scalar derived quantities ──────────────────────────────────────────────────
export function scalarDerived(R, r, delta, beta, eta, r_b, r_g) {
  const filing = delta > beta + eta;
  const sigma_min = filing ? computeSigmaMin(delta, beta, eta, r, R) : null;
  const BW = filing ? checkBW(delta, beta, eta, r, R) : false;
  const invCond = checkInvestmentCondition(R, r, delta);

  // Optimal x in each regime (interior, capped at 1)
  const xNR = xOpt_NR(R, beta, eta);
  const xI = filing ? xOpt_I(R, r, delta) : null;
  const xII = filing ? xOpt_II(R, delta, beta, eta) : null;

  return { filing, sigma_min, BW, invCond, xNR, xI, xII };
}

// ── Economy-wide profit at σ_min (constrained Regime II) ──────────────────────
// The issuer sets σ = σ_min (binding constraint) and competes on market size.
export function Pi_II_at_smin(x, R, r, delta, beta, eta, sigma_min, r_b, r_g) {
  const Phi = ES_II(x, R); // x(R-1)
  const bc = ((delta - beta - eta) * x * x) / (2 * beta);
  // a_II = (1+δ)/2 + η/2 − r_b − bc_constant … but at general x, we use F^II −Phi
  const FIIval = F_II(x, R, r, delta, beta, eta, r_b);
  // E[U_i^II] = r_b + a_II + σ_min·Phi
  const a = FIIval - Phi; // since F^II = a + Phi (the linear part)
  const EU = r_b + a + sigma_min * Phi;
  const M = Math.max(0, (EU - r_b) / (r_g - r_b));
  const pi_per_dep = (1 - sigma_min) * Phi;
  return M * pi_per_dep;
}

// ── Full data series for charts (300 x-values) ────────────────────────────────
export function computeFullSeries(R, r, delta, beta, eta, r_b, r_g, N = 300) {
  const { filing, sigma_min, BW, invCond, xNR, xI, xII } =
    scalarDerived(R, r, delta, beta, eta, r_b, r_g);

  const data = [];
  let xC = null;
  let prevIssuerDiff = null;

  for (let i = 1; i <= N; i++) {
    const x = i / N;

    // ── F values ──
    const fNR = F_NR(x, R, r, beta, eta, r_b);
    const fI = filing ? F_I(x, R, r, delta, eta, r_b) : fNR;
    const fII = filing ? F_II(x, R, r, delta, beta, eta, r_b) : fNR;

    // ── Π^{k*}(x) at optimal σ ──
    const PiNR = Pi_star(fNR, r_b, r_g);
    const PiI = filing ? Pi_star(fI, r_b, r_g) : PiNR;
    const PiII = filing ? Pi_star(fII, r_b, r_g) : PiNR;

    // ── Π^{II}(x, σ_min) — feasible constrained Regime II ──
    const PiII_smin = (filing && sigma_min !== null)
      ? Pi_II_at_smin(x, R, r, delta, beta, eta, sigma_min, r_b, r_g)
      : 0;

    // ── W^{k*}(x) total welfare ──
    const WNR = W_star(fNR, r_b, r_g);
    const WI = filing ? W_star(fI, r_b, r_g) : WNR;
    const WII = filing ? W_star(fII, r_b, r_g) : WNR;

    // ── Patient welfare difference across equilibria ──
    // Δ = (σ_min − σ^{I*}) · E[S^I(x)]   [cf. old model; now with δ]
    const SI = filing ? ES_I(x, R, r, delta) : ES_NR(x, R);
    const Phi_I = SI;
    const sigI = (fI > 0 && Phi_I > 0) ? sigma_opt_k(fI, Phi_I) : 0;
    const patDiff = (filing && sigma_min !== null && SI > 0)
      ? (sigma_min - sigI) * SI
      : 0;

    // ── Carry gain and bribe cost (asymptotic decomposition) ──
    const bc = filing ? ((delta - beta - eta) * x * x) / (2 * beta) : 0;
    const carryGain = (filing && SI > 0) ? Math.max(0, (sigma_min - sigI) * SI + bc) : 0;
    // Direct: Δ_direct = w_pat^II(σ_min) - w_pat^I(σ^{I*})
    //       = −bc + σ_min·S^II − σ^{I*}·S^I    (from the algebraic identity)
    const SII_x = ES_II(x, R);
    const patDiff_direct = (filing && sigma_min !== null)
      ? (-bc + sigma_min * SII_x) - (sigI * SI)
      : 0;

    // ── Investment condition at this x ──
    // Marginal deferral profit slope: (R-1) - δ(R-r)/r
    const marginalDeferralSlope = (R - 1) - (delta * (R - r)) / r;

    // ── Crossover: issuer switches from Regime I to Regime II ──
    const issuerDiff = PiII_smin - PiI;
    if (filing && prevIssuerDiff !== null && prevIssuerDiff < 0 && issuerDiff >= 0) {
      const xPrev = (i - 1) / N;
      xC = xPrev + (-prevIssuerDiff / (issuerDiff - prevIssuerDiff)) * (1 / N);
    }
    if (filing) prevIssuerDiff = issuerDiff;

    data.push({
      x: fmt(x),
      // F values (raw "value" of operating)
      fNR: fmt(fNR),
      fI: fmt(fI),
      fII: fmt(fII),
      // Profits
      PiNR: fmt(PiNR),
      PiI: fmt(PiI),
      PiII: fmt(PiII),
      PiII_smin: fmt(PiII_smin, 5),
      // Welfare
      WNR: fmt(WNR),
      WI: fmt(WI),
      WII: fmt(WII),
      // Patient welfare
      patDiff: fmt(patDiff_direct, 5),
      carryGain: fmt(bc > 0 ? Math.max(0, (sigma_min - sigI) * SI) : 0, 5),
      bribeCost: fmt(bc, 5),
      // Other
      sigmaI: fmt(sigI, 4),
      sigma_min_val: fmt(sigma_min ?? 0, 4),
      marginalDeferralSlope: fmt(marginalDeferralSlope, 5),
      issuerDiff: fmt(issuerDiff, 5),
    });
  }

  return {
    data, filing, sigma_min, BW, invCond, xNR, xI, xII, xC,
  };
}

// ── Parameter sweeps ──────────────────────────────────────────────────────────

// Sweep (delta, R) to show investment condition regions
export function sweepInvestmentCondition(nDelta = 40, nR = 40) {
  const deltas = Array.from({ length: nDelta }, (_, i) => 0.05 + (i / (nDelta - 1)) * 0.93);
  const Rs = Array.from({ length: nR }, (_, i) => 1.05 + (i / (nR - 1)) * 2.95);
  const grid = deltas.map((d) =>
    Rs.map((Rv) => {
      const holds = checkInvestmentCondition(Rv, 0.5, d);
      const xOptI = xOpt_I(Rv, 0.5, d);
      return { delta: fmt(d, 3), R: fmt(Rv, 3), holds, xOptI: fmt(xOptI, 3) };
    })
  );
  return { grid, deltas: deltas.map((d) => fmt(d, 3)), Rs: Rs.map((r) => fmt(r, 3)) };
}

// Sweep (beta, R) for BW condition (analogous to old sweep, now with delta)
export function sweepBW(nBeta = 25, nR = 25, delta = 0.9, r = 0.5, eta = 0.02, r_b = 0.85, r_g = 1.15) {
  const betas = Array.from({ length: nBeta }, (_, i) => 0.05 + (i / (nBeta - 1)) * 0.8);
  const Rs = Array.from({ length: nR }, (_, i) => 1.1 + (i / (nR - 1)) * 2.4);

  const cells = betas.map((beta) =>
    Rs.map((R) => {
      if (beta + eta >= 1) return { BW: false, patOK: null, piOK: null };
      if (delta <= beta + eta) return { BW: false, patOK: null, piOK: null, isNR: true };

      const sigma_min = computeSigmaMin(delta, beta, eta, r, R);
      if (sigma_min === null || sigma_min < 0 || sigma_min > 1) {
        return { BW: false, patOK: null, piOK: null };
      }
      const BW = checkBW(delta, beta, eta, r, R);
      if (!BW) return { BW: false, patOK: null, piOK: null };

      let patOK = true;
      let piOK = true;
      for (let i = 1; i <= 80; i++) {
        const x = i / 80;
        const SI = ES_I(x, R, r, delta);
        const FI = F_I(x, R, r, delta, eta, r_b);
        const FII = F_II(x, R, r, delta, beta, eta, r_b);

        if (SI > 0) {
          const sigI = (FI > 0 && SI > 0) ? sigma_opt_k(FI, SI) : 0;
          if (sigI < sigma_min - 1e-9) {
            const pd = (sigma_min - sigI) * SI;
            if (pd < -1e-9) patOK = false;
          }
        }
        if (Math.max(FI, FII) > 0) {
          const piII = Pi_star(FII, r_b, r_g);
          const piI = Pi_star(FI, r_b, r_g);
          if (piII < piI - 1e-9) piOK = false;
        }
      }
      return { BW: true, patOK, piOK };
    })
  );
  return { cells, betas: betas.map((b) => fmt(b, 3)), Rs: Rs.map((r) => fmt(r, 3)) };
}
