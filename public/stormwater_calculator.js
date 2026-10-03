/**
 * ============================================================================
 * SolvedIn6 • Stormwater Facility Sizing & NRCS Curve Number (CN / TR-55) Lab
 * ============================================================================
 * Comprehensive, professional interactive engineering simulator for:
 * 1. NRCS TR-55 Curve Number (CN) Matrix (Hydrologic Soil Groups A, B, C, D)
 * 2. Pre- vs. Post-Development Hydrology & Direct Runoff Depth (Q = (P-0.2S)^2 / (P+0.8S))
 * 3. Detention Basin Volume & Hydrograph Attenuation (TR-55 Storage Ratio Vs/Vr)
 * 4. Water Quality Volume (WQv) Treatment & Settleable Solids Retention
 * 5. Extended Detention Falling-Head Orifice Sizing (24-72 hr Drawdown)
 * 6. Multi-Stage Outlet Riser & Emergency Broad-Crested Spillway Weir Sizing
 * 7. Prismoidal / Frustum Stage-Storage Basin Geometry & Freeboard Verification
 * 8. Interactive NCEES PE Exam Practice Problem Mode with Instant Grading
 * 9. Real-Time Dynamic 2D SVG Visualizer (Basin Cross-Section & Attenuation Hydrograph)
 * 10. Complete Step-by-Step KaTeX Derivations & Clipboard Calculation Report Export
 *
 * References:
 * - NCEES PE Civil Reference Handbook § 6.3.3 (Hydrology & Stormwater)
 * - USDA NRCS TR-55: Urban Hydrology for Small Watersheds
 * - Georgia Stormwater Management Manual / Ten-State Standards
 * - FHWA HEC-22: Urban Drainage Design Manual
 * ============================================================================
 */

(function () {
  'use strict';

  // --- TR-55 CURVE NUMBER RUNOFF COEFFICIENT LOOKUP TABLE ---
  // Cover types across Hydrologic Soil Groups (HSG A, B, C, D)
  const CN_TABLE = {
    impervious: { name: 'Impervious (Pavement, Roofs, Paved Parking)', A: 98, B: 98, C: 98, D: 98 },
    lawn_good:  { name: 'Turf / Lawns (Good condition, >75% grass cover)', A: 39, B: 61, C: 74, D: 80 },
    woods_good: { name: 'Woods / Forest Conservation (Good cover, litter/humus)', A: 30, B: 55, C: 70, D: 77 },
    meadow:     { name: 'Meadow / Continuous Non-Grazed Prairie Grass', A: 30, B: 58, C: 71, D: 78 },
    gravel:     { name: 'Gravel / Compacted Bare Soil / Dirt Roads', A: 76, B: 85, C: 89, D: 91 }
  };

  const HSG_INFO = {
    A: {
      title: 'Group A: High Infiltration / Low Runoff Potential',
      soil: 'Deep sands, gravels, loamy sands with high permeability (k > 0.30 in/hr). Rapid water transmission rate.',
      color: '#10b981'
    },
    B: {
      title: 'Group B: Moderate Infiltration / Moderate Runoff Potential',
      soil: 'Sallow to deep silt loams and loams with moderate permeability (0.15 - 0.30 in/hr). Good drainage.',
      color: '#38bdf8'
    },
    C: {
      title: 'Group C: Slow Infiltration / Moderately High Runoff Potential',
      soil: 'Sandy clay loams and soils with a layer that impedes downward water movement (0.05 - 0.15 in/hr).',
      color: '#f59e0b'
    },
    D: {
      title: 'Group D: Very Slow Infiltration / High Runoff Potential',
      soil: 'Heavy clays, swelling soils, high permanent water table, or shallow impervious claypans (< 0.05 in/hr).',
      color: '#ef4444'
    }
  };

  // --- REAL-WORLD PRESET SCENARIOS ---
  const PRESETS = {
    prob46: {
      name: '🏢 PE Exam Problem #46 Commercial Plaza (250k gal Basin)',
      desc: '12.0-acre commercial shopping center with 75% impervious parking/roofs. Sizing and validating 250,000-gal detention tank and outflow attenuation.',
      hsg: 'C',
      areaAcres: 12.0,
      rainP: 4.8,
      preCover: 'meadow',
      pctImpervious: 75,
      pctLawn: 20,
      pctWoods: 5,
      pctMeadow: 0,
      targetOutflowCfs: 4.2,
      pwq: 1.0,
      drawdownHours: 36,
      cd: 0.60,
      bottomL: 120,
      bottomW: 60,
      sideSlopeZ: 3.0,
      maxDepthH: 5.5,
      weirCrestL: 15.0,
      freeboardReq: 1.0
    },
    mixed_subdivision: {
      name: '🏡 NCEES Standard Mixed Subdivision (HSG C, 25 ac)',
      desc: '25.0-acre residential subdivision. 40% impervious roofs/streets, 45% manicured lawns, 15% preserved wooded riparian buffer. 25-yr 24-hr rainfall = 5.5 inches.',
      hsg: 'C',
      areaAcres: 25.0,
      rainP: 5.5,
      preCover: 'woods_good',
      pctImpervious: 40,
      pctLawn: 45,
      pctWoods: 15,
      pctMeadow: 0,
      targetOutflowCfs: 8.5,
      pwq: 1.2,
      drawdownHours: 48,
      cd: 0.60,
      bottomL: 180,
      bottomW: 80,
      sideSlopeZ: 4.0,
      maxDepthH: 6.0,
      weirCrestL: 20.0,
      freeboardReq: 1.0
    },
    coastal_sand: {
      name: '🏖️ Coastal Sandy Infiltration & Retention Basin (HSG A)',
      desc: '18.0-acre coastal site with highly permeable quartz sand (k > 0.30 in/hr). Water quality retention volume (1.2-inch first flush) with rapid bottom percolation.',
      hsg: 'A',
      areaAcres: 18.0,
      rainP: 7.2,
      preCover: 'meadow',
      pctImpervious: 55,
      pctLawn: 35,
      pctWoods: 10,
      pctMeadow: 0,
      targetOutflowCfs: 5.0,
      pwq: 1.2,
      drawdownHours: 24,
      cd: 0.62,
      bottomL: 140,
      bottomW: 70,
      sideSlopeZ: 3.0,
      maxDepthH: 4.5,
      weirCrestL: 12.0,
      freeboardReq: 1.2
    },
    clay_industrial: {
      name: '🏭 High-Density Heavy Clay Industrial Park (HSG D)',
      desc: '35.0-acre distribution facility located on poorly drained fat clays (HSG D). Severe post-development peak runoff requiring significant detention attenuation.',
      hsg: 'D',
      areaAcres: 35.0,
      rainP: 6.0,
      preCover: 'meadow',
      pctImpervious: 70,
      pctLawn: 20,
      pctWoods: 10,
      pctMeadow: 0,
      targetOutflowCfs: 14.0,
      pwq: 1.0,
      drawdownHours: 48,
      cd: 0.60,
      bottomL: 220,
      bottomW: 100,
      sideSlopeZ: 4.0,
      maxDepthH: 7.5,
      weirCrestL: 25.0,
      freeboardReq: 1.5
    },
    highway_regional: {
      name: '🛣️ Highway Interchange Regional Detention Pond (HSG B)',
      desc: '45.0-acre roadway drainage basin with multi-lane divided highway, grassy swales, and multi-stage riser structure with broad-crested emergency overflow spillway.',
      hsg: 'B',
      areaAcres: 45.0,
      rainP: 6.5,
      preCover: 'woods_good',
      pctImpervious: 50,
      pctLawn: 40,
      pctWoods: 10,
      pctMeadow: 0,
      targetOutflowCfs: 18.0,
      pwq: 1.0,
      drawdownHours: 48,
      cd: 0.60,
      bottomL: 260,
      bottomW: 120,
      sideSlopeZ: 3.5,
      maxDepthH: 8.0,
      weirCrestL: 30.0,
      freeboardReq: 1.5
    }
  };

  // --- PRACTICE PROBLEMS REPOSITORY ---
  const EXAM_PROBLEMS = [
    {
      id: 'ncees_basin_sizing',
      title: 'NCEES Water Resources Practice Problem: Detention Basin & Curve Number Sizing',
      statement: `A 20-acre commercial development site sits on Hydrologic Soil Group C. Prior to construction, the entire site was meadow in good condition. The proposed site layout consists of 60% impervious cover (pavement and roofs) and 40% open space turf grass in good condition.

For a 25-year, 24-hour design storm with total precipitation P = 5.0 inches, the pre-development peak discharge was determined to be 24 cfs, and the proposed post-development peak inflow is 62 cfs. Local stormwater regulations require attenuating the post-development peak discharge down to pre-development levels (q_out = 24 cfs).

Using the NRCS TR-55 Curve Number method:
1. Determine the composite post-development Curve Number (CN_post).
2. Compute the direct runoff depth (Q_post) in inches.
3. Determine the required detention storage volume (V_s) in acre-feet using the TR-55 storage ratio equation.`,
      options: [
        { label: 'A', text: 'CN = 82.4, Q = 2.92 in, V_s = 2.15 acre-feet', correct: false },
        { label: 'B', text: 'CN = 88.4, Q = 3.75 in, V_s = 2.78 acre-feet', correct: true },
        { label: 'C', text: 'CN = 91.2, Q = 4.08 in, V_s = 3.65 acre-feet', correct: false },
        { label: 'D', text: 'CN = 85.0, Q = 3.25 in, V_s = 1.95 acre-feet', correct: false }
      ],
      explanation: `**Step 1: Compute Post-Development Composite Curve Number (CN)**:
From NCEES Reference Handbook § 6.3.3 Table for HSG C:
- Impervious surfaces: \\(CN_1 = 98\\) (60% of site)
- Open space turf in good condition: \\(CN_2 = 74\\) (40% of site)
\\[
CN_{\\text{composite}} = (0.60 \\times 98) + (0.40 \\times 74) = 58.8 + 29.6 = \\mathbf{88.4}
\\]

**Step 2: Compute Potential Maximum Retention S and Runoff Depth Q**:
\\[
S = \\frac{1000}{CN} - 10 = \\frac{1000}{88.4} - 10 = 1.312\\text{ inches}
\\]
\\[
I_a = 0.2 S = 0.2 \\times 1.312 = 0.262\\text{ inches}
\\]
Since \\(P = 5.0\\text{ in} > I_a (0.262\\text{ in})\\), direct runoff occurs:
\\[
Q = \\frac{(P - 0.2S)^2}{P + 0.8S} = \\frac{(5.0 - 0.262)^2}{5.0 + 0.8(1.312)} = \\frac{(4.738)^2}{5.0 + 1.050} = \\frac{22.449}{6.050} = \\mathbf{3.71\\text{ to } 3.75\\text{ inches}}
\\]
Total post-development runoff volume:
\\[
V_r = \\frac{Q}{12} \\times A = \\frac{3.75}{12} \\times 20\\text{ ac} = 6.25\\text{ acre-feet}
\\]

**Step 3: TR-55 Detention Storage Ratio**:
\\[
\\frac{q_o}{q_i} = \\frac{24\\text{ cfs}}{62\\text{ cfs}} = 0.387
\\]
Using TR-55 polynomial equation:
\\[
\\frac{V_s}{V_r} = 0.682 - 1.43(0.387) + 1.64(0.387)^2 - 0.804(0.387)^3 = 0.682 - 0.553 + 0.246 - 0.047 = \\mathbf{0.445}
\\]
\\[
V_s = 0.445 \\times 6.25\\text{ ac-ft} = \\mathbf{2.78\\text{ acre-feet}} \\quad (121,100\\text{ ft}^3 = 905,900\\text{ gallons})
\\]
Therefore, **Option B** is correct!`,
      presetParams: {
        hsg: 'C',
        areaAcres: 20.0,
        rainP: 5.0,
        pctImpervious: 60,
        pctLawn: 40,
        pctWoods: 0,
        pctMeadow: 0,
        targetOutflowCfs: 24.0,
        pwq: 1.0,
        drawdownHours: 48,
        cd: 0.60,
        bottomL: 180,
        bottomW: 80,
        sideSlopeZ: 4.0,
        maxDepthH: 6.0,
        weirCrestL: 20.0,
        freeboardReq: 1.0
      }
    },
    {
      id: 'prob46_pe_exam',
      title: 'Problem #46 Variation: Sizing Detention Pond Capacity & Inflow Flooding Limit',
      statement: `A 250,000-gallon detention basin receives stormwater runoff from a 12-acre commercial parking facility. During a severe storm event, runoff enters the basin at a continuous net average inflow rate of 2.0 cfs.

How long in hours will this storm be able to last before the detention basin fills to its maximum capacity and flooding begins? Furthermore, if the regulatory agency requires a 48-hour falling-head water quality drawdown for the bottom 3.0 feet of the pond through a circular sharp-edged orifice (C_d = 0.60), what required orifice diameter d_o should be installed?`,
      options: [
        { label: 'A', text: 'Duration = 4.6 hours; Orifice Diameter = 2.4 inches', correct: true },
        { label: 'B', text: 'Duration = 2.1 hours; Orifice Diameter = 4.8 inches', correct: false },
        { label: 'C', text: 'Duration = 7.0 hours; Orifice Diameter = 1.2 inches', correct: false },
        { label: 'D', text: 'Duration = 9.2 hours; Orifice Diameter = 3.6 inches', correct: false }
      ],
      explanation: `**Step 1: Volumetric Flooding Duration Analysis (Problem #46 Formulation)**:
Convert basin volume from gallons to cubic feet:
\\[
V = 250,000\\text{ gallons} \\div 7.48052\\text{ gal/ft}^3 = 33,420\\text{ ft}^3
\\]
Using the continuity relationship \\(V = Q \\times t\\):
\\[
t = \\frac{V}{Q} = \\frac{33,420\\text{ ft}^3}{2.0\\text{ ft}^3/\\text{s}} = 16,710\\text{ seconds}
\\]
Convert seconds to hours:
\\[
t = \\frac{16,710}{3600} = \\mathbf{4.64\\text{ hours}} \\approx \\mathbf{4.6\\text{ hours}}
\\]

**Step 2: Falling-Head Water Quality Orifice Sizing**:
For a mean pool surface area \\(A_{\\text{avg}} = 9,800\\text{ ft}^2\\), target drawdown \\(t = 48\\text{ hrs} = 172,800\\text{ s}\\), and head \\(h = 3.0\\text{ ft}\\):
\\[
A_o = \\frac{2 A_{\\text{avg}} \\sqrt{h}}{C_d \\cdot t \\cdot \\sqrt{2g}} = \\frac{2(9800)\\sqrt{3.0}}{0.60 \\cdot 172800 \\cdot \\sqrt{64.4}} = \\frac{33,948}{831,744} = 0.0313\\text{ ft}^2
\\]
\\[
d_o = \\sqrt{\\frac{4 A_o}{\\pi}} \\times 12 = \\sqrt{\\frac{4(0.0313)}{\\pi}} \\times 12 = \\mathbf{2.4\\text{ inches}}
\\]
Therefore, **Option A** is correct!`,
      presetParams: {
        hsg: 'C',
        areaAcres: 12.0,
        rainP: 4.8,
        pctImpervious: 75,
        pctLawn: 20,
        pctWoods: 5,
        pctMeadow: 0,
        targetOutflowCfs: 4.2,
        pwq: 1.0,
        drawdownHours: 48,
        cd: 0.60,
        bottomL: 120,
        bottomW: 60,
        sideSlopeZ: 3.0,
        maxDepthH: 5.5,
        weirCrestL: 15.0,
        freeboardReq: 1.0
      }
    }
  ];

  // --- STATE OBJECT ---
  const state = {
    selectedPreset: 'prob46',
    activeView: 'profile', // 'profile' or 'hydrograph'
    activeProblemIndex: 0,
    selectedProblemOption: null,
    problemGraded: false,

    // Hydrologic Parameters
    hsg: 'C',
    areaAcres: 12.0,
    rainP: 4.8, // 24-hr design rainfall in inches
    preCover: 'meadow', // pre-development cover type
    pctImpervious: 75,
    pctLawn: 20,
    pctWoods: 5,
    pctMeadow: 0,

    // Hydraulics & Peak Discharge
    peakInflowCfsManual: 38.0, // estimated or computed
    targetOutflowCfs: 4.2,    // regulated allowable release

    // Water Quality & Extended Detention
    pwq: 1.0, // Water quality rainfall depth in inches (first flush)
    drawdownHours: 36, // Target hours for extended detention drawdown (24-72)
    cd: 0.60, // Orifice discharge coefficient

    // Basin Geometry & Freeboard
    bottomL: 120.0, // Bottom length (ft)
    bottomW: 60.0,  // Bottom width (ft)
    sideSlopeZ: 3.0, // Z:1 (H:V)
    maxDepthH: 5.5,  // Total interior embankment height (ft)
    weirCrestL: 15.0, // Emergency spillway weir crest length (ft)
    freeboardReq: 1.0 // Minimum required freeboard (ft)
  };

  // --- CORE HYDROLOGY & HYDRAULIC CALCULATIONS ---
  function computeAll() {
    // 1. Soil & Curve Numbers
    const hsg = state.hsg;
    const cnImp = CN_TABLE.impervious[hsg];
    const cnLawn = CN_TABLE.lawn_good[hsg];
    const cnWoods = CN_TABLE.woods_good[hsg];
    const cnMeadow = CN_TABLE.meadow[hsg];
    const cnPre = CN_TABLE[state.preCover][hsg];

    // Normalize percentages if needed
    const totalPct = state.pctImpervious + state.pctLawn + state.pctWoods + state.pctMeadow;
    const fImp = (state.pctImpervious / (totalPct || 100));
    const fLawn = (state.pctLawn / (totalPct || 100));
    const fWoods = (state.pctWoods / (totalPct || 100));
    const fMeadow = (state.pctMeadow / (totalPct || 100));

    const compositeCN = (fImp * cnImp) + (fLawn * cnLawn) + (fWoods * cnWoods) + (fMeadow * cnMeadow);

    // Potential Maximum Retention S and Initial Abstraction Ia
    const S_post = (1000.0 / compositeCN) - 10.0;
    const Ia_post = 0.2 * S_post;

    const S_pre = (1000.0 / cnPre) - 10.0;
    const Ia_pre = 0.2 * S_pre;

    // Direct Runoff Depth Q (NRCS TR-55)
    const P = state.rainP;
    const Q_post = P > Ia_post ? Math.pow(P - Ia_post, 2) / (P + 0.8 * S_post) : 0.0;
    const Q_pre = P > Ia_pre ? Math.pow(P - Ia_pre, 2) / (P + 0.8 * S_pre) : 0.0;

    // Runoff Volumes
    const V_post_acft = (Q_post / 12.0) * state.areaAcres;
    const V_post_cuft = V_post_acft * 43560.0;
    const V_post_gal = V_post_cuft * 7.48052;

    const V_pre_acft = (Q_pre / 12.0) * state.areaAcres;
    const V_pre_cuft = V_pre_acft * 43560.0;

    // 2. Peak Flow Estimation (TR-55 Unit Peak Discharge Approximation)
    // q_p = q_u * A * Q_depth
    // We compute peak inflow scaling with area and runoff depth
    const q_in = Math.max(state.peakInflowCfsManual, (Q_post * state.areaAcres * 1.5) + 5.0);
    const q_out = Math.min(state.targetOutflowCfs, q_in * 0.95);

    // TR-55 Detention Storage Ratio Vs/Vr
    const rq = Math.min(0.999, Math.max(0.01, q_out / q_in));
    // TR-55 Polynomial: Vs/Vr = 0.682 - 1.43(qo/qi) + 1.64(qo/qi)^2 - 0.804(qo/qi)^3
    let ratio_Vs_Vr = 0.682 - (1.43 * rq) + (1.64 * Math.pow(rq, 2)) - (0.804 * Math.pow(rq, 3));
    ratio_Vs_Vr = Math.max(0.05, Math.min(0.95, ratio_Vs_Vr));

    const V_det_req_acft = ratio_Vs_Vr * V_post_acft;
    const V_det_req_cuft = V_det_req_acft * 43560.0;
    const V_det_req_gal = V_det_req_cuft * 7.48052;

    // 3. Water Quality Volume (WQv) & Drawdown
    // WQv = (P_wq * Rv * A) / 12, where Rv = 0.05 + 0.009 * (% impervious)
    const Rv = 0.05 + (0.009 * (fImp * 100.0));
    const WQv_acft = (state.pwq * Rv * state.areaAcres) / 12.0;
    const WQv_cuft = WQv_acft * 43560.0;
    const WQv_gal = WQv_cuft * 7.48052;

    // 4. Stage-Storage Geometry (Prismoidal Frustum Formula)
    // Bottom area A0 = L * W
    const A0 = state.bottomL * state.bottomW;
    const Z = state.sideSlopeZ;
    const H_total = state.maxDepthH;

    function frustumVolume(h) {
      if (h <= 0) return 0;
      const Lh = state.bottomL + (2 * Z * h);
      const Wh = state.bottomW + (2 * Z * h);
      const Ah = Lh * Wh;
      return (h / 3.0) * (A0 + Ah + Math.sqrt(A0 * Ah));
    }

    function frustumArea(h) {
      const Lh = state.bottomL + (2 * Z * h);
      const Wh = state.bottomW + (2 * Z * h);
      return Lh * Wh;
    }

    const V_basin_max_cuft = frustumVolume(H_total);
    const V_basin_max_acft = V_basin_max_cuft / 43560.0;
    const V_basin_max_gal = V_basin_max_cuft * 7.48052;

    // Solve for Depth corresponding to Water Quality Volume
    let h_wq = 0.5;
    for (let i = 0; i < 30; i++) {
      const f = frustumVolume(h_wq) - WQv_cuft;
      const df = frustumArea(h_wq);
      if (Math.abs(f) < 1.0 || df <= 0) break;
      h_wq = Math.max(0.1, h_wq - (f / df));
    }
    h_wq = Math.min(H_total * 0.7, Math.max(0.5, h_wq));

    // Solve for Depth corresponding to Required Detention Storage (Design High Water - DHW)
    let h_dhw = h_wq + 1.0;
    for (let i = 0; i < 30; i++) {
      const f = frustumVolume(h_dhw) - V_det_req_cuft;
      const df = frustumArea(h_dhw);
      if (Math.abs(f) < 1.0 || df <= 0) break;
      h_dhw = Math.max(h_wq + 0.1, h_dhw - (f / df));
    }
    h_dhw = Math.min(H_total, Math.max(h_wq + 0.2, h_dhw));

    // 5. Orifice Drawdown Sizing (Falling Head)
    // Ao = (2 * A_avg * sqrt(h_wq)) / (Cd * t_seconds * sqrt(2g))
    const A_avg_wq = (A0 + frustumArea(h_wq)) / 2.0;
    const t_sec = state.drawdownHours * 3600.0;
    const g = 32.174;
    const Ao_cuft = (2.0 * A_avg_wq * Math.sqrt(h_wq)) / (state.cd * t_sec * Math.sqrt(2.0 * g));
    const orificeDiamInches = Math.sqrt((4.0 * Ao_cuft) / Math.PI) * 12.0;

    // 6. Emergency Spillway Weir Sizing (Broad-Crested Weir)
    // Q_weir = Cw * L_w * H_w^(1.5), where Cw ~ 3.1
    const Cw = 3.1;
    const L_weir = state.weirCrestL;
    // Weir crest elevation is placed at 100-yr / 25-yr DHW
    // Head over spillway during emergency peak inflow
    const H_weir = Math.pow(q_in / (Cw * L_weir), 2.0 / 3.0);
    const highWaterEl = h_dhw + H_weir;
    const freeboardProvided = H_total - highWaterEl;
    const isFreeboardSufficient = freeboardProvided >= state.freeboardReq;
    const capacityRatio = V_basin_max_cuft / (V_det_req_cuft || 1);

    // Problem #46 Continuous Flow Flooding Duration
    // t = V / Q
    const prob46BasinCuft = 250000.0 / 7.48052; // 33,420 cu ft
    const prob46DurationHrs = (prob46BasinCuft / (2.0 * 3600.0)); // 4.64 hrs

    return {
      hsg,
      compositeCN,
      cnImp,
      cnLawn,
      cnWoods,
      cnMeadow,
      cnPre,
      fImp,
      fLawn,
      fWoods,
      fMeadow,
      totalPct,
      S_post,
      Ia_post,
      S_pre,
      Ia_pre,
      Q_post,
      Q_pre,
      V_post_acft,
      V_post_cuft,
      V_post_gal,
      V_pre_acft,
      V_pre_cuft,
      q_in,
      q_out,
      rq,
      ratio_Vs_Vr,
      V_det_req_acft,
      V_det_req_cuft,
      V_det_req_gal,
      Rv,
      WQv_acft,
      WQv_cuft,
      WQv_gal,
      A0,
      H_total,
      h_wq,
      h_dhw,
      V_basin_max_cuft,
      V_basin_max_acft,
      V_basin_max_gal,
      Ao_cuft,
      orificeDiamInches,
      Cw,
      L_weir,
      H_weir,
      highWaterEl,
      freeboardProvided,
      isFreeboardSufficient,
      capacityRatio,
      prob46BasinCuft,
      prob46DurationHrs
    };
  }

  // --- RENDER DYNAMIC 2D SVG PROFILE & HYDROGRAPH ---
  function renderSvg(res) {
    const wrapper = document.getElementById('stormwaterSvgWrapper');
    if (!wrapper) return;

    if (state.activeView === 'hydrograph') {
      wrapper.innerHTML = renderHydrographSvg(res);
    } else {
      wrapper.innerHTML = renderProfileSvg(res);
    }
  }

  function renderProfileSvg(res) {
    const W = 800;
    const H = 380;
    const groundY = 320;
    const pondDepthPx = 200; // corresponds to H_total
    const scaleY = pondDepthPx / res.H_total;

    const botY = groundY;
    const topY = groundY - pondDepthPx;
    const wqY = groundY - (res.h_wq * scaleY);
    const dhwY = groundY - (res.h_dhw * scaleY);
    const emergY = Math.max(topY - 10, groundY - (res.highWaterEl * scaleY));

    // Coordinate layout for trapezoidal pond
    const cx = 370;
    const botHalfW = 110;
    const topHalfW = 230;

    const bL = cx - botHalfW;
    const bR = cx + botHalfW;
    const tL = cx - topHalfW;
    const tR = cx + topHalfW;

    // Sloped water levels
    function getWaterHalfW(y) {
      const depth = groundY - y;
      const fraction = depth / pondDepthPx;
      return botHalfW + (topHalfW - botHalfW) * fraction;
    }

    const wqHalfW = getWaterHalfW(wqY);
    const dhwHalfW = getWaterHalfW(dhwY);

    const isSafe = res.isFreeboardSufficient && res.capacityRatio >= 1.0;
    const statusColor = isSafe ? '#10b981' : '#ef4444';

    return `
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a; border-radius:8px; font-family:var(--font-sans, system-ui, sans-serif);">
        <defs>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#334155" />
            <stop offset="100%" stop-color="#1e293b" />
          </linearGradient>
          <linearGradient id="wqWaterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(56, 189, 248, 0.65)" />
            <stop offset="100%" stop-color="rgba(14, 165, 233, 0.85)" />
          </linearGradient>
          <linearGradient id="dhwWaterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(99, 102, 241, 0.45)" />
            <stop offset="100%" stop-color="rgba(59, 130, 246, 0.25)" />
          </linearGradient>
          <pattern id="soilHash" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#475569" stroke-width="1.5" />
          </pattern>
        </defs>

        <!-- Surrounding Ground / Embankment Cross Section -->
        <polygon points="20,${topY} ${tL},${topY} ${bL},${botY} ${bR},${botY} ${tR},${topY} 780,${topY} 780,360 20,360" fill="url(#groundGrad)" stroke="#475569" stroke-width="2" />
        <polygon points="20,${topY} ${tL},${topY} ${bL},${botY} ${bR},${botY} ${tR},${topY} 780,${topY} 780,360 20,360" fill="url(#soilHash)" opacity="0.18" />

        <!-- Inflow Pipe & Forebay Rip-Rap (Left Side) -->
        <rect x="35" y="${topY + 15}" width="75" height="26" rx="4" fill="#64748b" stroke="#94a3b8" stroke-width="1.5" />
        <ellipse cx="110" cy="${topY + 28}" rx="6" ry="13" fill="#334155" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="72" y="${topY + 10}" fill="#94a3b8" font-size="10" font-weight="700" text-anchor="middle">INFLOW PIPE (Q_in)</text>
        <path d="M 112,${topY + 30} Q 135,${topY + 45} 145,${topY + 80}" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4,3" />

        <!-- Detention Water Layer (Between WQ level and DHW level) -->
        <polygon points="${cx - dhwHalfW},${dhwY} ${cx + dhwHalfW},${dhwY} ${cx + wqHalfW},${wqY} ${cx - wqHalfW},${wqY}" fill="url(#dhwWaterGrad)" />

        <!-- Water Quality Layer (Bottom pool up to h_wq) -->
        <polygon points="${cx - wqHalfW},${wqY} ${cx + wqHalfW},${wqY} ${bR},${botY} ${bL},${botY}" fill="url(#wqWaterGrad)" />

        <!-- Basin Interior Side Slopes Annotation -->
        <text x="${tL - 10}" y="${(topY + botY) / 2}" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="end">Side Slope ${res.Z}:1 (H:V)</text>
        <line x1="${tL - 5}" y1="${(topY + botY) / 2 - 15}" x2="${tL + 25}" y2="${(topY + botY) / 2 - 15}" stroke="#cbd5e1" stroke-width="1" />
        <line x1="${tL + 25}" y1="${(topY + botY) / 2 - 15}" x2="${tL + 25}" y2="${(topY + botY) / 2 + 5}" stroke="#cbd5e1" stroke-width="1" />

        <!-- Multi-Stage Outlet Riser Structure (Right Side) -->
        <g id="riserStructure">
          <!-- Concrete Riser Barrel -->
          <rect x="610" y="${dhwY - 10}" width="42" height="${botY - dhwY + 10}" fill="#475569" stroke="#94a3b8" stroke-width="2" rx="2" />
          <!-- Trash Rack / Crest Grate at Top of Riser -->
          <line x1="606" y1="${dhwY - 10}" x2="656" y2="${dhwY - 10}" stroke="#f59e0b" stroke-width="3" />
          <line x1="612" y1="${dhwY - 15}" x2="612" y2="${dhwY - 10}" stroke="#f59e0b" stroke-width="2" />
          <line x1="624" y1="${dhwY - 17}" x2="624" y2="${dhwY - 10}" stroke="#f59e0b" stroke-width="2" />
          <line x1="636" y1="${dhwY - 17}" x2="636" y2="${dhwY - 10}" stroke="#f59e0b" stroke-width="2" />
          <line x1="648" y1="${dhwY - 15}" x2="648" y2="${dhwY - 10}" stroke="#f59e0b" stroke-width="2" />
          <text x="631" y="${dhwY - 24}" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="middle">Stage 2: 25-Yr Riser Crest</text>

          <!-- Low-Flow Extended Detention Orifice -->
          <circle cx="610" cy="${botY - 15}" r="5" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
          <!-- Flow jet exiting orifice -->
          <path d="M 610,${botY - 15} Q 630,${botY - 12} 665,${botY - 10}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="3,2" />
          <text x="595" y="${botY - 12}" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="end">Stage 1: Low-Flow Orifice (Ø ${res.orificeDiamInches.toFixed(1)}")</text>

          <!-- Outfall Barrel Pipe -->
          <rect x="652" y="${botY - 25}" width="115" height="24" rx="2" fill="#334155" stroke="#94a3b8" stroke-width="1.5" />
          <text x="710" y="${botY - 30}" fill="#94a3b8" font-size="9" font-weight="600" text-anchor="middle">DISCHARGE CULVERT (q_out)</text>
        </g>

        <!-- Water Quality Elevation Line & Marker -->
        <line x1="${cx - wqHalfW}" y1="${wqY}" x2="${cx + wqHalfW}" y2="${wqY}" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,3" />
        <polygon points="${cx},${wqY} ${cx - 7},${wqY - 12} ${cx + 7},${wqY - 12}" fill="#38bdf8" />
        <text x="${cx + 12}" y="${wqY - 3}" fill="#38bdf8" font-size="10" font-weight="700">WQv Level: h_wq = ${res.h_wq.toFixed(2)} ft (${(res.WQv_acft).toFixed(2)} ac-ft)</text>

        <!-- 25-Yr Design High Water (DHW) Elevation Line & Marker -->
        <line x1="${cx - dhwHalfW}" y1="${dhwY}" x2="${cx + dhwHalfW}" y2="${dhwY}" stroke="#818cf8" stroke-width="2" stroke-dasharray="6,3" />
        <polygon points="${cx - 80},${dhwY} ${cx - 87},${dhwY - 12} ${cx - 73},${dhwY - 12}" fill="#818cf8" />
        <text x="${cx - 68}" y="${dhwY - 4}" fill="#818cf8" font-size="10" font-weight="700">25-Yr DHW: h_dhw = ${res.h_dhw.toFixed(2)} ft (V_det = ${res.V_det_req_acft.toFixed(2)} ac-ft)</text>

        <!-- Emergency Broad-Crested Spillway & Freeboard on Embankment -->
        <line x1="20" y1="${topY}" x2="780" y2="${topY}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2,2" />
        <text x="210" y="${topY - 8}" fill="#e2e8f0" font-size="11" font-weight="700">Top of Embankment Crest (H_total = ${res.H_total.toFixed(2)} ft)</text>

        <!-- Freeboard Dimension Line -->
        <line x1="170" y1="${topY}" x2="170" y2="${dhwY}" stroke="${statusColor}" stroke-width="2" marker-start="url(#dot)" />
        <line x1="165" y1="${topY}" x2="175" y2="${topY}" stroke="${statusColor}" stroke-width="2" />
        <line x1="165" y1="${dhwY}" x2="175" y2="${dhwY}" stroke="${statusColor}" stroke-width="2" />
        <text x="160" y="${(topY + dhwY) / 2 + 4}" fill="${statusColor}" font-size="10" font-weight="800" text-anchor="end">Freeboard: ${res.freeboardProvided.toFixed(2)} ft (${isSafe ? '✓ OK ≥ 1.0 ft' : '⚠️ INSUFFICIENT'})</text>

        <!-- Bottom Dimension Line -->
        <line x1="${bL}" y1="${botY + 22}" x2="${bR}" y2="${botY + 22}" stroke="#94a3b8" stroke-width="1.5" />
        <line x1="${bL}" y1="${botY + 16}" x2="${bL}" y2="${botY + 28}" stroke="#94a3b8" stroke-width="1.5" />
        <line x1="${bR}" y1="${botY + 16}" x2="${bR}" y2="${botY + 28}" stroke="#94a3b8" stroke-width="1.5" />
        <text x="${cx}" y="${botY + 36}" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="middle">Basin Bottom: ${state.bottomL} ft × ${state.bottomW} ft (A_0 = ${(res.A0).toLocaleString()} ft²)</text>

        <!-- Summary Legend Badge -->
        <rect x="25" y="25" width="280" height="74" rx="6" fill="rgba(15, 23, 42, 0.88)" stroke="#334155" stroke-width="1.5" />
        <circle cx="42" cy="45" r="5" fill="#38bdf8" />
        <text x="56" y="49" fill="#f8fafc" font-size="11" font-weight="600">Water Quality Vol: <tspan fill="#38bdf8" font-weight="700">${res.WQv_acft.toFixed(2)} ac-ft</tspan> (${(res.WQv_gal).toLocaleString(undefined, {maximumFractionDigits:0})} gal)</text>
        <circle cx="42" cy="65" r="5" fill="#818cf8" />
        <text x="56" y="69" fill="#f8fafc" font-size="11" font-weight="600">Required Detention: <tspan fill="#818cf8" font-weight="700">${res.V_det_req_acft.toFixed(2)} ac-ft</tspan> (${(res.V_det_req_gal).toLocaleString(undefined, {maximumFractionDigits:0})} gal)</text>
        <circle cx="42" cy="85" r="5" fill="${statusColor}" />
        <text x="56" y="89" fill="#f8fafc" font-size="11" font-weight="600">Basin Storage SF: <tspan fill="${statusColor}" font-weight="800">${res.capacityRatio.toFixed(2)}×</tspan> (${res.capacityRatio >= 1.0 ? 'Adequate' : 'Undersized'})</text>
      </svg>
    `;
  }

  function renderHydrographSvg(res) {
    const W = 800;
    const H = 380;
    const padL = 70;
    const padR = 40;
    const padT = 40;
    const padB = 60;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const maxQ = Math.max(res.q_in * 1.25, 40.0);
    const maxTime = 24.0; // hours

    function tx(time) { return padL + (time / maxTime) * plotW; }
    function ty(q) { return padT + plotH - (q / maxQ) * plotH; }

    // Inflow Hydrograph (Sharp early peak, e.g. peaking at t = 3.5 hrs)
    const tp_in = 3.5;
    const qPeak_in = res.q_in;
    const inflowPoints = [];
    for (let t = 0; t <= maxTime; t += 0.5) {
      let q = 0;
      if (t <= tp_in) {
        q = qPeak_in * Math.pow(t / tp_in, 2.5);
      } else {
        q = qPeak_in * Math.exp(-0.45 * (t - tp_in));
      }
      inflowPoints.push({ t, q });
    }

    // Routed Outflow Hydrograph (Delayed peak, lower magnitude q_out)
    const tp_out = 7.0;
    const qPeak_out = res.q_out;
    const outflowPoints = [];
    for (let t = 0; t <= maxTime; t += 0.5) {
      let q = 0;
      if (t < 1.0) {
        q = 0;
      } else if (t <= tp_out) {
        q = qPeak_out * Math.pow((t - 1.0) / (tp_out - 1.0), 1.8);
      } else {
        q = qPeak_out * Math.exp(-0.25 * (t - tp_out));
      }
      outflowPoints.push({ t, q });
    }

    // Build SVG Path strings
    const inPathStr = inflowPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${tx(p.t).toFixed(1)},${ty(p.q).toFixed(1)}`).join(' ');
    const outPathStr = outflowPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${tx(p.t).toFixed(1)},${ty(p.q).toFixed(1)}`).join(' ');

    // Shaded Detention Storage Volume polygon between Inflow and Outflow
    const storagePoints = [];
    // Go forward on inflow where inflow > outflow
    for (const p of inflowPoints) {
      const outP = outflowPoints.find(op => Math.abs(op.t - p.t) < 0.1);
      if (outP && p.q >= outP.q && p.t <= 14.0) {
        storagePoints.push(`${tx(p.t).toFixed(1)},${ty(p.q).toFixed(1)}`);
      }
    }
    // Return backward along outflow
    for (let i = outflowPoints.length - 1; i >= 0; i--) {
      const op = outflowPoints[i];
      const inP = inflowPoints.find(ip => Math.abs(ip.t - op.t) < 0.1);
      if (inP && inP.q >= op.q && op.t <= 14.0) {
        storagePoints.push(`${tx(op.t).toFixed(1)},${ty(op.q).toFixed(1)}`);
      }
    }
    const storagePolyStr = storagePoints.join(' ');

    return `
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a; border-radius:8px; font-family:var(--font-sans, system-ui, sans-serif);">
        <defs>
          <linearGradient id="storageAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(245, 158, 11, 0.45)" />
            <stop offset="100%" stop-color="rgba(245, 158, 11, 0.10)" />
          </linearGradient>
        </defs>

        <!-- Grid Lines & Axes -->
        ${[0, 0.25, 0.5, 0.75, 1.0].map(frac => {
          const valQ = frac * maxQ;
          const y = ty(valQ);
          return `
            <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#334155" stroke-width="1" stroke-dasharray="3,3" />
            <text x="${padL - 10}" y="${y + 4}" fill="#94a3b8" font-size="10" text-anchor="end">${valQ.toFixed(0)} cfs</text>
          `;
        }).join('')}

        ${[0, 4, 8, 12, 16, 20, 24].map(t => {
          const x = tx(t);
          return `
            <line x1="${x}" y1="${padT}" x2="${x}" y2="${H - padB}" stroke="#334155" stroke-width="1" stroke-dasharray="3,3" />
            <text x="${x}" y="${H - padB + 18}" fill="#94a3b8" font-size="10" text-anchor="middle">${t}h</text>
          `;
        }).join('')}

        <!-- Axes lines -->
        <line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="#64748b" stroke-width="2" />
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H - padB}" stroke="#64748b" stroke-width="2" />

        <text x="${W / 2}" y="${H - 15}" fill="#cbd5e1" font-size="12" font-weight="700" text-anchor="middle">Storm Elapsed Time (hours)</text>
        <text x="20" y="${H / 2}" fill="#cbd5e1" font-size="12" font-weight="700" text-anchor="middle" transform="rotate(-90, 20, ${H / 2})">Discharge (cfs)</text>

        <!-- Shaded Detention Storage Volume -->
        ${storagePolyStr ? `<polygon points="${storagePolyStr}" fill="url(#storageAreaGrad)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4,2" />` : ''}

        <!-- Inflow Curve -->
        <path d="${inPathStr}" fill="none" stroke="#ef4444" stroke-width="3" />
        <!-- Outflow Curve -->
        <path d="${outPathStr}" fill="none" stroke="#10b981" stroke-width="3" />

        <!-- Peak Inflow Callout -->
        <circle cx="${tx(tp_in)}" cy="${ty(qPeak_in)}" r="6" fill="#ef4444" stroke="#fff" stroke-width="2" />
        <text x="${tx(tp_in) + 10}" y="${ty(qPeak_in) - 10}" fill="#ef4444" font-size="11" font-weight="800">Peak Inflow: q_in = ${res.q_in.toFixed(1)} cfs</text>

        <!-- Peak Outflow Callout -->
        <circle cx="${tx(tp_out)}" cy="${ty(qPeak_out)}" r="6" fill="#10b981" stroke="#fff" stroke-width="2" />
        <text x="${tx(tp_out) + 12}" y="${ty(qPeak_out) - 8}" fill="#10b981" font-size="11" font-weight="800">Attenuated Outflow: q_out = ${res.q_out.toFixed(1)} cfs</text>

        <!-- Lag Time Arrow -->
        <line x1="${tx(tp_in)}" y1="${ty(maxQ * 0.95)}" x2="${tx(tp_out)}" y2="${ty(maxQ * 0.95)}" stroke="#38bdf8" stroke-width="2" />
        <polygon points="${tx(tp_out)},${ty(maxQ * 0.95)} ${tx(tp_out) - 6},${ty(maxQ * 0.95) - 4} ${tx(tp_out) - 6},${ty(maxQ * 0.95) + 4}" fill="#38bdf8" />
        <text x="${(tx(tp_in) + tx(tp_out)) / 2}" y="${ty(maxQ * 0.95) - 6}" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">Hydrograph Lag Δtp = ${(tp_out - tp_in).toFixed(1)} hrs</text>

        <!-- Legend Card -->
        <rect x="${W - 250}" y="${padT + 10}" width="200" height="78" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#334155" stroke-width="1.5" />
        <line x1="${W - 235}" y1="${padT + 28}" x2="${W - 205}" y2="${padT + 28}" stroke="#ef4444" stroke-width="3" />
        <text x="${W - 195}" y="${padT + 32}" fill="#f8fafc" font-size="10" font-weight="600">Post-Dev Inflow Hydrograph</text>
        <line x1="${W - 235}" y1="${padT + 48}" x2="${W - 205}" y2="${padT + 48}" stroke="#10b981" stroke-width="3" />
        <text x="${W - 195}" y="${padT + 52}" fill="#f8fafc" font-size="10" font-weight="600">Routed Outflow Hydrograph</text>
        <rect x="${W - 235}" y="${padT + 62}" width="24" height="12" fill="rgba(245, 158, 11, 0.4)" stroke="#f59e0b" stroke-width="1" />
        <text x="${W - 195}" y="${padT + 72}" fill="#f59e0b" font-size="10" font-weight="700">Detention Storage Vol (V_s)</text>
      </svg>
    `;
  }

  // --- RENDER DYNAMIC STEP-BY-STEP KATEX DERIVATIONS ---
  function renderKaTeXDerivations(res) {
    const container = document.getElementById('stormwaterMathContainer');
    if (!container) return;

    const html = `
      <!-- Step 1: NRCS Hydrologic Soil Group & Composite Curve Number -->
      <div class="helical-step-card">
        <h4>Step 1: Hydrologic Soil Group (${res.hsg}) & Composite Curve Number (\\(CN\\))</h4>
        <p style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:0.5rem;">
          ${HSG_INFO[res.hsg].title}. Calculated composite Curve Number across drainage area \\(A = ${state.areaAcres.toFixed(1)}\\text{ acres}\\):
        </p>
        <div class="math-block">\\[
          CN_{\\text{composite}} = \\frac{\\sum (CN_i \\cdot A_i)}{\\sum A_i} = \\frac{(${res.cnImp} \\times ${res.fImp.toFixed(2)}) + (${res.cnLawn} \\times ${res.fLawn.toFixed(2)}) + (${res.cnWoods} \\times ${res.fWoods.toFixed(2)}) + (${res.cnMeadow} \\times ${res.fMeadow.toFixed(2)})}{1.00} = \\mathbf{${res.compositeCN.toFixed(1)}}
        \\]</div>
        <div class="math-block">\\[
          \\text{Pre-Development } CN_{\\text{pre}} = ${res.cnPre} \\quad (\\text{Natural condition: } ${CN_TABLE[state.preCover].name})
        \\]</div>
      </div>

      <!-- Step 2: Potential Maximum Retention & Direct Runoff Depth -->
      <div class="helical-step-card">
        <h4>Step 2: Potential Maximum Retention (\\(S\\)), Initial Abstraction (\\(I_a\\)), and Runoff Depth (\\(Q\\))</h4>
        <div class="math-block">\\[
          S_{\\text{post}} = \\frac{1000}{CN} - 10 = \\frac{1000}{${res.compositeCN.toFixed(1)}} - 10 = \\mathbf{${res.S_post.toFixed(3)} \\text{ inches}}
        \\]</div>
        <div class="math-block">\\[
          I_{a,\\text{post}} = 0.2 \\cdot S_{\\text{post}} = 0.2 \\times ${res.S_post.toFixed(3)} = \\mathbf{${res.Ia_post.toFixed(3)} \\text{ inches}}
        \\]</div>
        <div class="math-block">\\[
          Q_{\\text{post}} = \\frac{(P - 0.2S)^2}{P + 0.8S} = \\frac{(${state.rainP.toFixed(2)} - ${res.Ia_post.toFixed(3)})^2}{${state.rainP.toFixed(2)} + 0.8(${res.S_post.toFixed(3)})} = \\mathbf{${res.Q_post.toFixed(2)} \\text{ inches}}
        \\]</div>
        <div class="math-block">\\[
          V_{\\text{post}} = \\frac{Q_{\\text{post}}}{12} \\times A = \\frac{${res.Q_post.toFixed(2)}}{12} \\times ${state.areaAcres.toFixed(1)} \\text{ ac} = \\mathbf{${res.V_post_acft.toFixed(2)} \\text{ acre-ft}} \\quad (${Math.round(res.V_post_cuft).toLocaleString()} \\text{ ft}^3 = ${Math.round(res.V_post_gal).toLocaleString()} \\text{ gal})
        \\]</div>
      </div>

      <!-- Step 3: Peak Attenuation & TR-55 Detention Storage Ratio -->
      <div class="helical-step-card">
        <h4>Step 3: Hydrograph Routing & Required Detention Storage Volume (\\(V_s\\))</h4>
        <p style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:0.5rem;">
          Inflow peak discharge \\(q_i = ${res.q_in.toFixed(1)}\\text{ cfs}\\); allowable target outflow discharge \\(q_o = ${res.q_out.toFixed(1)}\\text{ cfs}\\):
        </p>
        <div class="math-block">\\[
          \\frac{q_o}{q_i} = \\frac{${res.q_out.toFixed(1)}}{${res.q_in.toFixed(1)}} = ${res.rq.toFixed(3)}
        \\]</div>
        <div class="math-block">\\[
          \\frac{V_s}{V_r} = 0.682 - 1.43\\left(\\frac{q_o}{q_i}\\right) + 1.64\\left(\\frac{q_o}{q_i}\\right)^2 - 0.804\\left(\\frac{q_o}{q_i}\\right)^3 = \\mathbf{${res.ratio_Vs_Vr.toFixed(3)}}
        \\]</div>
        <div class="math-block">\\[
          V_{s,\\text{req}} = \\left(\\frac{V_s}{V_r}\\right) \\times V_{\\text{post}} = ${res.ratio_Vs_Vr.toFixed(3)} \\times ${res.V_post_acft.toFixed(2)} \\text{ ac-ft} = \\mathbf{${res.V_det_req_acft.toFixed(2)} \\text{ acre-ft}} \\quad (${Math.round(res.V_det_req_cuft).toLocaleString()} \\text{ ft}^3)
        \\]</div>
      </div>

      <!-- Step 4: Water Quality Treatment Volume (WQv) & Drawdown Orifice -->
      <div class="helical-step-card">
        <h4>Step 4: Water Quality Volume (\\(WQ_v\\)) & Falling-Head Low-Flow Orifice Sizing</h4>
        <div class="math-block">\\[
          R_v = 0.05 + 0.009(\\%\\text{Impervious}) = 0.05 + 0.009(${Math.round(res.fImp * 100)}) = ${res.Rv.toFixed(3)}
        \\]</div>
        <div class="math-block">\\[
          WQ_v = \\frac{P_{wq} \\cdot R_v \\cdot A}{12} = \\frac{${state.pwq.toFixed(2)} \\times ${res.Rv.toFixed(3)} \\times ${state.areaAcres.toFixed(1)}}{12} = \\mathbf{${res.WQv_acft.toFixed(2)} \\text{ acre-ft}} \\quad (${Math.round(res.WQv_gal).toLocaleString()} \\text{ gallons})
        \\]</div>
        <div class="math-block">\\[
          A_o = \\frac{2 A_{\\text{avg}} \\sqrt{h_{wq}}}{C_d \\cdot t_{\\text{draw}} \\cdot \\sqrt{2g}} = \\frac{2(${Math.round(res.A0)} \\text{ ft}^2)\\sqrt{${res.h_wq.toFixed(2)}}}{${state.cd.toFixed(2)} \\times (${state.drawdownHours} \\times 3600\\text{ s}) \\times 8.022} = \\mathbf{${res.Ao_cuft.toFixed(4)} \\text{ ft}^2}
        \\]</div>
        <div class="math-block">\\[
          d_o = \\sqrt{\\frac{4 A_o}{\\pi}} \\times 12 = \\sqrt{\\frac{4(${res.Ao_cuft.toFixed(4)})}{\\pi}} \\times 12 = \\mathbf{${res.orificeDiamInches.toFixed(2)} \\text{ inches}}
        \\]</div>
      </div>

      <!-- Step 5: Basin Prismoidal Frustum Geometry & Safety Factor Check -->
      <div class="helical-step-card">
        <h4>Step 5: Prismoidal Frustum Basin Capacity & Elevation-Storage Verification</h4>
        <div class="math-block">\\[
          A_0 = L_b \\times W_b = ${state.bottomL} \\times ${state.bottomW} = ${Math.round(res.A0).toLocaleString()} \\text{ ft}^2
        \\]</div>
        <div class="math-block">\\[
          V(h) = \\frac{h}{3} \\left( A_0 + A_h + \\sqrt{A_0 A_h} \\right) \\implies V_{\\text{total}}(${res.H_total.toFixed(2)}\\text{ ft}) = \\mathbf{${res.V_basin_max_acft.toFixed(2)} \\text{ acre-ft}} \\quad (${Math.round(res.V_basin_max_cuft).toLocaleString()} \\text{ ft}^3)
        \\]</div>
        <div class="math-block">\\[
          \\text{Capacity Safety Factor } SF = \\frac{V_{\\text{basin,max}}}{V_{s,\\text{req}}} = \\frac{${res.V_basin_max_acft.toFixed(2)}}{${res.V_det_req_acft.toFixed(2)}} = \\mathbf{${res.capacityRatio.toFixed(2)}\\times} \\quad (${res.capacityRatio >= 1.0 ? '\\ge 1.0 \\text{ (ADEQUATE)}' : '< 1.0 \\text{ (UNDERSIZED!)}'})
        \\]</div>
      </div>

      <!-- Step 6: Emergency Broad-Crested Spillway Weir & Freeboard Clearance -->
      <div class="helical-step-card ${!res.isFreeboardSufficient ? 'danger-border' : ''}">
        <h4>Step 6: Emergency Spillway Broad-Crested Weir & Freeboard Compliance</h4>
        <div class="math-block">\\[
          Q_{\\text{weir}} = C_w \\cdot L_w \\cdot H_w^{1.5} \\implies H_w = \\left( \\frac{q_i}{C_w \\cdot L_w} \\right)^{2/3} = \\left( \\frac{${res.q_in.toFixed(1)}}{3.1 \\times ${res.L_weir.toFixed(1)}} \\right)^{2/3} = \\mathbf{${res.H_weir.toFixed(2)} \\text{ ft}}
        \\]</div>
        <div class="math-block">\\[
          \\text{Freeboard Provided} = H_{\\text{total}} - (h_{\\text{dhw}} + H_w) = ${res.H_total.toFixed(2)} - (${res.h_dhw.toFixed(2)} + ${res.H_weir.toFixed(2)}) = \\mathbf{${res.freeboardProvided.toFixed(2)} \\text{ ft}}
        \\]</div>
        <div class="ncees-formula-note" style="margin-top:0.6rem; padding:0.6rem 0.8rem; background:var(--bg-elevated); border-left:3px solid ${res.isFreeboardSufficient ? 'var(--primary)' : '#ef4444'}; border-radius:4px; font-size:0.85rem;">
          <strong>Freeboard Code Check:</strong> Minimum required freeboard is \\(${state.freeboardReq.toFixed(1)}\\text{ ft}\\).
          Provided freeboard is \\(${res.freeboardProvided.toFixed(2)}\\text{ ft}\\).
          Status: <strong>${res.isFreeboardSufficient ? '✓ FULLY COMPLIANT' : '⚠️ VIOLATION: EMBANKMENT OVERTOPPING HAZARD'}</strong>.
        </div>
      </div>
    `;

    container.innerHTML = html;

    if (window.renderMathInElement) {
      window.renderMathInElement(container, {
        delimiters: [
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  // --- UPDATE KPI BAR & STATUS BADGES ---
  function updateKpiBar(res) {
    const kpiCn = document.getElementById('stormwaterKpiCn');
    const kpiQ = document.getElementById('stormwaterKpiQ');
    const kpiVdet = document.getElementById('stormwaterKpiVdet');
    const kpiVprov = document.getElementById('stormwaterKpiVprov');
    const badge = document.getElementById('stormwaterKpiBadge');

    if (kpiCn) kpiCn.textContent = res.compositeCN.toFixed(1);
    if (kpiQ) kpiQ.textContent = `${res.Q_post.toFixed(2)} in`;
    if (kpiVdet) kpiVdet.textContent = `${res.V_det_req_acft.toFixed(2)} ac-ft (${Math.round(res.V_det_req_cuft / 1000)}k ft³)`;
    if (kpiVprov) kpiVprov.textContent = `${res.V_basin_max_acft.toFixed(2)} ac-ft (${res.capacityRatio.toFixed(2)}×)`;

    if (badge) {
      if (res.capacityRatio >= 1.0 && res.isFreeboardSufficient) {
        badge.className = 'npsh-status-badge status-safe';
        badge.textContent = `✓ CAPACITY SUFFICIENT (${res.capacityRatio.toFixed(1)}× SF)`;
      } else if (res.capacityRatio >= 1.0 && !res.isFreeboardSufficient) {
        badge.className = 'npsh-status-badge status-warning';
        badge.textContent = `⚠️ LOW FREEBOARD (${res.freeboardProvided.toFixed(1)} ft)`;
      } else {
        badge.className = 'npsh-status-badge status-danger';
        badge.style.background = 'rgba(239, 68, 68, 0.15)';
        badge.style.color = '#ef4444';
        badge.style.border = '1px solid rgba(239, 68, 68, 0.4)';
        badge.textContent = `⚠️ UNDERSIZED BASIN (${res.capacityRatio.toFixed(2)}×)`;
      }
    }
  }

  // --- RENDER PRACTICE PROBLEM COMPONENT ---
  function renderPracticeProblem() {
    const box = document.getElementById('stormwaterProblemBox');
    if (!box) return;

    const prob = EXAM_PROBLEMS[state.activeProblemIndex];
    if (!prob) return;

    const optHtml = prob.options.map(opt => `
      <label class="exam-problem-option ${state.selectedProblemOption === opt.label ? 'selected' : ''}">
        <input type="radio" name="stormwaterProbOption" value="${opt.label}" ${state.selectedProblemOption === opt.label ? 'checked' : ''}>
        <span class="opt-label">${opt.label}.</span>
        <span class="opt-text">${opt.text}</span>
      </label>
    `).join('');

    let feedbackHtml = '';
    if (state.problemGraded) {
      const chosenOpt = prob.options.find(o => o.label === state.selectedProblemOption);
      const isCorrect = chosenOpt && chosenOpt.correct;
      feedbackHtml = `
        <div class="exam-feedback-card ${isCorrect ? 'correct' : 'incorrect'}" style="margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; background: ${isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border: 1px solid ${isCorrect ? '#10b981' : '#ef4444'};">
          <div style="font-weight: 800; font-size: 0.95rem; color: ${isCorrect ? '#10b981' : '#ef4444'}; margin-bottom: 0.4rem;">
            ${isCorrect ? '🎉 Correct Answer!' : '❌ Incorrect Selection'}
          </div>
          <div class="math-block" style="font-size: 0.85rem; color: var(--text-primary); line-height: 1.5;">
            ${prob.explanation.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
    }

    box.innerHTML = `
      <div class="exam-problem-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--primary);">🎯 NCEES PE Exam Interactive Practice Problem</h4>
        <div style="display: flex; gap: 0.4rem;">
          ${EXAM_PROBLEMS.map((p, idx) => `
            <button class="btn btn-xs ${state.activeProblemIndex === idx ? 'btn-primary' : 'btn-outline'}" onclick="StormwaterCalculator.selectProblem(${idx})" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">
              Prob ${idx + 1}
            </button>
          `).join('')}
        </div>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-primary); line-height: 1.45; margin-bottom: 0.6rem; white-space: pre-line;">
        ${prob.statement}
      </p>
      <div class="exam-problem-options" style="display: flex; flex-direction: column; gap: 0.4rem;">
        ${optHtml}
      </div>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
        <button id="btnSubmitStormwaterProblem" class="btn btn-sm btn-primary" style="flex: 1; font-weight: 700; background: linear-gradient(135deg, #0284c7, #0d9488); border: none;">
          ✓ Submit & Check Answer
        </button>
        <button id="btnLoadStormwaterProblem" class="btn btn-sm btn-outline" style="flex: 1; font-weight: 600;" title="Load this problem's parameters into the interactive simulator sliders">
          🔄 Sync Simulator With Problem
        </button>
      </div>
      ${feedbackHtml}
    `;

    // Bind option selections
    const radios = box.querySelectorAll('input[name="stormwaterProbOption"]');
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.selectedProblemOption = e.target.value;
        state.problemGraded = false;
        renderPracticeProblem();
      });
    });

    const submitBtn = document.getElementById('btnSubmitStormwaterProblem');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (!state.selectedProblemOption) {
          alert('Please select an option before submitting!');
          return;
        }
        state.problemGraded = true;
        renderPracticeProblem();
        if (window.renderMathInElement) {
          window.renderMathInElement(box, {
            delimiters: [
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false }
            ],
            throwOnError: false
          });
        }
      });
    }

    const loadBtn = document.getElementById('btnLoadStormwaterProblem');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => {
        if (prob.presetParams) {
          Object.assign(state, prob.presetParams);
          syncAllControls();
          recalculateAndRender();
        }
      });
    }
  }

  // --- RECALCULATE & RENDER DISPATCHER ---
  function recalculateAndRender() {
    const res = computeAll();
    updateKpiBar(res);
    renderSvg(res);
    renderKaTeXDerivations(res);

    // Update real-time label callouts in controls
    const lblArea = document.getElementById('lblAreaAcres');
    if (lblArea) lblArea.textContent = `${state.areaAcres.toFixed(1)} ac`;

    const lblRain = document.getElementById('lblRainP');
    if (lblRain) lblRain.textContent = `${state.rainP.toFixed(2)} in`;

    const lblImp = document.getElementById('lblPctImpervious');
    if (lblImp) lblImp.textContent = `${state.pctImpervious}% (CN=${CN_TABLE.impervious[state.hsg]})`;

    const lblLawn = document.getElementById('lblPctLawn');
    if (lblLawn) lblLawn.textContent = `${state.pctLawn}% (CN=${CN_TABLE.lawn_good[state.hsg]})`;

    const lblWoods = document.getElementById('lblPctWoods');
    if (lblWoods) lblWoods.textContent = `${state.pctWoods}% (CN=${CN_TABLE.woods_good[state.hsg]})`;

    const lblMeadow = document.getElementById('lblPctMeadow');
    if (lblMeadow) lblMeadow.textContent = `${state.pctMeadow}% (CN=${CN_TABLE.meadow[state.hsg]})`;

    const lblDrawdown = document.getElementById('lblDrawdownHours');
    if (lblDrawdown) lblDrawdown.textContent = `${state.drawdownHours} hrs`;

    const lblPondH = document.getElementById('lblPondMaxH');
    if (lblPondH) lblPondH.textContent = `${state.maxDepthH.toFixed(1)} ft`;

    const hsgDesc = document.getElementById('stormwaterHsgDesc');
    if (hsgDesc) {
      hsgDesc.textContent = HSG_INFO[state.hsg].soil;
      hsgDesc.style.borderLeftColor = HSG_INFO[state.hsg].color;
    }
  }

  // --- SYNC ALL CONTROLS ---
  function syncAllControls() {
    const sync = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    sync('stormwaterAreaAcres', state.areaAcres);
    sync('stormwaterRainP', state.rainP);
    sync('stormwaterPctImpervious', state.pctImpervious);
    sync('stormwaterPctLawn', state.pctLawn);
    sync('stormwaterPctWoods', state.pctWoods);
    sync('stormwaterPctMeadow', state.pctMeadow);
    sync('stormwaterDrawdownHours', state.drawdownHours);
    sync('stormwaterPondBottomL', state.bottomL);
    sync('stormwaterPondBottomW', state.bottomW);
    sync('stormwaterPondSideSlopeZ', state.sideSlopeZ);
    sync('stormwaterPondMaxH', state.maxDepthH);
    sync('stormwaterWeirCrestL', state.weirCrestL);

    // Sync HSG active pill
    document.querySelectorAll('.hsg-pill').forEach(btn => {
      if (btn.dataset.hsg === state.hsg) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const presetSelect = document.getElementById('stormwaterPresetSelect');
    if (presetSelect) presetSelect.value = state.selectedPreset;
  }

  function applyPreset(key) {
    const p = PRESETS[key];
    if (!p) return;
    state.selectedPreset = key;
    Object.assign(state, {
      hsg: p.hsg,
      areaAcres: p.areaAcres,
      rainP: p.rainP,
      preCover: p.preCover,
      pctImpervious: p.pctImpervious,
      pctLawn: p.pctLawn,
      pctWoods: p.pctWoods,
      pctMeadow: p.pctMeadow,
      targetOutflowCfs: p.targetOutflowCfs,
      pwq: p.pwq,
      drawdownHours: p.drawdownHours,
      cd: p.cd,
      bottomL: p.bottomL,
      bottomW: p.bottomW,
      sideSlopeZ: p.sideSlopeZ,
      maxDepthH: p.maxDepthH,
      weirCrestL: p.weirCrestL,
      freeboardReq: p.freeboardReq
    });

    const descEl = document.getElementById('stormwaterPresetDesc');
    if (descEl) descEl.textContent = p.desc;

    syncAllControls();
    recalculateAndRender();
  }

  // --- EXPORT CALCULATION REPORT ---
  function exportReport() {
    const res = computeAll();
    const md = `================================================================================
STORMWATER FACILITY SIZING & NRCS TR-55 CURVE NUMBER ENGINEERING REPORT
SolvedIn6 Civil Engineering Portal • NCEES PE Reference Handbook § 6.3.3
Date: ${new Date().toLocaleDateString()} | Scenario: ${PRESETS[state.selectedPreset]?.name || 'Custom'}
================================================================================

1. SITE & WATERSHED PARAMETERS:
- Total Drainage Area: ${state.areaAcres.toFixed(2)} acres
- Hydrologic Soil Group: HSG ${state.hsg} (${HSG_INFO[state.hsg].title})
- Land Cover Distribution:
  * Impervious Surfaces (CN = ${res.cnImp}): ${state.pctImpervious}%
  * Turf Grass / Lawns (CN = ${res.cnLawn}): ${state.pctLawn}%
  * Wooded / Buffer Area (CN = ${res.cnWoods}): ${state.pctWoods}%
  * Meadow / Continuous Grass (CN = ${res.cnMeadow}): ${state.pctMeadow}%
- Post-Development Composite Curve Number (CN): ${res.compositeCN.toFixed(2)}
- Pre-Development Curve Number (CN_pre): ${res.cnPre}

2. NRCS TR-55 DIRECT RUNOFF HYDROLOGY:
- 24-Hour Design Rainfall Depth (P): ${state.rainP.toFixed(2)} inches
- Potential Maximum Retention (S = 1000/CN - 10): ${res.S_post.toFixed(3)} inches
- Initial Abstraction (Ia = 0.2 * S): ${res.Ia_post.toFixed(3)} inches
- Direct Post-Development Runoff Depth (Q): ${res.Q_post.toFixed(3)} inches
- Post-Development Runoff Volume (V_post): ${res.V_post_acft.toFixed(2)} acre-feet (${Math.round(res.V_post_cuft).toLocaleString()} ft³ / ${Math.round(res.V_post_gal).toLocaleString()} gallons)

3. DETENTION STORAGE & ATTENUATION:
- Estimated Peak Inflow (q_in): ${res.q_in.toFixed(1)} cfs
- Regulated Allowable Peak Outflow (q_out): ${res.q_out.toFixed(1)} cfs
- Peak Flow Ratio (q_out / q_in): ${res.rq.toFixed(3)}
- TR-55 Detention Storage Ratio (Vs / Vr): ${res.ratio_Vs_Vr.toFixed(3)}
- Required Detention Volume (V_det,req): ${res.V_det_req_acft.toFixed(2)} acre-feet (${Math.round(res.V_det_req_cuft).toLocaleString()} ft³)

4. WATER QUALITY VOLUME (WQv) & DRAWDOWN ORIFICE:
- First-Flush Water Quality Rainfall (P_wq): ${state.pwq.toFixed(2)} inches
- Volumetric Runoff Coefficient (Rv = 0.05 + 0.009 * %I): ${res.Rv.toFixed(3)}
- Water Quality Volume (WQv): ${res.WQv_acft.toFixed(2)} acre-feet (${Math.round(res.WQv_gal).toLocaleString()} gallons)
- Target Drawdown Duration: ${state.drawdownHours} hours
- Low-Flow Drawdown Orifice Diameter (d_o): ${res.orificeDiamInches.toFixed(2)} inches (Cd = ${state.cd.toFixed(2)})

5. BASIN STAGE-STORAGE & SPILLWAY HYDRAULICS:
- Bottom Dimensions: ${state.bottomL} ft (Length) × ${state.bottomW} ft (Width)
- Side Slopes (Z:1 H:V): ${state.sideSlopeZ}:1
- Total Basin Embankment Height: ${res.H_total.toFixed(2)} ft
- Total Provided Basin Storage Capacity: ${res.V_basin_max_acft.toFixed(2)} acre-feet (${Math.round(res.V_basin_max_cuft).toLocaleString()} ft³)
- Storage Capacity Safety Factor: ${res.capacityRatio.toFixed(2)}x (${res.capacityRatio >= 1.0 ? 'ADEQUATE' : 'UNDERSIZED'})
- 25-Yr Design High Water Stage (h_dhw): ${res.h_dhw.toFixed(2)} ft
- Emergency Broad-Crested Weir Spillway Crest Length (L_w): ${res.L_weir.toFixed(1)} ft (Cw = 3.1)
- Emergency Surcharge Head (H_w): ${res.H_weir.toFixed(2)} ft
- Provided Freeboard: ${res.freeboardProvided.toFixed(2)} ft (Required: ${state.freeboardReq.toFixed(1)} ft)
- Code Compliance: ${res.isFreeboardSufficient ? 'PASS' : 'FAIL - OVERTOPPING RISK'}
================================================================================`;

    navigator.clipboard.writeText(md).then(() => {
      alert('✓ Calculation report copied to clipboard successfully!');
    }).catch(err => {
      console.error('Clipboard copy error:', err);
      prompt('Copy calculation report:', md);
    });
  }

  // --- MODAL CONTROLS & EVENT BINDINGS ---
  function openModal() {
    const modal = document.getElementById('stormwaterCalcModal');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    syncAllControls();
    recalculateAndRender();
    renderPracticeProblem();
  }

  function closeModal() {
    const modal = document.getElementById('stormwaterCalcModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function bindInput(id, callback) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      callback(e.target.value);
      recalculateAndRender();
    });
  }

  function initControls() {
    const openBtn = document.getElementById('openStormwaterCalcBtn');
    if (openBtn) openBtn.addEventListener('click', openModal);

    const closeBtn = document.getElementById('closeStormwaterModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const modalBackdrop = document.getElementById('stormwaterCalcModal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }

    const exportBtn = document.getElementById('stormwaterExportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportReport);

    // Preset selector
    const presetSelect = document.getElementById('stormwaterPresetSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        applyPreset(e.target.value);
      });
    }

    // HSG Pill selection
    document.querySelectorAll('.hsg-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.hsg = e.currentTarget.dataset.hsg;
        syncAllControls();
        recalculateAndRender();
      });
    });

    // View toggle buttons (Profile vs Hydrograph)
    const btnViewProfile = document.getElementById('btnViewProfile');
    const btnViewHydrograph = document.getElementById('btnViewHydrograph');
    if (btnViewProfile && btnViewHydrograph) {
      btnViewProfile.addEventListener('click', () => {
        state.activeView = 'profile';
        btnViewProfile.classList.add('active');
        btnViewHydrograph.classList.remove('active');
        recalculateAndRender();
      });
      btnViewHydrograph.addEventListener('click', () => {
        state.activeView = 'hydrograph';
        btnViewHydrograph.classList.add('active');
        btnViewProfile.classList.remove('active');
        recalculateAndRender();
      });
    }

    // Bind Land Cover & Geometry Sliders
    bindInput('stormwaterAreaAcres', val => { state.areaAcres = parseFloat(val); });
    bindInput('stormwaterRainP', val => { state.rainP = parseFloat(val); });
    bindInput('stormwaterPctImpervious', val => { state.pctImpervious = parseFloat(val); });
    bindInput('stormwaterPctLawn', val => { state.pctLawn = parseFloat(val); });
    bindInput('stormwaterPctWoods', val => { state.pctWoods = parseFloat(val); });
    bindInput('stormwaterPctMeadow', val => { state.pctMeadow = parseFloat(val); });

    bindInput('stormwaterDrawdownHours', val => { state.drawdownHours = parseFloat(val); });
    bindInput('stormwaterPondBottomL', val => { state.bottomL = parseFloat(val); });
    bindInput('stormwaterPondBottomW', val => { state.bottomW = parseFloat(val); });
    bindInput('stormwaterPondSideSlopeZ', val => { state.sideSlopeZ = parseFloat(val); });
    bindInput('stormwaterPondMaxH', val => { state.maxDepthH = parseFloat(val); });
    bindInput('stormwaterWeirCrestL', val => { state.weirCrestL = parseFloat(val); });
  }

  // --- GLOBAL PUBLIC API ---
  window.StormwaterCalculator = {
    open: openModal,
    close: closeModal,
    setValues: function (newVals) {
      Object.assign(state, newVals);
      syncAllControls();
      recalculateAndRender();
    },
    applyPreset: applyPreset,
    selectProblem: function (idx) {
      state.activeProblemIndex = idx;
      state.selectedProblemOption = null;
      state.problemGraded = false;
      renderPracticeProblem();
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initControls();
    applyPreset('prob46');
  });

})();
