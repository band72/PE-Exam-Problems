/**
 * ============================================================================
 * SolvedIn6 • Time Rate of Consolidation & Soil Surcharge Preload Lab
 * ============================================================================
 * Comprehensive, professional interactive engineering simulator for:
 * 1. Terzaghi 1-D Consolidation Theory & Time Factor (Tv = cv * t / Hdr^2)
 * 2. Primary Consolidation Settlement (Sp = [Cc * H / (1 + e0)] * log10((σ'v0 + Δσp) / σ'v0))
 * 3. Soil Surcharge Preload Design: Calculating required Surcharge Weight & Fill Thickness
 *    to squeeze out excess pore moisture and eliminate residual structural settlement
 * 4. Dual-Direction Solvers:
 *    - Mode A: Compute Surcharge Weight & Height from Target Preload Time (t -> Weight)
 *    - Mode B: Compute Consolidation Time from Specified Surcharge Weight/Height (Weight -> t)
 * 5. Site Acreage, Building Footprint Dimensions & 2:1 Side Berm Batter Slopes
 * 6. Earthwork Logistics: Surcharge Weight in Tons/lbs, Volume in yd³, and 22-Ton Dump Truckloads
 * 7. Pore Moisture Expulsion Meter: Total Gallons and Acre-Feet of Water Squeezed Out of Soil
 * 8. Single vs. Double Drainage (Hdr = H vs Hdr = H / 2) with 4x Time Impact
 * 9. Dynamic 2D SVG Stratigraphy, Water Squeeze Vectors & Excess Pore Pressure Isochrones
 * 10. Live Step-by-Step KaTeX Derivations and Clipboard Calculation Report Export
 *
 * References:
 * - NCEES PE Civil Reference Handbook § 3.3 & § 3.4 (Soil Mechanics & Foundations)
 * - Holtz, Kovacs, & Sheahan: An Introduction to Geotechnical Engineering
 * - Terzaghi, Peck, & Mesri: Soil Mechanics in Engineering Practice
 * - NAVFAC DM-7.01: Soil Mechanics Design Manual
 * ============================================================================
 */

(function () {
  'use strict';

  // --- SOIL PRESETS FOR COMPRESSIBLE STRATUM ---
  const SOIL_PRESETS = {
    soft_marine_clay: {
      name: '🧱 Soft Marine Clay (Normally Consolidated)',
      desc: 'High sensitivity, high compressibility, low permeability. Problem #130 analog.',
      cv: 0.080,
      Cc: 0.36,
      e0: 0.90,
      gammaSat: 112,
      wPct: 33,
      color: '#5d4037'
    },
    fat_clay_ch: {
      name: '🌊 Fat Clay / Gulf Coast Gumbo (CH)',
      desc: 'Highly plastic, expansive, very slow drainage rate and high secondary compression potential.',
      cv: 0.035,
      Cc: 0.52,
      e0: 1.20,
      gammaSat: 105,
      wPct: 44,
      color: '#4e342e'
    },
    medium_stiff_clay: {
      name: '🧱 Medium Stiff Alluvial Clay (CL)',
      desc: 'Moderately plastic floodplain deposit with moderate drainage velocity.',
      cv: 0.150,
      Cc: 0.24,
      e0: 0.72,
      gammaSat: 120,
      wPct: 26,
      color: '#6d4c41'
    },
    organic_silt_peat: {
      name: '🌱 Organic Silt & Muck (OH / Pt)',
      desc: 'Extremely compressible wetland marsh deposits, high initial void ratio.',
      cv: 0.020,
      Cc: 0.65,
      e0: 1.65,
      gammaSat: 88,
      wPct: 62,
      color: '#3e2723'
    },
    glacial_till_cl: {
      name: '🪨 Dense Lean Clay / Glacial Till',
      desc: 'Overconsolidated matrix with low void ratio and faster pore pressure dissipation.',
      cv: 0.280,
      Cc: 0.16,
      e0: 0.55,
      gammaSat: 130,
      wPct: 19,
      color: '#795548'
    }
  };

  // --- SURCHARGE SOIL FILL TYPES ---
  const FILL_PRESETS = {
    granular_borrow: { name: 'Compacted Granular Borrow / Select Sand', gammaFill: 125, desc: 'Clean granular fill, easy compaction' },
    crushed_stone: { name: 'Dense Crushed Aggregate / Rock Fill', gammaFill: 135, desc: 'Heavy rock fill, high surcharge stress per foot' },
    common_earth: { name: 'Common Earth / Silty Clay Excavation', gammaFill: 115, desc: 'Unclassified on-site borrow material' },
    lightweight_fill: { name: 'Lightweight Aggregate / Slag', gammaFill: 90, desc: 'Reduced unit weight borrow' }
  };

  // State object
  const state = {
    // Solver Mode: 'timeToWeight' (target time -> find required surcharge weight/height)
    // or 'weightToTime' (given surcharge height/weight -> find time to push out moisture)
    solveMode: 'timeToWeight',

    // Property Acreage & Site Dimensions
    propertyAcreage: 4.5,       // Total property parcel size (acres)
    footprintL: 300,            // Building pad length (ft)
    footprintW: 200,            // Building pad width (ft)
    bermSideSlope: 2.0,         // Side slope batter (2:1 H:V)

    // Soil & Stratigraphy Parameters
    selectedSoilKey: 'soft_marine_clay',
    clayThicknessH: 20.0,       // ft
    drainageType: 'double',      // 'double' (Hdr = H/2) or 'single' (Hdr = H)
    cv: 0.080,                   // ft^2 / day
    Cc: 0.36,                    // Compression index
    e0: 0.90,                    // Initial void ratio
    sigmaV0: 2200,               // psf (initial effective overburden at mid-layer)

    // Structural Foundation Loading
    deltaP: 1500,                // psf (permanent structural building load)

    // Surcharge Preload Soil Parameters
    selectedFillKey: 'granular_borrow',
    gammaFill: 125,              // pcf

    // Preload Surcharge Parameters
    timeDays: 180,               // days (target allowable preloading time)
    surchargeHeightHs: 29.67,    // ft (surcharge fill thickness)
    targetPctSettlement: 100,    // % of permanent structural settlement to eliminate

    // Logistics parameters
    truckCapacityTons: 22.0      // standard tri-axle dump truck payload
  };

  // DOM Elements cache
  let dom = {};

  function initDOM() {
    dom = {
      modal: document.getElementById('consolidationCalcModal'),
      openBtn: document.getElementById('openConsolidationCalcBtn'),
      closeBtn: document.getElementById('closeConsolidationModalBtn'),

      // KPIs
      kpiWeightTons: document.getElementById('consKpiWeightTons'),
      kpiWeightLbs: document.getElementById('consKpiWeightLbs'),
      kpiTimeDays: document.getElementById('consKpiTimeDays'),
      kpiFillHeight: document.getElementById('consKpiFillHeight'),
      kpiPoreMoisture: document.getElementById('consKpiPoreMoisture'),
      kpiSettlement: document.getElementById('consKpiSettlement'),

      // Controls
      modeTimeToWeightBtn: document.getElementById('consModeTimeToWeightBtn'),
      modeWeightToTimeBtn: document.getElementById('consModeWeightToTimeBtn'),
      soilSelect: document.getElementById('consSoilPresetSelect'),
      fillSelect: document.getElementById('consFillPresetSelect'),
      drainageDoubleBtn: document.getElementById('consDrainDoubleBtn'),
      drainageSingleBtn: document.getElementById('consDrainSingleBtn'),

      // Site & Dimension Sliders
      acreageSlider: document.getElementById('consAcreageSlider'),
      acreageVal: document.getElementById('consAcreageVal'),
      footprintLSlider: document.getElementById('consFootprintLSlider'),
      footprintLVal: document.getElementById('consFootprintLVal'),
      footprintWSlider: document.getElementById('consFootprintWSlider'),
      footprintWVal: document.getElementById('consFootprintWVal'),
      bermSlopeSelect: document.getElementById('consBermSlopeSelect'),

      // Preload & Soil Sliders
      timeSlider: document.getElementById('consTimeSlider'),
      timeVal: document.getElementById('consTimeVal'),
      heightSlider: document.getElementById('consHeightSlider'),
      heightVal: document.getElementById('consHeightVal'),
      gammaSlider: document.getElementById('consGammaSlider'),
      gammaVal: document.getElementById('consGammaVal'),
      clayThickSlider: document.getElementById('consClayThickSlider'),
      clayThickVal: document.getElementById('consClayThickVal'),
      cvSlider: document.getElementById('consCvSlider'),
      cvVal: document.getElementById('consCvVal'),
      ccSlider: document.getElementById('consCcSlider'),
      ccVal: document.getElementById('consCcVal'),
      e0Slider: document.getElementById('consE0Slider'),
      e0Val: document.getElementById('consE0Val'),
      sigma0Slider: document.getElementById('consSigma0Slider'),
      sigma0Val: document.getElementById('consSigma0Val'),
      deltaPSlider: document.getElementById('consDeltaPSlider'),
      deltaPVal: document.getElementById('consDeltaPVal'),

      // Visuals & Containers
      diagramSvg: document.getElementById('consDiagramSvg'),
      mathContainer: document.getElementById('consMathContainer'),
      copyReportBtn: document.getElementById('consCopyReportBtn')
    };
  }

  // --- MATHEMATICAL FORMULAS & CONSOLIDATION CALCULATIONS ---

  function computeTvFromU(U) {
    if (U <= 0.0001) return 0.0;
    if (U >= 0.9999) return 2.5;
    if (U <= 0.60) {
      return (Math.PI / 4.0) * (U * U);
    } else {
      return 1.781 - 0.933 * Math.log10(100.0 * (1.0 - U));
    }
  }

  function computeUFromTv(Tv) {
    if (Tv <= 0.0) return 0.0;
    const tvCrit = (Math.PI / 4.0) * 0.36; // 0.282743
    if (Tv <= tvCrit) {
      return Math.sqrt((4.0 * Tv) / Math.PI);
    } else {
      const exponent = (1.781 - Tv) / 0.933;
      const term = Math.pow(10.0, exponent);
      const U = 1.0 - (term / 100.0);
      return Math.min(0.999, Math.max(0.0, U));
    }
  }

  function calculateConsolidation() {
    const H = state.clayThicknessH;
    const Hdr = state.drainageType === 'double' ? (H / 2.0) : H;
    const cv = state.cv;
    const Cc = state.Cc;
    const e0 = state.e0;
    const sigmaV0 = state.sigmaV0;
    const deltaP = state.deltaP;
    const gammaFill = state.gammaFill;

    // Site Acreage & Dimensions
    const propAreaSqFt = state.propertyAcreage * 43560.0;
    const padAreaSqFt = state.footprintL * state.footprintW;
    const padAcres = padAreaSqFt / 43560.0;
    const padCoveragePct = (padAreaSqFt / propAreaSqFt) * 100.0;

    // 1. Ultimate Primary Consolidation Settlement under Permanent Structural Load
    const compressionRatio = (Cc * H) / (1.0 + e0);
    const stressRatioStructural = (sigmaV0 + deltaP) / sigmaV0;
    const Sp_ult_ft = compressionRatio * Math.log10(stressRatioStructural);
    const Sp_ult_in = Sp_ult_ft * 12.0;

    // 2. Pore water moisture squeezed out of soil matrix
    const waterVolumeCuFt = padAreaSqFt * Sp_ult_ft;
    const waterVolumeGallons = waterVolumeCuFt * 7.48052;
    const waterVolumeAcreFt = waterVolumeCuFt / 43560.0;

    let targetSettlementFt = Sp_ult_ft * (state.targetPctSettlement / 100.0);
    let timeDays = state.timeDays;
    let surchargeHeightFt = state.surchargeHeightHs;
    let deltaSigmaS = 0;
    let Stotal_ult_ft = 0;
    let Us = 0;
    let Tv = 0;

    if (state.solveMode === 'timeToWeight') {
      timeDays = state.timeDays;
      Tv = (cv * timeDays) / (Hdr * Hdr);
      Us = computeUFromTv(Tv);

      Stotal_ult_ft = targetSettlementFt / Math.max(0.01, Us);
      const logRatioTotal = Stotal_ult_ft / compressionRatio;
      const totalStressMid = sigmaV0 * Math.pow(10.0, logRatioTotal);
      deltaSigmaS = totalStressMid - sigmaV0 - deltaP;
      deltaSigmaS = Math.max(0, deltaSigmaS);

      surchargeHeightFt = deltaSigmaS / gammaFill;
      state.surchargeHeightHs = surchargeHeightFt;
    } else {
      surchargeHeightFt = state.surchargeHeightHs;
      deltaSigmaS = surchargeHeightFt * gammaFill;

      const totalStressMid = sigmaV0 + deltaP + deltaSigmaS;
      const logRatioTotal = Math.log10(totalStressMid / sigmaV0);
      Stotal_ult_ft = compressionRatio * logRatioTotal;

      Us = targetSettlementFt / Math.max(0.001, Stotal_ult_ft);
      Us = Math.min(0.999, Math.max(0.01, Us));

      Tv = computeTvFromU(Us);
      timeDays = (Tv * Hdr * Hdr) / cv;
      state.timeDays = timeDays;
    }

    // Surcharge Embankment Geometry:
    // Core Pad Prismoid Volume:
    const padVolFt3 = padAreaSqFt * surchargeHeightFt;

    // Side slope berm prismoidal transition (Z:1 slope, default 2:1)
    const zSlope = state.bermSideSlope;
    const bermSpread = zSlope * surchargeHeightFt;
    const baseL = state.footprintL + 2.0 * bermSpread;
    const baseW = state.footprintW + 2.0 * bermSpread;
    const baseAreaSqFt = baseL * baseW;
    const totalSurchargeVolFt3 = (surchargeHeightFt / 3.0) * (padAreaSqFt + baseAreaSqFt + Math.sqrt(padAreaSqFt * baseAreaSqFt));
    const totalSurchargeVolYd3 = totalSurchargeVolFt3 / 27.0;

    // Weight on pad footprint only (matches 1D consolidation column)
    const padWeightLbs = padVolFt3 * gammaFill;
    const padWeightTons = padWeightLbs / 2000.0;

    // Total earthwork surcharge including side berms
    const totalWeightLbs = totalSurchargeVolFt3 * gammaFill;
    const totalWeightTons = totalWeightLbs / 2000.0;

    // Earthwork Truckloads (22 tons per tri-axle dump truck)
    const truckloadsCount = Math.ceil(totalWeightTons / state.truckCapacityTons);

    const moistureExpelledPct = Us * 100.0;

    const preconsolidationStress = sigmaV0 + deltaP + deltaSigmaS;
    const sustainedStress = sigmaV0 + deltaP;
    const inducedOcr = preconsolidationStress / sustainedStress;

    const timeMonths = timeDays / 30.4375;
    const timeYears = timeDays / 365.25;

    return {
      H,
      Hdr,
      cv,
      Cc,
      e0,
      sigmaV0,
      deltaP,
      gammaFill,
      propAreaSqFt,
      padAreaSqFt,
      padAcres,
      padCoveragePct,
      compressionRatio,
      Sp_ult_ft,
      Sp_ult_in,
      waterVolumeCuFt,
      waterVolumeGallons,
      waterVolumeAcreFt,
      Stotal_ult_ft,
      Stotal_ult_in: Stotal_ult_ft * 12.0,
      targetSettlementFt,
      targetSettlementIn: targetSettlementFt * 12.0,
      deltaSigmaS,
      surchargeHeightFt,
      timeDays,
      timeMonths,
      timeYears,
      Tv,
      Us,
      moistureExpelledPct,
      padVolFt3,
      padVolYd3: padVolFt3 / 27.0,
      padWeightLbs,
      padWeightTons,
      totalSurchargeVolFt3,
      totalSurchargeVolYd3,
      totalWeightLbs,
      totalWeightTons,
      truckloadsCount,
      bermSpread,
      baseL,
      baseW,
      baseAreaSqFt,
      preconsolidationStress,
      sustainedStress,
      inducedOcr
    };
  }

  // --- UI UPDATE & KPI BINDING ---
  function updateUI() {
    const calc = calculateConsolidation();

    // 1. Update KPI Cards
    if (dom.kpiWeightTons) {
      dom.kpiWeightTons.innerHTML = `${Math.round(calc.padWeightTons).toLocaleString()} <span style="font-size:0.85rem; font-weight:500;">Tons</span>`;
    }
    if (dom.kpiWeightLbs) {
      dom.kpiWeightLbs.textContent = `${Math.round(calc.padWeightLbs).toLocaleString()} lbs (${Math.round(calc.padVolYd3).toLocaleString()} yd³ • ${calc.truckloadsCount.toLocaleString()} Trucks)`;
    }
    if (dom.kpiTimeDays) {
      dom.kpiTimeDays.innerHTML = `${Math.round(calc.timeDays)} <span style="font-size:0.85rem; font-weight:500;">Days (${calc.timeMonths.toFixed(1)} mo)</span>`;
    }
    if (dom.kpiFillHeight) {
      dom.kpiFillHeight.innerHTML = `${calc.surchargeHeightFt.toFixed(1)} <span style="font-size:0.85rem; font-weight:500;">ft (Δσ_s = ${Math.round(calc.deltaSigmaS)} psf)</span>`;
    }
    if (dom.kpiPoreMoisture) {
      dom.kpiPoreMoisture.innerHTML = `${calc.moistureExpelledPct.toFixed(1)}% <span style="font-size:0.85rem; font-weight:500;">(${Math.round(calc.waterVolumeGallons).toLocaleString()} gal)</span>`;
    }
    if (dom.kpiSettlement) {
      dom.kpiSettlement.innerHTML = `${calc.Sp_ult_in.toFixed(2)}" <span style="font-size:0.85rem; font-weight:500;">(Post-Settlement: 0.00")</span>`;
    }

    // 2. Update Slider Value Labels & Positions
    if (dom.timeSlider && dom.timeVal) {
      dom.timeVal.textContent = `${Math.round(calc.timeDays)} days (${calc.timeMonths.toFixed(1)} mo)`;
      if (document.activeElement !== dom.timeSlider) {
        dom.timeSlider.value = Math.round(calc.timeDays);
      }
    }
    if (dom.heightSlider && dom.heightVal) {
      dom.heightVal.textContent = `${calc.surchargeHeightFt.toFixed(1)} ft (${Math.round(calc.padWeightTons).toLocaleString()} Tons)`;
      if (document.activeElement !== dom.heightSlider) {
        dom.heightSlider.value = calc.surchargeHeightFt.toFixed(1);
      }
    }

    // Acreage and Dimensions
    if (dom.acreageVal) dom.acreageVal.textContent = `${state.propertyAcreage.toFixed(1)} Acres (${Math.round(calc.propAreaSqFt).toLocaleString()} sq ft)`;
    if (dom.acreageSlider && document.activeElement !== dom.acreageSlider) dom.acreageSlider.value = state.propertyAcreage;

    if (dom.footprintLVal) dom.footprintLVal.textContent = `${state.footprintL} ft`;
    if (dom.footprintLSlider && document.activeElement !== dom.footprintLSlider) dom.footprintLSlider.value = state.footprintL;

    if (dom.footprintWVal) dom.footprintWVal.textContent = `${state.footprintW} ft (${calc.padAreaSqFt.toLocaleString()} sq ft = ${calc.padAcres.toFixed(2)} ac)`;
    if (dom.footprintWSlider && document.activeElement !== dom.footprintWSlider) dom.footprintWSlider.value = state.footprintW;

    if (dom.gammaVal) dom.gammaVal.textContent = `${state.gammaFill} pcf`;
    if (dom.gammaSlider && document.activeElement !== dom.gammaSlider) dom.gammaSlider.value = state.gammaFill;

    if (dom.clayThickVal) dom.clayThickVal.textContent = `${state.clayThicknessH} ft (Hdr = ${calc.Hdr.toFixed(1)} ft)`;
    if (dom.clayThickSlider && document.activeElement !== dom.clayThickSlider) dom.clayThickSlider.value = state.clayThicknessH;

    if (dom.cvVal) dom.cvVal.textContent = `${state.cv.toFixed(3)} ft²/day`;
    if (dom.cvSlider && document.activeElement !== dom.cvSlider) dom.cvSlider.value = state.cv.toFixed(3);

    if (dom.ccVal) dom.ccVal.textContent = state.Cc.toFixed(2);
    if (dom.ccSlider && document.activeElement !== dom.ccSlider) dom.ccSlider.value = state.Cc.toFixed(2);

    if (dom.e0Val) dom.e0Val.textContent = state.e0.toFixed(2);
    if (dom.e0Slider && document.activeElement !== dom.e0Slider) dom.e0Slider.value = state.e0.toFixed(2);

    if (dom.sigma0Val) dom.sigma0Val.textContent = `${state.sigmaV0.toLocaleString()} psf`;
    if (dom.sigma0Slider && document.activeElement !== dom.sigma0Slider) dom.sigma0Slider.value = state.sigmaV0;

    if (dom.deltaPVal) dom.deltaPVal.textContent = `${state.deltaP.toLocaleString()} psf`;
    if (dom.deltaPSlider && document.activeElement !== dom.deltaPSlider) dom.deltaPSlider.value = state.deltaP;

    // 3. Highlight Active Solver Mode Buttons
    if (dom.modeTimeToWeightBtn && dom.modeWeightToTimeBtn) {
      dom.modeTimeToWeightBtn.classList.toggle('active', state.solveMode === 'timeToWeight');
      dom.modeWeightToTimeBtn.classList.toggle('active', state.solveMode === 'weightToTime');
    }

    // 4. Highlight Drainage Buttons
    if (dom.drainageDoubleBtn && dom.drainageSingleBtn) {
      dom.drainageDoubleBtn.classList.toggle('active', state.drainageType === 'double');
      dom.drainageSingleBtn.classList.toggle('active', state.drainageType === 'single');
    }

    // 5. Draw Dynamic SVG Stratigraphy & Pore Water Isochrone
    renderSVGDiagram(calc);

    // 6. Render KaTeX Step-by-Step Derivations
    renderMathDerivations(calc);
  }

  // --- DYNAMIC SVG STRATIGRAPHY & ISOCHRONE VISUALIZER ---
  function renderSVGDiagram(calc) {
    if (!dom.diagramSvg) return;

    const width = 640;
    const height = 440;
    const isDouble = state.drainageType === 'double';

    const fillHeightPx = Math.min(100, Math.max(35, calc.surchargeHeightFt * 2.8));
    const upperSandPx = 30;
    const clayPx = 160;
    const lowerSandPx = 40;

    const groundY = 140;
    const fillTopY = groundY - fillHeightPx;
    const upperSandBottomY = groundY + upperSandPx;
    const clayBottomY = upperSandBottomY + clayPx;
    const lowerBoundaryY = clayBottomY + lowerSandPx;

    const leftX = 60;
    const rightX = 420;
    const centerFillX = (leftX + rightX) / 2;

    const isoLeft = 475;
    const isoWidth = 135;
    const isoRight = isoLeft + isoWidth;

    let isochronePoints = [];
    const numPoints = 25;
    for (let i = 0; i <= numPoints; i++) {
      const frac = i / numPoints;
      const y = upperSandBottomY + frac * clayPx;

      let uRatio = 0.0;
      if (isDouble) {
        const M1 = Math.PI / 2.0;
        const M2 = 3.0 * Math.PI / 2.0;
        const zHdr = frac <= 0.5 ? (frac * 2.0) : ((1.0 - frac) * 2.0);
        uRatio = (4.0 / Math.PI) * Math.sin(M1 * zHdr) * Math.exp(-M1 * M1 * calc.Tv)
               + (4.0 / (3.0 * Math.PI)) * Math.sin(M2 * zHdr) * Math.exp(-M2 * M2 * calc.Tv);
      } else {
        const M1 = Math.PI / 2.0;
        const M2 = 3.0 * Math.PI / 2.0;
        uRatio = (4.0 / Math.PI) * Math.cos(M1 * (1.0 - frac)) * Math.exp(-M1 * M1 * calc.Tv)
               + (4.0 / (3.0 * Math.PI)) * Math.cos(M2 * (1.0 - frac)) * Math.exp(-M2 * M2 * calc.Tv);
      }
      uRatio = Math.max(0.0, Math.min(1.0, uRatio));
      const isoX = isoLeft + uRatio * isoWidth;
      isochronePoints.push(`${isoX.toFixed(1)},${y.toFixed(1)}`);
    }

    const isochronePathD = `M ${isoLeft},${upperSandBottomY} L ` + isochronePoints.join(' L ') + ` L ${isoLeft},${clayBottomY} Z`;

    dom.diagramSvg.innerHTML = `
      <defs>
        <linearGradient id="surchargeFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#b45309" stop-opacity="0.9"/>
        </linearGradient>
        <linearGradient id="sandStratumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fde047" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#eab308" stop-opacity="0.6"/>
        </linearGradient>
        <linearGradient id="clayStratumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#5d4037" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#4e342e" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#3e2723" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="rockStratumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#475569" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#1e293b" stop-opacity="0.98"/>
        </linearGradient>
        <linearGradient id="isochroneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.6"/>
        </linearGradient>

        <pattern id="sandHatch" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.2" fill="#ca8a04"/>
          <circle cx="9" cy="9" r="1.0" fill="#ca8a04"/>
        </pattern>
        <pattern id="clayHatch" width="20" height="10" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2" x2="14" y2="2" stroke="#8d6e63" stroke-width="1.2"/>
          <line x1="8" y1="7" x2="20" y2="7" stroke="#8d6e63" stroke-width="1.2"/>
        </pattern>
        <pattern id="rockHatch" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 16 L16 0 M-4 4 L4 -4 M12 20 L20 12" stroke="#64748b" stroke-width="1.5"/>
        </pattern>
      </defs>

      <rect width="${width}" height="${height}" fill="#0f172a" rx="8"/>

      <!-- Perimeter Relief / Dewatering Ditches on Flanks -->
      <!-- Left Relief Ditch -->
      <polygon points="14,${groundY} 22,${groundY + 22} 44,${groundY + 22} 52,${groundY}" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
      <polygon points="18,${groundY + 10} 22,${groundY + 22} 44,${groundY + 22} 48,${groundY + 10}" fill="#0284c7" opacity="0.85"/>
      <text x="33" y="${groundY - 8}" fill="#38bdf8" font-size="8.5" font-weight="700" text-anchor="middle">Left Relief</text>
      <text x="33" y="${groundY + 33}" fill="#93c5fd" font-size="7.5" text-anchor="middle">Ditch</text>

      <!-- Right Relief Ditch -->
      <polygon points="428,${groundY} 436,${groundY + 22} 458,${groundY + 22} 466,${groundY}" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
      <polygon points="432,${groundY + 10} 436,${groundY + 22} 458,${groundY + 22} 462,${groundY + 10}" fill="#0284c7" opacity="0.85"/>
      <text x="447" y="${groundY - 8}" fill="#38bdf8" font-size="8.5" font-weight="700" text-anchor="middle">Right Relief</text>
      <text x="447" y="${groundY + 33}" fill="#93c5fd" font-size="7.5" text-anchor="middle">Ditch</text>

      <!-- Upper Sand Drainage Layer -->
      <rect x="${leftX}" y="${groundY}" width="${rightX - leftX}" height="${upperSandPx}" fill="url(#sandStratumGrad)"/>
      <rect x="${leftX}" y="${groundY}" width="${rightX - leftX}" height="${upperSandPx}" fill="url(#sandHatch)"/>
      <line x1="${leftX}" y1="${groundY}" x2="${rightX}" y2="${groundY}" stroke="#e2e8f0" stroke-width="2"/>
      <text x="${leftX + 12}" y="${groundY + 18}" fill="#0f172a" font-weight="700" font-size="10.5">🟡 Free-Draining Sand Blanket (Upper Drainage Layer)</text>
      
      <!-- Lateral Drainage Vectors into Perimeter Ditches -->
      <g stroke="#0284c7" stroke-width="1.8" fill="#0284c7">
        <line x1="${leftX + 45}" y1="${groundY + 15}" x2="${leftX - 5}" y2="${groundY + 15}" stroke-dasharray="3,2"/>
        <polygon points="${leftX - 8},${groundY + 15} ${leftX - 1},${groundY + 12} ${leftX - 1},${groundY + 18}"/>
        <line x1="${rightX - 45}" y1="${groundY + 15}" x2="${rightX + 5}" y2="${groundY + 15}" stroke-dasharray="3,2"/>
        <polygon points="${rightX + 8},${groundY + 15} ${rightX + 1},${groundY + 12} ${rightX + 1},${groundY + 18}"/>
      </g>

      <!-- Surcharge Soil Embankment Fill with 2:1 side slopes -->
      <polygon points="${leftX + 35},${fillTopY} ${rightX - 35},${fillTopY} ${rightX + 10},${groundY} ${leftX - 10},${groundY}" fill="url(#surchargeFillGrad)" stroke="#f59e0b" stroke-width="2"/>

      <!-- Surcharge Height Dimension Line -->
      <line x1="${leftX - 6}" y1="${fillTopY}" x2="${leftX - 6}" y2="${groundY}" stroke="#fbbf24" stroke-width="1.5"/>
      <line x1="${leftX - 12}" y1="${fillTopY}" x2="${leftX}" y2="${fillTopY}" stroke="#fbbf24" stroke-width="1.5"/>
      <line x1="${leftX - 12}" y1="${groundY}" x2="${leftX}" y2="${groundY}" stroke="#fbbf24" stroke-width="1.5"/>

      <!-- Surcharge Embankment Central Identification Card -->
      <rect x="${centerFillX - 145}" y="${fillTopY + (groundY - fillTopY) / 2 - 20}" width="290" height="40" rx="5" fill="rgba(15, 23, 42, 0.92)" stroke="#f59e0b" stroke-width="1.2"/>
      <text x="${centerFillX}" y="${fillTopY + (groundY - fillTopY) / 2 - 4}" fill="#fef08a" font-weight="800" font-size="11" text-anchor="middle">
        🚜 Surcharge Fill: hs = ${calc.surchargeHeightFt.toFixed(1)} ft (Δσs = ${Math.round(calc.deltaSigmaS)} psf)
      </text>
      <text x="${centerFillX}" y="${fillTopY + (groundY - fillTopY) / 2 + 13}" fill="#cbd5e1" font-size="9.5" text-anchor="middle">
        Pad Weight: ${Math.round(calc.padWeightTons).toLocaleString()} Tons (${Math.round(calc.padVolYd3).toLocaleString()} yd³ • ${Math.ceil(calc.padWeightTons / 22.0).toLocaleString()} Trucks)
      </text>

      <!-- Compressible Saturated Clay Layer (Reclaimed Lake Bed & Filled Ditch) -->
      <rect x="${leftX}" y="${upperSandBottomY}" width="${rightX - leftX}" height="${clayPx}" fill="url(#clayStratumGrad)"/>
      <rect x="${leftX}" y="${upperSandBottomY}" width="${rightX - leftX}" height="${clayPx}" fill="url(#clayHatch)"/>
      <line x1="${leftX}" y1="${upperSandBottomY}" x2="${rightX}" y2="${upperSandBottomY}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,3"/>

      <!-- Clay Layer Label & Parameters -->
      <rect x="${leftX + 15}" y="${upperSandBottomY + 10}" width="280" height="46" rx="4" fill="rgba(15, 23, 42, 0.92)" stroke="#8d6e63" stroke-width="1"/>
      <text x="${leftX + 22}" y="${upperSandBottomY + 25}" fill="#f5d0fe" font-weight="700" font-size="10.5">🧱 Reclaimed Lake Bed & Filled Ditch (H = ${calc.H} ft)</text>
      <text x="${leftX + 22}" y="${upperSandBottomY + 39}" fill="#cbd5e1" font-size="9">Soft Marine Clay • cv = ${calc.cv.toFixed(3)} ft²/d | Cc = ${calc.Cc.toFixed(2)} | σ'v0 = ${calc.sigmaV0} psf</text>
      <text x="${leftX + 22}" y="${upperSandBottomY + 51}" fill="#38bdf8" font-size="8.5">💧 Pore water expelled: ${Math.round(calc.waterVolumeGallons).toLocaleString()} gal to perimeter relief ditches</text>

      <!-- Moisture Dissipation Flow Arrows inside Clay -->
      <g stroke="#38bdf8" stroke-width="2" fill="#38bdf8">
        <line x1="${leftX + 100}" y1="${upperSandBottomY + 55}" x2="${leftX + 100}" y2="${upperSandBottomY + 12}" stroke-dasharray="3,2"/>
        <polygon points="${leftX + 100},${upperSandBottomY + 7} ${leftX + 96},${upperSandBottomY + 16} ${leftX + 104},${upperSandBottomY + 16}"/>
        <line x1="${leftX + 240}" y1="${upperSandBottomY + 55}" x2="${leftX + 240}" y2="${upperSandBottomY + 12}" stroke-dasharray="3,2"/>
        <polygon points="${leftX + 240},${upperSandBottomY + 7} ${leftX + 236},${upperSandBottomY + 16} ${leftX + 244},${upperSandBottomY + 16}"/>
        <line x1="${leftX + 330}" y1="${upperSandBottomY + 55}" x2="${leftX + 330}" y2="${upperSandBottomY + 12}" stroke-dasharray="3,2"/>
        <polygon points="${leftX + 330},${upperSandBottomY + 7} ${leftX + 326},${upperSandBottomY + 16} ${leftX + 334},${upperSandBottomY + 16}"/>
      </g>
      <text x="${leftX + 240}" y="${upperSandBottomY + 72}" fill="#38bdf8" font-size="9.5" font-weight="700" text-anchor="middle">💧 Pore Water Squeezed Out (Upward to Ditches)</text>

      ${isDouble ? `
        <g stroke="#38bdf8" stroke-width="2" fill="#38bdf8">
          <line x1="${leftX + 100}" y1="${clayBottomY - 45}" x2="${leftX + 100}" y2="${clayBottomY - 8}" stroke-dasharray="3,2"/>
          <polygon points="${leftX + 100},${clayBottomY - 3} ${leftX + 96},${clayBottomY - 12} ${leftX + 104},${clayBottomY - 12}"/>
          <line x1="${leftX + 240}" y1="${clayBottomY - 45}" x2="${leftX + 240}" y2="${clayBottomY - 8}" stroke-dasharray="3,2"/>
          <polygon points="${leftX + 240},${clayBottomY - 3} ${leftX + 236},${clayBottomY - 12} ${leftX + 244},${clayBottomY - 12}"/>
          <line x1="${leftX + 330}" y1="${clayBottomY - 45}" x2="${leftX + 330}" y2="${clayBottomY - 8}" stroke-dasharray="3,2"/>
          <polygon points="${leftX + 330},${clayBottomY - 3} ${leftX + 326},${clayBottomY - 12} ${leftX + 334},${clayBottomY - 12}"/>
        </g>
        <text x="${leftX + 240}" y="${clayBottomY - 50}" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">💧 Pore Water Squeezed Out (Downward)</text>
      ` : `
        <rect x="${leftX + 110}" y="${clayBottomY - 32}" width="220" height="22" rx="3" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444"/>
        <text x="${leftX + 220}" y="${clayBottomY - 17}" fill="#fca5a5" font-size="10" font-weight="700" text-anchor="middle">🚫 Impermeable Boundary (Zero Downward Drainage)</text>
      `}

      <line x1="${rightX + 16}" y1="${upperSandBottomY}" x2="${rightX + 16}" y2="${clayBottomY}" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="${rightX + 10}" y1="${upperSandBottomY}" x2="${rightX + 22}" y2="${upperSandBottomY}" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="${rightX + 10}" y1="${clayBottomY}" x2="${rightX + 22}" y2="${clayBottomY}" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="${rightX + 26}" y="${(upperSandBottomY + clayBottomY) / 2 + 4}" fill="#cbd5e1" font-weight="700" font-size="11">H = ${calc.H} ft</text>

      <!-- Lower Stratum -->
      ${isDouble ? `
        <rect x="${leftX}" y="${clayBottomY}" width="${rightX - leftX}" height="${lowerSandPx}" fill="url(#sandStratumGrad)"/>
        <rect x="${leftX}" y="${clayBottomY}" width="${rightX - leftX}" height="${lowerSandPx}" fill="url(#sandHatch)"/>
        <line x1="${leftX}" y1="${clayBottomY}" x2="${rightX}" y2="${clayBottomY}" stroke="#94a3b8" stroke-width="1.5"/>
        <text x="${leftX + 12}" y="${clayBottomY + 25}" fill="#0f172a" font-weight="700" font-size="11">🟡 Lower Sand Aquifer (Double Drainage: Hdr = ${calc.Hdr} ft)</text>
      ` : `
        <rect x="${leftX}" y="${clayBottomY}" width="${rightX - leftX}" height="${lowerSandPx}" fill="url(#rockStratumGrad)"/>
        <rect x="${leftX}" y="${clayBottomY}" width="${rightX - leftX}" height="${lowerSandPx}" fill="url(#rockHatch)"/>
        <line x1="${leftX}" y1="${clayBottomY}" x2="${rightX}" y2="${clayBottomY}" stroke="#ef4444" stroke-width="2"/>
        <text x="${leftX + 12}" y="${clayBottomY + 25}" fill="#f87171" font-weight="700" font-size="11">🪨 Impermeable Bedrock (Single Drainage: Hdr = ${calc.Hdr} ft)</text>
      `}

      <line x1="${leftX}" y1="${lowerBoundaryY}" x2="${rightX}" y2="${lowerBoundaryY}" stroke="#334155" stroke-width="2"/>

      <!-- Right Panel: Isochrone u(z,t) Plot -->
      <rect x="${isoLeft - 10}" y="${groundY - 15}" width="${isoWidth + 30}" height="${lowerBoundaryY - groundY + 25}" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="${isoLeft + isoWidth / 2 + 5}" y="${groundY + 8}" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Pore Pressure u(z,t)</text>
      <text x="${isoLeft + isoWidth / 2 + 5}" y="${groundY + 22}" fill="#94a3b8" font-size="9" text-anchor="middle">Isochrone @ t = ${Math.round(calc.timeDays)} d</text>

      <line x1="${isoLeft}" y1="${upperSandBottomY}" x2="${isoLeft}" y2="${clayBottomY}" stroke="#64748b" stroke-width="1.5"/>
      <line x1="${isoRight}" y1="${upperSandBottomY}" x2="${isoRight}" y2="${clayBottomY}" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
      <text x="${isoLeft}" y="${clayBottomY + 14}" fill="#94a3b8" font-size="9" text-anchor="middle">u = 0</text>
      <text x="${isoRight}" y="${clayBottomY + 14}" fill="#94a3b8" font-size="9" text-anchor="middle">u = u₀</text>

      <path d="${isochronePathD}" fill="url(#isochroneGrad)" stroke="#38bdf8" stroke-width="2"/>

      <rect x="${isoLeft - 2}" y="${clayBottomY + 22}" width="${isoWidth + 14}" height="30" rx="4" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
      <text x="${isoLeft + (isoWidth + 10) / 2}" y="${clayBottomY + 36}" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">
        💧 Expelled: ${calc.moistureExpelledPct.toFixed(1)}%
      </text>
      <text x="${isoLeft + (isoWidth + 10) / 2}" y="${clayBottomY + 47}" fill="#94a3b8" font-size="8.5" text-anchor="middle">
        ${Math.round(calc.waterVolumeGallons).toLocaleString()} gal water
      </text>
    `;
  }

  // --- STEP-BY-STEP KATEX DERIVATIONS ---
  function renderMathDerivations(calc) {
    if (!dom.mathContainer) return;

    const drainDesc = state.drainageType === 'double'
      ? `Two-Way (Double) Drainage: \\(H_{dr} = \\frac{H}{2} = \\frac{${calc.H}}{2} = ${calc.Hdr.toFixed(1)}\\text{ ft}\\)`
      : `Single Drainage (Impermeable Base): \\(H_{dr} = H = ${calc.H}\\text{ ft}\\)`;

    dom.mathContainer.innerHTML = `
      <div class="derivation-step">
        <div class="step-badge">Step 1</div>
        <div class="step-title">Primary Consolidation Settlement & Expelled Lake Bed Moisture Volume</div>
        <p class="step-desc">
          For the <strong>${state.propertyAcreage.toFixed(1)}-acre</strong> parcel where a historic retention pond and agricultural drainage ditch were previously backfilled with saturated soft sediments, a warehouse building pad of <strong>${state.footprintL} ft × ${state.footprintW} ft = ${calc.padAreaSqFt.toLocaleString()} sq ft</strong> (${calc.padAcres.toFixed(2)} acres) sits directly over the reclaimed lake bed. The permanent structural foundation bearing pressure is \\(\\Delta\\sigma_p = ${calc.deltaP}\\text{ psf}\\):
        </p>
        <div class="math-block">
          \\[
            S_{p,ult} = \\frac{C_c \\cdot H}{1 + e_0} \\log_{10}\\left(\\frac{\\sigma'_{v0} + \\Delta\\sigma_p}{\\sigma'_{v0}}\\right)
          \\]
          \\[
            S_{p,ult} = \\frac{${calc.Cc.toFixed(2)} \\cdot ${calc.H}\\text{ ft}}{1 + ${calc.e0.toFixed(2)}} \\log_{10}\\left(\\frac{${calc.sigmaV0} + ${calc.deltaP}}{${calc.sigmaV0}}\\right)
            = \\frac{${(calc.Cc * calc.H).toFixed(2)}}{${(1 + calc.e0).toFixed(2)}} \\log_{10}\\left(\\frac{${calc.sigmaV0 + calc.deltaP}}{${calc.sigmaV0}}\\right)
          \\]
          \\[
            S_{p,ult} = ${calc.compressionRatio.toFixed(4)} \\cdot \\log_{10}(${((calc.sigmaV0 + calc.deltaP)/calc.sigmaV0).toFixed(4)}) = ${calc.Sp_ult_ft.toFixed(4)}\\text{ ft} = \\mathbf{${calc.Sp_ult_in.toFixed(2)}\\text{ inches}}
          \\]
          \\[
            V_{\\text{water}} = \\text{Pad Area} \\cdot S_{p,ult} = ${calc.padAreaSqFt.toLocaleString()}\\text{ ft}^2 \\cdot ${calc.Sp_ult_ft.toFixed(4)}\\text{ ft}
            = ${Math.round(calc.waterVolumeCuFt).toLocaleString()}\\text{ ft}^3 = \\mathbf{${Math.round(calc.waterVolumeGallons).toLocaleString()}\\text{ Gallons of Moisture}}
          \\]
        </div>
        <p class="step-note">
          📌 <strong>Civil Site Engineering Principle:</strong> Because the former lake and ditch were backfilled with uncompacted fine-grained soils, building directly atop them would cause severe differential settlement. Surcharge preloading forces this entire \\(${calc.Sp_ult_in.toFixed(2)}\\text{ inches}\\) (<strong>${Math.round(calc.waterVolumeGallons).toLocaleString()} gallons</strong>) of trapped pore moisture up and out into perimeter relief ditches before building construction begins.
        </p>
      </div>

      <div class="derivation-step">
        <div class="step-badge">Step 2</div>
        <div class="step-title">Terzaghi Time Factor (\\(T_v\\)) & Degree of Consolidation (\\(U_s\\))</div>
        <p class="step-desc">
          Drainage conditions: ${drainDesc}.<br>
          Coefficient of consolidation \\(c_v = ${calc.cv.toFixed(3)}\\text{ ft}^2/\\text{day}\\), allotted preloading time \\(t = ${Math.round(calc.timeDays)}\\text{ days}\\) (${calc.timeMonths.toFixed(1)} months).
        </p>
        <div class="math-block">
          \\[
            T_v = \\frac{c_v \\cdot t}{H_{dr}^2} = \\frac{${calc.cv.toFixed(3)}\\text{ ft}^2/\\text{day} \\cdot ${Math.round(calc.timeDays)}\\text{ days}}{(${calc.Hdr.toFixed(1)}\\text{ ft})^2}
            = \\frac{${(calc.cv * calc.timeDays).toFixed(2)}}{${(calc.Hdr * calc.Hdr).toFixed(1)}} = \\mathbf{${calc.Tv.toFixed(4)}}
          \\]
          ${calc.Us <= 0.60 ? `
            \\[
              U_s = \\sqrt{\\frac{4 T_v}{\\pi}} = \\sqrt{\\frac{4 \\cdot ${calc.Tv.toFixed(4)}}{\\pi}} = \\sqrt{${((4*calc.Tv)/Math.PI).toFixed(4)}} = \\mathbf{${calc.Us.toFixed(4)}} \\quad (\\mathbf{${calc.moistureExpelledPct.toFixed(1)}\\%})
            \\]
          ` : `
            \\[
              T_v = 1.781 - 0.933 \\log_{10}(100 - 100 U_s) \\implies
              U_s = 1 - 10^{\\frac{1.781 - ${calc.Tv.toFixed(4)}}{0.933} - 2} = \\mathbf{${calc.Us.toFixed(4)}} \\quad (\\mathbf{${calc.moistureExpelledPct.toFixed(1)}\\%})
            \\]
          `}
        </div>
        <p class="step-note">
          Under the total preload load, \\(${calc.moistureExpelledPct.toFixed(1)}\\%\\) of excess pore water pressure will dissipate within the ${Math.round(calc.timeDays)}-day period.
        </p>
      </div>

      <div class="derivation-step">
        <div class="step-badge">Step 3</div>
        <div class="step-title">Required Total Ultimate Settlement & Surcharge Effective Stress (\\(\\Delta\\sigma_s\\))</div>
        <p class="step-desc">
          To achieve \\(S(t) = S_{p,ult} = ${calc.Sp_ult_ft.toFixed(4)}\\text{ ft}\\) when \\(U_s = ${calc.Us.toFixed(4)}\\):
        </p>
        <div class="math-block">
          \\[
            S(t) = U_s \\cdot S_{total,ult} = S_{p,ult} \\implies
            S_{total,ult} = \\frac{S_{p,ult}}{U_s} = \\frac{${calc.Sp_ult_ft.toFixed(4)}\\text{ ft}}{${calc.Us.toFixed(4)}} = \\mathbf{${calc.Stotal_ult_ft.toFixed(4)}\\text{ ft}} \\; (${calc.Stotal_ult_in.toFixed(2)}\\text{ in})
          \\]
          \\[
            \\log_{10}\\left(\\frac{\\sigma'_{v0} + \\Delta\\sigma_p + \\Delta\\sigma_s}{\\sigma'_{v0}}\\right) = \\frac{S_{total,ult}}{\\frac{C_c H}{1+e_0}} = \\frac{${calc.Stotal_ult_ft.toFixed(4)}}{${calc.compressionRatio.toFixed(4)}} = ${(calc.Stotal_ult_ft / calc.compressionRatio).toFixed(5)}
          \\]
          \\[
            \\frac{\\sigma'_{v0} + \\Delta\\sigma_p + \\Delta\\sigma_s}{\\sigma'_{v0}} = 10^{${(calc.Stotal_ult_ft / calc.compressionRatio).toFixed(5)}} = ${(Math.pow(10, calc.Stotal_ult_ft / calc.compressionRatio)).toFixed(4)}
          \\]
          \\[
            \\Delta\\sigma_s = ${calc.sigmaV0} \\cdot ${(Math.pow(10, calc.Stotal_ult_ft / calc.compressionRatio)).toFixed(4)} - ${calc.sigmaV0} - ${calc.deltaP} = \\mathbf{${Math.round(calc.deltaSigmaS)}\\text{ psf}}
          \\]
        </div>
      </div>

      <div class="derivation-step">
        <div class="step-badge">Step 4</div>
        <div class="step-title">Required Surcharge Soil Fill Height, Weight, and Earthwork Logistics</div>
        <p class="step-desc">
          Compacted soil unit weight \\(\\gamma_{fill} = ${calc.gammaFill}\\text{ pcf}\\), Building pad \\(${state.footprintL}\\text{ ft} \\times ${state.footprintW}\\text{ ft} = ${calc.padAreaSqFt.toLocaleString()}\\text{ sq ft}\\):
        </p>
        <div class="math-block">
          \\[
            h_s = \\frac{\\Delta\\sigma_s}{\\gamma_{fill}} = \\frac{${Math.round(calc.deltaSigmaS)}\\text{ psf}}{${calc.gammaFill}\\text{ pcf}} = \\mathbf{${calc.surchargeHeightFt.toFixed(2)}\\text{ ft}}
          \\]
          \\[
            W_{\\text{pad}} = \\text{Pad Area} \\cdot h_s \\cdot \\gamma_{fill} = ${calc.padAreaSqFt.toLocaleString()}\\text{ ft}^2 \\cdot ${calc.surchargeHeightFt.toFixed(2)}\\text{ ft} \\cdot ${calc.gammaFill}\\text{ pcf}
            = \\mathbf{${Math.round(calc.padWeightLbs).toLocaleString()}\\text{ lbs}} = \\mathbf{${Math.round(calc.padWeightTons).toLocaleString()}\\text{ Tons}}
          \\]
          \\[
            \\text{Earthwork Volume} = \\frac{${calc.padAreaSqFt.toLocaleString()} \\cdot ${calc.surchargeHeightFt.toFixed(2)}}{27} = \\mathbf{${Math.round(calc.padVolYd3).toLocaleString()}\\text{ yd}^3}
          \\]
          \\[
            \\text{Tri-Axle Dump Trucks (22 Tons/truck)} = \\frac{${Math.round(calc.padWeightTons).toLocaleString()}\\text{ Tons}}{22\\text{ Tons/truck}}
            = \\mathbf{${Math.ceil(calc.padWeightTons / 22.0).toLocaleString()}\\text{ Truckloads}}
          \\]
        </div>
        <div class="final-answer-box" style="margin-top: 1rem; padding: 1rem; background: rgba(16, 185, 129, 0.15); border: 1.5px solid #10b981; border-radius: 6px;">
          <h4 style="margin: 0 0 0.4rem 0; color: #10b981; font-size: 1rem;">🏁 Dual Solution Summary: Time & Weight</h4>
          <p style="margin: 0; line-height: 1.5; color: #e2e8f0; font-size: 0.95rem;">
            • <strong>Preload Surcharge Time:</strong> \\(t = \\mathbf{${Math.round(calc.timeDays)}\\text{ Days}}\\) (${calc.timeMonths.toFixed(1)} Months)<br>
            • <strong>Required Soil Weight on Pad:</strong> \\(W_s = \\mathbf{${Math.round(calc.padWeightTons).toLocaleString()}\\text{ Tons}}\\) (${Math.round(calc.padWeightLbs).toLocaleString()} lbs)<br>
            • <strong>Required Fill Thickness:</strong> \\(h_s = \\mathbf{${calc.surchargeHeightFt.toFixed(1)}\\text{ ft}}\\) | Surcharge Pressure: \\(\\Delta\\sigma_s = \\mathbf{${Math.round(calc.deltaSigmaS)}\\text{ psf}}\\)
          </p>
        </div>
      </div>
    `;

    if (window.renderMathInElement) {
      window.renderMathInElement(dom.mathContainer, {
        delimiters: [
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  // --- EVENT LISTENERS SETUP ---
  function setupEventListeners() {
    if (dom.openBtn) {
      dom.openBtn.addEventListener('click', openModal);
    }
    if (dom.closeBtn) {
      dom.closeBtn.addEventListener('click', closeModal);
    }
    if (dom.modal) {
      dom.modal.addEventListener('click', function (e) {
        if (e.target === dom.modal) closeModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dom.modal && dom.modal.classList.contains('open')) {
        closeModal();
      }
    });

    if (dom.modeTimeToWeightBtn) {
      dom.modeTimeToWeightBtn.addEventListener('click', function () {
        state.solveMode = 'timeToWeight';
        updateUI();
      });
    }
    if (dom.modeWeightToTimeBtn) {
      dom.modeWeightToTimeBtn.addEventListener('click', function () {
        state.solveMode = 'weightToTime';
        updateUI();
      });
    }

    if (dom.drainageDoubleBtn) {
      dom.drainageDoubleBtn.addEventListener('click', function () {
        state.drainageType = 'double';
        updateUI();
      });
    }
    if (dom.drainageSingleBtn) {
      dom.drainageSingleBtn.addEventListener('click', function () {
        state.drainageType = 'single';
        updateUI();
      });
    }

    if (dom.soilSelect) {
      dom.soilSelect.addEventListener('change', function () {
        const key = this.value;
        if (SOIL_PRESETS[key]) {
          state.selectedSoilKey = key;
          const preset = SOIL_PRESETS[key];
          state.cv = preset.cv;
          state.Cc = preset.Cc;
          state.e0 = preset.e0;
          if (dom.cvSlider) dom.cvSlider.value = preset.cv;
          if (dom.ccSlider) dom.ccSlider.value = preset.Cc;
          if (dom.e0Slider) dom.e0Slider.value = preset.e0;
          updateUI();
        }
      });
    }

    if (dom.fillSelect) {
      dom.fillSelect.addEventListener('change', function () {
        const key = this.value;
        if (FILL_PRESETS[key]) {
          state.selectedFillKey = key;
          state.gammaFill = FILL_PRESETS[key].gammaFill;
          if (dom.gammaSlider) dom.gammaSlider.value = state.gammaFill;
          updateUI();
        }
      });
    }

    if (dom.bermSlopeSelect) {
      dom.bermSlopeSelect.addEventListener('change', function () {
        state.bermSideSlope = parseFloat(this.value);
        updateUI();
      });
    }

    const bindSlider = (sliderEl, stateKey, isFloat, callback) => {
      if (!sliderEl) return;
      sliderEl.addEventListener('input', function () {
        state[stateKey] = isFloat ? parseFloat(this.value) : parseInt(this.value, 10);
        if (callback) callback();
        updateUI();
      });
    };

    bindSlider(dom.acreageSlider, 'propertyAcreage', true);
    bindSlider(dom.footprintLSlider, 'footprintL', false);
    bindSlider(dom.footprintWSlider, 'footprintW', false);

    bindSlider(dom.timeSlider, 'timeDays', false, () => {
      state.solveMode = 'timeToWeight';
    });
    bindSlider(dom.heightSlider, 'surchargeHeightHs', true, () => {
      state.solveMode = 'weightToTime';
    });
    bindSlider(dom.gammaSlider, 'gammaFill', false);
    bindSlider(dom.clayThickSlider, 'clayThicknessH', true);
    bindSlider(dom.cvSlider, 'cv', true);
    bindSlider(dom.ccSlider, 'Cc', true);
    bindSlider(dom.e0Slider, 'e0', true);
    bindSlider(dom.sigma0Slider, 'sigmaV0', false);
    bindSlider(dom.deltaPSlider, 'deltaP', false);

    if (dom.copyReportBtn) {
      dom.copyReportBtn.addEventListener('click', copyCalculationReport);
    }
  }

  function openModal() {
    if (!dom.modal) initDOM();
    if (!dom.modal) return;
    dom.modal.classList.add('open');
    dom.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateUI();
  }

  function closeModal() {
    if (!dom.modal) return;
    dom.modal.classList.remove('open');
    dom.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function copyCalculationReport() {
    const calc = calculateConsolidation();
    const reportText = `SolvedIn6 • PE Exam Geotechnical Engineering Report
Topic: Time Rate of Consolidation & Soil Surcharge Preload Design
Reference: NCEES PE Civil Handbook § 3.3 & § 3.4

--- PROPERTY & BUILDING PAD GEOMETRY ---
Site Civil History: Reclaimed Retention Lake Bed & Backfilled Agricultural Drainage Ditch
Total Property Area: ${state.propertyAcreage.toFixed(1)} Acres (${Math.round(calc.propAreaSqFt).toLocaleString()} sq ft)
Building Pad Footprint: ${state.footprintL} ft × ${state.footprintW} ft (${calc.padAreaSqFt.toLocaleString()} sq ft = ${calc.padAcres.toFixed(2)} Acres)
Building Footprint Coverage: ${calc.padCoveragePct.toFixed(1)}% of site parcel
Expelled Moisture Disposal: Collected via Perimeter Dewatering / Relief Trenches

--- GIVEN SOIL & STRATIGRAPHY PARAMETERS ---
Clay Stratum Thickness: ${calc.H} ft
Drainage Path (Hdr): ${calc.Hdr.toFixed(1)} ft (${state.drainageType === 'double' ? 'Double Drainage' : 'Single Drainage'})
Coefficient of Consolidation (cv): ${calc.cv.toFixed(3)} ft²/day
Compression Index (Cc): ${calc.Cc.toFixed(2)}
Initial Void Ratio (e0): ${calc.e0.toFixed(2)}
Initial Effective Overburden (σ'v0): ${calc.sigmaV0} psf
Permanent Structural Load (Δσp): ${calc.deltaP} psf

--- PORE MOISTURE EXPULSION ---
Primary Structural Settlement Eliminated: ${calc.Sp_ult_in.toFixed(2)} inches (${calc.Sp_ult_ft.toFixed(4)} ft)
Volume of Water Squeezed Out: ${Math.round(calc.waterVolumeGallons).toLocaleString()} Gallons (${Math.round(calc.waterVolumeCuFt).toLocaleString()} ft³ = ${calc.waterVolumeAcreFt.toFixed(2)} acre-ft)

--- SOLUTION RESULTS: TIME & WEIGHT ---
Allotted Preload Time (t): ${Math.round(calc.timeDays)} Days (${calc.timeMonths.toFixed(1)} Months)
Terzaghi Time Factor (Tv): ${calc.Tv.toFixed(4)}
Moisture Dissipation / Consolidation (Us): ${calc.moistureExpelledPct.toFixed(1)}%
Required Surcharge Stress (Δσs): ${Math.round(calc.deltaSigmaS)} psf
Required Surcharge Fill Height (hs): ${calc.surchargeHeightFt.toFixed(2)} ft
Total Surcharge Soil Volume: ${Math.round(calc.padVolYd3).toLocaleString()} yd³ (${Math.round(calc.padVolFt3).toLocaleString()} ft³)
TOTAL SURCHARGE WEIGHT (Ws): ${Math.round(calc.padWeightTons).toLocaleString()} Tons (${Math.round(calc.padWeightLbs).toLocaleString()} lbs)
Earthwork Hauling Fleet: ${Math.ceil(calc.padWeightTons / 22.0).toLocaleString()} Tri-Axle Dump Truckloads (22 tons/truck)

--- SETTLEMENT & PRECONSOLIDATION BREAKDOWN ---
Total Ultimate Settlement under Surcharge: ${calc.Stotal_ult_in.toFixed(2)} inches
Residual Post-Construction Settlement: 0.00 inches (Completely Eliminated)
Induced Overconsolidation Ratio (OCR): ${calc.inducedOcr.toFixed(2)}
`;

    navigator.clipboard.writeText(reportText).then(() => {
      const origText = dom.copyReportBtn.textContent;
      dom.copyReportBtn.textContent = '✅ Copied to Clipboard!';
      setTimeout(() => {
        dom.copyReportBtn.textContent = origText;
      }, 2500);
    }).catch(err => {
      console.error('Failed to copy report:', err);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    setupEventListeners();
  });

  window.ConsolidationCalculator = {
    open: openModal,
    close: closeModal,
    setValues: function (vals) {
      if (vals) Object.assign(state, vals);
      updateUI();
    },
    getState: function () {
      return Object.assign({}, state);
    }
  };

})();
