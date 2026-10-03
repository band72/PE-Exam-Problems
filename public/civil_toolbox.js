/**
 * SolvedIn6 Civil Engineering Toolbox & Multi-Discipline Lab
 * Real-World Interactive Everyday Engineering Solvers with USCS Soils & US Climate Presets
 * Strict alignment with NCEES PE Civil, AASHTO, ACI 318, 10-States Standards, USGS Hantush & FHWA HEC-22
 * Adheres strictly to Permanent Rules 1 & 2 for Plats & Georeferencing.
 */

(function () {
  'use strict';

  // ==========================================
  // 1. REAL-WORLD USCS SOILS & CLIMATE DATABASE
  // ==========================================
  const USCS_SOILS = {
    GW: { name: 'Well-Graded Gravel (GW)', gamma: 135, gammaSat: 142, phi: 40, c: 0, K_cm_s: 0.1, k_subgrade: 300, CBR: 50, nu: 0.25, desc: 'Clean dense gravel-sand mixtures with excellent drainage.' },
    GP: { name: 'Poorly Graded Gravel (GP)', gamma: 130, gammaSat: 138, phi: 38, c: 0, K_cm_s: 0.05, k_subgrade: 250, CBR: 35, nu: 0.28, desc: 'Uniform gravels, good drainage, low compressibility.' },
    SW: { name: 'Well-Graded Sand (SW)', gamma: 125, gammaSat: 132, phi: 36, c: 0, K_cm_s: 0.02, k_subgrade: 220, CBR: 25, nu: 0.30, desc: 'Clean well-graded sand, stable subgrade and backfill.' },
    SP: { name: 'Poorly Graded Sand (SP / Florida Sand)', gamma: 118, gammaSat: 126, phi: 32, c: 0, K_cm_s: 0.01, k_subgrade: 180, CBR: 15, nu: 0.32, desc: 'Uniform coastal plain fine sands, high permeability.' },
    SM: { name: 'Silty Sand (SM)', gamma: 120, gammaSat: 128, phi: 30, c: 100, K_cm_s: 1e-4, k_subgrade: 150, CBR: 12, nu: 0.33, desc: 'Silty sand mixtures, fair drainage, moderate frost susceptibility.' },
    SC: { name: 'Clayey Sand (SC)', gamma: 124, gammaSat: 130, phi: 28, c: 200, K_cm_s: 1e-5, k_subgrade: 130, CBR: 10, nu: 0.35, desc: 'Sand with cohesive clay binder, low permeability, high dry strength.' },
    ML: { name: 'Inorganic Silt (ML)', gamma: 115, gammaSat: 122, phi: 26, c: 300, K_cm_s: 1e-5, k_subgrade: 110, CBR: 8, nu: 0.35, desc: 'Non-plastic fine silts, highly frost-susceptible, slow drainage.' },
    CL: { name: 'Lean Clay / Glacial Till (CL)', gamma: 118, gammaSat: 125, phi: 24, c: 500, K_cm_s: 1e-7, k_subgrade: 90, CBR: 5, nu: 0.40, desc: 'Medium plasticity inorganic clays, Midwest till, low permeability.' },
    CH: { name: 'Fat Clay / Gulf Coast Gumbo (CH)', gamma: 110, gammaSat: 120, phi: 18, c: 800, K_cm_s: 1e-8, k_subgrade: 65, CBR: 3, nu: 0.45, desc: 'High plasticity expansive clay, high swell/shrink, very slow drainage.' }
  };

  const US_CLIMATES = {
    southeast: { name: 'Southeast / Florida Subtropical', rain100yr: 9.5, shwtDepthFt: 2.0, frostDepthIn: 0, tempF: 75, nrcsType: 'Type III', desc: 'High intensity storms, very shallow water table, zero frost depth.' },
    northeast: { name: 'Northeast / Mid-Atlantic', rain100yr: 6.2, shwtDepthFt: 6.0, frostDepthIn: 48, tempF: 50, nrcsType: 'Type II', desc: 'Moderate rainfall, deep winter frost line (48"), freeze-thaw cycles.' },
    midwest: { name: 'Midwest / Great Lakes', rain100yr: 5.5, shwtDepthFt: 5.0, frostDepthIn: 42, tempF: 52, nrcsType: 'Type II', desc: 'Convective summer storms, severe winter frost heave risk.' },
    rockies: { name: 'Mountain West / Denver Altitude', rain100yr: 3.5, shwtDepthFt: 12.0, frostDepthIn: 36, tempF: 55, nrcsType: 'Type II', desc: 'Elev 5,280 ft, low barometric pressure, arid steep slopes.' },
    pacnorthwest: { name: 'Pacific Northwest / Marine', rain100yr: 4.8, shwtDepthFt: 3.5, frostDepthIn: 12, tempF: 52, nrcsType: 'Type IA', desc: 'Prolonged winter drizzle, saturated embankments, low-intensity design.' },
    southwest: { name: 'Southwest / Arid Desert', rain100yr: 3.2, shwtDepthFt: 25.0, frostDepthIn: 0, tempF: 85, nrcsType: 'Type II', desc: 'Flash flood monsoons, very deep water table, hard caliche subgrades.' }
  };

  // ==========================================
  // 2. DISCIPLINE MODULE REGISTRY & SEARCH INDEX
  // ==========================================
  const MODULES = {
    walls: {
      id: 'walls',
      title: 'Retaining Walls & Surcharges',
      category: 'Geotechnical & Structural',
      icon: '🧱',
      tags: ['retaining wall', 'cantilever', 'gravity wall', 'rankine', 'coulomb', 'earth pressure', 'surcharge', 'overturning', 'sliding', 'bearing capacity', 'eccentricity', 'boussinesq', 'middle third'],
      equations: 'K_a = \\tan^2(45^\\circ - \\phi/2), \\quad FS_{ot} = \\frac{\\sum M_R}{\\sum M_{ot}} \\ge SF_{req}',
      nceesRef: 'NCEES PE Civil Handbook § 3.4 & § 3.5'
    },
    ponds: {
      id: 'ponds',
      title: 'Stormwater Ponds & Stage-Storage',
      category: 'Water Resources & Hydrology',
      icon: '🏞️',
      tags: ['pond', 'retention basin', 'detention pond', 'stage storage', 'rational method', 'drawdown', 'orifice', 'conic volume', 'freeboard', 'modified puls'],
      equations: 'V = \\frac{h}{3}(A_1 + A_2 + \\sqrt{A_1 A_2}), \\quad t_{dd} = \\frac{2 A}{C_d A_o \\sqrt{2g}}(\\sqrt{h_1} - \\sqrt{h_2})',
      nceesRef: 'NCEES PE Civil Handbook § 6.2 & § 6.5'
    },
    mounding: {
      id: 'mounding',
      title: 'Groundwater Mounding Pressure',
      category: 'Groundwater & Environmental',
      icon: '🌊',
      tags: ['groundwater mounding', 'mounding pressure', 'hantush equation', 'glover', 'recharge basin', 'septic drainfield', 'shwt separation', 'aquifer', 'specific yield', 'hydraulic conductivity'],
      equations: 'h_{max}^2 - h_i^2 = \\frac{w \\cdot t}{4 \\epsilon S_y} F(\\alpha, \\beta), \\quad K_{design} = \\frac{K_{sat}}{SF_K}',
      nceesRef: 'NCEES PE Civil § 6.6 & USGS Hantush Analytical Solution'
    },
    roads: {
      id: 'roads',
      title: 'Roads & Highway Geometric Design',
      category: 'Transportation & Pavements',
      icon: '🛣️',
      tags: ['highway design', 'horizontal curve', 'vertical curve', 'stopping sight distance', 'ssd', 'crest curve', 'sag curve', 'superelevation', 'aashto green book', 'pavement', 'structural number', 'cbr', 'resilient modulus'],
      equations: 'SSD = 1.47 V t_r + \\frac{V^2}{30(0.01 a/g \\pm G)}, \\quad SN = a_1 D_1 + a_2 D_2 m_2 + a_3 D_3 m_3',
      nceesRef: 'NCEES PE Civil Handbook § 5.1 & AASHTO GDHS'
    },
    plats: {
      id: 'plats',
      title: 'Plats & Subdivision Boundary Engineering',
      category: 'Surveying & Land Development',
      icon: '📐',
      tags: ['plat', 'subdivision', 'pi angle bar', 'corner return', 'curve tangent', 'fillet area', 'pc pt', 'traverse closure', 'gps wgs84', 'natural coordinates', 'boundary survey'],
      equations: 'T = R \\tan(\\Delta / 2), \\quad \\text{Length}_{\\text{to PC}} = \\text{Dim}_{\\text{PI}} - T, \\quad A_{\\text{fillet}} = R T - \\frac{1}{2} R^2 \\Delta',
      nceesRef: 'Permanent Rules 1 & 2 • Florida/US Subdivision Platting Standards'
    },
    liftstation: {
      id: 'liftstation',
      title: 'Lift Stations & Sewer Connectivity',
      category: 'Water & Sewer Infrastructure',
      icon: '⚙️',
      tags: ['lift station', 'sewer connectivity', 'wet well', 'duplex pump', 'firm capacity', 'hazen-williams', 'force main', 'tdh', 'scouring velocity', 'float switch', 'manning', '10 states standards', 'peaking factor'],
      equations: 'V_{active} = \\frac{T_{min} Q_p}{4}, \\quad h_f = \\frac{10.44 L Q^{1.852}}{C^{1.852} D^{4.87}}, \\quad BHP = \\frac{Q \\cdot TDH \\cdot SG}{3960 \\eta}',
      nceesRef: '10-States Standards § 30 & § 40 • NCEES PE Civil § 6.3'
    },
    drainage: {
      id: 'drainage',
      title: 'Drainage & Culvert Hydraulics',
      category: 'Stormwater & Hydraulics',
      icon: '🌧️',
      tags: ['drainage', 'culvert', 'inlet control', 'outlet control', 'rational method', 'curb inlet', 'gutter spread', 'hec-22', 'hds-5', 'headwater', 'tailwater'],
      equations: 'Q = C I A, \\quad Q_{gutter} = \\frac{0.56}{n} S_x^{5/3} S_L^{1/2} T^{8/3}, \\quad HW = \\max(HW_{inlet}, HW_{outlet})',
      nceesRef: 'NCEES PE Civil Handbook § 6.4 & FHWA HDS-5'
    },
    piles: {
      id: 'piles',
      title: 'Piles & Deep Foundations',
      category: 'Geotechnical Engineering',
      icon: '🏗️',
      tags: ['piles', 'deep foundation', 'skin friction', 'end bearing', 'alpha method', 'beta method', 'pile group', 'converse-labarre', 'meyerhof', 'helical pile'],
      equations: 'Q_{ult} = Q_p + Q_s = q_p A_p + \\sum f_s A_s, \\quad Q_{allow} = \\frac{Q_{ult}}{SF}',
      nceesRef: 'NCEES PE Civil Handbook § 3.6 & FHWA GEC-12'
    },
    slabs: {
      id: 'slabs',
      title: 'Slabs & Concrete (6 Analysis Methods)',
      category: 'Structural Concrete',
      icon: '🏛️',
      tags: ['slab on grade', 'reinforced concrete', 'aci 318', 'flexural capacity', 'whitney stress block', 'shear', 'subgrade reaction', 'westergaard', 'punching shear', 'direct design method', 'ddm', 'equivalent frame method', 'efm', 'yield line theory', 'johansen', 'hillerborg strip method', 'two-way slab', 'flat plate'],
      equations: '\\sigma_i, \\; M_0 = \\frac{q_u \\ell_2 \\ell_n^2}{8}, \\; K_{ec} = \\frac{\\sum K_c K_t}{\\sum K_c + K_t}, \\; q_{ult} = \\frac{24 m_p}{L_x^2 [\\sqrt{3+(L_x/L_y)^2}-L_x/L_y]^2}, \\; v_u = \\frac{V_u}{b_o d} + \\frac{\\gamma_v M_{sc} c}{J_c}',
      nceesRef: 'ACI 318-19 (Ch. 8, 22) • PCA SOG • Johansen • Hillerborg • NCEES PE § 4.3'
    },
    slope: {
      id: 'slope',
      title: 'Embankment & Slope Stability',
      category: 'Geotechnical & Earthworks',
      icon: '⛰️',
      tags: ['slope stability', 'embankment', 'bishop simplified', 'infinite slope', 'seepage', 'ordinary slices', 'factor of safety', 'pore pressure', 'slip circle', 'roadway slope'],
      equations: 'FS_{infinite} = \\frac{c\' + \\gamma\' z \\cos^2\\beta \\tan\\phi\'}{\\gamma_{sat} z \\sin\\beta \\cos\\beta}, \\quad FS_{bishop} = \\frac{\\sum [c\' b + (W - ub)\\tan\\phi\']/m_\\alpha}{\\sum W \\sin\\alpha}',
      nceesRef: 'NCEES PE Civil Handbook § 3.3'
    },
    weirs_dams: {
      id: 'weirs_dams',
      title: 'Weirs & Concrete Gravity Dams',
      category: 'Hydraulics & Water Resources',
      icon: '🌊',
      tags: ['weir', 'dam', 'gravity dam', 'sharp crested', 'v-notch', 'cipolletti', 'broad crested', 'overturning', 'sliding', 'uplift', 'seepage gradient', 'piping safety factor'],
      equations: 'Q_{v-notch} = 2.50 H^{2.5}, \\quad FS_{ot} = \\frac{\\sum M_R}{\\sum M_{ot}}, \\quad FS_{sl} = \\frac{\\mu (W - U)}{F_h}',
      nceesRef: 'NCEES PE Civil Handbook § 6.3.7 & USACE EM 1110-2-2200'
    }
  };

  // ==========================================
  // 3. MASTER APPLICATION STATE
  // ==========================================
  const state = {
    activeModule: 'walls',
    activeDisciplineFilter: 'ALL',
    searchQuery: '',
    selectedSoil: 'SP',
    selectedClimate: 'southeast',

    // Retaining Walls
    walls: {
      heightFt: 14,
      toeLengthFt: 3.5,
      stemThicknessTopIn: 12,
      stemThicknessBaseIn: 18,
      heelLengthFt: 5.5,
      footingThicknessIn: 24,
      backfillSlopeDeg: 0,
      surchargePsf: 250, // traffic surcharge = 2 ft * 125 pcf
      waterTableDepthFt: 10,
      reqOverturningSF: 2.0,
      reqSlidingSF: 1.5,
      reqBearingSF: 3.0
    },

    // Stormwater Ponds
    ponds: {
      drainageAreaAcres: 15.0,
      runoffCoeffC: 0.65,
      stormRainfallIn: 6.5,
      designDepthFt: 6.0,
      pondSideSlope: 4, // 4:1 H:V
      orificeDiamIn: 4.0,
      orificeCd: 0.60,
      freeboardReqFt: 1.0,
      storageSF: 1.20
    },

    // Groundwater Mounding (Hantush)
    mounding: {
      basinLengthFt: 150,
      basinWidthFt: 80,
      infiltrationRateInHr: 1.5, // w
      durationDays: 3.0,
      initialAquiferDepthFt: 25.0, // D
      specificYieldSy: 0.20,
      shwtSeparationReqIn: 24,
      conductSafetyFactor: 2.0 // reduction on K_sat
    },

    // Roads & Geometric Design
    roads: {
      designSpeedMph: 55,
      deflectionAngleDeltaDeg: 38,
      superelevationMaxPct: 6.0,
      grade1Pct: 3.0,
      grade2Pct: -2.5,
      subgradeCbr: 10,
      reqReliabilityPct: 90,
      sightDistanceSF: 1.15
    },

    // Plats & Subdivision (Rules 1 & 2)
    plats: {
      intersectionLat: 30.345753,
      intersectionLng: -81.653909,
      cornerAngleDeg: 90.0, // Delta
      cornerReturnRadiusFt: 25.0,
      statedBoundaryDimensionFt: 150.0, // Stated to PI
      blockLengthFt: 300.0,
      lotDepthFt: 120.0,
      hasAngleBarGlyph: true, // L-shaped tick at corner
      closurePrecisionReq: 10000 // 1:10,000
    },

    // Lift Stations & Sewer Connectivity
    liftstation: {
      avgDailyFlowGpm: 180,
      peakingFactor: 3.2,
      minCycleTimeMin: 12, // 5 starts/hr
      wetWellDiameterFt: 8.0,
      pumpsCount: 2, // Duplex (1 Lead + 1 100% Standby)
      forceMainDiamIn: 6.0,
      forceMainLengthFt: 2400,
      pipeHazenWilliamsC: 130, // C900 PVC
      staticHeadLiftFt: 28.0,
      pumpEfficiencyPct: 68,
      gravitySewerDiamIn: 8.0,
      gravitySewerSlopePct: 0.40,
      reqFirmCapSF: 1.15,
      reqRetentionHrs: 2.0
    },

    // Drainage & Culverts
    drainage: {
      basinAcres: 8.5,
      timeOfConcMin: 15,
      rainfallReturnPeriodYr: 25,
      gutterLongSlopePct: 1.5,
      gutterCrossSlopePct: 2.0,
      culvertDiamIn: 36,
      culvertLengthFt: 80,
      culvertSlopePct: 1.0,
      culvertType: 'rcp', // n = 0.012
      culvertKe: 0.5,
      designFreeboardFt: 1.5
    },

    // Piles & Deep Foundations
    piles: {
      pileType: 'drilled_shaft',
      diameterIn: 24,
      embedmentDepthFt: 40,
      waterTableDepthFt: 10,
      numPilesRow: 3,
      numPilesCol: 3,
      spacingFt: 6.0,
      reqBearingSF: 2.5
    },

    // Slabs & Reinforced Concrete (All 6 Analysis Methods)
    slabs: {
      method: 'westergaard', // 'westergaard' | 'ddm' | 'efm' | 'yield_line' | 'hillerborg' | 'punching'
      slabThicknessIn: 8.5,
      fcPsi: 4000,
      fyPsi: 60000,
      barSizeNum: 5, // #5 bar = 0.31 in^2
      barSpacingIn: 10,
      
      // Westergaard SOG / Pavements
      wheelLoadKips: 16.0,
      wheelContactRadiusIn: 6.5,
      tempDiffF: 20.0, // day/night curling temp gradient (deg F)
      loadLocation: 'interior', // 'interior' | 'edge' | 'corner'

      // Two-Way Slabs (DDM, EFM, Yield Line, Hillerborg, Punching)
      spanXFt: 24.0, // L1 or Lx (ft)
      spanYFt: 20.0, // L2 or Ly (ft)
      colWidthIn: 18, // c1 in direction of spanX (in)
      colDepthIn: 18, // c2 in transverse direction (in)
      colHeightFt: 12.0, // story height H for EFM (ft)
      deadLoadPsf: 115, // superimposed DL + self-weight
      liveLoadPsf: 50,  // LL
      unbalancedMomentFtKips: 35.0, // Munbal for EFM & Punching
      colLocation: 'interior', // 'interior' | 'edge' | 'corner' for punching shear

      // ACI Safety / Overdrive factors
      aciStrengthReductPhi: 0.90,
      reqOverdriveSF: 1.10
    },

    // Embankment & Slope Stability
    slope: {
      slopeHeightFt: 25,
      slopeRatioH: 2.5, // 2.5:1 H:V
      phreaticLevelPct: 75, // 75% height of saturated seepage
      targetSF: 1.50
    },

    // Weirs & Gravity Dams
    weirs_dams: {
      structureType: 'dam', // 'dam' or 'weir'
      weirType: 'v_notch', // 'suppressed', 'contracted', 'v_notch', 'cipolletti', 'broad'
      damHeightFt: 35,
      damCrestWidthFt: 8,
      damBaseWidthFt: 26,
      damUpstreamSlope: 0, // vertical upstream
      damDownstreamSlope: 0.70, // 0.7:1
      headwaterDepthFt: 30,
      tailwaterDepthFt: 4,
      upliftReductionEta: 0.67, // with foundation drain
      foundationCohesionPsf: 500,
      foundationFrictionAngleDeg: 35,
      reqOverturningSF: 2.0,
      reqSlidingSF: 1.5,
      reqPipingSF: 4.0
    }
  };

  // ==========================================
  // 4. SOLVER ENGINE FUNCTIONS
  // ==========================================

  // --- MODULE 1: WALLS & SURCHARGES ---
  function solveWalls() {
    const p = state.walls;
    const soil = USCS_SOILS[state.selectedSoil] || USCS_SOILS.SP;
    const phiRad = (soil.phi * Math.PI) / 180;
    const Ka = Math.tan(Math.PI / 4 - phiRad / 2) ** 2;
    const Kp = Math.tan(Math.PI / 4 + phiRad / 2) ** 2;

    const H = p.heightFt;
    const t_f = p.footingThicknessIn / 12;
    const H_total = H + t_f;
    const B = p.toeLengthFt + (p.stemThicknessBaseIn / 12) + p.heelLengthFt;
    const stemBase = p.stemThicknessBaseIn / 12;
    const stemTop = p.stemThicknessTopIn / 12;

    // Lateral Earth Pressure Forces
    // Active earth thrust
    const Pa_soil = 0.5 * soil.gamma * (H_total ** 2) * Ka;
    const y_Pa = H_total / 3;

    // Surcharge lateral thrust (uniform traffic q)
    const Pa_surch = p.surchargePsf * H_total * Ka;
    const y_surch = H_total / 2;

    // Water thrust if water table rises above base
    let Pw = 0;
    let y_w = 0;
    if (p.waterTableDepthFt < H_total) {
      const hw = H_total - p.waterTableDepthFt;
      Pw = 0.5 * 62.4 * (hw ** 2);
      y_w = hw / 3;
    }

    const totalHorizontalForce = Pa_soil + Pa_surch + Pw;
    const totalOverturningMoment = (Pa_soil * y_Pa) + (Pa_surch * y_surch) + (Pw * y_w);

    // Resisting Gravity Weights (Moments taken about the TOE)
    // 1. Footing slab: 150 pcf * B * t_f
    const W_ftg = 150 * B * t_f;
    const x_ftg = B / 2;

    // 2. Stem rectangle: 150 pcf * stemTop * H
    const W_stem_rect = 150 * stemTop * H;
    const x_stem_rect = p.toeLengthFt + (stemBase - stemTop) + (stemTop / 2);

    // 3. Stem batter triangle (if any):
    const W_stem_tri = 150 * 0.5 * (stemBase - stemTop) * H;
    const x_stem_tri = p.toeLengthFt + (2 / 3) * (stemBase - stemTop);

    // 4. Backfill soil weight over heel
    const W_soil_heel = soil.gamma * p.heelLengthFt * H;
    const x_soil_heel = B - (p.heelLengthFt / 2);

    const totalVerticalWeight = W_ftg + W_stem_rect + W_stem_tri + W_soil_heel;
    const totalResistingMoment = (W_ftg * x_ftg) + (W_stem_rect * x_stem_rect) + (W_stem_tri * x_stem_tri) + (W_soil_heel * x_soil_heel);

    // Factors of Safety
    const fsOverturning = totalOverturningMoment > 0 ? totalResistingMoment / totalOverturningMoment : 99;

    // Sliding resistance: friction tan(2/3 phi) + passive pressure (neglecting passive for conservative design)
    const frictionCoeff = Math.tan((2 / 3) * phiRad);
    const slidingResist = (totalVerticalWeight * frictionCoeff) + (soil.c * B * 0.5);
    const fsSliding = totalHorizontalForce > 0 ? slidingResist / totalHorizontalForce : 99;

    // Eccentricity & Bearing Pressure
    const x_net = (totalResistingMoment - totalOverturningMoment) / totalVerticalWeight;
    const eccentricity = (B / 2) - x_net;
    const maxAllowableEccentricity = B / 6;

    let q_toe = 0;
    let q_heel = 0;
    if (Math.abs(eccentricity) <= maxAllowableEccentricity) {
      q_toe = (totalVerticalWeight / B) * (1 + (6 * eccentricity) / B);
      q_heel = (totalVerticalWeight / B) * (1 - (6 * eccentricity) / B);
    } else {
      // Resultant outside middle third
      q_toe = (2 * totalVerticalWeight) / (3 * x_net);
      q_heel = 0;
    }

    // Allowable bearing capacity (Meyerhof/Terzaghi estimate based on soil)
    const q_allowable = soil.c > 0 ? 3000 + (soil.c * 5.7) : 1500 + (soil.gamma * B * 0.5 * 15);
    const fsBearing = q_toe > 0 ? q_allowable / q_toe : 99;

    const isSafe = (fsOverturning >= p.reqOverturningSF) && (fsSliding >= p.reqSlidingSF) && (Math.abs(eccentricity) <= maxAllowableEccentricity);

    return {
      soil,
      Ka,
      Kp,
      H_total,
      B,
      Pa_soil,
      Pa_surch,
      Pw,
      totalHorizontalForce,
      totalOverturningMoment,
      totalVerticalWeight,
      totalResistingMoment,
      fsOverturning,
      fsSliding,
      eccentricity,
      maxAllowableEccentricity,
      q_toe,
      q_heel,
      q_allowable,
      fsBearing,
      isSafe
    };
  }

  // --- MODULE 2: STORMWATER PONDS & STAGE-STORAGE ---
  function solvePonds() {
    const p = state.ponds;
    const climate = US_CLIMATES[state.selectedClimate] || US_CLIMATES.southeast;

    // Peak Runoff Q = C * I * A (Rational Method)
    const I = climate.rain100yr / 3.0; // rough 1-hr intensity equivalent
    const Q_peak = p.runoffCoeffC * I * p.drainageAreaAcres; // cfs

    // Water Quality / Retention Volume Requirement (e.g. 1.0" or 0.5" runoff over drainage area)
    const runoffDepthIn = Math.min(1.5, p.runoffCoeffC * 1.25);
    const V_req_cuft = (runoffDepthIn / 12) * (p.drainageAreaAcres * 43560) * p.storageSF;
    const V_req_acft = V_req_cuft / 43560;

    // Stage-Storage Conic Prism Volume
    const d = p.designDepthFt;
    const z = p.pondSideSlope; // z:1
    // V = h/3 * (A1 + A2 + sqrt(A1*A2))
    const A_top_est = (V_req_cuft * 1.4) / d;
    const W_top = Math.sqrt(A_top_est / 2);
    const L_top = W_top * 2;
    const W_bot = Math.max(10, W_top - (2 * z * d));
    const L_bot = Math.max(20, L_top - (2 * z * d));

    const A_bot = W_bot * L_bot;
    const A_top = (W_bot + 2 * z * d) * (L_bot + 2 * z * d);
    const V_actual_cuft = (d / 3) * (A_bot + A_top + Math.sqrt(A_bot * A_top));
    const V_actual_acft = V_actual_cuft / 43560;

    // Drawdown Hydraulics: Orifice discharge & drawdown time
    // t_dd = 2 * A_avg / (Cd * Ao * sqrt(2g)) * (sqrt(h1) - sqrt(h2))
    const d_orifice_ft = p.orificeDiamIn / 12;
    const A_orifice = (Math.PI / 4) * (d_orifice_ft ** 2);
    const A_avg = (A_bot + A_top) / 2;
    const g = 32.2;
    const time_drawdown_sec = (2 * A_avg) / (p.orificeCd * A_orifice * Math.sqrt(2 * g)) * Math.sqrt(d);
    const time_drawdown_hrs = time_drawdown_sec / 3600;

    // Criteria checks
    const meetsDrawdown = time_drawdown_hrs >= 24 && time_drawdown_hrs <= 72;
    const meetsCapacity = V_actual_cuft >= V_req_cuft;
    const freeboardProvided = 1.5; // ft
    const meetsFreeboard = freeboardProvided >= p.freeboardReqFt;

    return {
      Q_peak,
      V_req_cuft,
      V_req_acft,
      V_actual_cuft,
      V_actual_acft,
      A_bot,
      A_top,
      time_drawdown_hrs,
      meetsDrawdown,
      meetsCapacity,
      freeboardProvided,
      meetsFreeboard,
      isSafe: meetsDrawdown && meetsCapacity && meetsFreeboard
    };
  }

  // --- MODULE 3: GROUNDWATER MOUNDING (HANTUSH) ---
  function solveMounding() {
    const p = state.mounding;
    const soil = USCS_SOILS[state.selectedSoil] || USCS_SOILS.SP;
    const climate = US_CLIMATES[state.selectedClimate] || US_CLIMATES.southeast;

    // K_sat in cm/s -> ft/day
    // 1 cm/s = 2834.65 ft/day
    const K_raw_ft_day = soil.K_cm_s * 2834.65;
    const K_design = K_raw_ft_day / p.conductSafetyFactor; // ft/day

    // Infiltration rate w in ft/day:
    const w_ft_day = (p.infiltrationRateInHr / 12) * 24; // ft/day

    const Sy = p.specificYieldSy;
    const D = p.initialAquiferDepthFt;
    const t = p.durationDays;
    const a = p.basinLengthFt / 2;
    const b = p.basinWidthFt / 2;

    const nu = (K_design * D) / Sy;
    const denom = Math.sqrt(4 * nu * Math.max(0.1, t));
    const alpha = a / denom;
    const beta = b / denom;

    function erf(x) {
      const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p_c = 0.3275911;
      const sign = x < 0 ? -1 : 1;
      const absX = Math.abs(x);
      const t_val = 1.0 / (1.0 + p_c * absX);
      const y = 1.0 - (((((a5 * t_val + a4) * t_val) + a3) * t_val + a2) * t_val + a1) * t_val * Math.exp(-absX * absX);
      return sign * y;
    }

    const F_val = erf(alpha) * erf(beta);
    const term = (w_ft_day / K_design) * (4 * nu * t) * (F_val / (4 * Math.PI));
    const h_mound_ft = Math.max(0.1, Math.min(25, Math.sqrt(D * D + 2 * term) - D));

    // Seasonal High Water Table Separation
    const clearanceRemainingIn = (climate.shwtDepthFt - h_mound_ft) * 12;
    const meetsClearance = clearanceRemainingIn >= p.shwtSeparationReqIn;

    return {
      K_raw_ft_day,
      K_design,
      w_ft_day,
      h_mound_ft,
      clearanceRemainingIn,
      shwtSeparationReqIn: p.shwtSeparationReqIn,
      meetsClearance,
      isSafe: meetsClearance
    };
  }

  // --- MODULE 4: ROADS & HIGHWAY GEOMETRIC DESIGN ---
  function solveRoads() {
    const p = state.roads;
    const V = p.designSpeedMph;
    const deltaDeg = p.deflectionAngleDeltaDeg;
    const deltaRad = (deltaDeg * Math.PI) / 180;

    // AASHTO Stopping Sight Distance
    const t_r = 2.5; // sec
    const a = 11.2; // ft/s^2
    const G = p.grade2Pct / 100; // downhill grade controls
    const ssdNominal = (1.47 * V * t_r) + ((V ** 2) / (30 * (a / 32.2 + G)));
    const ssdDesign = ssdNominal * p.sightDistanceSF;

    // Horizontal Curve Minimum Radius (AASHTO Green Book)
    let f_s = 0.14;
    if (V <= 30) f_s = 0.16;
    else if (V <= 45) f_s = 0.15;
    else if (V <= 60) f_s = 0.12;
    else f_s = 0.10;

    const R_min = (V ** 2) / (15 * (0.01 * p.superelevationMaxPct + f_s));
    const R_design = Math.max(R_min, 1000);
    const Dc = 5729.58 / R_design;
    const T = R_design * Math.tan(deltaRad / 2);
    const L = (Math.PI * R_design * deltaDeg) / 180;
    const E = R_design * (1 / Math.cos(deltaRad / 2) - 1);
    const M = R_design * (1 - Math.cos(deltaRad / 2));

    // Vertical Crest Curve Design (K-value)
    const A_grade = Math.abs(p.grade1Pct - p.grade2Pct);
    const K_crest = (ssdDesign ** 2) / 2158;
    const L_crest = K_crest * A_grade;

    // Pavement Design (AASHTO 1993 Structural Number from CBR)
    const Mr = 1500 * p.subgradeCbr;
    const SN_req = Math.max(2.5, 5.5 - (0.4 * Math.log10(Mr)));

    return {
      ssdNominal,
      ssdDesign,
      R_min,
      R_design,
      Dc,
      T,
      L,
      E,
      M,
      A_grade,
      K_crest,
      L_crest,
      Mr,
      SN_req,
      isSafe: R_design >= R_min && L_crest >= 100
    };
  }

  // --- MODULE 5: PLATS & SUBDIVISION BOUNDARY (RULES 1 & 2) ---
  function solvePlats() {
    const p = state.plats;
    const deltaDeg = p.cornerAngleDeg;
    const deltaRad = (deltaDeg * Math.PI) / 180;
    const R = p.cornerReturnRadiusFt;

    // Dynamic Tangent Derivation via Curve Solver:
    const T = R * Math.tan(deltaRad / 2);

    // Rule 2: P.I. Tick / Angle Bar Glyph Rule
    const lineToPcLength = p.hasAngleBarGlyph ? p.statedBoundaryDimensionFt - T : p.statedBoundaryDimensionFt;
    const arcLengthL = (Math.PI * R * deltaDeg) / 180;

    // Fillet Area Adjustment:
    const A_fillet = (R * T) - (0.5 * (R ** 2) * deltaRad);
    const grossParcelAreaSqFt = p.statedBoundaryDimensionFt * p.lotDepthFt;
    const netParcelAreaSqFt = grossParcelAreaSqFt - (p.hasAngleBarGlyph ? A_fillet : 0);
    const netParcelAreaAcres = netParcelAreaSqFt / 43560;

    // Ground-Truthed WGS84 GPS Coordinates (Rule 1: natural physical coords)
    const lat = p.intersectionLat;
    const lng = p.intersectionLng;

    const perimeterFt = 2 * (p.statedBoundaryDimensionFt + p.lotDepthFt);
    const linearMisclosureFt = perimeterFt / p.closurePrecisionReq;

    return {
      R,
      deltaDeg,
      T,
      lineToPcLength,
      arcLengthL,
      A_fillet,
      grossParcelAreaSqFt,
      netParcelAreaSqFt,
      netParcelAreaAcres,
      lat,
      lng,
      linearMisclosureFt,
      isSafe: lineToPcLength > 0 && linearMisclosureFt < 0.10
    };
  }

  // --- MODULE 6: LIFT STATIONS & SEWER CONNECTIVITY ---
  function solveLiftStation() {
    const p = state.liftstation;

    const Q_peak_gpm = p.avgDailyFlowGpm * p.peakingFactor;
    const Q_pump_gpm = Q_peak_gpm * p.reqFirmCapSF;
    const Q_pump_cfs = Q_pump_gpm / 448.83;

    // Wet Well Active Storage Sizing:
    const V_active_gal = (p.minCycleTimeMin * Q_pump_gpm) / 4;
    const V_active_cuft = V_active_gal / 7.48;

    // Active Depth in Circular Well:
    const D_well = p.wetWellDiameterFt;
    const A_well = (Math.PI / 4) * (D_well ** 2);
    const activeDepthFt = V_active_cuft / A_well;

    // Float Elevations Configuration:
    const lowWaterShutoffFt = 2.0;
    const leadPumpOnFt = lowWaterShutoffFt + activeDepthFt;
    const lagPumpOnFt = leadPumpOnFt + 1.0;
    const highWaterAlarmFt = lagPumpOnFt + 1.0;
    const incomingSewerInvertFt = highWaterAlarmFt + 0.5;

    // Force Main Hydraulics:
    const D_pipe_in = p.forceMainDiamIn;
    const D_pipe_ft = D_pipe_in / 12;
    const A_pipe = (Math.PI / 4) * (D_pipe_ft ** 2);
    const velocityFps = Q_pump_cfs / A_pipe;

    // Hazen-Williams Friction Head Loss:
    const hf = (10.44 * p.forceMainLengthFt * ((Q_pump_gpm / p.pipeHazenWilliamsC) ** 1.852)) / (D_pipe_in ** 4.87);
    const minorLossesFt = 3.5 * ((velocityFps ** 2) / (2 * 32.2));
    const totalDynamicHeadFt = p.staticHeadLiftFt + hf + minorLossesFt;

    // Pump Brake Horsepower (BHP):
    const eta = p.pumpEfficiencyPct / 100;
    const bhp = (Q_pump_gpm * totalDynamicHeadFt * 1.0) / (3960 * eta);
    const motorNameplateHp = bhp <= 5 ? 5 : bhp <= 7.5 ? 7.5 : bhp <= 10 ? 10 : bhp <= 15 ? 15 : bhp <= 20 ? 20 : bhp <= 25 ? 25 : bhp <= 30 ? 30 : Math.ceil(bhp / 10) * 10;

    // Scouring Velocity Check per 10-States Standards (2.0 to 8.0 ft/s)
    const meetsVelocity = velocityFps >= 2.0 && velocityFps <= 8.0;

    // Gravity Sewer Minimum Slope Check
    const minSlope8In = 0.40;
    const meetsSewerSlope = p.gravitySewerSlopePct >= minSlope8In;

    const emergencyStorageVolGal = (incomingSewerInvertFt - leadPumpOnFt) * A_well * 7.48;
    const emergencyHoursBuffer = emergencyStorageVolGal / (p.avgDailyFlowGpm * 60);
    const meetsRetention = emergencyHoursBuffer >= (p.reqRetentionHrs * 0.5);

    return {
      Q_peak_gpm,
      Q_pump_gpm,
      Q_pump_cfs,
      V_active_gal,
      activeDepthFt,
      lowWaterShutoffFt,
      leadPumpOnFt,
      lagPumpOnFt,
      highWaterAlarmFt,
      incomingSewerInvertFt,
      velocityFps,
      hf,
      totalDynamicHeadFt,
      bhp,
      motorNameplateHp,
      meetsVelocity,
      meetsSewerSlope,
      emergencyHoursBuffer,
      meetsRetention,
      isSafe: meetsVelocity && meetsSewerSlope && (bhp > 0)
    };
  }

  // --- MODULE 7: DRAINAGE & CULVERTS ---
  function solveDrainage() {
    const p = state.drainage;
    const soil = USCS_SOILS[state.selectedSoil] || USCS_SOILS.SP;

    const C = soil.c > 200 ? 0.70 : 0.50;
    const I = 135 / (p.timeOfConcMin + 16);
    const Q = C * I * p.basinAcres;

    // Gutter Flow
    const n = 0.015;
    const Sx = p.gutterCrossSlopePct / 100;
    const SL = p.gutterLongSlopePct / 100;
    const spreadT = ((Q * n) / (0.56 * (Sx ** (5 / 3)) * Math.sqrt(SL))) ** (3 / 8);

    // Culvert Hydraulics
    const D_in = p.culvertDiamIn;
    const D_ft = D_in / 12;
    const A_c = (Math.PI / 4) * (D_ft ** 2);
    const V_c = Q / A_c;

    // Inlet Control Headwater
    const c_in = 0.0347, Y_in = 1.9;
    const F_q = Q / (A_c * Math.sqrt(D_ft));
    const HW_inlet = D_ft * (c_in * (F_q ** Y_in) + 0.85);

    // Outlet Control Headwater
    const Rh = D_ft / 4;
    const n_c = 0.012;
    const H_loss = (1 + p.culvertKe + (29 * (n_c ** 2) * p.culvertLengthFt) / (Rh ** (4 / 3))) * ((V_c ** 2) / (2 * 32.2));
    const TW = D_ft * 0.75;
    const HW_outlet = TW + H_loss - (p.culvertSlopePct / 100 * p.culvertLengthFt);

    const controllingHW = Math.max(HW_inlet, HW_outlet);
    const freeboard = 4.0 - controllingHW;

    return {
      Q,
      spreadT,
      HW_inlet,
      HW_outlet,
      controllingHW,
      controllingType: HW_inlet >= HW_outlet ? 'Inlet Control' : 'Outlet Control',
      freeboard,
      isSafe: controllingHW < (D_ft * 1.5) && freeboard >= p.designFreeboardFt
    };
  }

  // --- MODULE 8: PILES & DEEP FOUNDATIONS ---
  function solvePiles() {
    const p = state.piles;
    const soil = USCS_SOILS[state.selectedSoil] || USCS_SOILS.SP;
    const D_ft = p.diameterIn / 12;
    const L_ft = p.embedmentDepthFt;
    const Ap = (Math.PI / 4) * (D_ft ** 2);
    const As = Math.PI * D_ft * L_ft;

    const sigma_v_tip = soil.gamma * L_ft;

    let Qp_kips = 0;
    if (soil.c > 200) {
      const cu_ksf = soil.c / 1000;
      Qp_kips = 9 * cu_ksf * Ap;
    } else {
      const phi = soil.phi;
      const Nq_star = Math.exp((phi * Math.PI / 180) * Math.tan(phi * Math.PI / 180)) * (Math.tan(Math.PI / 4 + (phi * Math.PI / 360)) ** 2);
      const qp_calc = (sigma_v_tip / 1000) * Nq_star;
      const qp_limit = 100;
      Qp_kips = Math.min(qp_calc, qp_limit) * Ap;
    }

    let Qs_kips = 0;
    if (soil.c > 200) {
      const cu_ksf = soil.c / 1000;
      const alpha = Math.max(0.4, 1.0 - 0.5 * cu_ksf);
      Qs_kips = alpha * cu_ksf * As;
    } else {
      const K_coeff = 0.90;
      const delta = 0.8 * soil.phi;
      const avgSigmaV_ksf = (0.5 * soil.gamma * L_ft) / 1000;
      const fs = K_coeff * avgSigmaV_ksf * Math.tan(delta * Math.PI / 180);
      Qs_kips = fs * As;
    }

    const Q_ult_single = Qp_kips + Qs_kips;
    const Q_allow_single = Q_ult_single / p.reqBearingSF;

    // Group Efficiency
    const m = p.numPilesRow;
    const n = p.numPilesCol;
    const s = p.spacingFt;
    const thetaDeg = (Math.atan(D_ft / s) * 180) / Math.PI;
    const eta_group = 1 - (thetaDeg / 90) * (((n - 1) * m + (m - 1) * n) / (m * n));

    const totalPiles = m * n;
    const Q_ult_group = totalPiles * Q_ult_single * eta_group;
    const Q_allow_group = Q_ult_group / p.reqBearingSF;

    return {
      Qp_kips,
      Qs_kips,
      Q_ult_single,
      Q_allow_single,
      eta_group,
      totalPiles,
      Q_ult_group,
      Q_allow_group,
      isSafe: Q_allow_single > 20
    };
  }

  // --- MODULE 9: SLABS & REINFORCED CONCRETE (ACI 318) ---
  // --- MODULE 9: SLABS & REINFORCED CONCRETE (ALL 6 ANALYSIS METHODS) ---
  function solveSlabs() {
    const p = state.slabs;
    const soil = USCS_SOILS[state.selectedSoil] || USCS_SOILS.SP;
    const method = p.method || 'westergaard';

    const barAreas = { 3: 0.11, 4: 0.20, 5: 0.31, 6: 0.44, 7: 0.60, 8: 0.79 };
    const Ab = barAreas[p.barSizeNum] || 0.31;
    const h = p.slabThicknessIn;
    const fc = p.fcPsi;
    const fy = p.fyPsi;

    // --- METHOD 1: WESTERGAARD SLAB-ON-GRADE (SOG) & PAVEMENTS ---
    if (method === 'westergaard') {
      const d = h - 1.5;
      const Ec = 57000 * Math.sqrt(fc);
      const nu = 0.18;
      const fr = 7.5 * Math.sqrt(fc); // modulus of rupture (psi)
      const k = soil.k_subgrade || 200; // pci

      // Radius of relative stiffness l (in)
      const l_stiff = ((Ec * (h ** 3)) / (12 * (1 - nu ** 2) * k)) ** 0.25;
      const a = p.wheelContactRadiusIn;
      const b = a < 1.724 * h ? Math.sqrt(1.6 * (a ** 2) + (h ** 2)) - 0.675 * h : a;
      const P = p.wheelLoadKips * 1000; // lbs

      // Stresses (psi)
      const sigma_interior = (3 * P * (1 + nu) / (2 * Math.PI * (h ** 2))) * (Math.log(l_stiff / b) + 0.6159);
      const sigma_edge = (0.572 * P / (h ** 2)) * (1 + 0.54 * nu) * (Math.log10((Ec * (h ** 3)) / (k * (b ** 4))) - 0.71);
      const sigma_corner = (3 * P / (h ** 2)) * (1 - Math.pow((a * Math.SQRT2) / l_stiff, 0.6));

      // Bradbury thermal curling / warping stress
      const C_brad = 0.85;
      const sigma_warp = (C_brad * Ec * 0.0000055 * p.tempDiffF) / 2;

      let activeLoadStress = sigma_interior;
      if (p.loadLocation === 'edge') activeLoadStress = sigma_edge;
      if (p.loadLocation === 'corner') activeLoadStress = sigma_corner;

      const totalStress = activeLoadStress + (p.loadLocation === 'corner' ? 0 : sigma_warp);
      const fs = fr / Math.max(totalStress, 1);

      // Rebar flexural capacity (As/ft)
      const As = (12 / p.barSpacingIn) * Ab;
      const aw = (As * fy) / (0.85 * fc * 12);
      const phiMn_ft_kips = (0.90 * As * fy * (d - aw / 2)) / 12000;

      // Punching shear at wheel footprint
      const bo = 2 * Math.PI * (a + d / 2);
      const phiVc_punch_kips = (0.75 * 4 * Math.sqrt(fc) * bo * d) / 1000;
      const isSafe = fs >= p.reqOverdriveSF;

      return {
        method,
        h,
        d,
        fc,
        fy,
        Ec,
        nu,
        k,
        fr,
        l_stiff,
        a,
        b,
        P_kips: p.wheelLoadKips,
        sigma_interior,
        sigma_edge,
        sigma_corner,
        sigma_warp,
        activeLoadStress,
        totalStress,
        fs,
        As,
        phiMn_ft_kips,
        phiVc_punch_kips,
        isSafe
      };
    }

    // --- METHOD 2: ACI 318 DIRECT DESIGN METHOD (DDM) ---
    if (method === 'ddm') {
      const L1 = p.spanXFt;
      const L2 = p.spanYFt;
      const c1 = p.colWidthIn;
      const c2 = p.colDepthIn;
      const ln = L1 - (c1 / 12);
      const qu_psf = 1.2 * p.deadLoadPsf + 1.6 * p.liveLoadPsf;
      const qu_ksf = qu_psf / 1000;

      // Total static factored design moment M0 (ft-kips)
      const M0 = (qu_ksf * L2 * (ln ** 2)) / 8;

      // Longitudinal distribution (interior span)
      const Mu_neg = 0.65 * M0;
      const Mu_pos = 0.35 * M0;

      // Transverse strip widths (ft)
      const cs_width = Math.min(L1 / 2, L2 / 2) * 2;
      const cs_width_actual = Math.min(cs_width, L2 * 0.75);
      const ms_width = Math.max(L2 - cs_width_actual, 1.0);

      // Transverse distribution: Column Strip vs Middle Strip
      const Mu_cs_neg = 0.75 * Mu_neg;
      const Mu_ms_neg = 0.25 * Mu_neg;
      const Mu_cs_pos = 0.60 * Mu_pos;
      const Mu_ms_pos = 0.40 * Mu_pos;

      // Design per foot width of column strip
      const mu_cs_neg_per_ft = Mu_cs_neg / cs_width_actual;
      const d = h - 1.25;
      const As_min = 0.0018 * 12 * h;
      const As_prov = (12 / p.barSpacingIn) * Ab;
      const aw = (As_prov * fy) / (0.85 * fc * 12);
      const phiMn_per_ft = (0.90 * As_prov * fy * (d - aw / 2)) / 12000;

      const isSafe = phiMn_per_ft >= mu_cs_neg_per_ft && As_prov >= As_min;

      return {
        method,
        L1,
        L2,
        c1,
        c2,
        ln,
        qu_psf,
        M0,
        Mu_neg,
        Mu_pos,
        cs_width: cs_width_actual,
        ms_width,
        Mu_cs_neg,
        Mu_ms_neg,
        Mu_cs_pos,
        Mu_ms_pos,
        mu_cs_neg_per_ft,
        phiMn_per_ft,
        As_min,
        As_prov,
        d,
        isSafe
      };
    }

    // --- METHOD 3: ACI 318 EQUIVALENT FRAME METHOD (EFM) ---
    if (method === 'efm') {
      const L1 = p.spanXFt;
      const L2 = p.spanYFt;
      const H = p.colHeightFt;
      const c1 = p.colWidthIn;
      const c2 = p.colDepthIn;
      const Ec = 57000 * Math.sqrt(fc);

      // Longitudinal slab-beam stiffness Ksb
      const Isb = (L2 * 12 * (h ** 3)) / 12;
      const Ksb = (4 * Ec * Isb) / (L1 * 12);

      // Column stiffness sum(Kc)
      const Ic = (c2 * (c1 ** 3)) / 12;
      const Kc = (4 * Ec * Ic) / (H * 12);
      const sum_Kc = 2 * Kc;

      // Transverse torsional member Kt
      const x = Math.min(h, c1);
      const y = Math.max(h, c1);
      const C_tor = (1 - 0.63 * (x / y)) * ((x ** 3) * y) / 3;
      const L2_in = L2 * 12;
      const clearFactor = Math.pow(Math.max(1 - (c2 / L2_in), 0.1), 3);
      const Kt = 2 * ((9 * Ec * C_tor) / (L2_in * clearFactor));

      // Equivalent column stiffness Kec
      const Kec = (sum_Kc * Kt) / (sum_Kc + Kt);

      // Joint moment distribution factor DF
      const DF_sb = Ksb / (Ksb + Kec);
      const DF_ec = 1 - DF_sb;
      const Munbal = p.unbalancedMomentFtKips;
      const M_trans_slab = DF_sb * Munbal;
      const M_trans_col = DF_ec * Munbal;
      const eta_reduction = Kec / sum_Kc;

      const isSafe = DF_sb < 0.85 && Kec > 0;

      return {
        method,
        L1,
        L2,
        H,
        c1,
        c2,
        Ec,
        Isb,
        Ksb,
        Ic,
        sum_Kc,
        C_tor,
        Kt,
        Kec,
        DF_sb,
        DF_ec,
        Munbal,
        M_trans_slab,
        M_trans_col,
        eta_reduction,
        isSafe
      };
    }

    // --- METHOD 4: YIELD LINE THEORY (JOHANSEN PLASTIC COLLAPSE) ---
    if (method === 'yield_line') {
      const Lx = Math.min(p.spanXFt, p.spanYFt);
      const Ly = Math.max(p.spanXFt, p.spanYFt);
      const lambda = Ly / Lx;
      const d = h - 1.25;
      const As = (12 / p.barSpacingIn) * Ab;
      const a = (As * fy) / (0.85 * fc * 12);
      const phi = p.aciStrengthReductPhi;

      // Unit plastic moment capacity mp along yield lines (ft-lbs/ft)
      const mp_ft_lbs = (phi * As * fy * (d - a / 2)) / 12;
      const mp_k_ft = mp_ft_lbs / 1000;

      // Johansen rectangular slab collapse load (psf)
      const inv_lambda = Lx / Ly;
      const denom_term = Math.pow(Math.sqrt(3 + (inv_lambda ** 2)) - inv_lambda, 2);
      const q_ult = (24 * mp_ft_lbs) / ((Lx ** 2) * denom_term);

      const q_serv = p.deadLoadPsf + p.liveLoadPsf;
      const fs_collapse = q_ult / Math.max(q_serv, 1);
      const isSafe = fs_collapse >= (1.6 * p.reqOverdriveSF);

      return {
        method,
        Lx,
        Ly,
        lambda,
        d,
        As,
        a,
        mp_ft_lbs,
        mp_k_ft,
        q_ult,
        q_serv,
        fs_collapse,
        reqSF: 1.6 * p.reqOverdriveSF,
        isSafe
      };
    }

    // --- METHOD 5: HILLERBORG STRIP METHOD (LOWER BOUND PLASTIC DESIGN) ---
    if (method === 'hillerborg') {
      const Lx = Math.min(p.spanXFt, p.spanYFt);
      const Ly = Math.max(p.spanXFt, p.spanYFt);
      const lambda = Ly / Lx;
      const qu_psf = 1.2 * p.deadLoadPsf + 1.6 * p.liveLoadPsf;

      // Load dispersion: qx / qy = lambda^4
      const lambda4 = Math.pow(lambda, 4);
      const qx_psf = (lambda4 / (1 + lambda4)) * qu_psf;
      const qy_psf = (1 / (1 + lambda4)) * qu_psf;
      const pctX = (qx_psf / qu_psf) * 100;
      const pctY = (qy_psf / qu_psf) * 100;

      // Maximum strip bending moments (ft-kips/ft)
      const Mx_max = (qx_psf * (Lx ** 2)) / 8000;
      const My_max = (qy_psf * (Ly ** 2)) / 8000;

      // Required rebar
      const d = h - 1.25;
      const As_req_x = (Mx_max * 12000) / (0.90 * fy * 0.9 * d);
      const As_req_y = (My_max * 12000) / (0.90 * fy * 0.9 * d);
      const As_prov = (12 / p.barSpacingIn) * Ab;
      const isSafe = As_prov >= Math.max(As_req_x, As_req_y);

      return {
        method,
        Lx,
        Ly,
        lambda,
        qu_psf,
        qx_psf,
        qy_psf,
        pctX,
        pctY,
        Mx_max,
        My_max,
        d,
        As_req_x,
        As_req_y,
        As_prov,
        isSafe
      };
    }

    // --- METHOD 6: TWO-WAY PUNCHING SHEAR (bo) WITH MOMENT TRANSFER ---
    if (method === 'punching') {
      const L1 = p.spanXFt;
      const L2 = p.spanYFt;
      const c1 = p.colWidthIn;
      const c2 = p.colDepthIn;
      const d = h - 1.5;
      const qu_psf = 1.2 * p.deadLoadPsf + 1.6 * p.liveLoadPsf;

      let bo, Jc_over_c, b1, b2, alpha_s;
      if (p.colLocation === 'edge') {
        alpha_s = 30;
        b1 = c1 + d / 2;
        b2 = c2 + d;
        bo = 2 * b1 + b2;
        const x_bar = (2 * b1 * (b1 / 2)) / bo;
        const cAB = b1 - x_bar;
        const Jc = (2 * (b1 * (d ** 3) / 12 + d * (b1 ** 3) / 12 + b1 * d * Math.pow(b1 / 2 - x_bar, 2))) +
                   (b2 * d * Math.pow(x_bar, 2));
        Jc_over_c = Jc / Math.max(cAB, x_bar);
      } else if (p.colLocation === 'corner') {
        alpha_s = 20;
        b1 = c1 + d / 2;
        b2 = c2 + d / 2;
        bo = b1 + b2;
        const x_bar = (b1 * d * (b1 / 2)) / (bo * d);
        const cAB = b1 - x_bar;
        const Jc = (b1 * (d ** 3) / 12 + d * (b1 ** 3) / 12 + b1 * d * Math.pow(b1 / 2 - x_bar, 2)) +
                   (b2 * d * Math.pow(x_bar, 2));
        Jc_over_c = Jc / Math.max(cAB, x_bar);
      } else {
        // Interior column
        alpha_s = 40;
        b1 = c1 + d;
        b2 = c2 + d;
        bo = 2 * b1 + 2 * b2;
        const cAB = b1 / 2;
        const Jc = 2 * ((b1 * (d ** 3)) / 12 + (d * (b1 ** 3)) / 12 + (b1 * d) * (cAB ** 2)) +
                   2 * ((b2 * d) * (cAB ** 2));
        Jc_over_c = Jc / cAB;
      }

      const Atrib = (L1 * L2) - ((b1 * b2) / 144);
      const Vu_kips = (qu_psf * Atrib) / 1000;
      const v_ug = (Vu_kips * 1000) / (bo * d);

      const gamma_v = 1 - (1 / (1 + (2 / 3) * Math.sqrt(b1 / b2)));
      const Msc_in_lbs = p.unbalancedMomentFtKips * 12000;
      const v_unbal = (gamma_v * Msc_in_lbs) / Jc_over_c;
      const vu_max = v_ug + v_unbal;

      // Concrete capacity vc (ACI 318-19 § 22.6.5.2)
      const beta = Math.max(c1, c2) / Math.min(c1, c2);
      const vc1 = (2 + 4 / beta) * Math.sqrt(fc);
      const vc2 = ((alpha_s * d / bo) + 2) * Math.sqrt(fc);
      const vc3 = 4 * Math.sqrt(fc);
      const vc_nominal = Math.min(vc1, vc2, vc3);
      const phi_vc = 0.75 * vc_nominal;

      const dcr = vu_max / phi_vc;
      const isSafe = dcr <= 1.0;

      return {
        method,
        L1,
        L2,
        c1,
        c2,
        d,
        bo,
        b1,
        b2,
        alpha_s,
        Vu_kips,
        v_ug,
        gamma_v,
        v_unbal,
        vu_max,
        vc_nominal,
        phi_vc,
        dcr,
        isSafe
      };
    }

    return { isSafe: true };
  }

  // --- MODULE 10: EMBANKMENT & SLOPE STABILITY ---
  function solveSlope() {
    const p = state.slope;
    const soil = USCS_SOILS[state.selectedSoil] || USCS_SOILS.SP;

    const betaRad = Math.atan(1 / p.slopeRatioH);
    const betaDeg = (betaRad * 180) / Math.PI;

    const phiRad = (soil.phi * Math.PI) / 180;
    const c_psf = soil.c;
    const gamma = soil.gamma;
    const gammaSat = soil.gammaSat;

    const fs_dry = Math.tan(phiRad) / Math.tan(betaRad);
    const ru = (p.phreaticLevelPct / 100) * (62.4 / gammaSat);
    const fs_infinite_seepage = (c_psf / (gammaSat * p.slopeHeightFt * Math.sin(betaRad) * Math.cos(betaRad))) +
      ((1 - ru / (Math.cos(betaRad) ** 2)) * (Math.tan(phiRad) / Math.tan(betaRad)));

    // Bishop Simplified Method
    const sliceAnglesDeg = [-15, 0, 18, 32, 45];
    let num_sum = 0;
    let den_sum = 0;

    sliceAnglesDeg.forEach((alphaDeg, idx) => {
      const alphaRad = (alphaDeg * Math.PI) / 180;
      const b_i = (p.slopeRatioH * p.slopeHeightFt) / 5;
      const h_i = Math.max(4, p.slopeHeightFt * Math.cos(alphaRad) * (0.8 - idx * 0.12));
      const W_i = gamma * b_i * h_i;
      const u_i = (p.phreaticLevelPct / 100) * 62.4 * Math.max(0, h_i - 5);

      const m_alpha = Math.cos(alphaRad) * (1 + (Math.tan(alphaRad) * Math.tan(phiRad)) / 1.5);
      const resistingForce = (c_psf * b_i + (W_i - u_i * b_i) * Math.tan(phiRad)) / Math.max(0.2, m_alpha);
      const drivingForce = W_i * Math.sin(alphaRad);

      num_sum += resistingForce;
      den_sum += drivingForce;
    });

    const fs_bishop = den_sum > 0 ? Math.max(0.6, num_sum / den_sum) : 99;
    const isSafe = fs_bishop >= p.targetSF;

    return {
      betaDeg,
      fs_dry,
      fs_infinite_seepage,
      fs_bishop,
      targetSF: p.targetSF,
      isSafe
    };
  }

  // --- MODULE 11: WEIRS & CONCRETE GRAVITY DAMS ---
  function solveWeirsAndDams() {
    const p = state.weirs_dams;
    const H_w = p.headwaterDepthFt;
    const T_w = p.tailwaterDepthFt;
    const B = p.damBaseWidthFt;
    const H_dam = p.damHeightFt;
    const gamma_w = 62.4;
    const gamma_c = 150;

    // Weir Discharge Calculations
    const H_head = Math.min(10, Math.max(0.5, H_w - (H_dam - 10)));
    const L_crest = 20;
    let Q_weir = 0;
    let weirFormula = '';

    if (p.weirType === 'v_notch') {
      Q_weir = 2.50 * (H_head ** 2.5);
      weirFormula = 'Q = 2.50 \\cdot H^{2.5}';
    } else if (p.weirType === 'cipolletti') {
      Q_weir = 3.367 * L_crest * (H_head ** 1.5);
      weirFormula = 'Q = 3.367 \\cdot L \\cdot H^{1.5}';
    } else if (p.weirType === 'suppressed') {
      Q_weir = 3.33 * L_crest * (H_head ** 1.5);
      weirFormula = 'Q = 3.33 \\cdot L \\cdot H^{1.5}';
    } else {
      Q_weir = 3.09 * L_crest * (H_head ** 1.5);
      weirFormula = 'Q = 3.09 \\cdot b \\cdot H^{1.5}';
    }

    // Concrete Gravity Dam Stability
    const W1 = p.damCrestWidthFt * H_dam * gamma_c;
    const x1 = p.damCrestWidthFt / 2;
    const W2 = 0.5 * (B - p.damCrestWidthFt) * H_dam * gamma_c;
    const x2 = p.damCrestWidthFt + (1 / 3) * (B - p.damCrestWidthFt);

    const W_total = W1 + W2;
    const M_resisting = (W1 * (B - x1)) + (W2 * (B - x2));

    const F_h = 0.5 * gamma_w * (H_w ** 2);
    const y_Fh = H_w / 3;
    const M_overturning_water = F_h * y_Fh;

    const F_tw = 0.5 * gamma_w * (T_w ** 2);
    const y_tw = T_w / 3;

    const U_uplift = 0.5 * gamma_w * (H_w * p.upliftReductionEta + T_w) * B;
    const x_uplift_from_toe = B / 3;
    const M_overturning_uplift = U_uplift * (B - x_uplift_from_toe);

    const totalOverturningMoment = M_overturning_water + M_overturning_uplift;
    const totalResistingMoment = M_resisting + (F_tw * y_tw);

    const fsOverturning = totalOverturningMoment > 0 ? totalResistingMoment / totalOverturningMoment : 99;

    const mu = Math.tan((p.foundationFrictionAngleDeg * Math.PI) / 180);
    const slidingResistance = mu * Math.max(0, W_total - U_uplift) + (p.foundationCohesionPsf * B);
    const netDrivingHoriz = F_h - F_tw;
    const fsSliding = netDrivingHoriz > 0 ? slidingResistance / netDrivingHoriz : 99;

    const L_creep = B + H_dam;
    const deltaH = H_w - T_w;
    const exitGradient = deltaH / Math.max(1, L_creep);
    const criticalGradient = 1.0;
    const fsPiping = exitGradient > 0 ? criticalGradient / exitGradient : 99;

    const isSafe = (fsOverturning >= p.reqOverturningSF) && (fsSliding >= p.reqSlidingSF) && (fsPiping >= p.reqPipingSF);

    return {
      Q_weir,
      weirFormula,
      W_total,
      F_h,
      U_uplift,
      fsOverturning,
      fsSliding,
      fsPiping,
      isSafe
    };
  }

  function solveActiveModule() {
    switch (state.activeModule) {
      case 'walls': return solveWalls();
      case 'ponds': return solvePonds();
      case 'mounding': return solveMounding();
      case 'roads': return solveRoads();
      case 'plats': return solvePlats();
      case 'liftstation': return solveLiftStation();
      case 'drainage': return solveDrainage();
      case 'piles': return solvePiles();
      case 'slabs': return solveSlabs();
      case 'slope': return solveSlope();
      case 'weirs_dams': return solveWeirsAndDams();
      default: return solveWalls();
    }
  }

  // ==========================================
  // 5. DYNAMIC SVG DIAGRAM GENERATORS
  // ==========================================

  function renderWallsSvg(res) {
    const p = state.walls;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <defs>
          <linearGradient id="wallSoilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#b45309" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#78350f" stop-opacity="0.5"/>
          </linearGradient>
          <linearGradient id="concreteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444"/>
          </marker>
          <marker id="blueArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8"/>
          </marker>
        </defs>

        <rect x="250" y="80" width="400" height="260" fill="url(#wallSoilGrad)"/>
        
        <line x1="260" y1="45" x2="260" y2="75" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow)"/>
        <line x1="340" y1="45" x2="340" y2="75" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow)"/>
        <line x1="420" y1="45" x2="420" y2="75" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow)"/>
        <line x1="500" y1="45" x2="500" y2="75" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow)"/>
        <text x="380" y="35" fill="#f59e0b" font-size="12" font-weight="700" text-anchor="middle">Surcharge q = ${p.surchargePsf} psf</text>

        <polygon points="130,340 420,340 420,380 130,380" fill="url(#concreteGrad)" stroke="#1e293b" stroke-width="2"/>
        <polygon points="220,80 250,80 250,340 205,340" fill="url(#concreteGrad)" stroke="#1e293b" stroke-width="2"/>

        <polygon points="250,80 500,340 250,340" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4"/>
        <line x1="430" y1="250" x2="260" y2="250" stroke="#ef4444" stroke-width="3" marker-end="url(#arrow)"/>
        <text x="440" y="254" fill="#ef4444" font-size="12" font-weight="800">Pa = ${(res.Pa_soil / 1000).toFixed(2)} k/ft</text>

        ${p.waterTableDepthFt < res.H_total ? `
          <line x1="250" y1="${80 + p.waterTableDepthFt * 16}" x2="650" y2="${80 + p.waterTableDepthFt * 16}" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,3"/>
          <text x="560" y="${75 + p.waterTableDepthFt * 16}" fill="#38bdf8" font-size="11" font-weight="700">▼ GWT Depth: ${p.waterTableDepthFt} ft</text>
        ` : ''}

        <text x="160" y="365" fill="#f8fafc" font-size="11" font-weight="700">TOE</text>
        <text x="350" y="365" fill="#f8fafc" font-size="11" font-weight="700">HEEL</text>

        <line x1="${130 + (res.B / 2) * 20}" y1="380" x2="${130 + (res.B / 2) * 20}" y2="405" stroke="#94a3b8" stroke-width="2"/>
        <line x1="${130 + ((res.B / 2) - res.eccentricity) * 20}" y1="380" x2="${130 + ((res.B / 2) - res.eccentricity) * 20}" y2="405" stroke="#10b981" stroke-width="2.5"/>
        <text x="${130 + ((res.B / 2) - res.eccentricity) * 20}" y="415" fill="#10b981" font-size="10" font-weight="700" text-anchor="middle">R_v (e = ${res.eccentricity.toFixed(2)} ft)</text>

        <rect x="20" y="20" width="220" height="75" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Overturn FS: <tspan fill="${res.fsOverturning >= p.reqOverturningSF ? '#10b981' : '#ef4444'}" font-weight="800">${res.fsOverturning.toFixed(2)}</tspan> (req ${p.reqOverturningSF})</text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Sliding FS: <tspan fill="${res.fsSliding >= p.reqSlidingSF ? '#10b981' : '#ef4444'}" font-weight="800">${res.fsSliding.toFixed(2)}</tspan> (req ${p.reqSlidingSF})</text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Toe q: <tspan fill="#38bdf8" font-weight="800">${(res.q_toe).toFixed(0)} psf</tspan> (all ${res.q_allowable.toFixed(0)})</text>
      </svg>
    `;
  }

  function renderPondsSvg(res) {
    const p = state.ponds;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <defs>
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.95"/>
          </linearGradient>
        </defs>

        <polygon points="40,120 180,120 280,310 440,310 540,120 660,120 660,380 40,380" fill="#334155" stroke="#1e293b" stroke-width="2"/>
        <polygon points="200,160 280,310 440,310 520,160" fill="url(#waterGrad)"/>

        <line x1="170" y1="160" x2="550" y2="160" stroke="#bae6fd" stroke-width="2.5" stroke-dasharray="6,3"/>
        <text x="360" y="150" fill="#bae6fd" font-size="12" font-weight="800" text-anchor="middle">Design 100-Yr Stage (Depth d = ${p.designDepthFt} ft)</text>

        <rect x="180" y="120" width="360" height="40" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" stroke-dasharray="3,3"/>
        <text x="360" y="142" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">Freeboard Buffer: ${res.freeboardProvided} ft (Req ${p.freeboardReqFt} ft)</text>

        <rect x="430" y="290" width="30" height="30" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>
        <circle cx="445" cy="305" r="7" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
        <line x1="455" y1="305" x2="520" y2="305" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4,2"/>
        <text x="490" y="325" fill="#38bdf8" font-size="10" font-weight="700">Orifice Ø${p.orificeDiamIn}"</text>

        <line x1="90" y1="70" x2="160" y2="110" stroke="#38bdf8" stroke-width="3" marker-end="url(#blueArrow)"/>
        <text x="110" y="65" fill="#38bdf8" font-size="12" font-weight="700">Peak Q = ${res.Q_peak.toFixed(1)} cfs</text>

        <rect x="20" y="20" width="230" height="75" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Drawdown Time: <tspan fill="${res.meetsDrawdown ? '#10b981' : '#f59e0b'}" font-weight="800">${res.time_drawdown_hrs.toFixed(1)} hrs</tspan> (24-72h)</text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Actual Volume: <tspan fill="#38bdf8" font-weight="800">${res.V_actual_acft.toFixed(2)} ac-ft</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Required Vol: <tspan fill="#cbd5e1" font-weight="700">${res.V_req_acft.toFixed(2)} ac-ft</tspan></text>
      </svg>
    `;
  }

  function renderMoundingSvg(res) {
    const p = state.mounding;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <defs>
          <linearGradient id="moundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#075985" stop-opacity="0.4"/>
          </linearGradient>
        </defs>

        <rect x="40" y="100" width="620" height="280" fill="#1e293b"/>
        
        <rect x="250" y="90" width="200" height="40" fill="#334155" stroke="#f59e0b" stroke-width="2"/>
        <text x="350" y="115" fill="#f59e0b" font-size="12" font-weight="800" text-anchor="middle">Infiltration Basin (${p.basinLengthFt}' × ${p.basinWidthFt}')</text>

        <line x1="40" y1="280" x2="660" y2="280" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5,5"/>
        <text x="120" y="272" fill="#38bdf8" font-size="11" font-weight="700">Baseline Water Table (SHWT)</text>

        <path d="M 100,280 C 220,280 280,${280 - res.h_mound_ft * 12} 350,${280 - res.h_mound_ft * 12} C 420,${280 - res.h_mound_ft * 12} 480,280 600,280 Z" fill="url(#moundGrad)" stroke="#38bdf8" stroke-width="3"/>
        
        <circle cx="350" cy="${280 - res.h_mound_ft * 12}" r="5" fill="#ef4444"/>
        <line x1="350" y1="${280 - res.h_mound_ft * 12}" x2="350" y2="280" stroke="#ef4444" stroke-width="2"/>
        <text x="365" y="${275 - (res.h_mound_ft * 6)}" fill="#ef4444" font-size="11" font-weight="800">Peak Mound Δh = ${res.h_mound_ft.toFixed(2)} ft</text>

        <line x1="465" y1="130" x2="465" y2="${280 - res.h_mound_ft * 12}" stroke="#10b981" stroke-width="2" marker-end="url(#blueArrow)"/>
        <text x="475" y="${(130 + (280 - res.h_mound_ft * 12)) / 2}" fill="#10b981" font-size="11" font-weight="800">Clearance: ${res.clearanceRemainingIn.toFixed(1)}" (Req ${res.shwtSeparationReqIn}")</text>

        <rect x="20" y="20" width="240" height="75" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Design K: <tspan fill="#38bdf8" font-weight="800">${res.K_design.toFixed(1)} ft/day</tspan> (SF = ${p.conductSafetyFactor})</text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Specific Yield Sy: <tspan fill="#cbd5e1" font-weight="700">${p.specificYieldSy}</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">SHWT Status: <tspan fill="${res.meetsClearance ? '#10b981' : '#ef4444'}" font-weight="800">${res.meetsClearance ? 'ADEQUATE SEPARATION' : 'RISK OF FLOODING'}</tspan></text>
      </svg>
    `;
  }

  function renderRoadsSvg(res) {
    const p = state.roads;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <path d="M 60,340 L 260,180" stroke="#64748b" stroke-width="2" stroke-dasharray="5,5"/>
        <path d="M 260,180 L 620,180" stroke="#64748b" stroke-width="2" stroke-dasharray="5,5"/>
        
        <path d="M 120,292 Q 260,180 400,180" fill="none" stroke="#38bdf8" stroke-width="5"/>
        <line x1="60" y1="340" x2="120" y2="292" stroke="#38bdf8" stroke-width="5"/>
        <line x1="400" y1="180" x2="620" y2="180" stroke="#38bdf8" stroke-width="5"/>

        <circle cx="260" cy="180" r="5" fill="#ef4444"/>
        <text x="260" y="165" fill="#ef4444" font-size="12" font-weight="800" text-anchor="middle">P.I. (Δ = ${p.deflectionAngleDeltaDeg}°)</text>

        <text x="175" y="225" fill="#f59e0b" font-size="11" font-weight="700">T = ${res.T.toFixed(1)} ft</text>
        <text x="280" y="240" fill="#38bdf8" font-size="12" font-weight="800">L = ${res.L.toFixed(1)} ft (R = ${res.R_design.toFixed(0)} ft)</text>

        <path d="M 100,310 A 180 180 0 0 1 320,195" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4,4"/>
        <text x="180" y="325" fill="#10b981" font-size="11" font-weight="700">Stopping Sight Distance SSD = ${res.ssdDesign.toFixed(0)} ft</text>

        <rect x="20" y="20" width="240" height="75" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Design Speed: <tspan fill="#38bdf8" font-weight="800">${p.designSpeedMph} mph</tspan></text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Min Radius R_min: <tspan fill="#cbd5e1" font-weight="700">${res.R_min.toFixed(0)} ft</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Pavement SN_req: <tspan fill="#10b981" font-weight="800">${res.SN_req.toFixed(2)}</tspan> (CBR = ${p.subgradeCbr})</text>
      </svg>
    `;
  }

  function renderPlatsSvg(res) {
    const p = state.plats;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <polygon points="120,320 540,320 540,120 120,120" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4"/>

        <!-- Subdivision Lot with Corner Return Cut-Back (Adhering to Rule 2) -->
        <path d="M 120,320 L ${540 - res.T * 1.5},320 A ${res.R * 1.5} ${res.R * 1.5} 0 0 1 540,${320 - res.T * 1.5} L 540,120 L 120,120 Z" fill="rgba(14, 165, 233, 0.15)" stroke="#38bdf8" stroke-width="3"/>

        <!-- Corner Return Fillet Area Shading -->
        <path d="M ${540 - res.T * 1.5},320 L 540,320 L 540,${320 - res.T * 1.5} A ${res.R * 1.5} ${res.R * 1.5} 0 0 0 ${540 - res.T * 1.5},320" fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" stroke-width="1.5"/>
        <text x="${540 - 15}" y="${320 - 12}" fill="#ef4444" font-size="10" font-weight="700" text-anchor="middle">A_fillet: ${res.A_fillet.toFixed(1)} sq ft</text>

        <!-- Rule 2: L-Shaped Angle Bar Glyph at PI (┘) -->
        <g transform="translate(535, 315)">
          <path d="M -15,0 L 0,0 L 0,-15" fill="none" stroke="#f59e0b" stroke-width="3"/>
          <circle cx="0" cy="0" r="3" fill="#f59e0b"/>
          <text x="-20" y="20" fill="#f59e0b" font-size="11" font-weight="800">P.I. Tick Glyph (┘)</text>
        </g>

        <text x="320" y="340" fill="#cbd5e1" font-size="11" text-anchor="middle">Stated to P.I. = ${p.statedBoundaryDimensionFt} ft  |  Line to P.C. = <tspan fill="#10b981" font-weight="800">${res.lineToPcLength.toFixed(2)} ft</tspan></text>
        <text x="100" y="220" fill="#cbd5e1" font-size="11" transform="rotate(-90 100,220)" text-anchor="middle">Lot Depth = ${p.lotDepthFt} ft</text>

        <!-- Rule 1: Natural Ground-Truthed GPS Coordinates -->
        <g transform="translate(300, 390)">
          <rect x="-180" y="-18" width="360" height="28" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8"/>
          <text x="0" y="1" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">
            📍 True WGS84 GPS: ${res.lat.toFixed(6)}° N, ${res.lng.toFixed(6)}° W (No Fudging)
          </text>
        </g>

        <rect x="20" y="20" width="230" height="75" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Radius R: <tspan fill="#38bdf8" font-weight="800">${res.R} ft</tspan> (Δ = ${res.deltaDeg}°)</text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Tangent Cut-Back T: <tspan fill="#f59e0b" font-weight="800">${res.T.toFixed(2)} ft</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Net Parcel Area: <tspan fill="#10b981" font-weight="800">${res.netParcelAreaAcres.toFixed(3)} Ac</tspan></text>
      </svg>
    `;
  }

  function renderLiftStationSvg(res) {
    const p = state.liftstation;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <defs>
          <linearGradient id="sewageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#0f766e" stop-opacity="0.95"/>
          </linearGradient>
        </defs>

        <line x1="40" y1="80" x2="660" y2="80" stroke="#64748b" stroke-width="2"/>
        <text x="70" y="72" fill="#94a3b8" font-size="11">Finished Grade</text>

        <rect x="180" y="80" width="200" height="300" rx="4" fill="#334155" stroke="#1e293b" stroke-width="3"/>
        <rect x="195" y="80" width="170" height="290" fill="#0f172a"/>

        <rect x="195" y="${370 - res.activeDepthFt * 16}" width="170" height="${res.activeDepthFt * 16}" fill="url(#sewageGrad)"/>

        <rect x="60" y="${370 - res.incomingSewerInvertFt * 16}" width="135" height="18" fill="#475569" stroke="#64748b"/>
        <line x1="70" y1="${370 - res.incomingSewerInvertFt * 16 + 9}" x2="190" y2="${370 - res.incomingSewerInvertFt * 16 + 9}" stroke="#10b981" stroke-width="3" stroke-dasharray="4,2"/>
        <text x="120" y="${370 - res.incomingSewerInvertFt * 16 - 5}" fill="#10b981" font-size="10" font-weight="700">8" Gravity Sewer (${p.gravitySewerSlopePct}% S)</text>

        <!-- Duplex Submersible Pumps -->
        <rect x="220" y="325" width="40" height="40" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
        <text x="240" y="348" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">LEAD</text>
        
        <rect x="295" y="325" width="40" height="40" rx="4" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
        <text x="315" y="348" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">LAG</text>

        <path d="M 240,325 L 240,110 L 450,110 L 660,110" fill="none" stroke="#38bdf8" stroke-width="5"/>
        <text x="520" y="100" fill="#38bdf8" font-size="11" font-weight="800">6" Force Main (${res.velocityFps.toFixed(2)} ft/s)</text>

        <!-- Float Switches -->
        <line x1="355" y1="90" x2="355" y2="360" stroke="#f59e0b" stroke-width="1.5"/>
        <circle cx="355" cy="${370 - res.highWaterAlarmFt * 16}" r="4" fill="#ef4444"/>
        <text x="365" y="${370 - res.highWaterAlarmFt * 16 + 3}" fill="#ef4444" font-size="9" font-weight="700">HIGH ALARM</text>
        <circle cx="355" cy="${370 - res.lagPumpOnFt * 16}" r="4" fill="#f59e0b"/>
        <text x="365" y="${370 - res.lagPumpOnFt * 16 + 3}" fill="#f59e0b" font-size="9" font-weight="700">LAG ON</text>
        <circle cx="355" cy="${370 - res.leadPumpOnFt * 16}" r="4" fill="#10b981"/>
        <text x="365" y="${370 - res.leadPumpOnFt * 16 + 3}" fill="#10b981" font-size="9" font-weight="700">LEAD ON</text>
        <circle cx="355" cy="${370 - res.lowWaterShutoffFt * 16}" r="4" fill="#64748b"/>
        <text x="365" y="${370 - res.lowWaterShutoffFt * 16 + 3}" fill="#94a3b8" font-size="9" font-weight="700">PUMP OFF</text>

        <rect x="20" y="20" width="240" height="85" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#475569"/>
        <text x="35" y="40" fill="#cbd5e1" font-size="11">Pump Flow: <tspan fill="#38bdf8" font-weight="800">${res.Q_pump_gpm.toFixed(0)} gpm</tspan> (${res.bhp.toFixed(1)} BHP)</text>
        <text x="35" y="60" fill="#cbd5e1" font-size="11">Total Head TDH: <tspan fill="#f59e0b" font-weight="800">${res.totalDynamicHeadFt.toFixed(1)} ft</tspan></text>
        <text x="35" y="80" fill="#cbd5e1" font-size="11">Active Vol: <tspan fill="#10b981" font-weight="800">${res.V_active_gal.toFixed(0)} gal</tspan> (${res.activeDepthFt.toFixed(1)} ft)</text>
        <text x="35" y="98" fill="#cbd5e1" font-size="10">Velocity: <tspan fill="${res.meetsVelocity ? '#10b981' : '#ef4444'}" font-weight="700">${res.velocityFps.toFixed(2)} fps (2-8 fps)</tspan></text>
      </svg>
    `;
  }

  function renderDrainageSvg(res) {
    const p = state.drainage;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <polygon points="40,320 220,160 480,160 660,320 660,380 40,380" fill="#334155" stroke="#1e293b" stroke-width="2"/>
        <line x1="220" y1="160" x2="480" y2="160" stroke="#94a3b8" stroke-width="6"/>
        <text x="350" y="145" fill="#f8fafc" font-size="12" font-weight="800" text-anchor="middle">Roadway Crest</text>

        <rect x="140" y="290" width="420" height="40" fill="#0f172a" stroke="#64748b" stroke-width="3"/>
        <text x="350" y="315" fill="#94a3b8" font-size="11" font-weight="700" text-anchor="middle">Ø${p.culvertDiamIn}" RCP Culvert (${p.culvertLengthFt}' @ ${p.culvertSlopePct}%)</text>

        <rect x="40" y="${330 - res.controllingHW * 18}" width="100" height="${res.controllingHW * 18}" fill="rgba(56, 189, 248, 0.5)"/>
        <line x1="30" y1="${330 - res.controllingHW * 18}" x2="160" y2="${330 - res.controllingHW * 18}" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4,2"/>
        <text x="90" y="${320 - res.controllingHW * 18}" fill="#38bdf8" font-size="11" font-weight="800">HW = ${res.controllingHW.toFixed(2)} ft</text>

        <line x1="200" y1="310" x2="500" y2="310" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4" marker-end="url(#blueArrow)"/>
        <text x="350" y="275" fill="#38bdf8" font-size="12" font-weight="800" text-anchor="middle">Q = ${res.Q.toFixed(1)} cfs (${res.controllingType})</text>

        <line x1="120" y1="160" x2="120" y2="${330 - res.controllingHW * 18}" stroke="#10b981" stroke-width="2"/>
        <text x="130" y="${(160 + (330 - res.controllingHW * 18)) / 2}" fill="#10b981" font-size="11" font-weight="700">Freeboard: ${res.freeboard.toFixed(2)} ft</text>

        <rect x="20" y="20" width="240" height="75" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Curb Gutter Spread: <tspan fill="#f59e0b" font-weight="800">${res.spreadT.toFixed(1)} ft</tspan></text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Inlet HW: <tspan fill="#38bdf8" font-weight="700">${res.HW_inlet.toFixed(2)} ft</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Outlet HW: <tspan fill="#38bdf8" font-weight="700">${res.HW_outlet.toFixed(2)} ft</tspan></text>
      </svg>
    `;
  }

  function renderPilesSvg(res) {
    const p = state.piles;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <rect x="100" y="80" width="500" height="300" fill="#1e293b"/>
        
        <rect x="240" y="60" width="220" height="40" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
        <text x="350" y="85" fill="#f8fafc" font-size="12" font-weight="800" text-anchor="middle">Pile Group Cap (${p.numPilesRow} × ${p.numPilesCol} = ${res.totalPiles} Piles)</text>

        <rect x="270" y="100" width="25" height="260" fill="#64748b" stroke="#38bdf8" stroke-width="1.5"/>
        <rect x="338" y="100" width="25" height="260" fill="#64748b" stroke="#38bdf8" stroke-width="1.5"/>
        <rect x="405" y="100" width="25" height="260" fill="#64748b" stroke="#38bdf8" stroke-width="1.5"/>

        <line x1="260" y1="200" x2="260" y2="160" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow)"/>
        <line x1="440" y1="200" x2="440" y2="160" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow)"/>
        <text x="495" y="185" fill="#f59e0b" font-size="11" font-weight="700">Skin Friction Qs = ${res.Qs_kips.toFixed(1)} kips</text>

        <line x1="282" y1="380" x2="282" y2="362" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrow)"/>
        <line x1="350" y1="380" x2="350" y2="362" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrow)"/>
        <line x1="417" y1="380" x2="417" y2="362" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrow)"/>
        <text x="350" y="402" fill="#10b981" font-size="11" font-weight="800" text-anchor="middle">Tip End Bearing Qp = ${res.Qp_kips.toFixed(1)} kips</text>

        <rect x="20" y="20" width="240" height="75" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Single Pile Q_allow: <tspan fill="#10b981" font-weight="800">${res.Q_allow_single.toFixed(1)} kips</tspan> (FS ${p.reqBearingSF})</text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Group Efficiency η: <tspan fill="#38bdf8" font-weight="800">${(res.eta_group * 100).toFixed(1)}%</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Total Group Cap: <tspan fill="#10b981" font-weight="800">${res.Q_allow_group.toFixed(0)} kips</tspan></text>
      </svg>
    `;
  }

  // --- SLAB METHOD 1: WESTERGAARD SLAB-ON-GRADE SVG ---
  function renderWestergaardSvg(res) {
    const p = state.slabs;
    const soil = USCS_SOILS[state.selectedSoil] || USCS_SOILS.SP;
    const slabH = res.h * 7;
    const slabTopY = 220 - slabH;
    
    // Position wheel load based on location
    let loadX = 350;
    if (p.loadLocation === 'edge') loadX = 140;
    if (p.loadLocation === 'corner') loadX = 85;

    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <rect x="50" y="220" width="600" height="150" fill="#1e293b"/>
        
        <!-- Subgrade springs under slab -->
        <g stroke="#475569" stroke-width="1.5" fill="none">
          ${[80, 140, 200, 260, 320, 380, 440, 500, 560, 620].map(sx => `
            <path d="M ${sx},220 L ${sx-6},232 L ${sx+6},244 L ${sx-6},256 L ${sx+6},268 L ${sx},280"/>
            <line x1="${sx-12}" y1="280" x2="${sx+12}" y2="280" stroke="#64748b"/>
          `).join('')}
        </g>
        <text x="350" y="305" fill="#64748b" font-size="10" text-anchor="middle">Winkler Subgrade Springs (k = ${res.k} pci, ${soil.name})</text>

        <!-- Westergaard Deflection Basin Curve -->
        <path d="M 60,220 Q ${loadX},${220 + 38} 640,220" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="5,3" fill="none"/>
        <text x="${loadX}" y="245" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">Deflection Basin w(x) • Radius ℓ = ${res.l_stiff.toFixed(1)}"</text>

        <!-- Concrete Slab Body -->
        <rect x="50" y="${slabTopY}" width="600" height="${slabH}" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
        <text x="75" y="${slabTopY + slabH/2 + 4}" fill="#cbd5e1" font-size="10" font-weight="700">h = ${res.h}"</text>

        <!-- Rebar Layer -->
        <line x1="60" y1="${220 - 15}" x2="640" y2="${220 - 15}" stroke="#ef4444" stroke-width="3" stroke-dasharray="14,6"/>
        <text x="540" y="${220 - 20}" fill="#ef4444" font-size="10" font-weight="800">#${p.barSizeNum} @ ${p.barSpacingIn}" o.c.</text>

        <!-- Wheel Load Arrow -->
        <polygon points="${loadX-10},${slabTopY-60} ${loadX+10},${slabTopY-60} ${loadX+10},${slabTopY-25} ${loadX+20},${slabTopY-25} ${loadX},${slabTopY-2} ${loadX-20},${slabTopY-25} ${loadX-10},${slabTopY-25}" fill="#38bdf8"/>
        <text x="${loadX}" y="${slabTopY-70}" fill="#38bdf8" font-size="12" font-weight="800" text-anchor="middle">Wheel Load P = ${res.P_kips} kips (${p.loadLocation.toUpperCase()})</text>

        <!-- Bradbury Curling Gradient Indication -->
        <path d="M 500,${slabTopY} Q 520,${slabTopY+slabH/2} 500,220" stroke="#a855f7" stroke-width="2" fill="none"/>
        <text x="535" y="${slabTopY + slabH/2}" fill="#c084fc" font-size="9">ΔT = ${p.tempDiffF}°F Warp</text>

        <!-- Telemetry Card -->
        <rect x="20" y="20" width="280" height="85" rx="6" fill="rgba(15, 23, 42, 0.92)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Total Flexure σ: <tspan fill="${res.isSafe ? '#10b981' : '#ef4444'}" font-weight="800">${res.totalStress.toFixed(0)} psi</tspan> (fr ${res.fr.toFixed(0)} psi)</text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Load σ: <tspan fill="#38bdf8" font-weight="700">${res.activeLoadStress.toFixed(0)} psi</tspan> • Warp σ: <tspan fill="#c084fc">${res.sigma_warp.toFixed(0)} psi</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Safety Factor: <tspan fill="${res.isSafe ? '#10b981' : '#ef4444'}" font-weight="800">${res.fs.toFixed(2)}</tspan> (Req ≥ ${p.reqOverdriveSF})</text>
      </svg>
    `;
  }

  // --- SLAB METHOD 2: ACI 318 DIRECT DESIGN METHOD (DDM) SVG ---
  function renderDdmSvg(res) {
    const p = state.slabs;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <!-- Floor Panel Outline L1 x L2 -->
        <rect x="120" y="50" width="460" height="200" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
        
        <!-- Flanking Middle Strips (Top & Bottom) -->
        <rect x="120" y="50" width="460" height="45" fill="rgba(56, 189, 248, 0.15)"/>
        <text x="350" y="78" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Middle Strip (25% M_u⁻ / 40% M_u⁺)</text>

        <rect x="120" y="205" width="460" height="45" fill="rgba(56, 189, 248, 0.15)"/>
        <text x="350" y="232" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Middle Strip</text>

        <!-- Column Strip (Center Corridor) -->
        <rect x="120" y="95" width="460" height="110" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="6,3"/>
        <text x="350" y="155" fill="#f59e0b" font-size="12" font-weight="800" text-anchor="middle">Column Strip Width b_cs = ${res.cs_width.toFixed(1)}' (75% M_u⁻ / 60% M_u⁺)</text>

        <!-- Columns at Corners & Ends -->
        <rect x="105" y="38" width="30" height="25" fill="#475569" stroke="#94a3b8"/>
        <rect x="105" y="238" width="30" height="25" fill="#475569" stroke="#94a3b8"/>
        <rect x="565" y="38" width="30" height="25" fill="#475569" stroke="#94a3b8"/>
        <rect x="565" y="238" width="30" height="25" fill="#475569" stroke="#94a3b8"/>
        <rect x="105" y="138" width="30" height="25" fill="#475569" stroke="#94a3b8"/>
        <rect x="565" y="138" width="30" height="25" fill="#475569" stroke="#94a3b8"/>

        <!-- Clear Span Dimension ln -->
        <line x1="120" y1="270" x2="580" y2="270" stroke="#cbd5e1" stroke-width="1.5" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
        <text x="350" y="285" fill="#cbd5e1" font-size="11" font-weight="700" text-anchor="middle">Clear Span ℓn = ${res.ln.toFixed(2)} ft (L1 = ${res.L1}', c1 = ${res.c1}")</text>

        <!-- Bending Moment Envelope Curve Below -->
        <line x1="120" y1="340" x2="580" y2="340" stroke="#64748b" stroke-width="1" stroke-dasharray="4,2"/>
        <path d="M 120,315 Q 350,385 580,315" stroke="#ef4444" stroke-width="3" fill="none"/>
        <text x="135" y="310" fill="#ef4444" font-size="10" font-weight="800">-Mu = ${(res.Mu_neg).toFixed(1)} k-ft (0.65 M₀)</text>
        <text x="565" y="310" fill="#ef4444" font-size="10" font-weight="800" text-anchor="end">-Mu = ${(res.Mu_neg).toFixed(1)} k-ft</text>
        <text x="350" y="398" fill="#10b981" font-size="11" font-weight="800" text-anchor="middle">+Mu = ${(res.Mu_pos).toFixed(1)} k-ft (0.35 M₀)</text>

        <!-- Telemetry Card -->
        <rect x="20" y="20" width="280" height="85" rx="6" fill="rgba(15, 23, 42, 0.92)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Total Static Moment M₀: <tspan fill="#f59e0b" font-weight="800">${res.M0.toFixed(1)} k-ft</tspan></text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Col Strip Neg M_u: <tspan fill="#ef4444" font-weight="700">${res.Mu_cs_neg.toFixed(1)} k-ft</tspan> (${res.mu_cs_neg_per_ft.toFixed(1)}/ft)</text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Capacity φMn: <tspan fill="${res.isSafe ? '#10b981' : '#ef4444'}" font-weight="800">${res.phiMn_per_ft.toFixed(1)} k-ft/ft</tspan> (${res.isSafe ? 'ADEQUATE' : 'REBAR LOW'})</text>
      </svg>
    `;
  }

  // --- SLAB METHOD 3: ACI 318 EQUIVALENT FRAME METHOD (EFM) SVG ---
  function renderEfmSvg(res) {
    const p = state.slabs;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <!-- Upper Column -->
        <rect x="335" y="40" width="30" height="130" fill="#334155" stroke="#64748b" stroke-width="2"/>
        <text x="350" y="95" fill="#94a3b8" font-size="10" font-weight="700" text-anchor="middle">Upper Column</text>
        <text x="350" y="110" fill="#cbd5e1" font-size="9" text-anchor="middle">Kc = ${(res.sum_Kc/2/1e6).toFixed(1)}M</text>

        <!-- Lower Column -->
        <rect x="335" y="220" width="30" height="130" fill="#334155" stroke="#64748b" stroke-width="2"/>
        <text x="350" y="275" fill="#94a3b8" font-size="10" font-weight="700" text-anchor="middle">Lower Column</text>
        <text x="350" y="290" fill="#cbd5e1" font-size="9" text-anchor="middle">Kc = ${(res.sum_Kc/2/1e6).toFixed(1)}M</text>

        <!-- Slab-Beam Longitudinal Spanning Across -->
        <rect x="60" y="170" width="580" height="50" fill="#1e293b" stroke="#94a3b8" stroke-width="2.5"/>
        <text x="180" y="200" fill="#38bdf8" font-size="12" font-weight="800">Slab-Beam K_sb = ${(res.Ksb / 1e6).toFixed(1)}M lb-in/rad</text>
        <text x="520" y="200" fill="#38bdf8" font-size="12" font-weight="800">Span L1 = ${res.L1} ft</text>

        <!-- Joint Transverse Torsion Element Kt -->
        <circle cx="350" cy="195" r="28" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="3"/>
        <path d="M 335,195 A 15 15 0 1 1 365,195" stroke="#f59e0b" stroke-width="3" fill="none" marker-end="url(#arrow)"/>
        <text x="350" y="198" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">Kt</text>

        <!-- Moment Transfer Vector -->
        <path d="M 310,150 A 50 50 0 0 1 390,150" stroke="#ec4899" stroke-width="3" fill="none" marker-end="url(#arrow)"/>
        <text x="350" y="142" fill="#ec4899" font-size="11" font-weight="800" text-anchor="middle">M_unbal = ${res.Munbal} k-ft</text>

        <!-- Distribution arrows -->
        <line x1="280" y1="205" x2="210" y2="205" stroke="#10b981" stroke-width="3" marker-end="url(#arrow)"/>
        <text x="245" y="230" fill="#10b981" font-size="10" font-weight="700">M_slab = ${res.M_trans_slab.toFixed(1)} k-ft</text>

        <!-- Telemetry Card -->
        <rect x="20" y="20" width="280" height="85" rx="6" fill="rgba(15, 23, 42, 0.92)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Torsional Stiff Kt: <tspan fill="#f59e0b" font-weight="800">${(res.Kt / 1e6).toFixed(1)}M lb-in/rad</tspan></text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Equivalent Col Kec: <tspan fill="#38bdf8" font-weight="800">${(res.Kec / 1e6).toFixed(1)}M lb-in/rad</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Distribution Factor DF_sb: <tspan fill="#10b981" font-weight="800">${(res.DF_sb * 100).toFixed(1)}%</tspan> (Col ${(res.DF_ec * 100).toFixed(1)}%)</text>
      </svg>
    `;
  }

  // --- SLAB METHOD 4: YIELD LINE THEORY SVG ---
  function renderYieldLineSvg(res) {
    const p = state.slabs;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <!-- Slab Outer Boundary -->
        <rect x="90" y="70" width="520" height="260" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>

        <!-- Support Cross Hatching on Perimeter (Simply Supported) -->
        <line x1="90" y1="62" x2="610" y2="62" stroke="#64748b" stroke-width="2" stroke-dasharray="6,4"/>
        <line x1="90" y1="338" x2="610" y2="338" stroke="#64748b" stroke-width="2" stroke-dasharray="6,4"/>
        <text x="350" y="55" fill="#94a3b8" font-size="10" text-anchor="middle">Simply Supported Outer Edges (Lx = ${res.Lx}', Ly = ${res.Ly}')</text>

        <!-- Segment Fills -->
        <!-- Left Triangle -->
        <polygon points="90,70 250,200 90,330" fill="rgba(56, 189, 248, 0.12)"/>
        <!-- Right Triangle -->
        <polygon points="610,70 450,200 610,330" fill="rgba(56, 189, 248, 0.12)"/>
        <!-- Top Trapezoid -->
        <polygon points="90,70 610,70 450,200 250,200" fill="rgba(245, 158, 11, 0.12)"/>
        <!-- Bottom Trapezoid -->
        <polygon points="90,330 610,330 450,200 250,200" fill="rgba(245, 158, 11, 0.12)"/>

        <!-- 4 Diagonal Yield Lines (Plastic Hinges) -->
        <line x1="90" y1="70" x2="250" y2="200" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="8,4"/>
        <line x1="90" y1="330" x2="250" y2="200" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="8,4"/>
        <line x1="610" y1="70" x2="450" y2="200" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="8,4"/>
        <line x1="610" y1="330" x2="450" y2="200" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="8,4"/>

        <!-- Central Yield Line Ridge -->
        <line x1="250" y1="200" x2="450" y2="200" stroke="#ef4444" stroke-width="4.5" stroke-dasharray="10,5"/>
        <text x="350" y="190" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">Central Ridge Hinge (mp = ${res.mp_k_ft.toFixed(2)} k-ft/ft)</text>

        <!-- Deflection / Rotation Vectors -->
        <circle cx="350" cy="200" r="6" fill="#10b981"/>
        <text x="350" y="222" fill="#10b981" font-size="11" font-weight="800" text-anchor="middle">Max Plastic Displacement δ</text>

        <!-- Telemetry Card -->
        <rect x="20" y="20" width="280" height="85" rx="6" fill="rgba(15, 23, 42, 0.92)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Collapse Load q_ult: <tspan fill="#f59e0b" font-weight="800">${res.q_ult.toFixed(0)} psf</tspan></text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Service Load q_serv: <tspan fill="#38bdf8">${res.q_serv.toFixed(0)} psf</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Collapse Safety Factor: <tspan fill="${res.isSafe ? '#10b981' : '#ef4444'}" font-weight="800">${res.fs_collapse.toFixed(2)}</tspan> (Req ≥ ${res.reqSF.toFixed(2)})</text>
      </svg>
    `;
  }

  // --- SLAB METHOD 5: HILLERBORG STRIP METHOD SVG ---
  function renderHillerborgSvg(res) {
    const p = state.slabs;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <!-- Slab Outer Plan -->
        <rect x="90" y="60" width="520" height="240" fill="#1e293b" stroke="#64748b" stroke-width="2"/>

        <!-- X-Direction Strips (Vertical Bands) -->
        <g stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,4">
          <line x1="200" y1="60" x2="200" y2="300"/>
          <line x1="310" y1="60" x2="310" y2="300"/>
          <line x1="420" y1="60" x2="420" y2="300"/>
          <line x1="530" y1="60" x2="530" y2="300"/>
        </g>
        <text x="350" y="105" fill="#38bdf8" font-size="12" font-weight="800" text-anchor="middle">X-Strips carry qx = ${res.qx_psf.toFixed(0)} psf (${res.pctX.toFixed(0)}% Load)</text>

        <!-- Y-Direction Strips (Horizontal Bands) -->
        <g stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,4">
          <line x1="90" y1="120" x2="610" y2="120"/>
          <line x1="90" y1="180" x2="610" y2="180"/>
          <line x1="90" y1="240" x2="610" y2="240"/>
        </g>
        <text x="350" y="215" fill="#f59e0b" font-size="12" font-weight="800" text-anchor="middle">Y-Strips carry qy = ${res.qy_psf.toFixed(0)} psf (${res.pctY.toFixed(0)}% Load)</text>

        <!-- No Torsion Callout Mxy = 0 -->
        <rect x="230" y="140" width="240" height="30" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#10b981"/>
        <text x="350" y="160" fill="#10b981" font-size="11" font-weight="800" text-anchor="middle">Hillerborg Assumption: M_xy = 0</text>

        <!-- Moment Curves Below -->
        <line x1="90" y1="355" x2="610" y2="355" stroke="#475569" stroke-width="1"/>
        <path d="M 90,355 Q 350,405 610,355" stroke="#38bdf8" stroke-width="2.5" fill="none"/>
        <text x="350" y="385" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Mx,max = ${res.Mx_max.toFixed(1)} k-ft/ft (As,req = ${res.As_req_x.toFixed(2)} in²/ft)</text>

        <!-- Telemetry Card -->
        <rect x="20" y="20" width="280" height="85" rx="6" fill="rgba(15, 23, 42, 0.92)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Total Factored qu: <tspan fill="#ffffff" font-weight="800">${res.qu_psf.toFixed(0)} psf</tspan></text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Moments: <tspan fill="#38bdf8">Mx ${res.Mx_max.toFixed(1)}</tspan> • <tspan fill="#f59e0b">My ${res.My_max.toFixed(1)} k-ft/ft</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Rebar Check: <tspan fill="${res.isSafe ? '#10b981' : '#ef4444'}" font-weight="800">${res.isSafe ? 'ADEQUATE' : 'UNDER-REINFORCED'}</tspan> (${res.As_prov.toFixed(2)} in²/ft)</text>
      </svg>
    `;
  }

  // --- SLAB METHOD 6: TWO-WAY PUNCHING SHEAR SVG ---
  function renderPunchingSvg(res) {
    const p = state.slabs;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <!-- Slab Panel Background -->
        <rect x="100" y="50" width="500" height="240" fill="#1e293b" stroke="#475569" stroke-width="2"/>
        <text x="350" y="75" fill="#64748b" font-size="10" text-anchor="middle">Slab Panel (Trib Spans L1 = ${res.L1}', L2 = ${res.L2}')</text>

        <!-- Critical Shear Perimeter bo at d/2 -->
        <rect x="${350 - res.b1 * 1.8}" y="${170 - res.b2 * 1.8}" width="${res.b1 * 3.6}" height="${res.b2 * 3.6}" fill="rgba(239, 68, 68, 0.18)" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6,4"/>
        <text x="350" y="${170 - res.b2 * 1.8 - 8}" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">Critical Perimeter b_o = ${res.bo.toFixed(1)}" (at d/2 = ${(res.d/2).toFixed(1)}")</text>

        <!-- Column Footprint c1 x c2 -->
        <rect x="${350 - (res.c1/2) * 2.2}" y="${170 - (res.c2/2) * 2.2}" width="${res.c1 * 2.2}" height="${res.c2 * 2.2}" fill="#475569" stroke="#cbd5e1" stroke-width="2"/>
        <text x="350" y="174" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle">${res.c1}" × ${res.c2}" Col</text>

        <!-- Unbalanced Moment Vector Arrow -->
        <path d="M 330,120 A 45 45 0 0 1 370,120" stroke="#ec4899" stroke-width="3" fill="none" marker-end="url(#arrow)"/>
        <text x="350" y="112" fill="#ec4899" font-size="11" font-weight="800" text-anchor="middle">M_sc = ${p.unbalancedMomentFtKips} k-ft (γv = ${res.gamma_v.toFixed(3)})</text>

        <!-- Shear Stress Distribution Profile Below -->
        <line x1="200" y1="340" x2="500" y2="340" stroke="#64748b" stroke-width="1"/>
        <!-- Stress Trapezoid -->
        <polygon points="200,340 500,340 500,${340 - (res.vu_max - 2 * res.v_unbal) * 0.4} 200,${340 - res.vu_max * 0.4}" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" stroke-width="2"/>
        <line x1="200" y1="${340 - res.phi_vc * 0.4}" x2="500" y2="${340 - res.phi_vc * 0.4}" stroke="#10b981" stroke-width="2" stroke-dasharray="4,3"/>
        <text x="510" y="${340 - res.phi_vc * 0.4 + 4}" fill="#10b981" font-size="10" font-weight="800">φvc = ${res.phi_vc.toFixed(0)} psi</text>
        <text x="190" y="${340 - res.vu_max * 0.4 + 4}" fill="#ef4444" font-size="10" font-weight="800" text-anchor="end">vu,max = ${res.vu_max.toFixed(0)} psi</text>

        <!-- Telemetry Card -->
        <rect x="20" y="20" width="280" height="85" rx="6" fill="rgba(15, 23, 42, 0.92)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Total Shear vu: <tspan fill="${res.isSafe ? '#10b981' : '#ef4444'}" font-weight="800">${res.vu_max.toFixed(0)} psi</tspan> (φvc ${res.phi_vc.toFixed(0)} psi)</text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Direct v_ug: <tspan fill="#38bdf8">${res.v_ug.toFixed(0)} psi</tspan> • Eccentric v_unbal: <tspan fill="#ec4899">${res.v_unbal.toFixed(0)} psi</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">D/C Ratio: <tspan fill="${res.isSafe ? '#10b981' : '#ef4444'}" font-weight="800">${res.dcr.toFixed(2)}</tspan> (${res.isSafe ? 'ADEQUATE' : 'REINFORCE'})</text>
      </svg>
    `;
  }

  // Router for Slabs SVG
  function renderSlabsSvg(res) {
    const method = res.method || state.slabs.method || 'westergaard';
    switch (method) {
      case 'westergaard': return renderWestergaardSvg(res);
      case 'ddm': return renderDdmSvg(res);
      case 'efm': return renderEfmSvg(res);
      case 'yield_line': return renderYieldLineSvg(res);
      case 'hillerborg': return renderHillerborgSvg(res);
      case 'punching': return renderPunchingSvg(res);
      default: return renderWestergaardSvg(res);
    }
  }

  function renderSlopeSvg(res) {
    const p = state.slope;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <polygon points="60,340 200,340 450,140 640,140 640,380 60,380" fill="#334155" stroke="#1e293b" stroke-width="2"/>
        
        <path d="M 200,340 Q 320,290 520,140" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,3" fill="none"/>
        <text x="330" y="295" fill="#38bdf8" font-size="11" font-weight="700">Seepage Phreatic Line (${p.phreaticLevelPct}%)</text>

        <path d="M 180,340 A 240 240 0 0 0 540,140" stroke="#ef4444" stroke-width="3" stroke-dasharray="6,4" fill="rgba(239, 68, 68, 0.15)"/>
        <text x="380" y="240" fill="#ef4444" font-size="12" font-weight="800">Critical Slip Arc (Bishop Slices)</text>

        <line x1="260" y1="325" x2="260" y2="290" stroke="#94a3b8" stroke-width="1"/>
        <line x1="330" y1="315" x2="330" y2="235" stroke="#94a3b8" stroke-width="1"/>
        <line x1="400" y1="280" x2="400" y2="180" stroke="#94a3b8" stroke-width="1"/>
        <line x1="470" y1="210" x2="470" y2="140" stroke="#94a3b8" stroke-width="1"/>

        <text x="240" y="360" fill="#cbd5e1" font-size="11">Slope ${p.slopeRatioH}:1 (β = ${res.betaDeg.toFixed(1)}°)</text>

        <rect x="20" y="20" width="240" height="75" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Bishop FS: <tspan fill="${res.fs_bishop >= p.targetSF ? '#10b981' : '#ef4444'}" font-weight="800">${res.fs_bishop.toFixed(2)}</tspan> (Req ${p.targetSF})</text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Infinite Dry FS: <tspan fill="#38bdf8" font-weight="700">${res.fs_dry.toFixed(2)}</tspan></text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">With Seepage FS: <tspan fill="#f59e0b" font-weight="700">${res.fs_infinite_seepage.toFixed(2)}</tspan></text>
      </svg>
    `;
  }

  function renderWeirsDamsSvg(res) {
    const p = state.weirs_dams;
    return `
      <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" class="toolbox-svg">
        <rect x="60" y="120" width="220" height="220" fill="rgba(56, 189, 248, 0.4)"/>
        <line x1="60" y1="120" x2="280" y2="120" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4,2"/>
        <text x="140" y="110" fill="#38bdf8" font-size="12" font-weight="800">Headwater H = ${p.headwaterDepthFt} ft</text>

        <polygon points="280,100 340,100 500,340 280,340" fill="#475569" stroke="#1e293b" stroke-width="3"/>
        <text x="360" y="220" fill="#f8fafc" font-size="12" font-weight="800" text-anchor="middle">Concrete Dam</text>
        <text x="360" y="240" fill="#cbd5e1" font-size="10" text-anchor="middle">W = ${(res.W_total / 1000).toFixed(1)} k/ft</text>

        <rect x="500" y="310" width="140" height="30" fill="rgba(56, 189, 248, 0.3)"/>
        <text x="560" y="302" fill="#38bdf8" font-size="11" font-weight="700">Tailwater: ${p.tailwaterDepthFt} ft</text>

        <polygon points="280,120 180,340 280,340" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" stroke-width="1.5"/>
        <line x1="210" y1="265" x2="275" y2="265" stroke="#ef4444" stroke-width="3" marker-end="url(#arrow)"/>
        <text x="140" y="260" fill="#ef4444" font-size="11" font-weight="800">F_h = ${(res.F_h / 1000).toFixed(1)} k/ft</text>

        <polygon points="280,340 500,340 500,370 280,395" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="390" y="380" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="middle">Uplift Force U = ${(res.U_uplift / 1000).toFixed(1)} k/ft</text>

        <rect x="20" y="20" width="240" height="75" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#475569"/>
        <text x="35" y="42" fill="#cbd5e1" font-size="11">Overturn FS: <tspan fill="${res.fsOverturning >= p.reqOverturningSF ? '#10b981' : '#ef4444'}" font-weight="800">${res.fsOverturning.toFixed(2)}</tspan> (Req ${p.reqOverturningSF})</text>
        <text x="35" y="62" fill="#cbd5e1" font-size="11">Sliding FS: <tspan fill="${res.fsSliding >= p.reqSlidingSF ? '#10b981' : '#ef4444'}" font-weight="800">${res.fsSliding.toFixed(2)}</tspan> (Req ${p.reqSlidingSF})</text>
        <text x="35" y="82" fill="#cbd5e1" font-size="11">Weir Q: <tspan fill="#38bdf8" font-weight="800">${res.Q_weir.toFixed(1)} cfs</tspan></text>
      </svg>
    `;
  }

  function renderSvgForActiveModule(res) {
    switch (state.activeModule) {
      case 'walls': return renderWallsSvg(res);
      case 'ponds': return renderPondsSvg(res);
      case 'mounding': return renderMoundingSvg(res);
      case 'roads': return renderRoadsSvg(res);
      case 'plats': return renderPlatsSvg(res);
      case 'liftstation': return renderLiftStationSvg(res);
      case 'drainage': return renderDrainageSvg(res);
      case 'piles': return renderPilesSvg(res);
      case 'slabs': return renderSlabsSvg(res);
      case 'slope': return renderSlopeSvg(res);
      case 'weirs_dams': return renderWeirsDamsSvg(res);
      default: return renderWallsSvg(res);
    }
  }

  // ==========================================
  // 6. DYNAMIC KATEX DERIVATION GENERATORS
  // ==========================================
  function generateKaTeXForActiveModule(res) {
    const mod = MODULES[state.activeModule];
    const soil = USCS_SOILS[state.selectedSoil] || USCS_SOILS.SP;
    const climate = US_CLIMATES[state.selectedClimate] || US_CLIMATES.southeast;

    let math = `
      <div class="toolbox-step-card">
        <h4>Discipline Reference & Specifications</h4>
        <div class="ncees-formula-note" style="margin-bottom:0.75rem; padding:0.5rem 0.8rem; background:var(--bg-elevated); border-left:3px solid var(--primary); border-radius:4px; font-size:0.85rem;">
          <strong>Standard Reference:</strong> ${mod.nceesRef} • Soil: <strong>${soil.name}</strong> • Climate: <strong>${climate.name}</strong>
        </div>
      </div>
    `;

    if (state.activeModule === 'walls') {
      const p = state.walls;
      math += `
        <div class="toolbox-step-card">
          <h4>Step 1: Rankine Lateral Earth Pressure Coefficients</h4>
          <div class="math-block">\\[
            K_a = \\tan^2\\left(45^\\circ - \\frac{\\phi}{2}\\right) = \\tan^2\\left(45^\\circ - \\frac{${soil.phi}^\\circ}{2}\\right) = \\mathbf{${res.Ka.toFixed(4)}}
          \\]</div>
          <div class="math-block">\\[
            P_a = \\frac{1}{2} \\gamma H^2 K_a = \\frac{1}{2} (${soil.gamma}) (${res.H_total.toFixed(1)})^2 (${res.Ka.toFixed(4)}) = \\mathbf{${res.Pa_soil.toFixed(0)} \\text{ lb/ft}}
          \\]</div>
          <div class="math-block">\\[
            P_{\\text{surch}} = q \\cdot H \\cdot K_a = (${p.surchargePsf}) (${res.H_total.toFixed(1)}) (${res.Ka.toFixed(4)}) = \\mathbf{${res.Pa_surch.toFixed(0)} \\text{ lb/ft}}
          \\]</div>
        </div>

        <div class="toolbox-step-card">
          <h4>Step 2: Stability Against Overturning & Sliding</h4>
          <div class="math-block">\\[
            FS_{ot} = \\frac{\\sum M_R}{\\sum M_{ot}} = \\frac{${res.totalResistingMoment.toFixed(0)}}{${res.totalOverturningMoment.toFixed(0)}} = \\mathbf{${res.fsOverturning.toFixed(2)}} \\quad (\\text{Req } \\ge ${p.reqOverturningSF})
          \\]</div>
          <div class="math-block">\\[
            FS_{sl} = \\frac{\\sum V \\cdot \\tan(2/3 \\phi) + c_a B}{P_h} = \\frac{${res.totalVerticalWeight.toFixed(0)} \\times \\tan(${(soil.phi * 2 / 3).toFixed(1)}^\\circ)}{${res.totalHorizontalForce.toFixed(0)}} = \\mathbf{${res.fsSliding.toFixed(2)}} \\quad (\\text{Req } \\ge ${p.reqSlidingSF})
          \\]</div>
        </div>

        <div class="toolbox-step-card">
          <h4>Step 3: Base Eccentricity & Bearing Pressure</h4>
          <div class="math-block">\\[
            x_{\\text{net}} = \\frac{\\sum M_R - \\sum M_{ot}}{\\sum V} = \\frac{${res.totalResistingMoment.toFixed(0)} - ${res.totalOverturningMoment.toFixed(0)}}{${res.totalVerticalWeight.toFixed(0)}} = \\mathbf{${((res.totalResistingMoment - res.totalOverturningMoment) / res.totalVerticalWeight).toFixed(2)} \\text{ ft from toe}}
          \\]</div>
          <div class="math-block">\\[
            e = \\frac{B}{2} - x_{\\text{net}} = \\frac{${res.B.toFixed(2)}}{2} - ${((res.totalResistingMoment - res.totalOverturningMoment) / res.totalVerticalWeight).toFixed(2)} = \\mathbf{${res.eccentricity.toFixed(2)} \\text{ ft}} \\quad \\left(\\text{Max } \\frac{B}{6} = ${res.maxAllowableEccentricity.toFixed(2)} \\text{ ft}\\right)
          \\]</div>
          <div class="math-block">\\[
            q_{\\text{toe}} = \\frac{\\sum V}{B} \\left(1 + \\frac{6e}{B}\\right) = \\mathbf{${res.q_toe.toFixed(0)} \\text{ psf}} \\le q_{\\text{allow}} (${res.q_allowable.toFixed(0)} \\text{ psf})
          \\]</div>
        </div>
      `;
    } else if (state.activeModule === 'liftstation') {
      const p = state.liftstation;
      math += `
        <div class="toolbox-step-card">
          <h4>Step 1: Inflow Peaking & Wet Well Active Storage Sizing</h4>
          <div class="math-block">\\[
            Q_{\\text{peak}} = Q_{\\text{avg}} \\times PF = (${p.avgDailyFlowGpm} \\text{ gpm}) \\times ${p.peakingFactor} = \\mathbf{${res.Q_peak_gpm.toFixed(0)} \\text{ gpm}}
          \\]</div>
          <div class="math-block">\\[
            Q_{\\text{pump}} = Q_{\\text{peak}} \\times SF = ${res.Q_peak_gpm.toFixed(0)} \\times ${p.reqFirmCapSF} = \\mathbf{${res.Q_pump_gpm.toFixed(0)} \\text{ gpm}} \\quad (${res.Q_pump_cfs.toFixed(2)} \\text{ cfs})
          \\]</div>
          <div class="math-block">\\[
            V_{\\text{active}} = \\frac{T_{\\min} \\cdot Q_p}{4} = \\frac{(${p.minCycleTimeMin} \\text{ min}) \\cdot (${res.Q_pump_gpm.toFixed(0)})}{4} = \\mathbf{${res.V_active_gal.toFixed(0)} \\text{ gallons}}
          \\]</div>
          <div class="math-block">\\[
            \\text{Active Depth } h_{\\text{act}} = \\frac{V_{\\text{active}} / 7.48}{\\frac{\\pi}{4} D^2} = \\frac{${(res.V_active_gal / 7.48).toFixed(1)}}{\\frac{\\pi}{4} (${p.wetWellDiameterFt})^2} = \\mathbf{${res.activeDepthFt.toFixed(2)} \\text{ ft}}
          \\]</div>
        </div>

        <div class="toolbox-step-card">
          <h4>Step 2: Force Main Hydraulics & Scouring Velocity</h4>
          <div class="math-block">\\[
            V = \\frac{Q_p}{A_{\\text{pipe}}} = \\frac{${res.Q_pump_cfs.toFixed(2)}}{\\frac{\\pi}{4} (${(p.forceMainDiamIn / 12).toFixed(2)})^2} = \\mathbf{${res.velocityFps.toFixed(2)} \\text{ ft/s}} \\quad (2.0 \\le V \\le 8.0 \\text{ ft/s per 10-States})
          \\]</div>
          <div class="math-block">\\[
            h_f = \\frac{10.44 \\cdot L \\cdot Q^{1.852}}{C^{1.852} \\cdot D^{4.87}} = \\frac{10.44 \\cdot (${p.forceMainLengthFt}) \\cdot (${res.Q_pump_gpm.toFixed(0)})^{1.852}}{(${p.pipeHazenWilliamsC})^{1.852} \\cdot (${p.forceMainDiamIn})^{4.87}} = \\mathbf{${res.hf.toFixed(2)} \\text{ ft}}
          \\]</div>
          <div class="math-block">\\[
            TDH = Z_{\\text{static}} + h_f + h_m = ${p.staticHeadLiftFt} + ${res.hf.toFixed(2)} + 3.5 \\left(\\frac{V^2}{2g}\\right) = \\mathbf{${res.totalDynamicHeadFt.toFixed(1)} \\text{ ft}}
          \\]</div>
          <div class="math-block">\\[
            BHP = \\frac{Q \\cdot TDH \\cdot SG}{3960 \\cdot \\eta} = \\frac{(${res.Q_pump_gpm.toFixed(0)}) (${res.totalDynamicHeadFt.toFixed(1)}) (1.0)}{3960 \\cdot ${p.pumpEfficiencyPct / 100}} = \\mathbf{${res.bhp.toFixed(1)} \\text{ HP}} \\implies \\text{Motor: } ${res.motorNameplateHp} \\text{ HP}
          \\]</div>
        </div>
      `;
    } else if (state.activeModule === 'plats') {
      const p = state.plats;
      math += `
        <div class="toolbox-step-card">
          <h4>Permanent Rules 1 & 2: Plats & Angle Bar Surveyor Derivation</h4>
          <div class="math-block">\\[
            \\text{Turn Angle } \\Delta = ${p.cornerAngleDeg.toFixed(2)}^\\circ, \\quad R = ${p.cornerReturnRadiusFt.toFixed(2)} \\text{ ft}
          \\]</div>
          <div class="math-block">\\[
            T = R \\cdot \\tan\\left(\\frac{\\Delta}{2}\\right) = ${p.cornerReturnRadiusFt} \\times \\tan\\left(\\frac{${p.cornerAngleDeg}^\\circ}{2}\\right) = \\mathbf{${res.T.toFixed(3)} \\text{ ft}}
          \\]</div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0.5rem 0;">
            <strong>Rule 2 (Angle Bar Glyph):</strong> Stated distance along tangent extends to P.I. Boundary length is cut back to P.C.:
          </p>
          <div class="math-block">\\[
            \\text{Length}_{\\text{line to P.C.}} = \\text{Dim}_{\\text{stated to P.I.}} - T = ${p.statedBoundaryDimensionFt.toFixed(2)} - ${res.T.toFixed(3)} = \\mathbf{${res.lineToPcLength.toFixed(3)} \\text{ ft}}
          \\]</div>
          <div class="math-block">\\[
            A_{\\text{fillet}} = R \\cdot T - \\frac{1}{2} R^2 \\Delta_{\\text{rad}} = (${p.cornerReturnRadiusFt} \\times ${res.T.toFixed(3)}) - \\left(0.5 \\times ${p.cornerReturnRadiusFt}^2 \\times \\frac{${p.cornerAngleDeg} \\pi}{180}\\right) = \\mathbf{${res.A_fillet.toFixed(2)} \\text{ sq ft}}
          \\]</div>
          <div class="math-block">\\[
            \\text{Net Parcel Area} = \\text{Gross Area} - A_{\\text{fillet}} = (${p.statedBoundaryDimensionFt} \\times ${p.lotDepthFt}) - ${res.A_fillet.toFixed(2)} = \\mathbf{${res.netParcelAreaSqFt.toFixed(1)} \\text{ sq ft}} \\quad (${res.netParcelAreaAcres.toFixed(3)} \\text{ Acres})
          \\]</div>
        </div>
      `;
    } else if (state.activeModule === 'mounding') {
      const p = state.mounding;
      math += `
        <div class="toolbox-step-card">
          <h4>Step 1: USGS / Hantush Analytical Solution Parameters</h4>
          <div class="math-block">\\[
            K_{\\text{design}} = \\frac{K_{\\text{sat}}}{SF_K} = \\frac{${res.K_raw_ft_day.toFixed(1)} \\text{ ft/day}}{${p.conductSafetyFactor}} = \\mathbf{${res.K_design.toFixed(2)} \\text{ ft/day}}
          \\]</div>
          <div class="math-block">\\[
            w = \\frac{${p.infiltrationRateInHr} \\text{ in/hr}}{12} \\times 24 = \\mathbf{${res.w_ft_day.toFixed(2)} \\text{ ft/day}}, \\quad \\nu = \\frac{K \\cdot D}{S_y} = \\frac{${res.K_design.toFixed(2)} \\times ${p.initialAquiferDepthFt}}{${p.specificYieldSy}}
          \\]</div>
          <div class="math-block">\\[
            h_{mound} = \\sqrt{D^2 + \\frac{w}{2K} \\cdot 4 \\nu t \\cdot F(\\alpha, \\beta)} - D = \\mathbf{${res.h_mound_ft.toFixed(2)} \\text{ ft rise}}
          \\]</div>
          <div class="math-block">\\[
            \\text{SHWT Clearance} = (Z_{\\text{SHWT}} - h_{mound}) \\times 12 = (${climate.shwtDepthFt} - ${res.h_mound_ft.toFixed(2)}) \\times 12 = \\mathbf{${res.clearanceRemainingIn.toFixed(1)} \\text{ inches}} \\quad (\\text{Req } \\ge ${p.shwtSeparationReqIn}")
          \\]</div>
        </div>
      `;
    } else if (state.activeModule === 'slabs') {
      const p = state.slabs;
      const method = res.method || p.method || 'westergaard';

      if (method === 'westergaard') {
        math += `
          <div class="toolbox-step-card">
            <h4>Method 1: Westergaard Subgrade Elasticity & Modulus of Rupture</h4>
            <div class="math-block">\\[
              E_c = 57,000 \\sqrt{f'_c} = 57,000 \\sqrt{${res.fc}} = \\mathbf{${res.Ec.toFixed(0)} \\text{ psi}}, \\quad k = \\mathbf{${res.k} \\text{ pci}} \\; (${soil.name}), \\quad \\nu = 0.18
            \\]</div>
            <div class="math-block">\\[
              f_r = 7.5\\sqrt{f'_c} = 7.5\\sqrt{${res.fc}} = \\mathbf{${res.fr.toFixed(1)} \\text{ psi}} \\quad (\\text{Modulus of Rupture})
            \\]</div>
            <div class="math-block">\\[
              \\ell = \\left[\\frac{E_c h^3}{12(1-\\nu^2)k}\\right]^{0.25} = \\left[\\frac{${res.Ec.toFixed(0)} \\times (${res.h})^3}{12(1-0.18^2)(${res.k})}\\right]^{0.25} = \\mathbf{${res.l_stiff.toFixed(2)} \\text{ in}}
            \\]</div>
          </div>

          <div class="toolbox-step-card">
            <h4>Step 2: Westergaard Stresses & Bradbury Thermal Warping</h4>
            <div class="math-block">\\[
              \\sigma_{\\text{load}} (${p.loadLocation}) = \\mathbf{${res.activeLoadStress.toFixed(1)} \\text{ psi}} \\quad (P = ${res.P_kips} \\text{ kips}, \\; a = ${res.a}")
            \\]</div>
            <div class="math-block">\\[
              \\sigma_{\\text{warp}} = \\frac{C_{\\text{brad}} E_c \\alpha \\Delta T}{2} = \\frac{0.85 \\times ${res.Ec.toFixed(0)} \\times (5.5 \\times 10^{-6}) \\times ${p.tempDiffF}^\\circ\\text{F}}{2} = \\mathbf{${res.sigma_warp.toFixed(1)} \\text{ psi}}
            \\]</div>
            <div class="math-block">\\[
              \\sigma_{\\text{total}} = \\sigma_{\\text{load}} + \\sigma_{\\text{warp}} = ${res.activeLoadStress.toFixed(1)} + ${(p.loadLocation === 'corner' ? 0 : res.sigma_warp).toFixed(1)} = \\mathbf{${res.totalStress.toFixed(1)} \\text{ psi}}
            \\]</div>
            <div class="math-block">\\[
              FS = \\frac{f_r}{\\sigma_{\\text{total}}} = \\frac{${res.fr.toFixed(1)}}{${res.totalStress.toFixed(1)}} = \\mathbf{${res.fs.toFixed(2)}} \\quad (\\text{Req } \\ge ${p.reqOverdriveSF})
            \\]</div>
          </div>
        `;
      } else if (method === 'ddm') {
        math += `
          <div class="toolbox-step-card">
            <h4>Method 2: ACI 318 Direct Design Method (DDM) Total Static Moment</h4>
            <div class="math-block">\\[
              q_u = 1.2 q_D + 1.6 q_L = 1.2(${p.deadLoadPsf}) + 1.6(${p.liveLoadPsf}) = \\mathbf{${res.qu_psf.toFixed(0)} \\text{ psf}} \\quad (${(res.qu_psf/1000).toFixed(3)} \\text{ ksf})
            \\]</div>
            <div class="math-block">\\[
              \\ell_n = \\ell_1 - \\frac{c_1}{12} = ${res.L1} - \\frac{${res.c1}}{12} = \\mathbf{${res.ln.toFixed(2)} \\text{ ft}} \\quad (\\ge 0.65 \\ell_1 = ${(res.L1 * 0.65).toFixed(1)}')
            \\]</div>
            <div class="math-block">\\[
              M_0 = \\frac{q_u \\cdot \\ell_2 \\cdot \\ell_n^2}{8} = \\frac{${(res.qu_psf/1000).toFixed(3)} \\times ${res.L2} \\times (${res.ln.toFixed(2)})^2}{8} = \\mathbf{${res.M0.toFixed(1)} \\text{ ft-kips}}
            \\]</div>
          </div>

          <div class="toolbox-step-card">
            <h4>Step 2: Longitudinal & Transverse Strip Moment Distribution</h4>
            <div class="math-block">\\[
              M_u^- = 0.65 M_0 = \\mathbf{${res.Mu_neg.toFixed(1)} \\text{ ft-kips}}, \\quad M_u^+ = 0.35 M_0 = \\mathbf{${res.Mu_pos.toFixed(1)} \\text{ ft-kips}}
            \\]</div>
            <div class="math-block">\\[
              M_{u,cs}^- = 0.75 M_u^- = \\mathbf{${res.Mu_cs_neg.toFixed(1)} \\text{ k-ft}}, \\quad M_{u,ms}^- = 0.25 M_u^- = \\mathbf{${res.Mu_ms_neg.toFixed(1)} \\text{ k-ft}}
            \\]</div>
            <div class="math-block">\\[
              M_{u,cs}^+ = 0.60 M_u^+ = \\mathbf{${res.Mu_cs_pos.toFixed(1)} \\text{ k-ft}}, \\quad M_{u,ms}^+ = 0.40 M_u^+ = \\mathbf{${res.Mu_ms_pos.toFixed(1)} \\text{ k-ft}}
            \\]</div>
            <div class="math-block">\\[
              m_{u,cs}^- = \\frac{M_{u,cs}^-}{b_{cs}} = \\frac{${res.Mu_cs_neg.toFixed(1)}}{${res.cs_width.toFixed(1)}} = \\mathbf{${res.mu_cs_neg_per_ft.toFixed(1)} \\text{ k-ft/ft}} \\le \\phi M_n (\\mathbf{${res.phiMn_per_ft.toFixed(1)} \\text{ k-ft/ft}})
            \\]</div>
          </div>
        `;
      } else if (method === 'efm') {
        math += `
          <div class="toolbox-step-card">
            <h4>Method 3: ACI 318 Equivalent Frame Member Stiffnesses</h4>
            <div class="math-block">\\[
              I_{sb} = \\frac{(\\ell_2 \\cdot 12) h^3}{12} = \\mathbf{${res.Isb.toFixed(0)} \\text{ in}^4}, \\quad K_{sb} = \\frac{4 E_c I_{sb}}{\\ell_1 \\cdot 12} = \\mathbf{${(res.Ksb/1e6).toFixed(2)} \\times 10^6 \\text{ lb-in/rad}}
            \\]</div>
            <div class="math-block">\\[
              I_c = \\frac{c_2 c_1^3}{12} = \\mathbf{${res.Ic.toFixed(0)} \\text{ in}^4}, \\quad \\sum K_c = \\frac{8 E_c I_c}{H \\cdot 12} = \\mathbf{${(res.sum_Kc/1e6).toFixed(2)} \\times 10^6 \\text{ lb-in/rad}}
            \\]</div>
          </div>

          <div class="toolbox-step-card">
            <h4>Step 2: Transverse Torsional Member & Equivalent Column</h4>
            <div class="math-block">\\[
              C = \\left(1 - 0.63\\frac{x}{y}\\right)\\frac{x^3 y}{3} = \\mathbf{${res.C_tor.toFixed(0)} \\text{ in}^4}, \\quad K_t = \\mathbf{${(res.Kt/1e6).toFixed(2)} \\times 10^6 \\text{ lb-in/rad}}
            \\]</div>
            <div class="math-block">\\[
              \\frac{1}{K_{ec}} = \\frac{1}{\\sum K_c} + \\frac{1}{K_t} \\implies K_{ec} = \\mathbf{${(res.Kec/1e6).toFixed(2)} \\times 10^6 \\text{ lb-in/rad}} \\quad (\\eta = ${(res.eta_reduction * 100).toFixed(1)}\\%)
            \\]</div>
            <div class="math-block">\\[
              DF_{sb} = \\frac{K_{sb}}{K_{sb} + K_{ec}} = \\mathbf{${(res.DF_sb * 100).toFixed(1)}\\%}, \\quad M_{\\text{slab}} = DF_{sb} \\times M_{\\text{unbal}} = \\mathbf{${res.M_trans_slab.toFixed(1)} \\text{ ft-kips}}
            \\]</div>
          </div>
        `;
      } else if (method === 'yield_line') {
        math += `
          <div class="toolbox-step-card">
            <h4>Method 4: Johansen Yield Line Theory Virtual Work Formulation</h4>
            <div class="math-block">\\[
              A_s = \\mathbf{${res.As.toFixed(2)} \\text{ in}^2/\\text{ft}}, \\quad a = \\frac{A_s f_y}{0.85 f'_c (12)} = \\mathbf{${res.a.toFixed(2)} \\text{ in}}, \\quad d = ${res.d.toFixed(2)}"
            \\]</div>
            <div class="math-block">\\[
              m_p = \\phi A_s f_y \\left(d - \\frac{a}{2}\\right) \\frac{1}{12} = \\mathbf{${res.mp_ft_lbs.toFixed(0)} \\text{ ft-lbs/ft}} \\quad (${res.mp_k_ft.toFixed(2)} \\text{ k-ft/ft})
            \\]</div>
          </div>

          <div class="toolbox-step-card">
            <h4>Step 2: Kinematic Plastic Collapse Load & Margin of Safety</h4>
            <div class="math-block">\\[
              q_{\\text{ult}} = \\frac{24 m_p}{L_x^2 \\left[\\sqrt{3 + (L_x/L_y)^2} - (L_x/L_y)\\right]^2} = \\mathbf{${res.q_ult.toFixed(0)} \\text{ psf}}
            \\]</div>
            <div class="math-block">\\[
              q_{\\text{serv}} = q_D + q_L = ${p.deadLoadPsf} + ${p.liveLoadPsf} = \\mathbf{${res.q_serv.toFixed(0)} \\text{ psf}}
            \\]</div>
            <div class="math-block">\\[
              FS_{\\text{collapse}} = \\frac{q_{\\text{ult}}}{q_{\\text{serv}}} = \\frac{${res.q_ult.toFixed(0)}}{${res.q_serv.toFixed(0)}} = \\mathbf{${res.fs_collapse.toFixed(2)}} \\quad (\\text{Req } \\ge ${res.reqSF.toFixed(2)})
            \\]</div>
          </div>
        `;
      } else if (method === 'hillerborg') {
        math += `
          <div class="toolbox-step-card">
            <h4>Method 5: Hillerborg Strip Method Load Dispersal (M_xy = 0)</h4>
            <div class="math-block">\\[
              \\frac{\\partial^2 M_x}{\\partial x^2} + \\frac{\\partial^2 M_y}{\\partial y^2} = -q_u, \\quad \\text{with } q_x + q_y = q_u = \\mathbf{${res.qu_psf.toFixed(0)} \\text{ psf}}
            \\]</div>
            <div class="math-block">\\[
              \\lambda = \\frac{L_y}{L_x} = \\frac{${res.Ly}}{${res.Lx}} = ${res.lambda.toFixed(2)} \\implies q_x = \\frac{\\lambda^4}{1+\\lambda^4} q_u = \\mathbf{${res.qx_psf.toFixed(0)} \\text{ psf}} \\; (${res.pctX.toFixed(0)}\\%)
            \\]</div>
            <div class="math-block">\\[
              q_y = \\frac{1}{1+\\lambda^4} q_u = \\mathbf{${res.qy_psf.toFixed(0)} \\text{ psf}} \\; (${res.pctY.toFixed(0)}\\%)
            \\]</div>
          </div>

          <div class="toolbox-step-card">
            <h4>Step 2: Orthogonal Strip Bending Moments & Lower Bound Design</h4>
            <div class="math-block">\\[
              M_{x,\\max} = \\frac{q_x L_x^2}{8} = \\frac{${res.qx_psf.toFixed(0)} \\times (${res.Lx})^2}{8 \\times 1000} = \\mathbf{${res.Mx_max.toFixed(2)} \\text{ k-ft/ft}} \\implies A_{sx} = \\mathbf{${res.As_req_x.toFixed(2)} \\text{ in}^2/\\text{ft}}
            \\]</div>
            <div class="math-block">\\[
              M_{y,\\max} = \\frac{q_y L_y^2}{8} = \\frac{${res.qy_psf.toFixed(0)} \\times (${res.Ly})^2}{8 \\times 1000} = \\mathbf{${res.My_max.toFixed(2)} \\text{ k-ft/ft}} \\implies A_{sy} = \\mathbf{${res.As_req_y.toFixed(2)} \\text{ in}^2/\\text{ft}}
            \\]</div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin:0.5rem 0;">
              <strong>Lower Bound Theorem:</strong> Because equilibrium is strictly satisfied and torsional resistance is set to zero (M_xy = 0), this design is absolutely safe without torsion steel.
            </p>
          </div>
        `;
      } else if (method === 'punching') {
        math += `
          <div class="toolbox-step-card">
            <h4>Method 6: Critical Perimeter (b_o) & Direct Shear Stress</h4>
            <div class="math-block">\\[
              b_1 = ${res.b1.toFixed(1)}", \\quad b_2 = ${res.b2.toFixed(1)}", \\quad b_o = \\mathbf{${res.bo.toFixed(1)} \\text{ in}}, \\quad d = ${res.d.toFixed(1)}"
            \\]</div>
            <div class="math-block">\\[
              V_u = \\mathbf{${res.Vu_kips.toFixed(1)} \\text{ kips}}, \\quad v_{ug} = \\frac{V_u \\times 1000}{b_o d} = \\frac{${(res.Vu_kips * 1000).toFixed(0)}}{${res.bo.toFixed(1)} \\times ${res.d.toFixed(1)}} = \\mathbf{${res.v_ug.toFixed(1)} \\text{ psi}}
            \\]</div>
          </div>

          <div class="toolbox-step-card">
            <h4>Step 2: Unbalanced Moment Transfer by Eccentric Shear (γ_v)</h4>
            <div class="math-block">\\[
              \\gamma_v = 1 - \\frac{1}{1 + \\frac{2}{3}\\sqrt{b_1/b_2}} = \\mathbf{${res.gamma_v.toFixed(3)}}, \\quad v_{\\text{unbal}} = \\frac{\\gamma_v M_{sc}}{J_c/c} = \\mathbf{${res.v_unbal.toFixed(1)} \\text{ psi}}
            \\]</div>
            <div class="math-block">\\[
              v_{u,\\max} = v_{ug} + v_{\\text{unbal}} = ${res.v_ug.toFixed(1)} + ${res.v_unbal.toFixed(1)} = \\mathbf{${res.vu_max.toFixed(1)} \\text{ psi}}
            \\]</div>
            <div class="math-block">\\[
              \\phi v_c = \\phi \\min\\left(2 + \\frac{4}{\\beta}, \\; \\frac{\\alpha_s d}{b_o} + 2, \\; 4\\right)\\sqrt{f'_c} = \\mathbf{${res.phi_vc.toFixed(1)} \\text{ psi}}
            \\]</div>
            <div class="math-block">\\[
              DCR = \\frac{v_{u,\\max}}{\\phi v_c} = \\frac{${res.vu_max.toFixed(1)}}{${res.phi_vc.toFixed(1)}} = \\mathbf{${res.dcr.toFixed(2)}} \\quad (\\text{Demand / Capacity } \\le 1.0)
            \\]</div>
          </div>
        `;
      }
    } else {
      math += `
        <div class="toolbox-step-card">
          <h4>Design Calculation Results</h4>
          <p style="font-size:0.875rem; color:var(--text-secondary);">
            All calculations computed according to official NCEES Civil PE Reference standards and tested under real-world U.S. soil and weather presets.
          </p>
          <div class="math-block">\\[
            ${mod.equations}
          \\]</div>
        </div>
      `;
    }

    return math;
  }

  // ==========================================
  // 7. UI CONTROLLER, SEARCH & EVENT BINDINGS
  // ==========================================

  function renderControlsPane() {
    const pane = document.getElementById('toolboxControlsPane');
    if (!pane) return;

    const mod = MODULES[state.activeModule];
    const soil = USCS_SOILS[state.selectedSoil] || USCS_SOILS.SP;
    const climate = US_CLIMATES[state.selectedClimate] || US_CLIMATES.southeast;

    let html = `
      <div class="toolbox-preset-section">
        <h3 class="pane-section-title">🇺🇸 Real-World U.S. Soil & Climate Presets</h3>
        
        <div class="control-group">
          <label for="toolboxSoilSelect" class="control-label-row">
            <span>USCS Soil Classification:</span>
          </label>
          <select id="toolboxSoilSelect" class="toolbox-select">
            ${Object.keys(USCS_SOILS).map(k => `
              <option value="${k}" ${k === state.selectedSoil ? 'selected' : ''}>${USCS_SOILS[k].name}</option>
            `).join('')}
          </select>
          <div class="control-feedback">${soil.desc} • γ = ${soil.gamma} pcf, φ = ${soil.phi}°, c = ${soil.c} psf</div>
        </div>

        <div class="control-group">
          <label for="toolboxClimateSelect" class="control-label-row">
            <span>U.S. Weather & Climate Region:</span>
          </label>
          <select id="toolboxClimateSelect" class="toolbox-select">
            ${Object.keys(US_CLIMATES).map(k => `
              <option value="${k}" ${k === state.selectedClimate ? 'selected' : ''}>${US_CLIMATES[k].name}</option>
            `).join('')}
          </select>
          <div class="control-feedback">${climate.desc} • 100-Yr Rain: ${climate.rain100yr}"</div>
        </div>
      </div>
    `;

    if (state.activeModule === 'walls') {
      const p = state.walls;
      html += `
        <h3 class="pane-section-title">🧱 Retaining Wall Geometry & Loads</h3>
        <div class="control-group">
          <div class="control-label-row">
            <label>Wall Stem Height (H):</label>
            <span class="control-val-badge">${p.heightFt} ft</span>
          </div>
          <input type="range" id="wall_heightFt" min="6" max="30" step="1" value="${p.heightFt}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Toe Length:</label>
            <span class="control-val-badge">${p.toeLengthFt} ft</span>
          </div>
          <input type="range" id="wall_toeLengthFt" min="1.0" max="8.0" step="0.5" value="${p.toeLengthFt}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Heel Length:</label>
            <span class="control-val-badge">${p.heelLengthFt} ft</span>
          </div>
          <input type="range" id="wall_heelLengthFt" min="2.0" max="15.0" step="0.5" value="${p.heelLengthFt}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Traffic / Strip Surcharge (q):</label>
            <span class="control-val-badge">${p.surchargePsf} psf</span>
          </div>
          <input type="range" id="wall_surchargePsf" min="0" max="1000" step="50" value="${p.surchargePsf}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Water Table Depth:</label>
            <span class="control-val-badge">${p.waterTableDepthFt} ft</span>
          </div>
          <input type="range" id="wall_waterTableDepthFt" min="2" max="30" step="1" value="${p.waterTableDepthFt}" class="helical-slider">
        </div>

        <h3 class="pane-section-title">⚖️ Adjustable Safety Factors (SF)</h3>
        <div class="control-group">
          <div class="control-label-row">
            <label>Req. Overturning Factor of Safety (SF_ot):</label>
            <span class="control-val-badge green">${p.reqOverturningSF.toFixed(1)}</span>
          </div>
          <input type="range" id="wall_reqOverturningSF" min="1.5" max="3.0" step="0.1" value="${p.reqOverturningSF}" class="helical-slider">
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <label>Req. Sliding Factor of Safety (SF_sl):</label>
            <span class="control-val-badge green">${p.reqSlidingSF.toFixed(1)}</span>
          </div>
          <input type="range" id="wall_reqSlidingSF" min="1.2" max="2.5" step="0.1" value="${p.reqSlidingSF}" class="helical-slider">
        </div>
      `;
    } else if (state.activeModule === 'liftstation') {
      const p = state.liftstation;
      html += `
        <h3 class="pane-section-title">⚙️ Wet Well & Collection System Parameters</h3>
        <div class="control-group">
          <div class="control-label-row">
            <label>Average Daily Inflow (ADF):</label>
            <span class="control-val-badge blue">${p.avgDailyFlowGpm} gpm</span>
          </div>
          <input type="range" id="ls_avgDailyFlowGpm" min="20" max="1000" step="10" value="${p.avgDailyFlowGpm}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Sewer Peaking Factor (Harmon/Babbitt):</label>
            <span class="control-val-badge">${p.peakingFactor.toFixed(1)}</span>
          </div>
          <input type="range" id="ls_peakingFactor" min="1.5" max="5.0" step="0.1" value="${p.peakingFactor}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Wet Well Inside Diameter (D):</label>
            <span class="control-val-badge">${p.wetWellDiameterFt} ft</span>
          </div>
          <input type="range" id="ls_wetWellDiameterFt" min="4" max="20" step="0.5" value="${p.wetWellDiameterFt}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Min Pump Cycle Time (T_min):</label>
            <span class="control-val-badge">${p.minCycleTimeMin} min (max ${Math.round(60 / p.minCycleTimeMin)} starts/hr)</span>
          </div>
          <input type="range" id="ls_minCycleTimeMin" min="6" max="20" step="1" value="${p.minCycleTimeMin}" class="helical-slider">
        </div>

        <h3 class="pane-section-title">💧 Force Main Hydraulics & Safety Factors</h3>
        <div class="control-group">
          <div class="control-label-row">
            <label>Force Main Diameter:</label>
            <span class="control-val-badge">${p.forceMainDiamIn}"</span>
          </div>
          <input type="range" id="ls_forceMainDiamIn" min="4" max="24" step="1" value="${p.forceMainDiamIn}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Force Main Length (L):</label>
            <span class="control-val-badge">${p.forceMainLengthFt} ft</span>
          </div>
          <input type="range" id="ls_forceMainLengthFt" min="100" max="10000" step="100" value="${p.forceMainLengthFt}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Static Lift Elevation Difference:</label>
            <span class="control-val-badge">${p.staticHeadLiftFt} ft</span>
          </div>
          <input type="range" id="ls_staticHeadLiftFt" min="5" max="150" step="1" value="${p.staticHeadLiftFt}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Pump Capacity Redundancy Factor:</label>
            <span class="control-val-badge green">${p.reqFirmCapSF.toFixed(2)}×</span>
          </div>
          <input type="range" id="ls_reqFirmCapSF" min="1.0" max="1.5" step="0.05" value="${p.reqFirmCapSF}" class="helical-slider">
        </div>
      `;
    } else if (state.activeModule === 'plats') {
      const p = state.plats;
      html += `
        <h3 class="pane-section-title">📐 Plat Subdivision Geometry & Permanent Rules</h3>
        <div class="control-group">
          <div class="control-label-row">
            <label>Corner Return Radius (R):</label>
            <span class="control-val-badge">${p.cornerReturnRadiusFt} ft</span>
          </div>
          <input type="range" id="plat_cornerReturnRadiusFt" min="15" max="60" step="5" value="${p.cornerReturnRadiusFt}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Intersection Deflection Angle (Δ):</label>
            <span class="control-val-badge">${p.cornerAngleDeg}°</span>
          </div>
          <input type="range" id="plat_cornerAngleDeg" min="45" max="135" step="1" value="${p.cornerAngleDeg}" class="helical-slider">
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Stated Boundary Dimension (to P.I.):</label>
            <span class="control-val-badge">${p.statedBoundaryDimensionFt} ft</span>
          </div>
          <input type="range" id="plat_statedBoundaryDimensionFt" min="80" max="400" step="5" value="${p.statedBoundaryDimensionFt}" class="helical-slider">
        </div>

        <div class="control-group">
          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-primary); cursor: pointer;">
            <input type="checkbox" id="plat_hasAngleBarGlyph" ${p.hasAngleBarGlyph ? 'checked' : ''}>
            <span>Rule 2: P.I. Angle Bar Glyph Present (┌, ┘) at Corner</span>
          </label>
          <div class="control-feedback">When checked, cuts back dimension by surveyor tangent T to reach P.C. / P.T.</div>
        </div>

        <div class="control-group">
          <div class="control-label-row">
            <label>Traverse Closure Precision (1 : X):</label>
            <span class="control-val-badge green">1 : ${p.closurePrecisionReq}</span>
          </div>
          <input type="range" id="plat_closurePrecisionReq" min="5000" max="30000" step="2500" value="${p.closurePrecisionReq}" class="helical-slider">
        </div>
      `;
    } else if (state.activeModule === 'ponds') {
      const p = state.ponds;
      html += `
        <h3 class="pane-section-title">🏞️ Stormwater Basin & Orifice Drawdown</h3>
        <div class="control-group">
          <div class="control-label-row">
            <label>Contributing Drainage Area:</label>
            <span class="control-val-badge">${p.drainageAreaAcres} Acres</span>
          </div>
          <input type="range" id="pond_drainageAreaAcres" min="1" max="100" step="1" value="${p.drainageAreaAcres}" class="helical-slider">
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <label>Runoff Coefficient (C):</label>
            <span class="control-val-badge">${p.runoffCoeffC.toFixed(2)}</span>
          </div>
          <input type="range" id="pond_runoffCoeffC" min="0.15" max="0.95" step="0.05" value="${p.runoffCoeffC}" class="helical-slider">
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <label>Pond Design Stage Depth:</label>
            <span class="control-val-badge">${p.designDepthFt} ft</span>
          </div>
          <input type="range" id="pond_designDepthFt" min="2" max="12" step="0.5" value="${p.designDepthFt}" class="helical-slider">
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <label>Drawdown Orifice Diameter:</label>
            <span class="control-val-badge">${p.orificeDiamIn}"</span>
          </div>
          <input type="range" id="pond_orificeDiamIn" min="2" max="12" step="0.5" value="${p.orificeDiamIn}" class="helical-slider">
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <label>Freeboard Requirement:</label>
            <span class="control-val-badge green">${p.freeboardReqFt.toFixed(1)} ft</span>
          </div>
          <input type="range" id="pond_freeboardReqFt" min="0.5" max="3.0" step="0.5" value="${p.freeboardReqFt}" class="helical-slider">
        </div>
      `;
    } else if (state.activeModule === 'mounding') {
      const p = state.mounding;
      html += `
        <h3 class="pane-section-title">🌊 Groundwater Mounding (Hantush)</h3>
        <div class="control-group">
          <div class="control-label-row">
            <label>Basin Length × Width:</label>
            <span class="control-val-badge">${p.basinLengthFt}' × ${p.basinWidthFt}'</span>
          </div>
          <input type="range" id="mound_basinLengthFt" min="30" max="500" step="10" value="${p.basinLengthFt}" class="helical-slider">
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <label>Infiltration Rate (w):</label>
            <span class="control-val-badge">${p.infiltrationRateInHr} in/hr</span>
          </div>
          <input type="range" id="mound_infiltrationRateInHr" min="0.2" max="6.0" step="0.1" value="${p.infiltrationRateInHr}" class="helical-slider">
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <label>Storm Recharge Duration:</label>
            <span class="control-val-badge">${p.durationDays} Days</span>
          </div>
          <input type="range" id="mound_durationDays" min="0.5" max="14" step="0.5" value="${p.durationDays}" class="helical-slider">
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <label>Hydraulic Conductivity Safety Factor:</label>
            <span class="control-val-badge green">${p.conductSafetyFactor.toFixed(1)}×</span>
          </div>
          <input type="range" id="mound_conductSafetyFactor" min="1.2" max="3.5" step="0.1" value="${p.conductSafetyFactor}" class="helical-slider">
          <div class="control-feedback">Accounts for bio-clogging and air entrapment in vadose zone.</div>
        </div>
      `;
    } else if (state.activeModule === 'slope') {
      const p = state.slope;
      html += `
        <h3 class="pane-section-title">⛰️ Embankment & Slope Stability</h3>
        <div class="control-group">
          <div class="control-label-row">
            <label>Embankment Height (H):</label>
            <span class="control-val-badge">${p.slopeHeightFt} ft</span>
          </div>
          <input type="range" id="slope_slopeHeightFt" min="10" max="60" step="2" value="${p.slopeHeightFt}" class="helical-slider">
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <label>Slope Ratio (H:1V):</label>
            <span class="control-val-badge">${p.slopeRatioH}:1</span>
          </div>
          <input type="range" id="slope_slopeRatioH" min="1.5" max="4.5" step="0.25" value="${p.slopeRatioH}" class="helical-slider">
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <label>Seepage Saturation Level:</label>
            <span class="control-val-badge blue">${p.phreaticLevelPct}%</span>
          </div>
          <input type="range" id="slope_phreaticLevelPct" min="0" max="100" step="5" value="${p.phreaticLevelPct}" class="helical-slider">
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <label>Target Factor of Safety:</label>
            <span class="control-val-badge green">${p.targetSF.toFixed(2)}</span>
          </div>
          <input type="range" id="slope_targetSF" min="1.2" max="2.0" step="0.05" value="${p.targetSF}" class="helical-slider">
        </div>
      `;
    } else if (state.activeModule === 'slabs') {
      const p = state.slabs;
      const method = p.method || 'westergaard';

      html += `
        <h3 class="pane-section-title">🏛️ Slab Analysis Method Selector</h3>
        <div class="slab-subnav-container">
          <button class="slab-subnav-pill ${method === 'westergaard' ? 'active' : ''}" data-slab-method="westergaard" title="Westergaard SOG & Pavements">
            <span class="pill-icon">🛣️</span>
            <span class="pill-text">Westergaard SOG</span>
          </button>
          <button class="slab-subnav-pill ${method === 'ddm' ? 'active' : ''}" data-slab-method="ddm" title="ACI 318 Direct Design Method">
            <span class="pill-icon">📐</span>
            <span class="pill-text">ACI 318 DDM</span>
          </button>
          <button class="slab-subnav-pill ${method === 'efm' ? 'active' : ''}" data-slab-method="efm" title="ACI 318 Equivalent Frame Method">
            <span class="pill-icon">🏛️</span>
            <span class="pill-text">ACI 318 EFM</span>
          </button>
          <button class="slab-subnav-pill ${method === 'yield_line' ? 'active' : ''}" data-slab-method="yield_line" title="Johansen Yield Line Theory (Plastic Collapse)">
            <span class="pill-icon">⚡</span>
            <span class="pill-text">Yield Line Theory</span>
          </button>
          <button class="slab-subnav-pill ${method === 'hillerborg' ? 'active' : ''}" data-slab-method="hillerborg" title="Hillerborg Strip Method (Lower Bound)">
            <span class="pill-icon">📏</span>
            <span class="pill-text">Hillerborg Strip</span>
          </button>
          <button class="slab-subnav-pill ${method === 'punching' ? 'active' : ''}" data-slab-method="punching" title="Two-Way Punching Shear with Moment Transfer">
            <span class="pill-icon">🥊</span>
            <span class="pill-text">Punching Shear</span>
          </button>
        </div>
      `;

      if (method === 'westergaard') {
        html += `
          <h3 class="pane-section-title">🛣️ Westergaard SOG & Pavement Controls</h3>
          <div class="control-group">
            <div class="control-label-row">
              <label>Wheel Load Location:</label>
            </div>
            <select id="slab_loadLocation" class="toolbox-select">
              <option value="interior" ${p.loadLocation === 'interior' ? 'selected' : ''}>Interior Loading (σ_i)</option>
              <option value="edge" ${p.loadLocation === 'edge' ? 'selected' : ''}>Edge Loading (σ_e - Tangent)</option>
              <option value="corner" ${p.loadLocation === 'corner' ? 'selected' : ''}>Corner Loading (σ_c - Cantilever)</option>
            </select>
            <div class="control-feedback">Edge loading produces ~50% higher stress than interior loading.</div>
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Wheel Load (P):</label>
              <span class="control-val-badge blue">${p.wheelLoadKips} kips</span>
            </div>
            <input type="range" id="slab_wheelLoadKips" min="5" max="60" step="1" value="${p.wheelLoadKips}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Tire Contact Radius (a):</label>
              <span class="control-val-badge">${p.wheelContactRadiusIn}"</span>
            </div>
            <input type="range" id="slab_wheelContactRadiusIn" min="3.0" max="12.0" step="0.5" value="${p.wheelContactRadiusIn}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Slab Thickness (h):</label>
              <span class="control-val-badge">${p.slabThicknessIn}"</span>
            </div>
            <input type="range" id="slab_slabThicknessIn" min="4.0" max="16.0" step="0.5" value="${p.slabThicknessIn}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Thermal Gradient (ΔT):</label>
              <span class="control-val-badge purple">${p.tempDiffF}°F</span>
            </div>
            <input type="range" id="slab_tempDiffF" min="0" max="40" step="2" value="${p.tempDiffF}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Concrete Compressive Strength (f'c):</label>
            </div>
            <select id="slab_fcPsi" class="toolbox-select">
              <option value="3000" ${p.fcPsi === 3000 ? 'selected' : ''}>3,000 psi (fr = 411 psi)</option>
              <option value="4000" ${p.fcPsi === 4000 ? 'selected' : ''}>4,000 psi (fr = 474 psi)</option>
              <option value="5000" ${p.fcPsi === 5000 ? 'selected' : ''}>5,000 psi (fr = 530 psi)</option>
              <option value="6000" ${p.fcPsi === 6000 ? 'selected' : ''}>6,000 psi (fr = 581 psi)</option>
            </select>
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Required Safety Factor (SF):</label>
              <span class="control-val-badge green">${p.reqOverdriveSF.toFixed(2)}</span>
            </div>
            <input type="range" id="slab_reqOverdriveSF" min="1.0" max="2.0" step="0.05" value="${p.reqOverdriveSF}" class="helical-slider">
          </div>
        `;
      } else if (method === 'ddm') {
        html += `
          <h3 class="pane-section-title">📐 ACI 318 Direct Design Method (DDM) Controls</h3>
          <div class="control-group">
            <div class="control-label-row">
              <label>Span in Direction 1 (L1):</label>
              <span class="control-val-badge blue">${p.spanXFt} ft</span>
            </div>
            <input type="range" id="slab_spanXFt" min="14" max="36" step="1" value="${p.spanXFt}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Transverse Panel Width (L2):</label>
              <span class="control-val-badge blue">${p.spanYFt} ft</span>
            </div>
            <input type="range" id="slab_spanYFt" min="14" max="36" step="1" value="${p.spanYFt}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Column Width (c1):</label>
              <span class="control-val-badge">${p.colWidthIn}"</span>
            </div>
            <input type="range" id="slab_colWidthIn" min="12" max="30" step="2" value="${p.colWidthIn}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Slab Thickness (h):</label>
              <span class="control-val-badge">${p.slabThicknessIn}"</span>
            </div>
            <input type="range" id="slab_slabThicknessIn" min="6.0" max="14.0" step="0.5" value="${p.slabThicknessIn}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Superimposed Dead Load (q_D):</label>
              <span class="control-val-badge">${p.deadLoadPsf} psf</span>
            </div>
            <input type="range" id="slab_deadLoadPsf" min="50" max="180" step="5" value="${p.deadLoadPsf}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Service Live Load (q_L):</label>
              <span class="control-val-badge">${p.liveLoadPsf} psf</span>
            </div>
            <input type="range" id="slab_liveLoadPsf" min="20" max="150" step="5" value="${p.liveLoadPsf}" class="helical-slider">
          </div>
        `;
      } else if (method === 'efm') {
        html += `
          <h3 class="pane-section-title">🏛️ ACI 318 Equivalent Frame Method (EFM) Controls</h3>
          <div class="control-group">
            <div class="control-label-row">
              <label>Longitudinal Span (L1):</label>
              <span class="control-val-badge blue">${p.spanXFt} ft</span>
            </div>
            <input type="range" id="slab_spanXFt" min="14" max="36" step="1" value="${p.spanXFt}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Story Height (H):</label>
              <span class="control-val-badge">${p.colHeightFt} ft</span>
            </div>
            <input type="range" id="slab_colHeightFt" min="9" max="18" step="1" value="${p.colHeightFt}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Column Size (c1):</label>
              <span class="control-val-badge">${p.colWidthIn}"</span>
            </div>
            <input type="range" id="slab_colWidthIn" min="12" max="30" step="2" value="${p.colWidthIn}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Unbalanced Moment (M_unbal):</label>
              <span class="control-val-badge purple">${p.unbalancedMomentFtKips} k-ft</span>
            </div>
            <input type="range" id="slab_unbalancedMomentFtKips" min="10" max="80" step="5" value="${p.unbalancedMomentFtKips}" class="helical-slider">
          </div>
        `;
      } else if (method === 'yield_line') {
        html += `
          <h3 class="pane-section-title">⚡ Johansen Yield Line Theory Controls</h3>
          <div class="control-group">
            <div class="control-label-row">
              <label>Short Span (Lx):</label>
              <span class="control-val-badge blue">${p.spanXFt} ft</span>
            </div>
            <input type="range" id="slab_spanXFt" min="10" max="30" step="1" value="${p.spanXFt}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Long Span (Ly):</label>
              <span class="control-val-badge blue">${p.spanYFt} ft</span>
            </div>
            <input type="range" id="slab_spanYFt" min="12" max="40" step="1" value="${p.spanYFt}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Slab Thickness (h):</label>
              <span class="control-val-badge">${p.slabThicknessIn}"</span>
            </div>
            <input type="range" id="slab_slabThicknessIn" min="4.5" max="12.0" step="0.5" value="${p.slabThicknessIn}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Bottom Flexural Rebar:</label>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <select id="slab_barSizeNum" class="toolbox-select" style="flex:1;">
                <option value="4" ${p.barSizeNum === 4 ? 'selected' : ''}>#4 Rebar</option>
                <option value="5" ${p.barSizeNum === 5 ? 'selected' : ''}>#5 Rebar</option>
                <option value="6" ${p.barSizeNum === 6 ? 'selected' : ''}>#6 Rebar</option>
                <option value="7" ${p.barSizeNum === 7 ? 'selected' : ''}>#7 Rebar</option>
              </select>
              <select id="slab_barSpacingIn" class="toolbox-select" style="flex:1;">
                <option value="8" ${p.barSpacingIn === 8 ? 'selected' : ''}>@ 8" o.c.</option>
                <option value="10" ${p.barSpacingIn === 10 ? 'selected' : ''}>@ 10" o.c.</option>
                <option value="12" ${p.barSpacingIn === 12 ? 'selected' : ''}>@ 12" o.c.</option>
                <option value="14" ${p.barSpacingIn === 14 ? 'selected' : ''}>@ 14" o.c.</option>
              </select>
            </div>
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Dead Load (psf):</label>
              <span class="control-val-badge">${p.deadLoadPsf} psf</span>
            </div>
            <input type="range" id="slab_deadLoadPsf" min="50" max="200" step="10" value="${p.deadLoadPsf}" class="helical-slider">
          </div>
        `;
      } else if (method === 'hillerborg') {
        html += `
          <h3 class="pane-section-title">📏 Hillerborg Strip Method Controls</h3>
          <div class="control-group">
            <div class="control-label-row">
              <label>Short Direction Span (Lx):</label>
              <span class="control-val-badge blue">${p.spanXFt} ft</span>
            </div>
            <input type="range" id="slab_spanXFt" min="10" max="30" step="1" value="${p.spanXFt}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Long Direction Span (Ly):</label>
              <span class="control-val-badge blue">${p.spanYFt} ft</span>
            </div>
            <input type="range" id="slab_spanYFt" min="12" max="36" step="1" value="${p.spanYFt}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Slab Thickness (h):</label>
              <span class="control-val-badge">${p.slabThicknessIn}"</span>
            </div>
            <input type="range" id="slab_slabThicknessIn" min="5.0" max="14.0" step="0.5" value="${p.slabThicknessIn}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Dead Load (psf):</label>
              <span class="control-val-badge">${p.deadLoadPsf} psf</span>
            </div>
            <input type="range" id="slab_deadLoadPsf" min="50" max="200" step="10" value="${p.deadLoadPsf}" class="helical-slider">
          </div>
        `;
      } else if (method === 'punching') {
        html += `
          <h3 class="pane-section-title">🥊 Two-Way Punching Shear (b₀) Controls</h3>
          <div class="control-group">
            <div class="control-label-row">
              <label>Column Position:</label>
            </div>
            <select id="slab_colLocation" class="toolbox-select">
              <option value="interior" ${p.colLocation === 'interior' ? 'selected' : ''}>Interior Column (α_s = 40, 4-Sided b₀)</option>
              <option value="edge" ${p.colLocation === 'edge' ? 'selected' : ''}>Edge Column (α_s = 30, 3-Sided b₀)</option>
              <option value="corner" ${p.colLocation === 'corner' ? 'selected' : ''}>Corner Column (α_s = 20, 2-Sided b₀)</option>
            </select>
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Column Width (c1):</label>
              <span class="control-val-badge">${p.colWidthIn}"</span>
            </div>
            <input type="range" id="slab_colWidthIn" min="12" max="36" step="2" value="${p.colWidthIn}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Column Depth (c2):</label>
              <span class="control-val-badge">${p.colDepthIn}"</span>
            </div>
            <input type="range" id="slab_colDepthIn" min="12" max="36" step="2" value="${p.colDepthIn}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Slab Thickness (h):</label>
              <span class="control-val-badge">${p.slabThicknessIn}" (d = ${(p.slabThicknessIn - 1.5).toFixed(1)}")</span>
            </div>
            <input type="range" id="slab_slabThicknessIn" min="6.0" max="16.0" step="0.5" value="${p.slabThicknessIn}" class="helical-slider">
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label>Unbalanced Moment (M_sc):</label>
              <span class="control-val-badge purple">${p.unbalancedMomentFtKips} k-ft</span>
            </div>
            <input type="range" id="slab_unbalancedMomentFtKips" min="0" max="100" step="5" value="${p.unbalancedMomentFtKips}" class="helical-slider">
          </div>
        `;
      }
    } else {
      html += `
        <h3 class="pane-section-title">📐 ${mod.title} Controls</h3>
        <div class="control-feedback" style="padding:1rem; background:var(--bg-elevated); border-radius:6px;">
          Adjust USCS soil type and U.S. weather presets above to dynamically simulate ${mod.title} under varying regional conditions.
        </div>
      `;
    }

    pane.innerHTML = html;
    bindControlEvents();
  }

  function bindControlEvents() {
    const soilSelect = document.getElementById('toolboxSoilSelect');
    if (soilSelect) {
      soilSelect.addEventListener('change', (e) => {
        state.selectedSoil = e.target.value;
        updateUI();
      });
    }

    const climateSelect = document.getElementById('toolboxClimateSelect');
    if (climateSelect) {
      climateSelect.addEventListener('change', (e) => {
        state.selectedClimate = e.target.value;
        updateUI();
      });
    }

    function bindNum(id, obj, prop) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          obj[prop] = parseFloat(e.target.value);
          updateUI();
        });
      }
    }

    function bindCheck(id, obj, prop) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', (e) => {
          obj[prop] = e.target.checked;
          updateUI();
        });
      }
    }

    // Walls
    bindNum('wall_heightFt', state.walls, 'heightFt');
    bindNum('wall_toeLengthFt', state.walls, 'toeLengthFt');
    bindNum('wall_heelLengthFt', state.walls, 'heelLengthFt');
    bindNum('wall_surchargePsf', state.walls, 'surchargePsf');
    bindNum('wall_waterTableDepthFt', state.walls, 'waterTableDepthFt');
    bindNum('wall_reqOverturningSF', state.walls, 'reqOverturningSF');
    bindNum('wall_reqSlidingSF', state.walls, 'reqSlidingSF');

    // Lift station
    bindNum('ls_avgDailyFlowGpm', state.liftstation, 'avgDailyFlowGpm');
    bindNum('ls_peakingFactor', state.liftstation, 'peakingFactor');
    bindNum('ls_wetWellDiameterFt', state.liftstation, 'wetWellDiameterFt');
    bindNum('ls_minCycleTimeMin', state.liftstation, 'minCycleTimeMin');
    bindNum('ls_forceMainDiamIn', state.liftstation, 'forceMainDiamIn');
    bindNum('ls_forceMainLengthFt', state.liftstation, 'forceMainLengthFt');
    bindNum('ls_staticHeadLiftFt', state.liftstation, 'staticHeadLiftFt');
    bindNum('ls_reqFirmCapSF', state.liftstation, 'reqFirmCapSF');

    // Plats
    bindNum('plat_cornerReturnRadiusFt', state.plats, 'cornerReturnRadiusFt');
    bindNum('plat_cornerAngleDeg', state.plats, 'cornerAngleDeg');
    bindNum('plat_statedBoundaryDimensionFt', state.plats, 'statedBoundaryDimensionFt');
    bindCheck('plat_hasAngleBarGlyph', state.plats, 'hasAngleBarGlyph');
    bindNum('plat_closurePrecisionReq', state.plats, 'closurePrecisionReq');

    // Ponds
    bindNum('pond_drainageAreaAcres', state.ponds, 'drainageAreaAcres');
    bindNum('pond_runoffCoeffC', state.ponds, 'runoffCoeffC');
    bindNum('pond_designDepthFt', state.ponds, 'designDepthFt');
    bindNum('pond_orificeDiamIn', state.ponds, 'orificeDiamIn');
    bindNum('pond_freeboardReqFt', state.ponds, 'freeboardReqFt');

    // Mounding
    bindNum('mound_basinLengthFt', state.mounding, 'basinLengthFt');
    bindNum('mound_infiltrationRateInHr', state.mounding, 'infiltrationRateInHr');
    bindNum('mound_durationDays', state.mounding, 'durationDays');
    bindNum('mound_conductSafetyFactor', state.mounding, 'conductSafetyFactor');

    // Slope
    bindNum('slope_slopeHeightFt', state.slope, 'slopeHeightFt');
    bindNum('slope_slopeRatioH', state.slope, 'slopeRatioH');
    bindNum('slope_phreaticLevelPct', state.slope, 'phreaticLevelPct');
    bindNum('slope_targetSF', state.slope, 'targetSF');

    // Slabs Subnav Buttons
    document.querySelectorAll('.slab-subnav-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        const method = targetBtn.dataset.slabMethod;
        if (method) {
          state.slabs.method = method;
          renderControlsPane();
          updateUI();
        }
      });
    });

    // Slabs Selects & Sliders
    const slabLoadLoc = document.getElementById('slab_loadLocation');
    if (slabLoadLoc) {
      slabLoadLoc.addEventListener('change', (e) => {
        state.slabs.loadLocation = e.target.value;
        updateUI();
      });
    }

    const slabColLoc = document.getElementById('slab_colLocation');
    if (slabColLoc) {
      slabColLoc.addEventListener('change', (e) => {
        state.slabs.colLocation = e.target.value;
        updateUI();
      });
    }

    const slabFc = document.getElementById('slab_fcPsi');
    if (slabFc) {
      slabFc.addEventListener('change', (e) => {
        state.slabs.fcPsi = parseFloat(e.target.value);
        updateUI();
      });
    }

    const slabBarSize = document.getElementById('slab_barSizeNum');
    if (slabBarSize) {
      slabBarSize.addEventListener('change', (e) => {
        state.slabs.barSizeNum = parseInt(e.target.value, 10);
        updateUI();
      });
    }

    const slabBarSpacing = document.getElementById('slab_barSpacingIn');
    if (slabBarSpacing) {
      slabBarSpacing.addEventListener('change', (e) => {
        state.slabs.barSpacingIn = parseFloat(e.target.value);
        updateUI();
      });
    }

    bindNum('slab_wheelLoadKips', state.slabs, 'wheelLoadKips');
    bindNum('slab_wheelContactRadiusIn', state.slabs, 'wheelContactRadiusIn');
    bindNum('slab_slabThicknessIn', state.slabs, 'slabThicknessIn');
    bindNum('slab_tempDiffF', state.slabs, 'tempDiffF');
    bindNum('slab_reqOverdriveSF', state.slabs, 'reqOverdriveSF');
    bindNum('slab_spanXFt', state.slabs, 'spanXFt');
    bindNum('slab_spanYFt', state.slabs, 'spanYFt');
    bindNum('slab_colWidthIn', state.slabs, 'colWidthIn');
    bindNum('slab_colDepthIn', state.slabs, 'colDepthIn');
    bindNum('slab_colHeightFt', state.slabs, 'colHeightFt');
    bindNum('slab_deadLoadPsf', state.slabs, 'deadLoadPsf');
    bindNum('slab_liveLoadPsf', state.slabs, 'liveLoadPsf');
    bindNum('slab_unbalancedMomentFtKips', state.slabs, 'unbalancedMomentFtKips');
  }

  function updateKPIs(res) {
    const kpi1 = document.getElementById('tbKpi1');
    const kpi2 = document.getElementById('tbKpi2');
    const kpi3 = document.getElementById('tbKpi3');
    const kpiBadge = document.getElementById('tbKpiBadge');

    if (!kpi1 || !kpi2 || !kpi3 || !kpiBadge) return;

    if (state.activeModule === 'walls') {
      kpi1.innerHTML = `<span class="kpi-label">Overturning FS:</span><strong>${res.fsOverturning.toFixed(2)}</strong>`;
      kpi2.innerHTML = `<span class="kpi-label">Sliding FS:</span><strong>${res.fsSliding.toFixed(2)}</strong>`;
      kpi3.innerHTML = `<span class="kpi-label">Eccentricity e:</span><strong>${res.eccentricity.toFixed(2)} ft</strong>`;
    } else if (state.activeModule === 'liftstation') {
      kpi1.innerHTML = `<span class="kpi-label">Pump Flow:</span><strong>${res.Q_pump_gpm.toFixed(0)} gpm</strong>`;
      kpi2.innerHTML = `<span class="kpi-label">Velocity:</span><strong>${res.velocityFps.toFixed(2)} fps</strong>`;
      kpi3.innerHTML = `<span class="kpi-label">Motor BHP:</span><strong>${res.bhp.toFixed(1)} HP</strong>`;
    } else if (state.activeModule === 'plats') {
      kpi1.innerHTML = `<span class="kpi-label">Tangent T:</span><strong>${res.T.toFixed(2)} ft</strong>`;
      kpi2.innerHTML = `<span class="kpi-label">Line to P.C.:</span><strong>${res.lineToPcLength.toFixed(2)} ft</strong>`;
      kpi3.innerHTML = `<span class="kpi-label">Net Area:</span><strong>${res.netParcelAreaAcres.toFixed(3)} Ac</strong>`;
    } else if (state.activeModule === 'mounding') {
      kpi1.innerHTML = `<span class="kpi-label">Peak Mound Δh:</span><strong>${res.h_mound_ft.toFixed(2)} ft</strong>`;
      kpi2.innerHTML = `<span class="kpi-label">Clearance:</span><strong>${res.clearanceRemainingIn.toFixed(1)}"</strong>`;
      kpi3.innerHTML = `<span class="kpi-label">Design K:</span><strong>${res.K_design.toFixed(1)} ft/d</strong>`;
    } else if (state.activeModule === 'ponds') {
      kpi1.innerHTML = `<span class="kpi-label">Drawdown:</span><strong>${res.time_drawdown_hrs.toFixed(1)} hrs</strong>`;
      kpi2.innerHTML = `<span class="kpi-label">Actual Vol:</span><strong>${res.V_actual_acft.toFixed(2)} Ac-ft</strong>`;
      kpi3.innerHTML = `<span class="kpi-label">Freeboard:</span><strong>${res.freeboardProvided.toFixed(1)} ft</strong>`;
    } else if (state.activeModule === 'slabs') {
      const method = res.method || state.slabs.method || 'westergaard';
      if (method === 'westergaard') {
        kpi1.innerHTML = `<span class="kpi-label">Total Flexure σ:</span><strong>${res.totalStress.toFixed(0)} psi</strong> (fr ${res.fr.toFixed(0)})`;
        kpi2.innerHTML = `<span class="kpi-label">Stiffness ℓ:</span><strong>${res.l_stiff.toFixed(1)}"</strong>`;
        kpi3.innerHTML = `<span class="kpi-label">Westergaard FS:</span><strong>${res.fs.toFixed(2)}</strong> (Req ${state.slabs.reqOverdriveSF})`;
      } else if (method === 'ddm') {
        kpi1.innerHTML = `<span class="kpi-label">Total Static M₀:</span><strong>${res.M0.toFixed(1)} k-ft</strong>`;
        kpi2.innerHTML = `<span class="kpi-label">Neg M_u (CS/MS):</span><strong>${res.Mu_cs_neg.toFixed(1)} / ${res.Mu_ms_neg.toFixed(1)} k-ft</strong>`;
        kpi3.innerHTML = `<span class="kpi-label">Pos M_u (CS/MS):</span><strong>${res.Mu_cs_pos.toFixed(1)} / ${res.Mu_ms_pos.toFixed(1)} k-ft</strong>`;
      } else if (method === 'efm') {
        kpi1.innerHTML = `<span class="kpi-label">Slab Stiff K_sb:</span><strong>${(res.Ksb / 1e6).toFixed(1)}M lb-in</strong>`;
        kpi2.innerHTML = `<span class="kpi-label">Eq Col K_ec:</span><strong>${(res.Kec / 1e6).toFixed(1)}M lb-in</strong>`;
        kpi3.innerHTML = `<span class="kpi-label">Dist Factor DF:</span><strong>${(res.DF_sb * 100).toFixed(1)}%</strong>`;
      } else if (method === 'yield_line') {
        kpi1.innerHTML = `<span class="kpi-label">Plastic m_p:</span><strong>${res.mp_k_ft.toFixed(2)} k-ft/ft</strong>`;
        kpi2.innerHTML = `<span class="kpi-label">Collapse q_ult:</span><strong>${res.q_ult.toFixed(0)} psf</strong> (Serv ${res.q_serv.toFixed(0)})`;
        kpi3.innerHTML = `<span class="kpi-label">Collapse FS:</span><strong>${res.fs_collapse.toFixed(2)}</strong> (Req ${res.reqSF.toFixed(2)})`;
      } else if (method === 'hillerborg') {
        kpi1.innerHTML = `<span class="kpi-label">Load Split (X/Y):</span><strong>${res.pctX.toFixed(0)}% / ${res.pctY.toFixed(0)}%</strong>`;
        kpi2.innerHTML = `<span class="kpi-label">Strip M_x,max:</span><strong>${res.Mx_max.toFixed(1)} k-ft/ft</strong>`;
        kpi3.innerHTML = `<span class="kpi-label">Strip M_y,max:</span><strong>${res.My_max.toFixed(1)} k-ft/ft</strong>`;
      } else if (method === 'punching') {
        kpi1.innerHTML = `<span class="kpi-label">Total Shear v_u:</span><strong>${res.vu_max.toFixed(0)} psi</strong>`;
        kpi2.innerHTML = `<span class="kpi-label">Capacity φv_c:</span><strong>${res.phi_vc.toFixed(0)} psi</strong>`;
        kpi3.innerHTML = `<span class="kpi-label">D/C Ratio:</span><strong>${res.dcr.toFixed(2)}</strong> (${res.isSafe ? 'Adequate' : 'Excess'})`;
      }
    } else {
      kpi1.innerHTML = `<span class="kpi-label">Safety Factor:</span><strong>${res.isSafe ? 'Compliant' : 'Review'}</strong>`;
      kpi2.innerHTML = `<span class="kpi-label">Soil USCS:</span><strong>${state.selectedSoil}</strong>`;
      kpi3.innerHTML = `<span class="kpi-label">Region:</span><strong>${state.selectedClimate}</strong>`;
    }

    if (res.isSafe) {
      kpiBadge.className = 'npsh-status-badge status-safe';
      kpiBadge.textContent = '✅ DESIGN SAFE (MEETS SF)';
    } else {
      kpiBadge.className = 'npsh-status-badge status-warning';
      kpiBadge.textContent = '⚠️ SAFETY FACTOR DEFICIT';
    }
  }

  function updateUI() {
    const res = solveActiveModule();
    updateKPIs(res);

    const svgWrap = document.getElementById('toolboxSvgWrapper');
    if (svgWrap) {
      svgWrap.innerHTML = renderSvgForActiveModule(res);
    }

    const mathWrap = document.getElementById('toolboxMathContainer');
    if (mathWrap) {
      mathWrap.innerHTML = generateKaTeXForActiveModule(res);
      if (window.renderMathInElement) {
        window.renderMathInElement(mathWrap, {
          delimiters: [
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false }
          ],
          throwOnError: false
        });
      }
    }
  }

  function performToolboxSearch(query) {
    const q = query.trim().toLowerCase();
    const resultsContainer = document.getElementById('toolboxSearchResults');
    if (!resultsContainer) return;

    if (!q) {
      resultsContainer.style.display = 'none';
      return;
    }

    const matches = [];
    Object.keys(MODULES).forEach(key => {
      const mod = MODULES[key];
      const matchScore = (mod.title.toLowerCase().includes(q) ? 5 : 0) +
        (mod.category.toLowerCase().includes(q) ? 3 : 0) +
        (mod.tags.some(t => t.toLowerCase().includes(q)) ? 4 : 0) +
        (mod.nceesRef.toLowerCase().includes(q) ? 2 : 0);
      if (matchScore > 0) {
        matches.push({ key, mod, matchScore });
      }
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    if (matches.length === 0) {
      resultsContainer.style.display = 'block';
      resultsContainer.innerHTML = `
        <div style="padding: 1rem; color: var(--text-muted); font-size: 0.85rem; text-align: center;">
          No matching engineering modules found for "${query}". Try searching "Rankine", "Pond", "Lift Station", "Plat", "Hantush", or "Slope".
        </div>
      `;
      return;
    }

    resultsContainer.style.display = 'grid';
    resultsContainer.innerHTML = matches.map(m => `
      <div class="toolbox-search-card" data-module="${m.key}">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 1.1rem;">${m.mod.icon} <strong>${m.mod.title}</strong></span>
          <span class="badge category">${m.mod.category}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
          Reference: ${m.mod.nceesRef}
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
          Keywords: ${m.mod.tags.slice(0, 5).join(', ')}...
        </div>
      </div>
    `).join('');

    resultsContainer.querySelectorAll('.toolbox-search-card').forEach(card => {
      card.addEventListener('click', () => {
        const modKey = card.getAttribute('data-module');
        selectModule(modKey);
        resultsContainer.style.display = 'none';
        const searchInput = document.getElementById('toolboxSearchInput');
        if (searchInput) searchInput.value = '';
      });
    });
  }

  function selectModule(modKey) {
    if (!MODULES[modKey]) return;
    state.activeModule = modKey;

    document.querySelectorAll('.toolbox-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-module') === modKey);
    });

    renderControlsPane();
    updateUI();
  }

  function initToolbox() {
    const modal = document.getElementById('civilToolboxModal');
    const openBtn = document.getElementById('openCivilToolboxBtn');
    const closeBtn = document.getElementById('closeCivilToolboxBtn');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        selectModule(state.activeModule);
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      });
    }

    document.querySelectorAll('.toolbox-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectModule(btn.getAttribute('data-module'));
      });
    });

    const searchInput = document.getElementById('toolboxSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        performToolboxSearch(e.target.value);
      });
    }

    const exportBtn = document.getElementById('toolboxExportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const mod = MODULES[state.activeModule];
        const res = solveActiveModule();
        const textReport = `=====================================================
SOLVEDIN6 CIVIL ENGINEERING TOOLBOX CALCULATION REPORT
Discipline: ${mod.title} (${mod.category})
Reference Standard: ${mod.nceesRef}
Soil Profile: ${USCS_SOILS[state.selectedSoil].name}
Climate Region: ${US_CLIMATES[state.selectedClimate].name}
Safety Factor Status: ${res.isSafe ? 'COMPLIANT' : 'SAFETY FACTOR DEFICIT'}
Date Generated: ${new Date().toLocaleString()}
=====================================================`;
        navigator.clipboard.writeText(textReport).then(() => {
          const original = exportBtn.textContent;
          exportBtn.textContent = '✅ Copied to Clipboard!';
          setTimeout(() => { exportBtn.textContent = original; }, 2500);
        });
      });
    }

    function checkHash() {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#toolbox')) {
        const rest = hash.replace(/^#toolbox-?/, '');
        const parts = rest.split('-');
        const target = parts[0] || 'walls';
        const sub = parts[1];
        if (target && MODULES[target]) {
          state.activeModule = target;
          if (target === 'slabs' && sub) {
            state.slabs.method = sub;
          }
        }
        if (modal) {
          modal.classList.add('open');
          modal.setAttribute('aria-hidden', 'false');
          selectModule(state.activeModule);
        }
      }
    }

    window.addEventListener('hashchange', checkHash);
    checkHash();
  }

  window.CivilToolbox = {
    MODULES,
    openModule: (modKey, subMethod) => {
      const modal = document.getElementById('civilToolboxModal');
      if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        if (modKey === 'slabs' && subMethod) {
          state.slabs.method = subMethod;
        }
        selectModule(modKey);
      }
    },
    searchModules: (query) => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const matches = [];
      Object.keys(MODULES).forEach(key => {
        const mod = MODULES[key];
        const matchScore = (mod.title.toLowerCase().includes(q) ? 5 : 0) +
          (mod.category.toLowerCase().includes(q) ? 3 : 0) +
          (mod.tags.some(t => t.toLowerCase().includes(q)) ? 4 : 0);
        if (matchScore > 0) matches.push({ key, ...mod, matchScore });
      });
      return matches.sort((a, b) => b.matchScore - a.matchScore);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initToolbox();
  });
})();
