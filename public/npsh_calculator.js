/**
 * Net Positive Suction Head (NPSH) & Pump Cavitation Interactive Engineering Lab
 * SolvedIn6 PE Exam Study Portal
 *
 * Implements NCEES PE Civil Reference Handbook Section 6.3.8.6:
 *   H_s = H_pa - NPSH_r - H_vp - \sum h_L
 *       = (P_a - P_vapor) / \gamma - NPSH_r - \sum h_L
 *
 * Full interactive simulation of atmospheric pressure (altitude), fluid vapor pressure (temperature),
 * static suction head/lift, flow rate, pipe friction, minor losses, and pump NPSH_r.
 */

(function () {
  'use strict';

  // Presets for Real-World Scenarios
  const PRESETS = {
    municipal_safe: {
      name: '🌊 Municipal Intake (Safe Operation - Coastal)',
      altitude: 0,
      temp: 60,
      staticZ: -6, // 6 ft lift
      flow: 800,
      diameter: 8,
      length: 30,
      material: 'ductile_iron',
      minorK: 2.8, // foot valve + 90 deg elbow + gate valve
      npshR: 9.0,
      autoScale: false,
      marginReq: 3.0,
      desc: 'Typical municipal water treatment plant intake operating with ample cavitation margin.'
    },
    denver_altitude: {
      name: '🏔️ Denver High Altitude Booster (Cavitation Trap)',
      altitude: 5280,
      temp: 75,
      staticZ: -14, // 14 ft lift
      flow: 1000,
      diameter: 6,
      length: 40,
      material: 'welded_steel',
      minorK: 3.2,
      npshR: 12.0,
      autoScale: false,
      marginReq: 3.0,
      desc: 'High elevation drops atmospheric pressure to 12.1 psia. A 14 ft suction lift causes severe cavitation.'
    },
    hot_condensate: {
      name: '🔥 Hot Condensate Boiler Feed (Vapor Pressure Boil)',
      altitude: 500,
      temp: 160,
      staticZ: 0, // 0 ft lift
      flow: 600,
      diameter: 6,
      length: 25,
      material: 'welded_steel',
      minorK: 2.5,
      npshR: 14.0,
      autoScale: false,
      marginReq: 2.5,
      desc: 'At 160°F, water vapor pressure rises to 4.74 psia (11.2 ft head loss), causing violent boiling inside the pump.'
    },
    undersized_pipe: {
      name: '⚠️ Undersized 4-Inch Pipe (Friction Choke)',
      altitude: 200,
      temp: 68,
      staticZ: -6,
      flow: 1100,
      diameter: 4, // 4-inch choked!
      length: 45,
      material: 'cast_iron',
      minorK: 3.5,
      npshR: 10.0,
      autoScale: false,
      marginReq: 2.5,
      desc: 'Excessive velocity (28 ft/s) generates over 20 ft of friction and minor head losses, starving the pump.'
    },
    flooded_suction: {
      name: '💧 Flooded Suction Wet Well (Ideal Design Standard)',
      altitude: 1200,
      temp: 68,
      staticZ: 8, // +8 ft flooded positive head
      flow: 1200,
      diameter: 10,
      length: 20,
      material: 'pvc',
      minorK: 1.5,
      npshR: 11.0,
      autoScale: false,
      marginReq: 3.0,
      desc: 'Water level sits 8 ft above pump centerline. Provides huge cavitation margin and maximum reliability.'
    }
  };

  // Pipe Materials & Hazen-Williams C values
  const PIPE_MATERIALS = {
    pvc: { name: 'PVC / Plastic (Smooth)', C: 150 },
    ductile_iron: { name: 'Ductile Iron (Cement Lined)', C: 130 },
    welded_steel: { name: 'Welded / Seamless Steel', C: 120 },
    cast_iron: { name: 'Cast Iron / Aged Pipe', C: 100 }
  };

  // Current State
  const state = {
    altitudeFt: 0,
    waterTempF: 60,
    staticElevationFt: -6, // negative = suction lift, positive = flooded
    flowGpm: 800,
    pipeDiameterIn: 8,
    pipeLengthFt: 30,
    pipeMaterialKey: 'ductile_iron',
    minorLossK: 2.8,
    npshRequiredFt: 9.0,
    autoScaleNpshR: false,
    npshRBase: 9.0,
    qBase: 800,
    safetyMarginReqFt: 2.5,
    selectedPreset: 'municipal_safe'
  };

  // Physical Property Computations
  function computeFluidAndAtmosphericProps(altFt, tempF) {
    // US Standard Atmosphere for barometric pressure (psia)
    const Pa = 14.696 * Math.pow(1 - 6.87535e-6 * altFt, 5.2559);

    // Water temperature conversion
    const Tc = ((tempF - 32) * 5) / 9;

    // Density of water (lbf/ft^3)
    const gamma = 62.427 * (1 - Math.pow(tempF - 39.2, 2) / 350000);

    // Antoine equation for water vapor pressure (mmHg -> psia)
    const logP = 8.07131 - 1730.63 / (233.426 + Tc);
    const P_mmHg = Math.pow(10, logP);
    const Pvp = P_mmHg * (14.6959 / 760.0);

    // Pressure heads (ft of water)
    const Hpa = (Pa * 144.0) / gamma;
    const Hvp = (Pvp * 144.0) / gamma;

    return { Pa, Pvp, gamma, Hpa, Hvp, Tc };
  }

  // Hydraulic Calculations
  function computeHydraulics(s) {
    const fluid = computeFluidAndAtmosphericProps(s.altitudeFt, s.waterTempF);

    // Pipe geometry
    const Din = s.pipeDiameterIn;
    const Dft = Din / 12.0;
    const area = (Math.PI / 4.0) * Math.pow(Dft, 2);

    // Flow conversions
    const Qgpm = s.flowGpm;
    const Qcfs = Qgpm / 448.831;

    // Velocity & Velocity Head
    const V = Qcfs / area;
    const g = 32.174;
    const hv = Math.pow(V, 2) / (2.0 * g);

    // Friction loss via Hazen-Williams
    const mat = PIPE_MATERIALS[s.pipeMaterialKey] || PIPE_MATERIALS.ductile_iron;
    const C = mat.C;
    const L = s.pipeLengthFt;
    // h_f = 10.44 * L * Q^1.852 / (C^1.852 * D^4.87) with Q in gpm, D in inches
    const hf = (10.44 * L * Math.pow(Qgpm, 1.852)) / (Math.pow(C, 1.852) * Math.pow(Din, 4.87));

    // Minor loss
    const K = s.minorLossK;
    const hm = K * hv;

    // Total suction loss
    const hL = hf + hm;

    // Static suction head / lift
    const zs = s.staticElevationFt;
    const isLift = zs < 0;
    const liftFt = Math.abs(zs);

    // NPSHr calculation (optionally auto-scaled with flow)
    let npshR = s.npshRequiredFt;
    if (s.autoScaleNpshR && s.qBase > 0) {
      npshR = s.npshRBase * Math.pow(Qgpm / s.qBase, 1.8);
      if (npshR < 2.0) npshR = 2.0;
    }

    // NPSHa (Net Positive Suction Head Available)
    // NPSHa = H_pa + z_s - H_vp - \sum h_L
    // Note: if suction lift, zs is negative, so + zs subtracts the lift!
    const npshA = fluid.Hpa + zs - fluid.Hvp - hL;

    // NCEES Formula Section 6.3.8.6:
    // H_s = H_pa - NPSH_r - H_vp - \sum h_L
    //     = (P_a - P_vapor) / \gamma - NPSH_r - \sum h_L
    // H_s is the MAXIMUM ALLOWABLE STATIC SUCTION LIFT!
    const Hs_ncees = fluid.Hpa - npshR - fluid.Hvp - hL;

    // Cavitation Margin & Metrics
    const margin = npshA - npshR;
    const ratio = npshR > 0 ? npshA / npshR : 99;

    let status = 'SAFE';
    let statusClass = 'status-safe';
    let statusLabel = 'SAFE • CAVITATION FREE';
    let statusDesc = 'Available suction head comfortably exceeds pump requirement.';

    if (margin < 0) {
      status = 'CAVITATING';
      statusClass = 'status-danger';
      statusLabel = '⚠️ SEVERE CAVITATION ACTIVE';
      statusDesc = 'Impeller eye pressure dropped to vapor pressure! Pitting, noise & damage occurring.';
    } else if (margin < s.safetyMarginReqFt || ratio < 1.25) {
      status = 'MARGINAL';
      statusClass = 'status-warning';
      statusLabel = '⚡ MARGINAL / INCIPIENT CAVITATION';
      statusDesc = 'Buffer below recommended safety margin. Pressure dips or flow surges may induce cavitation.';
    }

    return {
      fluid,
      Din,
      Dft,
      area,
      Qgpm,
      Qcfs,
      V,
      hv,
      C,
      L,
      hf,
      K,
      hm,
      hL,
      zs,
      isLift,
      liftFt,
      npshR,
      npshA,
      Hs_ncees,
      margin,
      ratio,
      status,
      statusClass,
      statusLabel,
      statusDesc
    };
  }

  // Main UI Update Function
  function recalculateAndRender() {
    const res = computeHydraulics(state);

    updateKpis(res);
    updateControlsFeedback(res);
    renderSvgSchematic(res);
    renderWaterfallChart(res);
    updateKaTeXDerivations(res);
  }

  // Update KPI Top Bar
  function updateKpis(res) {
    const elNpshA = document.getElementById('npshKpiAvailable');
    const elNpshR = document.getElementById('npshKpiRequired');
    const elMargin = document.getElementById('npshKpiMargin');
    const elHs = document.getElementById('npshKpiHsNcees');
    const elStatus = document.getElementById('npshKpiStatusBadge');

    if (elNpshA) {
      elNpshA.textContent = `${res.npshA.toFixed(2)} ft`;
      elNpshA.className = `kpi-val ${res.status === 'CAVITATING' ? 'text-danger' : res.status === 'MARGINAL' ? 'text-warning' : 'text-success'}`;
    }
    if (elNpshR) {
      elNpshR.textContent = `${res.npshR.toFixed(2)} ft`;
    }
    if (elMargin) {
      const sign = res.margin >= 0 ? '+' : '';
      elMargin.textContent = `${sign}${res.margin.toFixed(2)} ft (${res.ratio.toFixed(2)}×)`;
      elMargin.className = `kpi-val ${res.status === 'CAVITATING' ? 'text-danger' : res.status === 'MARGINAL' ? 'text-warning' : 'text-success'}`;
    }
    if (elHs) {
      elHs.textContent = `${res.Hs_ncees.toFixed(2)} ft`;
      elHs.title = res.Hs_ncees >= 0
        ? `Maximum allowable suction lift is ${res.Hs_ncees.toFixed(2)} ft.`
        : `Pump requires flooded suction of at least ${Math.abs(res.Hs_ncees).toFixed(2)} ft!`;
    }
    if (elStatus) {
      elStatus.textContent = res.statusLabel;
      elStatus.className = `npsh-status-badge ${res.statusClass}`;
    }
  }

  // Update Controls Value Badges & Helper Text
  function updateControlsFeedback(res) {
    // Altitude
    const altText = document.getElementById('valNpshAltitude');
    if (altText) altText.textContent = `${state.altitudeFt.toLocaleString()} ft`;
    const paFeedback = document.getElementById('feedbackNpshAltitude');
    if (paFeedback) paFeedback.textContent = `Pa = ${res.fluid.Pa.toFixed(2)} psia • Hpa = ${res.fluid.Hpa.toFixed(2)} ft`;

    // Temperature
    const tempText = document.getElementById('valNpshTemp');
    if (tempText) tempText.textContent = `${state.waterTempF}°F`;
    const vpFeedback = document.getElementById('feedbackNpshTemp');
    if (vpFeedback) vpFeedback.textContent = `Pvp = ${res.fluid.Pvp.toFixed(3)} psia • Hvp = ${res.fluid.Hvp.toFixed(2)} ft`;

    // Static Z
    const zText = document.getElementById('valNpshStaticZ');
    if (zText) {
      const isFlooded = state.staticElevationFt >= 0;
      zText.textContent = `${isFlooded ? '+' : ''}${state.staticElevationFt.toFixed(1)} ft (${isFlooded ? 'Flooded' : 'Suction Lift'})`;
      zText.className = `control-val-badge ${isFlooded ? 'green' : 'amber'}`;
    }

    // Flow
    const flowText = document.getElementById('valNpshFlow');
    if (flowText) flowText.textContent = `${state.flowGpm.toLocaleString()} gpm (${res.Qcfs.toFixed(2)} cfs)`;

    // Diameter & Velocity
    const diaText = document.getElementById('valNpshDiameter');
    if (diaText) diaText.textContent = `${state.pipeDiameterIn}" (${state.pipeDiameterIn * 25.4} mm)`;
    const velFeedback = document.getElementById('feedbackNpshDiameter');
    if (velFeedback) {
      const v = res.V;
      let velClass = 'text-success';
      let velNote = 'Good suction velocity';
      if (v > 10.0) {
        velClass = 'text-danger';
        velNote = 'Excessive! (>10 fps causes high friction)';
      } else if (v > 7.0) {
        velClass = 'text-warning';
        velNote = 'High (>7 fps)';
      } else if (v < 2.0) {
        velClass = 'text-muted';
        velNote = 'Low (<2 fps, sedimentation risk)';
      }
      velFeedback.innerHTML = `Velocity: <strong class="${velClass}">${v.toFixed(2)} ft/s</strong> • ${velNote}`;
    }

    // Pipe Length
    const lenText = document.getElementById('valNpshLength');
    if (lenText) lenText.textContent = `${state.pipeLengthFt} ft`;

    // Minor loss K
    const kText = document.getElementById('valNpshMinorK');
    if (kText) kText.textContent = `K = ${state.minorLossK.toFixed(2)}`;
    const lossFeedback = document.getElementById('feedbackNpshLosses');
    if (lossFeedback) {
      lossFeedback.innerHTML = `Friction hf: <strong>${res.hf.toFixed(2)}'</strong> + Minor hm: <strong>${res.hm.toFixed(2)}'</strong> = Total <strong>${res.hL.toFixed(2)} ft</strong>`;
    }

    // NPSHr
    const rText = document.getElementById('valNpshR');
    if (rText) rText.textContent = `${res.npshR.toFixed(1)} ft`;

    // Margin Req
    const mReqText = document.getElementById('valNpshSafetyMargin');
    if (mReqText) mReqText.textContent = `${state.safetyMarginReqFt.toFixed(1)} ft`;
  }

  // Render SVG Cross-Section Schematic
  function renderSvgSchematic(res) {
    const svg = document.getElementById('npshDiagramSvg');
    if (!svg) return;

    const isCavitating = res.status === 'CAVITATING';
    const isMarginal = res.status === 'MARGINAL';

    // SVG coordinates setup: ViewBox 0 0 760 480
    const pumpX = 520;
    const pumpY = 220;
    const impellerRadius = 32;

    const scaleY = 7.0; // 7 pixels per foot
    let waterY = pumpY - res.zs * scaleY;
    if (waterY > 410) waterY = 410;
    if (waterY < 90) waterY = 90;

    const tankX1 = 60;
    const tankX2 = 290;
    const tankBottomY = 430;

    const pipeX = 200;
    const footValveY = waterY + 45 > 415 ? 415 : waterY + 45;
    const pipeThickness = Math.max(6, Math.min(22, res.Din * 1.5));

    // Dynamic cavitation bubble particles
    let bubbleElements = '';
    if (isCavitating) {
      for (let i = 0; i < 14; i++) {
        const bx = pumpX + (Math.sin(i * 1.3) * 16);
        const by = pumpY + (Math.cos(i * 1.3) * 16);
        const br = 2 + (i % 4) * 1.5;
        const opac = 0.5 + (i % 5) * 0.1;
        bubbleElements += `<circle cx="${bx}" cy="${by}" r="${br}" fill="#ffffff" stroke="#ef4444" stroke-width="1.2" opacity="${opac}">
          <animate attributeName="r" values="${br};${br + 3};0" dur="${0.35 + (i % 4) * 0.15}s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="${opac};1;0" dur="${0.35 + (i % 4) * 0.15}s" repeatCount="indefinite" />
        </circle>`;
      }
    } else if (isMarginal) {
      for (let i = 0; i < 5; i++) {
        const bx = pumpX + (Math.sin(i * 2.1) * 12);
        const by = pumpY + (Math.cos(i * 2.1) * 12);
        bubbleElements += `<circle cx="${bx}" cy="${by}" r="2" fill="#fef08a" stroke="#f59e0b" stroke-width="0.8" opacity="0.6">
          <animate attributeName="opacity" values="0.2;0.8;0" dur="0.8s" repeatCount="indefinite" />
        </circle>`;
      }
    }

    // Vibration ripple lines if cavitating
    let vibrationRipples = '';
    if (isCavitating) {
      vibrationRipples = `
        <circle cx="${pumpX}" cy="${pumpY}" r="48" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,4" opacity="0.8">
          <animate attributeName="r" values="42;60" dur="0.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0" dur="0.6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="${pumpX}" cy="${pumpY}" r="56" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6">
          <animate attributeName="r" values="50;72" dur="0.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0" dur="0.8s" repeatCount="indefinite"/>
        </circle>
      `;
    }

    const pipeFluidColor = isCavitating ? 'url(#cavitatingFluidGrad)' : isMarginal ? '#f59e0b' : '#38bdf8';

    svg.innerHTML = `
      <defs>
        <linearGradient id="waterBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#0369a1" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="cavitatingFluidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="70%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#ef4444"/>
        </linearGradient>
        <linearGradient id="pumpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <pattern id="soilHatchNpsh" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(100, 116, 139, 0.25)" stroke-width="2"/>
        </pattern>
      </defs>

      <rect x="0" y="0" width="760" height="480" fill="transparent"/>

      <!-- Atmospheric Pressure Indicator Cloud / Banner -->
      <g transform="translate(40, 25)">
        <rect x="0" y="0" width="280" height="40" rx="8" fill="rgba(30, 41, 59, 0.85)" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="14" y="24" fill="#38bdf8" font-size="12" font-weight="700">☁️ Patm (${state.altitudeFt} ft):</text>
        <text x="130" y="24" fill="#f8fafc" font-size="13" font-weight="800">${res.fluid.Pa.toFixed(2)} psia (${res.fluid.Hpa.toFixed(1)} ft head)</text>
      </g>

      <!-- Fluid Operating Temp Banner -->
      <g transform="translate(340, 25)">
        <rect x="0" y="0" width="260" height="40" rx="8" fill="rgba(30, 41, 59, 0.85)" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="14" y="24" fill="#f59e0b" font-size="12" font-weight="700">🌡️ Water Temp (${state.waterTempF}°F):</text>
        <text x="165" y="24" fill="#f8fafc" font-size="13" font-weight="800">Hvp = ${res.fluid.Hvp.toFixed(2)} ft</text>
      </g>

      <!-- Foundation / Sump Concrete Base -->
      <rect x="${tankX1 - 15}" y="${waterY}" width="${tankX2 - tankX1 + 30}" height="${tankBottomY - waterY + 20}" fill="url(#soilHatchNpsh)"/>
      <rect x="${tankX1}" y="${waterY}" width="${tankX2 - tankX1}" height="${tankBottomY - waterY}" fill="url(#waterBodyGrad)" stroke="#0284c7" stroke-width="2"/>
      
      <!-- Water Surface Waves -->
      <line x1="${tankX1 - 5}" y1="${waterY}" x2="${tankX2 + 5}" y2="${waterY}" stroke="#38bdf8" stroke-width="3"/>
      <polygon points="${tankX1 + 20},${waterY - 8} ${tankX1 + 35},${waterY} ${tankX1 + 20},${waterY}" fill="#38bdf8" opacity="0.6"/>
      <text x="${tankX1 + 15}" y="${waterY - 12}" fill="#38bdf8" font-size="11" font-weight="700">Free Water Surface</text>

      <!-- Concrete Pump Pedestal -->
      <rect x="${pumpX - 45}" y="260" width="110" height="190" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
      <rect x="${pumpX - 55}" y="255" width="130" height="12" rx="3" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
      <text x="${pumpX + 10}" y="320" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="middle">Pump Station</text>
      <text x="${pumpX + 10}" y="336" fill="#64748b" font-size="10" text-anchor="middle">Base Pedestal</text>

      <!-- Suction Piping Structure -->
      <!-- Submerged Foot Valve & Strainer -->
      <rect x="${pipeX - pipeThickness}" y="${footValveY - 16}" width="${pipeThickness * 2}" height="24" rx="4" fill="#64748b" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="${pipeX - pipeThickness - 2}" y1="${footValveY - 6}" x2="${pipeX + pipeThickness + 2}" y2="${footValveY - 6}" stroke="#0f172a" stroke-width="2"/>
      <line x1="${pipeX - pipeThickness - 2}" y1="${footValveY}" x2="${pipeX + pipeThickness + 2}" y2="${footValveY}" stroke="#0f172a" stroke-width="2"/>
      <text x="${pipeX - pipeThickness - 10}" y="${footValveY}" fill="#94a3b8" font-size="9" text-anchor="end">Foot Valve (K=2.0)</text>

      <!-- Vertical & Horizontal Suction Leg -->
      <path d="M ${pipeX} ${footValveY - 16} L ${pipeX} ${pumpY} L ${pumpX - impellerRadius} ${pumpY}" 
            fill="none" 
            stroke="${pipeFluidColor}" 
            stroke-width="${pipeThickness}" 
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.9"/>
      
      <!-- Suction Pipe Outer Casing lines -->
      <path d="M ${pipeX - pipeThickness / 2} ${footValveY - 16} L ${pipeX - pipeThickness / 2} ${pumpY - pipeThickness / 2} L ${pumpX - impellerRadius} ${pumpY - pipeThickness / 2}" 
            fill="none" stroke="#64748b" stroke-width="1.5"/>
      <path d="M ${pipeX + pipeThickness / 2} ${footValveY - 16} L ${pipeX + pipeThickness / 2} ${pumpY + pipeThickness / 2} L ${pumpX - impellerRadius} ${pumpY + pipeThickness / 2}" 
            fill="none" stroke="#64748b" stroke-width="1.5"/>

      <!-- Dynamic Flow Direction Arrows inside pipe -->
      <g stroke="#ffffff" stroke-width="2" fill="none" opacity="0.8">
        <path d="M ${pipeX} ${footValveY - 30} L ${pipeX} ${footValveY - 55}"/>
        <polygon points="${pipeX - 3},${footValveY - 50} ${pipeX + 3},${footValveY - 50} ${pipeX},${footValveY - 60}" fill="#ffffff"/>
        <path d="M ${pipeX + 40} ${pumpY} L ${pipeX + 80} ${pumpY}"/>
        <polygon points="${pipeX + 75},${pumpY - 3} ${pipeX + 75},${pumpY + 3} ${pipeX + 85},${pumpY}" fill="#ffffff"/>
      </g>

      <!-- Velocity & Friction Annotation on Suction Line -->
      <rect x="235" y="${pumpY - 38}" width="220" height="24" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" stroke-width="1"/>
      <text x="345" y="${pumpY - 22}" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">
        D = ${state.pipeDiameterIn}" | V = ${res.V.toFixed(2)} fps | ΣhL = ${res.hL.toFixed(2)}'
      </text>

      <!-- Pump Centerline Horizontal Reference -->
      <line x1="30" y1="${pumpY}" x2="680" y2="${pumpY}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>
      <text x="685" y="${pumpY + 4}" fill="#94a3b8" font-size="10">Pump Centerline</text>

      <!-- Static Suction Lift / Head Dimension Arrow -->
      <g stroke="#f59e0b" stroke-width="1.5">
        <line x1="38" y1="${pumpY}" x2="38" y2="${waterY}"/>
        <line x1="30" y1="${pumpY}" x2="46" y2="${pumpY}"/>
        <line x1="30" y1="${waterY}" x2="46" y2="${waterY}"/>
      </g>
      <text x="44" y="${pumpY + (waterY - pumpY) / 2 + 4}" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="start">
        ${res.isLift ? `Lift: ${res.liftFt.toFixed(1)}'` : `Flooded: +${Math.abs(res.zs).toFixed(1)}'`}
      </text>

      <!-- Centrifugal Pump Volute Casing -->
      <circle cx="${pumpX}" cy="${pumpY}" r="${impellerRadius + 14}" fill="url(#pumpGrad)" stroke="${isCavitating ? '#ef4444' : isMarginal ? '#f59e0b' : '#38bdf8'}" stroke-width="${isCavitating ? 3.5 : 2}"/>
      
      <!-- Impeller Blades with dynamic rotation -->
      <g transform="translate(${pumpX}, ${pumpY})">
        <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#94a3b8" stroke-width="1.5"/>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${Math.max(0.2, 1200 / state.flowGpm)}s" repeatCount="indefinite"/>
          <line x1="0" y1="-28" x2="0" y2="28" stroke="#cbd5e1" stroke-width="3"/>
          <line x1="-28" y1="0" x2="28" y2="0" stroke="#cbd5e1" stroke-width="3"/>
          <line x1="-20" y1="-20" x2="20" y2="20" stroke="#cbd5e1" stroke-width="2.5"/>
          <line x1="20" y1="-20" x2="-20" y2="20" stroke="#cbd5e1" stroke-width="2.5"/>
        </g>
      </g>

      <!-- Discharge Pipe Upwards -->
      <path d="M ${pumpX + 22} ${pumpY - 14} L ${pumpX + 22} 90 L 730 90" fill="none" stroke="#64748b" stroke-width="12" stroke-linecap="round"/>
      <path d="M ${pumpX + 22} ${pumpY - 14} L ${pumpX + 22} 90 L 730 90" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round"/>
      <text x="660" y="80" fill="#38bdf8" font-size="10" font-weight="700">Discharge →</text>

      <!-- Cavitation Bubbles & Shockwaves -->
      ${vibrationRipples}
      ${bubbleElements}

      <!-- Status Overlay Badge at Pump -->
      <g transform="translate(${pumpX - 90}, ${pumpY + 60})">
        <rect x="0" y="0" width="200" height="34" rx="6" fill="rgba(15, 23, 42, 0.95)" stroke="${isCavitating ? '#ef4444' : isMarginal ? '#f59e0b' : '#10b981'}" stroke-width="1.5"/>
        <text x="100" y="21" fill="${isCavitating ? '#ef4444' : isMarginal ? '#f59e0b' : '#10b981'}" font-size="11" font-weight="800" text-anchor="middle">
          ${isCavitating ? '⚠️ CAVITATION IN PROGRESS!' : isMarginal ? '⚡ MARGINAL HEAD BUFFER' : '✅ CAVITATION FREE'}
        </text>
      </g>

      <!-- Diagnostics Banner at Bottom -->
      <g transform="translate(180, 425)">
        <rect x="0" y="0" width="460" height="32" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#475569" stroke-width="1"/>
        <text x="230" y="20" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="middle">
          NPSHa: <tspan fill="${isCavitating ? '#ef4444' : '#10b981'}" font-weight="800">${res.npshA.toFixed(2)}'</tspan> vs NPSHr: <tspan fill="#38bdf8" font-weight="800">${res.npshR.toFixed(2)}'</tspan> • Margin: <tspan fill="${isCavitating ? '#ef4444' : '#10b981'}" font-weight="800">${res.margin >= 0 ? '+' : ''}${res.margin.toFixed(2)} ft</tspan>
        </text>
      </g>
    `;
  }

  // Render Head Waterfall Balance Chart
  function renderWaterfallChart(res) {
    const container = document.getElementById('npshWaterfallContainer');
    if (!container) return;

    const Hpa = res.fluid.Hpa;
    const Hvp = res.fluid.Hvp;
    const lift = res.isLift ? res.liftFt : 0;
    const flooded = !res.isLift ? Math.abs(res.zs) : 0;
    const losses = res.hL;
    const npshA = res.npshA;
    const npshR = res.npshR;
    const margin = res.margin;

    const maxBarHead = Math.max(45, Hpa + flooded + 5);

    function pct(val) {
      return Math.max(0, Math.min(100, (Math.abs(val) / maxBarHead) * 100)).toFixed(1);
    }

    container.innerHTML = `
      <div class="waterfall-summary-row">
        <div class="waterfall-col">
          <span class="wf-label">Gross Suction Energy (Atmospheric)</span>
          <div class="wf-bar-wrap">
            <div class="wf-bar positive" style="width: ${pct(Hpa)}%;">
              <span class="wf-val">+${Hpa.toFixed(1)} ft (Hpa)</span>
            </div>
          </div>
        </div>
      </div>

      ${flooded > 0 ? `
      <div class="waterfall-summary-row">
        <div class="waterfall-col">
          <span class="wf-label">Positive Flooded Suction Elevation (+zs)</span>
          <div class="wf-bar-wrap">
            <div class="wf-bar positive-alt" style="width: ${pct(flooded)}%;">
              <span class="wf-val">+${flooded.toFixed(1)} ft</span>
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="waterfall-deductions-box">
        <div class="deductions-title">System Losses & Suction Deductions:</div>
        
        <div class="waterfall-item-row">
          <span class="wf-sublabel">Vapor Pressure Head (-Hvp):</span>
          <div class="wf-bar-wrap">
            <div class="wf-bar negative" style="width: ${pct(Hvp)}%;">
              <span class="wf-val">-${Hvp.toFixed(2)} ft</span>
            </div>
          </div>
        </div>

        ${lift > 0 ? `
        <div class="waterfall-item-row">
          <span class="wf-sublabel">Static Suction Lift (-z_lift):</span>
          <div class="wf-bar-wrap">
            <div class="wf-bar negative-alt" style="width: ${pct(lift)}%;">
              <span class="wf-val">-${lift.toFixed(1)} ft</span>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="waterfall-item-row">
          <span class="wf-sublabel">Piping Friction & Minor Losses (-ΣhL):</span>
          <div class="wf-bar-wrap">
            <div class="wf-bar negative" style="width: ${pct(losses)}%;">
              <span class="wf-val">-${losses.toFixed(2)} ft</span>
            </div>
          </div>
        </div>
      </div>

      <div class="waterfall-comparison-row">
        <div class="wf-comp-card ${res.status === 'CAVITATING' ? 'danger' : 'success'}">
          <div class="wf-comp-header">
            <span>Net Head Available (NPSHa)</span>
            <strong class="wf-big-num">${npshA.toFixed(2)} ft</strong>
          </div>
          <div class="wf-sub-bar-bg">
            <div class="wf-sub-bar ${res.status === 'CAVITATING' ? 'bg-danger' : 'bg-success'}" style="width: ${pct(npshA)}%;"></div>
          </div>
        </div>

        <div class="wf-comp-card neutral">
          <div class="wf-comp-header">
            <span>Pump Required (NPSHr)</span>
            <strong class="wf-big-num">${npshR.toFixed(2)} ft</strong>
          </div>
          <div class="wf-sub-bar-bg">
            <div class="wf-sub-bar bg-primary" style="width: ${pct(npshR)}%;"></div>
          </div>
        </div>

        <div class="wf-comp-card ${margin >= 0 ? 'accent' : 'danger'}">
          <div class="wf-comp-header">
            <span>Net Safety Margin (ΔNPSH)</span>
            <strong class="wf-big-num">${margin >= 0 ? '+' : ''}${margin.toFixed(2)} ft</strong>
          </div>
          <div class="wf-margin-status">
            ${margin >= res.safetyMarginReqFt ? '✅ Meets safety threshold' : margin >= 0 ? '⚠️ Sub-optimal buffer' : '❌ CAVITATION: -' + Math.abs(margin).toFixed(2) + ' ft deficit'}
          </div>
        </div>
      </div>
    `;
  }

  // Update Dynamic KaTeX Step-by-Step Derivations
  function updateKaTeXDerivations(res) {
    const container = document.getElementById('npshMathContainer');
    if (!container) return;

    const fluid = res.fluid;
    const isCav = res.status === 'CAVITATING';

    const mathHtml = `
      <!-- Step 1: Environmental & Atmospheric Properties -->
      <div class="helical-step-card">
        <h4>Step 1: Environmental Atmospheric & Liquid Vapor Pressure Properties</h4>
        <p style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:0.5rem;">
          Calculate atmospheric pressure at <strong>${state.altitudeFt} ft altitude</strong> and water vapor pressure at <strong>${state.waterTempF}°F</strong>:
        </p>
        <div class="math-block">\\[
          P_a = 14.696 \\times \\left(1 - 6.875 \\times 10^{-6} \\cdot ${state.altitudeFt}\\right)^{5.2559} = ${fluid.Pa.toFixed(3)} \\text{ psia}
        \\]</div>
        <div class="math-block">\\[
          H_{pa} = \\frac{P_a \\times 144}{\\gamma} = \\frac{${fluid.Pa.toFixed(3)} \\times 144}{${fluid.gamma.toFixed(2)}} = \\mathbf{${fluid.Hpa.toFixed(2)} \\text{ ft of liquid}}
        \\]</div>
        <div class="math-block">\\[
          P_{\\text{vapor}} (${state.waterTempF}^\\circ\\text{F}) = ${fluid.Pvp.toFixed(3)} \\text{ psia} \\implies H_{vp} = \\frac{P_{\\text{vapor}} \\times 144}{\\gamma} = \\mathbf{${fluid.Hvp.toFixed(2)} \\text{ ft}}
        \\]</div>
      </div>

      <!-- Step 2: Suction Hydraulics & Losses -->
      <div class="helical-step-card">
        <h4>Step 2: Suction Pipeline Velocity & Head Loss Analysis (\\(\\sum h_L\\))</h4>
        <div class="math-block">\\[
          A = \\frac{\\pi}{4} \\left(\\frac{${state.pipeDiameterIn}}{12}\\right)^2 = ${res.area.toFixed(3)} \\text{ ft}^2, \\quad Q = ${state.flowGpm} \\text{ gpm} = ${res.Qcfs.toFixed(3)} \\text{ cfs}
        \\]</div>
        <div class="math-block">\\[
          V = \\frac{Q}{A} = \\frac{${res.Qcfs.toFixed(3)}}{${res.area.toFixed(3)}} = \\mathbf{${res.V.toFixed(2)} \\text{ ft/s}}, \\quad \\frac{V^2}{2g} = \\frac{(${res.V.toFixed(2)})^2}{2(32.2)} = ${res.hv.toFixed(3)} \\text{ ft}
        \\]</div>
        <div class="math-block">\\[
          h_f = \\frac{10.44 \\cdot L \\cdot Q^{1.852}}{C^{1.852} \\cdot D^{4.87}} = \\frac{10.44 \\cdot (${state.pipeLengthFt}) \\cdot (${state.flowGpm})^{1.852}}{(${res.C})^{1.852} \\cdot (${state.pipeDiameterIn})^{4.87}} = ${res.hf.toFixed(2)} \\text{ ft}
        \\]</div>
        <div class="math-block">\\[
          h_m = \\sum K \\cdot \\frac{V^2}{2g} = ${state.minorLossK.toFixed(2)} \\times ${res.hv.toFixed(3)} = ${res.hm.toFixed(2)} \\text{ ft}
        \\]</div>
        <div class="math-block">\\[
          \\sum h_L = h_f + h_m = ${res.hf.toFixed(2)} + ${res.hm.toFixed(2)} = \\mathbf{${res.hL.toFixed(2)} \\text{ ft}}
        \\]</div>
      </div>

      <!-- Step 3: NCEES Handbook Formula § 6.3.8.6 -->
      <div class="helical-step-card highlight">
        <h4>Step 3: NCEES PE Reference Handbook Formula (§ 6.3.8.6 Pump Cavitation)</h4>
        <p style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:0.5rem;">
          The official NCEES handbook specifies the maximum allowable static suction head/lift \\(H_s\\):
        </p>
        <div class="math-block">\\[
          H_s = \\frac{P_a - P_{\\text{vapor}}}{\\gamma} - \\text{NPSH}_r - \\sum h_L
        \\]</div>
        <div class="math-block">\\[
          H_s = \\frac{(${fluid.Pa.toFixed(3)} - ${fluid.Pvp.toFixed(3)}) \\times 144}{${fluid.gamma.toFixed(2)}} - ${res.npshR.toFixed(2)} - ${res.hL.toFixed(2)}
        \\]</div>
        <div class="math-block">\\[
          H_s = (${fluid.Hpa.toFixed(2)} - ${fluid.Hvp.toFixed(2)}) - ${res.npshR.toFixed(2)} - ${res.hL.toFixed(2)} = \\mathbf{${res.Hs_ncees.toFixed(2)} \\text{ ft}}
        \\]</div>
        <div class="ncees-formula-note" style="margin-top:0.6rem; padding:0.6rem 0.8rem; background:var(--bg-elevated); border-left:3px solid var(--primary); border-radius:4px; font-size:0.85rem;">
          <strong>NCEES Meaning:</strong> \\(H_s\\) is the <em>maximum permissible static suction lift</em> above the liquid surface.
          ${res.isLift ? `
            Actual static lift is \\(z_{\\text{lift}} = ${res.liftFt.toFixed(2)}\\text{ ft}\\).
            Since \\(z_{\\text{lift}} ${res.liftFt <= res.Hs_ncees ? '\\le' : '>' } H_s (${res.Hs_ncees.toFixed(2)}\\text{ ft})\\),
            the pump <strong>${res.liftFt <= res.Hs_ncees ? 'WILL NOT CAVITATE' : 'WILL CAVITATE SEVERELY'}</strong>.
          ` : `
            Liquid level is flooded at \\(+${Math.abs(res.zs).toFixed(2)}\\text{ ft}\\). Operating far above minimum requirement.
          `}
        </div>
      </div>

      <!-- Step 4: Net Positive Suction Head Available (NPSHa) & Margin -->
      <div class="helical-step-card ${isCav ? 'danger-border' : ''}">
        <h4>Step 4: Net Positive Suction Head Available (\\(\\text{NPSH}_a\\)) & Safety Margin</h4>
        <div class="math-block">\\[
          \\text{NPSH}_a = H_{pa} ${res.zs >= 0 ? '+' : '-'} ${Math.abs(res.zs).toFixed(2)} - H_{vp} - \\sum h_L
        \\]</div>
        <div class="math-block">\\[
          \\text{NPSH}_a = ${fluid.Hpa.toFixed(2)} ${res.zs >= 0 ? '+' : '-'} ${Math.abs(res.zs).toFixed(2)} - ${fluid.Hvp.toFixed(2)} - ${res.hL.toFixed(2)} = \\mathbf{${res.npshA.toFixed(2)} \\text{ ft}}
        \\]</div>
        <div class="math-block">\\[
          \\Delta\\text{NPSH} = \\text{NPSH}_a - \\text{NPSH}_r = ${res.npshA.toFixed(2)} - ${res.npshR.toFixed(2)} = \\mathbf{${res.margin >= 0 ? '+' : ''}${res.margin.toFixed(2)} \\text{ ft}} \\quad \\left(\\text{Ratio } = ${res.ratio.toFixed(2)}\\times\\right)
        \\]</div>
        
        <!-- Engineering Verdict & Recommendations -->
        <div style="margin-top:0.8rem; padding:0.75rem; border-radius:6px; background:${isCav ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)'}; border:1px solid ${isCav ? '#ef4444' : '#10b981'};">
          <strong style="color:${isCav ? '#ef4444' : '#10b981'}; font-size:0.95rem;">
            ${isCav ? '❌ ENGINEERING FAILURE: CAVITATION ACTIVE' : '✅ HYDRAULIC VERDICT: SAFE & CAVITATION-FREE'}
          </strong>
          <p style="font-size:0.85rem; color:var(--text-primary); margin-top:0.35rem;">
            ${isCav ? `
              The suction eye pressure drops below vapor pressure, generating vapor bubbles that implode upon reaching high-pressure impeller vanes.
              <br><strong>Mitigation Strategy:</strong>
              1. <em>Increase Suction Diameter</em>: Upsizing from ${state.pipeDiameterIn}" to ${state.pipeDiameterIn + 2}" cuts friction losses significantly.
              2. <em>Lower the Pump</em>: Decrease static suction lift from ${res.liftFt.toFixed(1)}' to ≤ ${Math.max(0, res.Hs_ncees).toFixed(1)}'.
              3. <em>Select Lower NPSHr Pump</em>: Install an impeller with larger eye area or inducer.
            ` : `
              The suction pressure at the pump impeller eye remains well above vapor pressure with a safety margin of ${res.margin.toFixed(2)} ft (recommended minimum is ${state.safetyMarginReqFt.toFixed(1)} ft).
            `}
          </p>
        </div>
      </div>
    `;

    container.innerHTML = mathHtml;

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

  // Bind Event Listeners
  function initControls() {
    const presetSelect = document.getElementById('npshPresetSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        applyPreset(e.target.value);
      });
    }

    bindSlider('npshAltitude', (val) => { state.altitudeFt = parseFloat(val); });
    bindSlider('npshTemp', (val) => { state.waterTempF = parseFloat(val); });
    bindSlider('npshStaticZ', (val) => { state.staticElevationFt = parseFloat(val); });
    bindSlider('npshFlow', (val) => { state.flowGpm = parseFloat(val); });
    bindSlider('npshDiameter', (val) => { state.pipeDiameterIn = parseFloat(val); });
    bindSlider('npshLength', (val) => { state.pipeLengthFt = parseFloat(val); });

    const matSelect = document.getElementById('npshMaterial');
    if (matSelect) {
      matSelect.addEventListener('change', (e) => {
        state.pipeMaterialKey = e.target.value;
        recalculateAndRender();
      });
    }

    bindSlider('npshMinorK', (val) => { state.minorLossK = parseFloat(val); });

    bindSlider('npshR', (val) => {
      state.npshRequiredFt = parseFloat(val);
      state.npshRBase = parseFloat(val);
    });

    const autoScaleToggle = document.getElementById('npshAutoScaleR');
    if (autoScaleToggle) {
      autoScaleToggle.addEventListener('change', (e) => {
        state.autoScaleNpshR = e.target.checked;
        recalculateAndRender();
      });
    }

    bindSlider('npshSafetyMargin', (val) => { state.safetyMarginReqFt = parseFloat(val); });

    const openBtn = document.getElementById('openNpshCalcBtn');
    if (openBtn) {
      openBtn.addEventListener('click', openNpshModal);
    }

    const closeBtn = document.getElementById('closeNpshModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeNpshModal);
    }

    const modalBackdrop = document.getElementById('npshCalcModal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeNpshModal();
      });
    }
  }

  function bindSlider(sliderId, callback) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    slider.addEventListener('input', (e) => {
      callback(e.target.value);
      recalculateAndRender();
    });
  }

  function syncControl(sliderId, val) {
    const slider = document.getElementById(sliderId);
    if (slider) slider.value = val;
  }

  function applyPreset(key) {
    const p = PRESETS[key];
    if (!p) return;

    state.selectedPreset = key;
    state.altitudeFt = p.altitude;
    state.waterTempF = p.temp;
    state.staticElevationFt = p.staticZ;
    state.flowGpm = p.flow;
    state.pipeDiameterIn = p.diameter;
    state.pipeLengthFt = p.length;
    state.pipeMaterialKey = p.material;
    state.minorLossK = p.minorK;
    state.npshRequiredFt = p.npshR;
    state.npshRBase = p.npshR;
    state.qBase = p.flow;
    state.autoScaleNpshR = p.autoScale;
    state.safetyMarginReqFt = p.marginReq;

    syncControl('npshAltitude', p.altitude);
    syncControl('npshTemp', p.temp);
    syncControl('npshStaticZ', p.staticZ);
    syncControl('npshFlow', p.flow);
    syncControl('npshDiameter', p.diameter);
    syncControl('npshLength', p.length);
    syncControl('npshMinorK', p.minorK);
    syncControl('npshR', p.npshR);
    syncControl('npshSafetyMargin', p.marginReq);

    const matSelect = document.getElementById('npshMaterial');
    if (matSelect) matSelect.value = p.material;

    const autoScaleToggle = document.getElementById('npshAutoScaleR');
    if (autoScaleToggle) autoScaleToggle.checked = p.autoScale;

    const descEl = document.getElementById('npshPresetDesc');
    if (descEl) descEl.textContent = p.desc;

    recalculateAndRender();
  }

  function openNpshModal() {
    const modal = document.getElementById('npshCalcModal');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    recalculateAndRender();
  }

  function closeNpshModal() {
    const modal = document.getElementById('npshCalcModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Export Global API
  window.NpshCalculator = {
    open: openNpshModal,
    close: closeNpshModal,
    setValues: function (newVals) {
      Object.assign(state, newVals);
      recalculateAndRender();
    },
    applyPreset: applyPreset
  };

  document.addEventListener('DOMContentLoaded', () => {
    initControls();
    applyPreset('municipal_safe');
  });
})();
