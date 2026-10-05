/**
 * NCEES PE Exam Water Resources & Environmental Engineering
 * Interactive Periodic Table & Water Chemistry Engineering Lab
 * 
 * Features:
 * 1. 118-Element Interactive Mendeleev Periodic Table with atomic weights, electron configs,
 *    valence states, and NCEES environmental/water engineering application notes.
 * 2. NCEES Reference Handbook § 6 / Environmental Manual p. 30 Common Radicals & Equivalent Weights.
 * 3. Real-time Cation-Anion Balance & Electrical Neutrality Solver (solves Problem #92).
 * 4. Stoichiometric compound ratio calculator (solves Problem #82 and lime softening Problem #72).
 */

(function() {
  'use strict';

  // 1. COMPLETE 118 ELEMENTS DATABASE
  const ELEMENTS = [
    { z: 1, s: 'H', n: 'Hydrogen', w: 1.008, cat: 'reactive-nonmetal', p: 1, g: 1, v: '+1, -1', ec: '1s¹', en: 2.20, notes: 'Water base (H₂O), hydronium H⁺ ion, pH = -log[H⁺], acid-base neutrality, alkalinity neutralization.' },
    { z: 2, s: 'He', n: 'Helium', w: 4.0026, cat: 'noble-gas', p: 1, g: 18, v: '0', ec: '1s²', en: null, notes: 'Inert noble gas, tracer testing in deep hydrogeological formations.' },
    { z: 3, s: 'Li', n: 'Lithium', w: 6.94, cat: 'alkali-metal', p: 2, g: 1, v: '+1', ec: '[He] 2s¹', en: 0.98, notes: 'Conservative chemical tracer in groundwater solute transport and aquifer pump tests.' },
    { z: 4, s: 'Be', n: 'Beryllium', w: 9.0122, cat: 'alkaline-earth', p: 2, g: 2, v: '+2', ec: '[He] 2s²', en: 1.57, notes: 'Toxic metal regulated under EPA Primary Drinking Water Standards (MCL = 0.004 mg/L).' },
    { z: 5, s: 'B', n: 'Boron', w: 10.81, cat: 'metalloid', p: 2, g: 13, v: '+3', ec: '[He] 2s² 2p¹', en: 2.04, notes: 'Boric acid B(OH)₃ in seawater reverse osmosis (RO); critical phytotoxicity limit for irrigation (0.75 mg/L).' },
    { z: 6, s: 'C', n: 'Carbon', w: 12.011, cat: 'reactive-nonmetal', p: 2, g: 14, v: '+4, +2, -4', ec: '[He] 2s² 2p²', en: 2.55, notes: 'TOC (Total Organic Carbon), BOD/COD stoichiometry, carbonate buffer system (CO₂, H₂CO₃, HCO₃⁻, CO₃²⁻), activated carbon adsorption (GAC/PAC).' },
    { z: 7, s: 'N', n: 'Nitrogen', w: 14.007, cat: 'reactive-nonmetal', p: 2, g: 15, v: '+5, +3, -3', ec: '[He] 2s² 2p³', en: 3.04, notes: 'Key nutrient in PE Exam: Total Nitrogen (TN), TKN, ammonia (NH₃/NH₄⁺), nitrite (NO₂⁻), nitrate (NO₃⁻ MCL = 10 mg/L as N), nitrification & denitrification stoichiometry.' },
    { z: 8, s: 'O', n: 'Oxygen', w: 15.999, cat: 'reactive-nonmetal', p: 2, g: 16, v: '-2', ec: '[He] 2s² 2p⁴', en: 3.44, notes: 'Dissolved Oxygen (DO), Streeter-Phelps oxygen sag curve, BOD ultimate L₀, COD oxidation, aeration transfer rates.' },
    { z: 9, s: 'F', n: 'Fluorine', w: 18.998, cat: 'halogen', p: 2, g: 17, v: '-1', ec: '[He] 2s² 2p⁵', en: 3.98, notes: 'Drinking water fluoridation (optimum ~0.7 mg/L for dental caries prevention; EPA MCL = 4.0 mg/L, secondary standard = 2.0 mg/L).' },
    { z: 10, s: 'Ne', n: 'Neon', w: 20.180, cat: 'noble-gas', p: 2, g: 18, v: '0', ec: '[He] 2s² 2p⁶', en: null, notes: 'Inert atmospheric tracer gas.' },
    { z: 11, s: 'Na', n: 'Sodium', w: 22.990, cat: 'alkali-metal', p: 3, g: 1, v: '+1', ec: '[Ne] 3s¹', en: 0.93, notes: 'Major cation in water balance (Problem #92: eq. wt = 23.0 mg/meq). Sodium Adsorption Ratio (SAR) for irrigation soils. Softening brine regeneration (NaCl).' },
    { z: 12, s: 'Mg', n: 'Magnesium', w: 24.305, cat: 'alkaline-earth', p: 3, g: 2, v: '+2', ec: '[Ne] 3s²', en: 1.31, notes: 'Major hardness cation (eq. wt = 12.15 mg/meq). Problem #92 & #72 lime-soda softening: precipitates as Mg(OH)₂ at elevated pH (>10.8).' },
    { z: 13, s: 'Al', n: 'Aluminum', w: 26.982, cat: 'post-transition', p: 3, g: 13, v: '+3', ec: '[Ne] 3s² 3p¹', en: 1.61, notes: 'Primary chemical coagulant: Alum Al₂(SO₄)₃·14H₂O (eq. wt = 99.0). Sweep flocculation and sweep coagulation mechanism. Industrial emission rate in Problem #84.' },
    { z: 14, s: 'Si', n: 'Silicon', w: 28.085, cat: 'metalloid', p: 3, g: 14, v: '+4', ec: '[Ne] 3s² 3p²', en: 1.90, notes: 'Silica sand filter media (effective size d₁₀, uniformity coefficient UC = d₆₀/d₁₀). Membrane foulant in RO desalination.' },
    { z: 15, s: 'P', n: 'Phosphorus', w: 30.974, cat: 'reactive-nonmetal', p: 3, g: 15, v: '+5, +3', ec: '[Ne] 3s² 3p³', en: 2.19, notes: 'Limiting nutrient for freshwater eutrophication. Organic contaminant in Problem #91. Chemical precipitation via ferric or alum to orthophosphate (PO₄³⁻).' },
    { z: 16, s: 'S', n: 'Sulfur', w: 32.06, cat: 'reactive-nonmetal', p: 3, g: 16, v: '+6, +4, -2', ec: '[Ne] 3s² 3p⁴', en: 2.58, notes: 'Sulfate SO₄²⁻ in water balance (Problem #92: eq. wt = 48.0 mg/meq). Hydrogen sulfide H₂S crown corrosion in sanitary sewer gravity pipes.' },
    { z: 17, s: 'Cl', n: 'Chlorine', w: 35.45, cat: 'halogen', p: 3, g: 17, v: '-1, +1, +3, +5, +7', ec: '[Ne] 3s² 3p⁵', en: 3.16, notes: 'Disinfection (Cl₂ + H₂O ⇌ HOCl + H⁺ + Cl⁻). Chloride Cl⁻ in cation-anion balance (Problem #92: eq. wt = 35.5 mg/meq). Mass balance conversion in Problem #82 (NaCl/Cl⁻ ratio = 1.65).' },
    { z: 18, s: 'Ar', n: 'Argon', w: 39.948, cat: 'noble-gas', p: 3, g: 18, v: '0', ec: '[Ne] 3s² 3p⁶', en: null, notes: 'Major noble gas constituent in ambient atmospheric air (~0.934% by volume).' },
    { z: 19, s: 'K', n: 'Potassium', w: 39.098, cat: 'alkali-metal', p: 4, g: 1, v: '+1', ec: '[Ar] 4s¹', en: 0.82, notes: 'Common natural monovalent cation in water (eq. wt = 39.1 mg/meq). Agricultural fertilizer runoff component.' },
    { z: 20, s: 'Ca', n: 'Calcium', w: 40.078, cat: 'alkaline-earth', p: 4, g: 2, v: '+2', ec: '[Ar] 4s²', en: 1.00, notes: 'Primary water hardness cation (eq. wt = 20.05 mg/meq). Problem #92 balance. Lime softening: Ca²⁺ + 2HCO₃⁻ + Ca(OH)₂ → 2CaCO₃(s) + 2H₂O. Alkalinity standard CaCO₃.' },
    { z: 21, s: 'Sc', n: 'Scandium', w: 44.956, cat: 'transition-metal', p: 4, g: 3, v: '+3', ec: '[Ar] 3d¹ 4s²', en: 1.36, notes: 'Transition metal; rare industrial wastewater trace element.' },
    { z: 22, s: 'Ti', n: 'Titanium', w: 47.867, cat: 'transition-metal', p: 4, g: 4, v: '+4, +3', ec: '[Ar] 3d² 4s²', en: 1.54, notes: 'Titanium dioxide TiO₂ photocatalytic advanced oxidation processes (AOP) for organic pollutant breakdown.' },
    { z: 23, s: 'V', n: 'Vanadium', w: 50.942, cat: 'transition-metal', p: 4, g: 5, v: '+5, +4, +3', ec: '[Ar] 3d³ 4s²', en: 1.63, notes: 'Petroleum refinery and coal combustion wastewater contaminant.' },
    { z: 24, s: 'Cr', n: 'Chromium', w: 51.996, cat: 'transition-metal', p: 4, g: 6, v: '+6, +3', ec: '[Ar] 3d⁵ 4s¹', en: 1.66, notes: 'EPA regulated metal (Total Cr MCL = 0.1 mg/L). Hexavalent chromium Cr(VI) is a toxic carcinogen reduced to Cr(III) via ferrous or bisulfite prior to precipitation.' },
    { z: 25, s: 'Mn', n: 'Manganese', w: 54.938, cat: 'transition-metal', p: 4, g: 7, v: '+2, +4, +7', ec: '[Ar] 3d⁵ 4s²', en: 1.55, notes: 'Secondary standard (0.05 mg/L); causes black pipe aesthetic discoloration and laundry staining. Oxidized by KMnO₄ or aeration followed by greensand filtration.' },
    { z: 26, s: 'Fe', n: 'Iron', w: 55.845, cat: 'transition-metal', p: 4, g: 8, v: '+2, +3', ec: '[Ar] 3d⁶ 4s²', en: 1.83, notes: 'Secondary standard (0.3 mg/L). Key coagulants: Ferric chloride FeCl₃ and Ferrous sulfate FeSO₄. Common well water contaminant oxidized from Fe²⁺ to Fe³⁺.' },
    { z: 27, s: 'Co', n: 'Cobalt', w: 58.933, cat: 'transition-metal', p: 4, g: 9, v: '+2, +3', ec: '[Ar] 3d⁷ 4s²', en: 1.88, notes: 'Essential micronutrient in anaerobic digestion (Vitamin B₁₂ cofactor for methanogens).' },
    { z: 28, s: 'Ni', n: 'Nickel', w: 58.693, cat: 'transition-metal', p: 4, g: 10, v: '+2', ec: '[Ar] 3d⁸ 4s²', en: 1.91, notes: 'Regulated electroplating heavy metal contaminant; removed via hydroxide precipitation at alkaline pH.' },
    { z: 29, s: 'Cu', n: 'Copper', w: 63.546, cat: 'transition-metal', p: 4, g: 11, v: '+2, +1', ec: '[Ar] 3d¹⁰ 4s¹', en: 1.90, notes: 'EPA Lead and Copper Rule (Action Level = 1.3 mg/L). Reservoir algaecide as copper sulfate CuSO₄·5H₂O. Plumbing pipe corrosion product.' },
    { z: 30, s: 'Zn', n: 'Zinc', w: 65.38, cat: 'transition-metal', p: 4, g: 12, v: '+2', ec: '[Ar] 3d¹⁰ 4s²', en: 1.65, notes: 'Secondary standard (5 mg/L); galvanized pipe coating, zinc orthophosphate corrosion inhibitor added to prevent lead leaching.' },
    { z: 31, s: 'Ga', n: 'Gallium', w: 69.723, cat: 'post-transition', p: 4, g: 13, v: '+3', ec: '[Ar] 3d¹⁰ 4s² 4p¹', en: 1.81, notes: 'Semiconductor manufacturing wastewater effluent.' },
    { z: 32, s: 'Ge', n: 'Germanium', w: 72.630, cat: 'metalloid', p: 4, g: 14, v: '+4', ec: '[Ar] 3d¹⁰ 4s² 4p²', en: 2.01, notes: 'Optical and electronics wastewater trace constituent.' },
    { z: 33, s: 'As', n: 'Arsenic', w: 74.922, cat: 'metalloid', p: 4, g: 15, v: '+3, +5', ec: '[Ar] 3d¹⁰ 4s² 4p³', en: 2.18, notes: 'Highly toxic carcinogen; EPA Drinking Water MCL = 0.010 mg/L (10 ppb). Co-precipitation with ferric coagulant or activated alumina adsorption.' },
    { z: 34, s: 'Se', n: 'Selenium', w: 78.971, cat: 'reactive-nonmetal', p: 4, g: 16, v: '+4, +6, -2', ec: '[Ar] 3d¹⁰ 4s² 4p⁴', en: 2.55, notes: 'EPA MCL = 0.05 mg/L; agricultural drainage and coal fly ash leachate contaminant.' },
    { z: 35, s: 'Br', n: 'Bromine', w: 79.904, cat: 'halogen', p: 4, g: 17, v: '-1', ec: '[Ar] 3d¹⁰ 4s² 4p⁵', en: 2.96, notes: 'Bromide Br⁻ precursor to carcinogenic brominated disinfection byproducts (bromate BrO₃⁻ via ozonation, brominated THMs/HAAs).' },
    { z: 36, s: 'Kr', n: 'Krypton', w: 83.798, cat: 'noble-gas', p: 4, g: 18, v: '0', ec: '[Ar] 3d¹⁰ 4s² 4p⁶', en: 3.00, notes: 'Noble gas; noble gas radiometric dating for ancient groundwater age determination.' },
    { z: 37, s: 'Rb', n: 'Rubidium', w: 85.468, cat: 'alkali-metal', p: 5, g: 1, v: '+1', ec: '[Kr] 5s¹', en: 0.82, notes: 'Alkali trace element in geothermal fluids and saline brine.' },
    { z: 38, s: 'Sr', n: 'Strontium', w: 87.62, cat: 'alkaline-earth', p: 5, g: 2, v: '+2', ec: '[Kr] 5s²', en: 0.95, notes: 'Chemical analogue to calcium; EPA drinking water health advisory level (HAL = 4 mg/L).' },
    { z: 39, s: 'Y', n: 'Yttrium', w: 88.906, cat: 'transition-metal', p: 5, g: 3, v: '+3', ec: '[Kr] 4d¹ 5s²', en: 1.22, notes: 'Rare earth element present in electronic recycling waste streams.' },
    { z: 40, s: 'Zr', n: 'Zirconium', w: 91.224, cat: 'transition-metal', p: 5, g: 4, v: '+4', ec: '[Kr] 4d² 5s²', en: 1.33, notes: 'Corrosion resistant nuclear fuel cladding material.' },
    { z: 41, s: 'Nb', n: 'Niobium', w: 92.906, cat: 'transition-metal', p: 5, g: 5, v: '+5', ec: '[Kr] 4d⁴ 5s¹', en: 1.6, notes: 'Specialty steel alloy additive.' },
    { z: 42, s: 'Mo', n: 'Molybdenum', w: 95.95, cat: 'transition-metal', p: 5, g: 6, v: '+6', ec: '[Kr] 4d⁵ 5s¹', en: 2.16, notes: 'Enzyme cofactor for nitrogenase in biological nitrogen fixation.' },
    { z: 43, s: 'Tc', n: 'Technetium', w: 98, cat: 'transition-metal', p: 5, g: 7, v: '+7', ec: '[Kr] 4d⁵ 5s²', en: 1.9, notes: 'Synthetic radioisotope (Tc-99) monitoring in nuclear waste cleanup.' },
    { z: 44, s: 'Ru', n: 'Ruthenium', w: 101.07, cat: 'transition-metal', p: 5, g: 8, v: '+3, +4', ec: '[Kr] 4d⁷ 5s¹', en: 2.2, notes: 'Catalyst for advanced electrolytic water oxidation.' },
    { z: 45, s: 'Rh', n: 'Rhodium', w: 102.91, cat: 'transition-metal', p: 5, g: 9, v: '+3', ec: '[Kr] 4d⁸ 5s¹', en: 2.28, notes: 'Precious metal catalyst; automotive catalytic converter runoff.' },
    { z: 46, s: 'Pd', n: 'Palladium', w: 106.42, cat: 'transition-metal', p: 5, g: 10, v: '+2', ec: '[Kr] 4d¹⁰', en: 2.20, notes: 'Catalytic hydrodechlorination of chlorinated solvents (TCE, PCE) in groundwater remediation.' },
    { z: 47, s: 'Ag', n: 'Silver', w: 107.87, cat: 'transition-metal', p: 5, g: 11, v: '+1', ec: '[Kr] 4d¹⁰ 5s¹', en: 1.93, notes: 'Secondary standard (0.1 mg/L); bactericidal disinfectant for point-of-use ceramic water filters.' },
    { z: 48, s: 'Cd', n: 'Cadmium', w: 112.41, cat: 'transition-metal', p: 5, g: 12, v: '+2', ec: '[Kr] 4d¹⁰ 5s²', en: 1.69, notes: 'Toxic heavy metal; EPA MCL = 0.005 mg/L. Battery manufacturing and pigment wastewater effluent; bioaccumulates in kidneys.' },
    { z: 49, s: 'In', n: 'Indium', w: 114.82, cat: 'post-transition', p: 5, g: 13, v: '+3', ec: '[Kr] 4d¹⁰ 5s² 5p¹', en: 1.78, notes: 'Indium tin oxide (ITO) in touch-screen manufacturing wastewater.' },
    { z: 50, s: 'Sn', n: 'Tin', w: 118.71, cat: 'post-transition', p: 5, g: 14, v: '+2, +4', ec: '[Kr] 4d¹⁰ 5s² 5p²', en: 1.96, notes: 'Organotin compounds (tributyltin TBT) historical antifouling biocide in marine coatings.' },
    { z: 51, s: 'Sb', n: 'Antimony', w: 121.76, cat: 'metalloid', p: 5, g: 15, v: '+3, +5', ec: '[Kr] 4d¹⁰ 5s² 5p³', en: 2.05, notes: 'EPA MCL = 0.006 mg/L; PET plastic catalyst leachates in bottled water.' },
    { z: 52, s: 'Te', n: 'Tellurium', w: 127.60, cat: 'metalloid', p: 5, g: 16, v: '+4, +6', ec: '[Kr] 4d¹⁰ 5s² 5p⁴', en: 2.1, notes: 'Cadmium telluride CdTe thin-film solar cell wastewater pollutant.' },
    { z: 53, s: 'I', n: 'Iodine', w: 126.90, cat: 'halogen', p: 5, g: 17, v: '-1', ec: '[Kr] 4d¹⁰ 5s² 5p⁵', en: 2.66, notes: 'Emergency field water disinfection; precursor to iodinated disinfection byproducts (I-THMs).' },
    { z: 54, s: 'Xe', n: 'Xenon', w: 131.29, cat: 'noble-gas', p: 5, g: 18, v: '0', ec: '[Kr] 4d¹⁰ 5s² 5p⁶', en: 2.60, notes: 'Noble gas; Xe-133 atmospheric tracer for nuclear testing monitoring.' },
    { z: 55, s: 'Cs', n: 'Cesium', w: 132.91, cat: 'alkali-metal', p: 6, g: 1, v: '+1', ec: '[Xe] 6s¹', en: 0.79, notes: 'Cs-137 radionuclide from nuclear fallout; tightly sorbed to clay soil minerals.' },
    { z: 56, s: 'Ba', n: 'Barium', w: 137.33, cat: 'alkaline-earth', p: 6, g: 2, v: '+2', ec: '[Xe] 6s²', en: 0.89, notes: 'EPA MCL = 2.0 mg/L. Forms insoluble barium sulfate BaSO₄ scale in oil & gas produced water.' },
    { z: 57, s: 'La', n: 'Lanthanum', w: 138.91, cat: 'lanthanide', p: 8, g: 3, v: '+3', ec: '[Xe] 5d¹ 6s²', en: 1.10, notes: 'Lanthanum-modified bentonite clay (Phoslock) used for in-lake phosphorus inactivation.' },
    { z: 58, s: 'Ce', n: 'Cerium', w: 140.12, cat: 'lanthanide', p: 8, g: 4, v: '+3, +4', ec: '[Xe] 4f¹ 5d¹ 6s²', en: 1.12, notes: 'Cerium oxide CeO₂ nanoparticles used in catalytic diesel fuel additives and polishing slurries.' },
    { z: 59, s: 'Pr', n: 'Praseodymium', w: 140.91, cat: 'lanthanide', p: 8, g: 5, v: '+3', ec: '[Xe] 4f³ 6s²', en: 1.13, notes: 'Rare earth element in magnet manufacturing.' },
    { z: 60, s: 'Nd', n: 'Neodymium', w: 144.24, cat: 'lanthanide', p: 8, g: 6, v: '+3', ec: '[Xe] 4f⁴ 6s²', en: 1.14, notes: 'Critical rare earth element in permanent wind turbine magnets; mining acid mine drainage.' },
    { z: 61, s: 'Pm', n: 'Promethium', w: 145, cat: 'lanthanide', p: 8, g: 7, v: '+3', ec: '[Xe] 4f⁵ 6s²', en: null, notes: 'Radioactive rare earth element.' },
    { z: 62, s: 'Sm', n: 'Samarium', w: 150.36, cat: 'lanthanide', p: 8, g: 8, v: '+3', ec: '[Xe] 4f⁶ 6s²', en: 1.17, notes: 'Neutron capture absorber in nuclear reactor control rods.' },
    { z: 63, s: 'Eu', n: 'Europium', w: 151.96, cat: 'lanthanide', p: 8, g: 9, v: '+3, +2', ec: '[Xe] 4f⁷ 6s²', en: null, notes: 'Fluorescent tracer in hydrologic fracture mapping.' },
    { z: 64, s: 'Gd', n: 'Gadolinium', w: 157.25, cat: 'lanthanide', p: 8, g: 10, v: '+3', ec: '[Xe] 4f⁷ 5d¹ 6s²', en: 1.20, notes: 'Anthropogenic MRI contrast agent passing through municipal wastewater into drinking water.' },
    { z: 65, s: 'Tb', n: 'Terbium', w: 158.93, cat: 'lanthanide', p: 8, g: 11, v: '+3', ec: '[Xe] 4f⁹ 6s²', en: null, notes: 'Green phosphor in electronic displays.' },
    { z: 66, s: 'Dy', n: 'Dysprosium', w: 162.50, cat: 'lanthanide', p: 8, g: 12, v: '+3', ec: '[Xe] 4f¹⁰ 6s²', en: 1.22, notes: 'High-temperature permanent magnet additive.' },
    { z: 67, s: 'Ho', n: 'Holmium', w: 164.93, cat: 'lanthanide', p: 8, g: 13, v: '+3', ec: '[Xe] 4f¹¹ 6s²', en: 1.23, notes: 'Medical laser optics and magnetic flux concentrator.' },
    { z: 68, s: 'Er', n: 'Erbium', w: 167.26, cat: 'lanthanide', p: 8, g: 14, v: '+3', ec: '[Xe] 4f¹² 6s²', en: 1.24, notes: 'Fiber optic signal amplifier in telecommunications.' },
    { z: 69, s: 'Tm', n: 'Thulium', w: 168.93, cat: 'lanthanide', p: 8, g: 15, v: '+3', ec: '[Xe] 4f¹³ 6s²', en: 1.25, notes: 'Portable medical X-ray radiation source.' },
    { z: 70, s: 'Yb', n: 'Ytterbium', w: 173.05, cat: 'lanthanide', p: 8, g: 16, v: '+3', ec: '[Xe] 4f¹⁴ 6s²', en: null, notes: 'Stress sensor alloy in geotechnical foundation monitoring.' },
    { z: 71, s: 'Lu', n: 'Lutetium', w: 174.97, cat: 'lanthanide', p: 8, g: 17, v: '+3', ec: '[Xe] 4f¹⁴ 5d¹ 6s²', en: 1.27, notes: 'Dense scintillation crystals in PET medical imaging.' },
    { z: 72, s: 'Hf', n: 'Hafnium', w: 178.49, cat: 'transition-metal', p: 6, g: 4, v: '+4', ec: '[Xe] 4f¹⁴ 5d² 6s²', en: 1.3, notes: 'Nuclear reactor control rod material with high thermal neutron capture cross section.' },
    { z: 73, s: 'Ta', n: 'Tantalum', w: 180.95, cat: 'transition-metal', p: 6, g: 5, v: '+5', ec: '[Xe] 4f¹⁴ 5d³ 6s²', en: 1.5, notes: 'Corrosion resistant capacitors in electronic microchips.' },
    { z: 74, s: 'W', n: 'Tungsten', w: 183.84, cat: 'transition-metal', p: 6, g: 6, v: '+6', ec: '[Xe] 4f¹⁴ 5d⁴ 6s²', en: 2.36, notes: 'Highest melting point metal; industrial cutting tool wastewater.' },
    { z: 75, s: 'Re', n: 'Rhenium', w: 186.21, cat: 'transition-metal', p: 6, g: 7, v: '+7', ec: '[Xe] 4f¹⁴ 5d⁵ 6s²', en: 1.9, notes: 'High-temperature jet engine turbine nickel superalloy component.' },
    { z: 76, s: 'Os', n: 'Osmium', w: 190.23, cat: 'transition-metal', p: 6, g: 8, v: '+4, +8', ec: '[Xe] 4f¹⁴ 5d⁶ 6s²', en: 2.2, notes: 'Densely packed metal (22.59 g/cm³); volatile toxic osmium tetroxide OsO₄.' },
    { z: 77, s: 'Ir', n: 'Iridium', w: 192.22, cat: 'transition-metal', p: 6, g: 9, v: '+4', ec: '[Xe] 4f¹⁴ 5d⁷ 6s²', en: 2.20, notes: 'Dimensionally stable anodes (DSA) for chlorine generation in water disinfection.' },
    { z: 78, s: 'Pt', n: 'Platinum', w: 195.08, cat: 'transition-metal', p: 6, g: 10, v: '+2, +4', ec: '[Xe] 4f¹⁴ 5d⁹ 6s¹', en: 2.28, notes: 'Catalyst in fuel cells and industrial emissions catalytic converters.' },
    { z: 79, s: 'Au', n: 'Gold', w: 196.97, cat: 'transition-metal', p: 6, g: 11, v: '+3', ec: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', en: 2.54, notes: 'Cyanide leaching gold extraction tailings; cyanide destruction via alkaline chlorination.' },
    { z: 80, s: 'Hg', n: 'Mercury', w: 200.59, cat: 'transition-metal', p: 6, g: 12, v: '+2, +1', ec: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', en: 2.00, notes: 'Problem #91 Roadway Pollutant (MCL = 0.002 mg/L). Highly toxic bioaccumulative methylmercury; conversion factor lookup in Reference Manual.' },
    { z: 81, s: 'Tl', n: 'Thallium', w: 204.38, cat: 'post-transition', p: 6, g: 13, v: '+1', ec: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', en: 1.62, notes: 'EPA MCL = 0.002 mg/L; coal combustion byproduct and copper smelting waste.' },
    { z: 82, s: 'Pb', n: 'Lead', w: 207.2, cat: 'post-transition', p: 6, g: 14, v: '+2, +4', ec: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', en: 2.33, notes: 'Problem #91 Roadway Pollutant. EPA Lead & Copper Rule (Action Level = 0.015 mg/L or 15 ppb). Solder and service line replacement engineering.' },
    { z: 83, s: 'Bi', n: 'Bismuth', w: 208.98, cat: 'post-transition', p: 6, g: 15, v: '+3', ec: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', en: 2.02, notes: 'Non-toxic lead replacement in modern brass plumbing fixtures.' },
    { z: 84, s: 'Po', n: 'Polonium', w: 209, cat: 'post-transition', p: 6, g: 16, v: '+4', ec: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', en: 2.0, notes: 'Alpha-emitting radon decay daughter in underground uranium mine air.' },
    { z: 85, s: 'At', n: 'Astatine', w: 210, cat: 'halogen', p: 6, g: 17, v: '-1', ec: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', en: 2.2, notes: 'Extremely rare short-lived radioactive halogen.' },
    { z: 86, s: 'Rn', n: 'Radon', w: 222, cat: 'noble-gas', p: 6, g: 18, v: '0', ec: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', en: null, notes: 'Radioactive noble gas from U-238 decay; indoor air quality hazard (EPA action level = 4.0 pCi/L); removed via diffused aeration.' },
    { z: 87, s: 'Fr', n: 'Francium', w: 223, cat: 'alkali-metal', p: 7, g: 1, v: '+1', ec: '[Rn] 7s¹', en: 0.7, notes: 'Highly unstable alkali metal isotope.' },
    { z: 88, s: 'Ra', n: 'Radium', w: 226, cat: 'alkaline-earth', p: 7, g: 2, v: '+2', ec: '[Rn] 7s²', en: 0.9, notes: 'EPA MCL for Combined Radium-226 and Radium-228 is 5.0 pCi/L in drinking water; cation exchange removal.' },
    { z: 89, s: 'Ac', n: 'Actinium', w: 227, cat: 'actinide', p: 9, g: 3, v: '+3', ec: '[Rn] 6d¹ 7s²', en: 1.1, notes: 'Radioactive decay series precursor.' },
    { z: 90, s: 'Th', n: 'Thorium', w: 232.04, cat: 'actinide', p: 9, g: 4, v: '+4', ec: '[Rn] 6d² 7s²', en: 1.3, notes: 'Naturally occurring radioactive material (NORM) in mineral sand mining tailings.' },
    { z: 91, s: 'Pa', n: 'Protactinium', w: 231.04, cat: 'actinide', p: 9, g: 5, v: '+5', ec: '[Rn] 5f² 6d¹ 7s²', en: 1.5, notes: 'Natural decay intermediate in uranium-235 series.' },
    { z: 92, s: 'U', n: 'Uranium', w: 238.03, cat: 'actinide', p: 9, g: 6, v: '+6, +4', ec: '[Rn] 5f³ 6d¹ 7s²', en: 1.38, notes: 'EPA Drinking Water MCL = 30 µg/L. Anion exchange and reverse osmosis removal in deep granitic aquifers.' },
    { z: 93, s: 'Np', n: 'Neptunium', w: 237, cat: 'actinide', p: 9, g: 7, v: '+5', ec: '[Rn] 5f⁴ 6d¹ 7s²', en: 1.36, notes: 'Transuranic nuclear waste byproduct.' },
    { z: 94, s: 'Pu', n: 'Plutonium', w: 244, cat: 'actinide', p: 9, g: 8, v: '+4', ec: '[Rn] 5f⁶ 7s²', en: 1.28, notes: 'Long-lived transuranic radionuclide monitored in deep geological nuclear repositories (WIPP).' },
    { z: 95, s: 'Am', n: 'Americium', w: 243, cat: 'actinide', p: 9, g: 9, v: '+3', ec: '[Rn] 5f⁷ 7s²', en: 1.3, notes: 'Ionization smoke detector isotope (Am-241).' },
    { z: 96, s: 'Cm', n: 'Curium', w: 247, cat: 'actinide', p: 9, g: 10, v: '+3', ec: '[Rn] 5f⁷ 6d¹ 7s²', en: 1.3, notes: 'Radioisotope thermoelectric generator heat source.' },
    { z: 97, s: 'Bk', n: 'Berkelium', w: 247, cat: 'actinide', p: 9, g: 11, v: '+3, +4', ec: '[Rn] 5f⁹ 7s²', en: 1.3, notes: 'Synthetic transuranic actinide.' },
    { z: 98, s: 'Cf', n: 'Californium', w: 251, cat: 'actinide', p: 9, g: 12, v: '+3', ec: '[Rn] 5f¹⁰ 7s²', en: 1.3, notes: 'Spontaneous neutron emitter (Cf-252) for neutron moisture gauges in geotechnical compaction testing.' },
    { z: 99, s: 'Es', n: 'Einsteinium', w: 252, cat: 'actinide', p: 9, g: 13, v: '+3', ec: '[Rn] 5f¹¹ 7s²', en: 1.3, notes: 'Synthetic actinide discovered in thermonuclear debris.' },
    { z: 100, s: 'Fm', n: 'Fermium', w: 257, cat: 'actinide', p: 9, g: 14, v: '+3', ec: '[Rn] 5f¹² 7s²', en: 1.3, notes: 'Synthetic actinide synthesized via neutron bombardment.' },
    { z: 101, s: 'Md', n: 'Mendelevium', w: 258, cat: 'actinide', p: 9, g: 15, v: '+3', ec: '[Rn] 5f¹³ 7s²', en: 1.3, notes: 'Named in honor of Dmitri Mendeleev, father of the Periodic Table.' },
    { z: 102, s: 'No', n: 'Nobelium', w: 259, cat: 'actinide', p: 9, g: 16, v: '+2, +3', ec: '[Rn] 5f¹⁴ 7s²', en: 1.3, notes: 'Synthetic actinide element.' },
    { z: 103, s: 'Lr', n: 'Lawrencium', w: 266, cat: 'actinide', p: 9, g: 17, v: '+3', ec: '[Rn] 5f¹⁴ 7s² 7p¹', en: 1.3, notes: 'Terminal actinide transition metal.' },
    { z: 104, s: 'Rf', n: 'Rutherfordium', w: 267, cat: 'transition-metal', p: 7, g: 4, v: '+4', ec: '[Rn] 5f¹⁴ 6d² 7s²', en: null, notes: 'Superheavy synthetic element.' },
    { z: 105, s: 'Db', n: 'Dubnium', w: 268, cat: 'transition-metal', p: 7, g: 5, v: '+5', ec: '[Rn] 5f¹⁴ 6d³ 7s²', en: null, notes: 'Superheavy synthetic element.' },
    { z: 106, s: 'Sg', n: 'Seaborgium', w: 269, cat: 'transition-metal', p: 7, g: 6, v: '+6', ec: '[Rn] 5f¹⁴ 6d⁴ 7s²', en: null, notes: 'Superheavy synthetic element.' },
    { z: 107, s: 'Bh', n: 'Bohrium', w: 270, cat: 'transition-metal', p: 7, g: 7, v: '+7', ec: '[Rn] 5f¹⁴ 6d⁵ 7s²', en: null, notes: 'Superheavy synthetic element.' },
    { z: 108, s: 'Hs', n: 'Hassium', w: 277, cat: 'transition-metal', p: 7, g: 8, v: '+8', ec: '[Rn] 5f¹⁴ 6d⁶ 7s²', en: null, notes: 'Superheavy synthetic element.' },
    { z: 109, s: 'Mt', n: 'Meitnerium', w: 278, cat: 'transition-metal', p: 7, g: 9, v: '+9', ec: '[Rn] 5f¹⁴ 6d⁷ 7s²', en: null, notes: 'Superheavy synthetic element.' },
    { z: 110, s: 'Ds', n: 'Darmstadtium', w: 281, cat: 'transition-metal', p: 7, g: 10, v: '+8', ec: '[Rn] 5f¹⁴ 6d⁸ 7s²', en: null, notes: 'Superheavy synthetic element.' },
    { z: 111, s: 'Rg', n: 'Roentgenium', w: 282, cat: 'transition-metal', p: 7, g: 11, v: '+5', ec: '[Rn] 5f¹⁴ 6d⁹ 7s²', en: null, notes: 'Superheavy synthetic element.' },
    { z: 112, s: 'Cn', n: 'Copernicium', w: 285, cat: 'transition-metal', p: 7, g: 12, v: '+2', ec: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', en: null, notes: 'Volatile liquid-like superheavy metal.' },
    { z: 113, s: 'Nh', n: 'Nihonium', w: 286, cat: 'post-transition', p: 7, g: 13, v: '+1', ec: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', en: null, notes: 'Superheavy post-transition element.' },
    { z: 114, s: 'Fl', n: 'Flerovium', w: 289, cat: 'post-transition', p: 7, g: 14, v: '+2', ec: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', en: null, notes: 'Island of stability superheavy element.' },
    { z: 115, s: 'Mc', n: 'Moscovium', w: 290, cat: 'post-transition', p: 7, g: 15, v: '+1, +3', ec: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', en: null, notes: 'Superheavy element.' },
    { z: 116, s: 'Lv', n: 'Livermorium', w: 293, cat: 'post-transition', p: 7, g: 16, v: '+2, +4', ec: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', en: null, notes: 'Superheavy element.' },
    { z: 117, s: 'Ts', n: 'Tennessine', w: 294, cat: 'halogen', p: 7, g: 17, v: '-1, +1', ec: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', en: null, notes: 'Superheavy halogen analogue.' },
    { z: 118, s: 'Og', n: 'Oganesson', w: 294, cat: 'noble-gas', p: 7, g: 18, v: '0', ec: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', en: null, notes: 'Heaviest known element in the periodic table.' }
  ];

  // 2. NCEES COMMON RADICALS & EQUIVALENT WEIGHTS (Handbook § 6 & Env. Manual p. 30)
  const RADICALS = [
    // CATIONS
    { type: 'Cation', name: 'Hydrogen Ion', formula: 'H⁺', mw: 1.01, z: 1, ew: 1.01, peNotes: 'Acid base scale pH = -log[H⁺]' },
    { type: 'Cation', name: 'Ammonium', formula: 'NH₄⁺', mw: 18.04, z: 1, ew: 18.04, peNotes: 'Reduced nitrogen form, nitrification substrate' },
    { type: 'Cation', name: 'Sodium', formula: 'Na⁺', mw: 23.00, z: 1, ew: 23.00, peNotes: 'Problem #92 balance (23/23 = 1.0 meq/L); NaCl ratio (Problem #82)' },
    { type: 'Cation', name: 'Potassium', formula: 'K⁺', mw: 39.10, z: 1, ew: 39.10, peNotes: 'Agricultural fertilizer component' },
    { type: 'Cation', name: 'Magnesium', formula: 'Mg²⁺', mw: 24.31, z: 2, ew: 12.15, peNotes: 'Problem #92 balance (12/12.15 = 0.99 meq/L); softening at pH > 10.8' },
    { type: 'Cation', name: 'Calcium', formula: 'Ca²⁺', mw: 40.08, z: 2, ew: 20.05, peNotes: 'Problem #92 balance (40/20.05 = 2.0 meq/L); lime-soda softening' },
    { type: 'Cation', name: 'Ferrous Iron', formula: 'Fe²⁺', mw: 55.85, z: 2, ew: 27.92, peNotes: 'Reduced soluble iron in anoxic well water' },
    { type: 'Cation', name: 'Ferric Iron', formula: 'Fe³⁺', mw: 55.85, z: 3, ew: 18.62, peNotes: 'Ferric chloride coagulant FeCl₃' },
    { type: 'Cation', name: 'Aluminum', formula: 'Al³⁺', mw: 26.98, z: 3, ew: 9.00, peNotes: 'Alum coagulant Al₂(SO₄)₃' },
    // ANIONS
    { type: 'Anion', name: 'Hydroxide', formula: 'OH⁻', mw: 17.01, z: 1, ew: 17.01, peNotes: 'pOH = 14 - pH, precipitation reagent' },
    { type: 'Anion', name: 'Chloride', formula: 'Cl⁻', mw: 35.45, z: 1, ew: 35.45, peNotes: 'Problem #92 balance (35/35.5 = 0.99 meq/L); NaCl ratio (Problem #82)' },
    { type: 'Anion', name: 'Bicarbonate', formula: 'HCO₃⁻', mw: 61.02, z: 1, ew: 61.02, peNotes: 'Primary natural water alkalinity species at pH 6.3 - 10.3' },
    { type: 'Anion', name: 'Nitrate (as NO₃⁻)', formula: 'NO₃⁻', mw: 62.00, z: 1, ew: 62.00, peNotes: 'Drinking water standard = 45 mg/L as NO₃⁻' },
    { type: 'Anion', name: 'Nitrate (as N)', formula: 'NO₃⁻-N', mw: 14.01, z: 1, ew: 14.01, peNotes: 'Problem #92 balance (14/14 = 1.0 meq/L); EPA MCL = 10 mg/L as N' },
    { type: 'Anion', name: 'Carbonate', formula: 'CO₃²⁻', mw: 60.01, z: 2, ew: 30.00, peNotes: 'Alkalinity species at high pH (> 10.3)' },
    { type: 'Anion', name: 'Sulfate', formula: 'SO₄²⁻', mw: 96.06, z: 2, ew: 48.03, peNotes: 'Problem #92 balance (48/48 = 1.0 meq/L); secondary standard = 250 mg/L' },
    { type: 'Anion', name: 'Phosphate (as PO₄³⁻)', formula: 'PO₄³⁻', mw: 94.97, z: 3, ew: 31.66, peNotes: 'Orthophosphate ion in wastewater precipitation' },
    { type: 'Anion', name: 'Phosphate (as P)', formula: 'PO₄³⁻-P', mw: 30.97, z: 3, ew: 10.32, peNotes: 'Nutrient effluent limit expressed as elemental P' },
    // COMPOUNDS & SPECIAL EQUIVALENTS
    { type: 'Compound', name: 'Alkalinity (as CaCO₃)', formula: 'CaCO₃', mw: 100.09, z: 2, ew: 50.04, peNotes: 'Problem #92 balance (150/50 = 3.0 meq/L); standard neutralization unit' },
    { type: 'Compound', name: 'Quicklime (as CaO)', formula: 'CaO', mw: 56.08, z: 2, ew: 28.04, peNotes: 'Problem #72 Softening lime requirement (eq. wt = 28.0)' },
    { type: 'Compound', name: 'Hydrated Lime', formula: 'Ca(OH)₂', mw: 74.09, z: 2, ew: 37.05, peNotes: 'Slaked lime used for pH elevation & softening' },
    { type: 'Compound', name: 'Soda Ash', formula: 'Na₂CO₃', mw: 105.99, z: 2, ew: 53.00, peNotes: 'Non-carbonate hardness removal in softening' },
    { type: 'Compound', name: 'Carbon Dioxide', formula: 'CO₂', mw: 44.01, z: 2, ew: 22.00, peNotes: 'Consumes lime in softening before hardness removal (Problem #72)' }
  ];

  // Problem #92 Baseline State
  const P92_STATE = {
    // Cations (mg/L)
    na_mg_l: 23.0,
    ca_mg_l: 40.0,
    mg_mg_l: 12.0,
    k_mg_l: 0.0,
    // Anions (mg/L)
    cl_mg_l: 35.0,
    so4_mg_l: 48.0,
    no3_n_mg_l: 14.0,
    alk_caco3_mg_l: 150.0
  };

  let activeElement = ELEMENTS[10]; // Default: Sodium (Na, Z=11)
  let activeTab = 'periodic'; // 'periodic' | 'radicals' | 'cation_anion'

  // Initialize UI & Event Listeners
  function init() {
    renderPeriodicGrid();
    renderRadicalsTable();
    updateElementInspector(activeElement);
    bindEvents();
    solveCationAnionBalance();
  }

  function renderPeriodicGrid(filterCat = 'ALL', searchQuery = '') {
    const gridEl = document.getElementById('ptElementGrid');
    if (!gridEl) return;

    const q = (searchQuery || '').trim().toLowerCase();

    // Map out grid placement
    let html = '';
    ELEMENTS.forEach(el => {
      // Category filter check
      if (filterCat !== 'ALL' && el.cat !== filterCat) return;

      // Search query check
      if (q) {
        const matches = el.s.toLowerCase().includes(q) ||
                        el.n.toLowerCase().includes(q) ||
                        String(el.z) === q;
        if (!matches) return;
      }

      // Determine CSS grid row and column
      let row = el.p;
      let col = el.g;

      // Lanthanides & Actinides sub-rows
      if (el.p === 8) { // Lanthanide row
        row = 9;
        col = el.z - 57 + 3; // start from column 3
      } else if (el.p === 9) { // Actinide row
        row = 10;
        col = el.z - 89 + 3;
      }

      const isSelected = activeElement && activeElement.z === el.z;

      html += `
        <div class="pt-element-tile cat-${el.cat} ${isSelected ? 'selected' : ''}" 
             data-z="${el.z}" 
             style="grid-row: ${row}; grid-column: ${col};"
             title="${el.n} (Atomic #${el.z}) • Mass: ${el.w} g/mol">
          <span class="pt-tile-z">${el.z}</span>
          <span class="pt-tile-symbol">${el.s}</span>
          <span class="pt-tile-name">${el.n}</span>
          <span class="pt-tile-weight">${Number(el.w).toFixed(el.w % 1 === 0 ? 0 : 2)}</span>
        </div>
      `;
    });

    // Add row markers for Lanthanides and Actinides if showing full table
    if (filterCat === 'ALL' && !q) {
      html += `
        <div class="pt-series-marker" style="grid-row: 6; grid-column: 3;" title="Lanthanides Series (Elements 57-71)">* 57-71</div>
        <div class="pt-series-marker" style="grid-row: 7; grid-column: 3;" title="Actinides Series (Elements 89-103)">** 89-103</div>
        <div class="pt-series-label" style="grid-row: 9; grid-column: 1 / span 2;">* Lanthanides</div>
        <div class="pt-series-label" style="grid-row: 10; grid-column: 1 / span 2;">** Actinides</div>
      `;
    }

    gridEl.innerHTML = html;

    // Attach click listeners to element tiles
    gridEl.querySelectorAll('.pt-element-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const z = parseInt(tile.dataset.z, 10);
        const elem = ELEMENTS.find(e => e.z === z);
        if (elem) {
          activeElement = elem;
          gridEl.querySelectorAll('.pt-element-tile').forEach(t => t.classList.remove('selected'));
          tile.classList.add('selected');
          updateElementInspector(elem);
        }
      });
    });
  }

  function updateElementInspector(el) {
    if (!el) return;

    const inspEl = document.getElementById('ptElementInspector');
    if (!inspEl) return;

    const catFormatted = el.cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    inspEl.innerHTML = `
      <div class="pt-inspector-card cat-${el.cat}">
        <div class="pt-inspector-header">
          <div class="pt-inspector-badge">
            <span class="pt-insp-z">Atomic #${el.z}</span>
            <span class="pt-insp-symbol">${el.s}</span>
            <span class="pt-insp-name">${el.n}</span>
          </div>
          <div class="pt-inspector-quickstats">
            <div class="pt-stat-row">
              <span class="pt-stat-label">Atomic Mass:</span>
              <strong class="pt-stat-val">${el.w} g/mol</strong>
            </div>
            <div class="pt-stat-row">
              <span class="pt-stat-label">Classification:</span>
              <span class="pt-stat-badge cat-${el.cat}">${catFormatted}</span>
            </div>
            <div class="pt-stat-row">
              <span class="pt-stat-label">Common Valence:</span>
              <strong class="pt-stat-val" style="color: #f59e0b;">${el.v || 'N/A'}</strong>
            </div>
            <div class="pt-stat-row">
              <span class="pt-stat-label">Electron Config:</span>
              <span class="pt-stat-val font-mono">${el.ec}</span>
            </div>
            <div class="pt-stat-row">
              <span class="pt-stat-label">Electronegativity:</span>
              <span class="pt-stat-val">${el.en !== null ? el.en : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div class="pt-inspector-notes">
          <h4 class="pt-notes-title">🌊 NCEES PE Water & Environmental Engineering Application:</h4>
          <p class="pt-notes-text">${el.notes}</p>
        </div>
      </div>
    `;
  }

  function renderRadicalsTable() {
    const tbody = document.getElementById('ptRadicalsTbody');
    if (!tbody) return;

    tbody.innerHTML = RADICALS.map(r => {
      const typeBadgeColor = r.type === 'Cation' ? 'rgba(56, 189, 248, 0.2)' : 
                             r.type === 'Anion' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)';
      const typeTextColor = r.type === 'Cation' ? '#38bdf8' : 
                            r.type === 'Anion' ? '#f87171' : '#f59e0b';

      return `
        <tr>
          <td><span class="badge" style="background: ${typeBadgeColor}; color: ${typeTextColor}; font-weight: 700;">${r.type}</span></td>
          <td style="font-weight: 700; color: var(--text-primary); font-size: 1.05rem;">${r.formula}</td>
          <td>${r.name}</td>
          <td style="font-family: monospace;">${r.mw.toFixed(2)}</td>
          <td style="font-family: monospace; font-weight: 700;">${r.z}</td>
          <td style="font-family: monospace; font-weight: 700; color: #10b981;">${r.ew.toFixed(2)}</td>
          <td style="color: var(--text-secondary); font-size: 0.85rem;">${r.peNotes}</td>
        </tr>
      `;
    }).join('');
  }

  // 3. CATION-ANION BALANCE SOLVER (PROBLEM #92)
  function solveCationAnionBalance() {
    const na_mg = parseFloat(document.getElementById('p92_na')?.value) || 0;
    const ca_mg = parseFloat(document.getElementById('p92_ca')?.value) || 0;
    const mg_mg = parseFloat(document.getElementById('p92_mg')?.value) || 0;
    const k_mg  = parseFloat(document.getElementById('p92_k')?.value) || 0;

    const cl_mg    = parseFloat(document.getElementById('p92_cl')?.value) || 0;
    const so4_mg   = parseFloat(document.getElementById('p92_so4')?.value) || 0;
    const no3_n_mg = parseFloat(document.getElementById('p92_no3_n')?.value) || 0;
    const alk_mg   = parseFloat(document.getElementById('p92_alk')?.value) || 0;

    const EW_NA = 23.0;
    const EW_CA = 20.05;
    const EW_MG = 12.15;
    const EW_K  = 39.1;

    const EW_CL    = 35.45;
    const EW_SO4   = 48.03;
    const EW_NO3_N = 14.01;
    const EW_ALK   = 50.04;

    const na_meq = na_mg / EW_NA;
    const ca_meq = ca_mg / EW_CA;
    const mg_meq = mg_mg / EW_MG;
    const k_meq  = k_mg / EW_K;

    const cl_meq    = cl_mg / EW_CL;
    const so4_meq   = so4_mg / EW_SO4;
    const no3_n_meq = no3_n_mg / EW_NO3_N;
    const alk_meq   = alk_mg / EW_ALK;

    const sumCations = na_meq + ca_meq + mg_meq + k_meq;
    const sumAnions  = cl_meq + so4_meq + no3_n_meq + alk_meq;

    const totalIons = sumCations + sumAnions;
    const diff = Math.abs(sumCations - sumAnions);
    const pctDiff = totalIons > 0 ? (diff / totalIons) * 100 : 0;

    const setText = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setText('res_na_meq', na_meq.toFixed(2) + ' meq/L');
    setText('res_ca_meq', ca_meq.toFixed(2) + ' meq/L');
    setText('res_mg_meq', mg_meq.toFixed(2) + ' meq/L');
    setText('res_k_meq', k_meq.toFixed(2) + ' meq/L');

    setText('res_cl_meq', cl_meq.toFixed(2) + ' meq/L');
    setText('res_so4_meq', so4_meq.toFixed(2) + ' meq/L');
    setText('res_no3_n_meq', no3_n_meq.toFixed(2) + ' meq/L');
    setText('res_alk_meq', alk_meq.toFixed(2) + ' meq/L');

    setText('res_sum_cations', sumCations.toFixed(2) + ' meq/L');
    setText('res_sum_anions', sumAnions.toFixed(2) + ' meq/L');
    setText('res_diff_meq', diff.toFixed(2) + ' meq/L');
    setText('res_pct_diff', pctDiff.toFixed(1) + '%');

    setText('ptKpiCations', sumCations.toFixed(2) + ' meq/L');
    setText('ptKpiAnions', sumAnions.toFixed(2) + ' meq/L');
    setText('ptKpiDiff', diff.toFixed(2) + ' meq/L');

    const statusEl = document.getElementById('ptBalanceStatus');
    const kpiStatusBadge = document.getElementById('ptKpiStatusBadge');
    let verdictHtml = '';
    let badgeClass = 'status-safe';
    let badgeText = 'ELECTRICALLY BALANCED';

    if (totalIons === 0) {
      verdictHtml = '<span style="color: var(--text-secondary);">Enter ion concentrations above to check electrical balance.</span>';
      badgeClass = 'status-warning';
      badgeText = 'NO DATA';
    } else if (pctDiff <= 2.0) {
      verdictHtml = `
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 6px; padding: 0.85rem; color: #10b981;">
          <strong>✅ Water Sample is Electrically Balanced (Δ = ${pctDiff.toFixed(1)}% ≤ 2%)</strong>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.88rem; color: var(--text-secondary);">
            The sum of cations (${sumCations.toFixed(2)} meq/L) matches the sum of anions (${sumAnions.toFixed(2)} meq/L) within Standard Methods acceptable laboratory tolerance.
          </p>
        </div>
      `;
      badgeClass = 'status-safe';
      badgeText = 'BALANCED (PASS)';
    } else if (sumAnions > sumCations) {
      verdictHtml = `
        <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 6px; padding: 0.85rem; color: #f87171;">
          <strong>❌ NOT BALANCED — Anions are Higher (${sumAnions.toFixed(2)} meq/L > ${sumCations.toFixed(2)} meq/L, Δ = ${pctDiff.toFixed(1)}%)</strong>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.88rem; color: var(--text-secondary);">
            <strong>Problem #92 Exam Answer:</strong> "No, the anions are higher (Option C)". The sample should be reviewed again or unmeasured cations (e.g. Iron, Aluminum, Potassium) are present.
          </p>
        </div>
      `;
      badgeClass = 'status-danger';
      badgeText = 'ANIONS HIGHER (REVIEW)';
    } else {
      verdictHtml = `
        <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 6px; padding: 0.85rem; color: #f87171;">
          <strong>❌ NOT BALANCED — Cations are Higher (${sumCations.toFixed(2)} meq/L > ${sumAnions.toFixed(2)} meq/L, Δ = ${pctDiff.toFixed(1)}%)</strong>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.88rem; color: var(--text-secondary);">
            The cations exceed anions by ${diff.toFixed(2)} meq/L. Review laboratory titration procedures or check for unmeasured organic anions.
          </p>
        </div>
      `;
      badgeClass = 'status-danger';
      badgeText = 'CATIONS HIGHER (REVIEW)';
    }

    if (statusEl) statusEl.innerHTML = verdictHtml;
    if (kpiStatusBadge) {
      kpiStatusBadge.className = 'npsh-status-badge ' + badgeClass;
      kpiStatusBadge.textContent = badgeText;
    }

    renderKaTeXDerivations({
      na_mg, ca_mg, mg_mg, k_mg,
      cl_mg, so4_mg, no3_n_mg, alk_mg,
      EW_NA, EW_CA, EW_MG, EW_K,
      EW_CL, EW_SO4, EW_NO3_N, EW_ALK,
      na_meq, ca_meq, mg_meq, k_meq,
      cl_meq, so4_meq, no3_n_meq, alk_meq,
      sumCations, sumAnions, diff, pctDiff
    });
  }

  function renderKaTeXDerivations(d) {
    const container = document.getElementById('ptMathContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="helical-step-card">
        <h4 style="margin: 0 0 0.4rem 0; color: #38bdf8;">Step 1: Governing Formula for Milliequivalents per Liter</h4>
        <div class="katex-eq">$$\\text{meq/L} = \\frac{\\text{Concentration (mg/L)}}{\\text{Equivalent Weight (mg/meq)}}, \\quad \\text{Equivalent Weight} = \\frac{\\text{Molar Mass } (MW)}{|\\text{Ion Charge } z|}$$</div>
      </div>

      <div class="helical-step-card">
        <h4 style="margin: 0 0 0.4rem 0; color: #38bdf8;">Step 2: Cation Milliequivalents Calculation</h4>
        <div class="katex-eq">$$\\begin{aligned}
          \\text{Na}^+: & \\quad \\frac{${d.na_mg.toFixed(1)} \\text{ mg/L}}{${d.EW_NA.toFixed(1)} \\text{ mg/meq}} = ${d.na_meq.toFixed(2)} \\text{ meq/L} \\\\[2pt]
          \\text{Ca}^{2+}: & \\quad \\frac{${d.ca_mg.toFixed(1)} \\text{ mg/L}}{${d.EW_CA.toFixed(2)} \\text{ mg/meq}} = ${d.ca_meq.toFixed(2)} \\text{ meq/L} \\\\[2pt]
          \\text{Mg}^{2+}: & \\quad \\frac{${d.mg_mg.toFixed(1)} \\text{ mg/L}}{${d.EW_MG.toFixed(2)} \\text{ mg/meq}} = ${d.mg_meq.toFixed(2)} \\text{ meq/L} \\\\[2pt]
          \\sum \\text{Cations} &= ${d.na_meq.toFixed(2)} + ${d.ca_meq.toFixed(2)} + ${d.mg_meq.toFixed(2)} + ${d.k_meq.toFixed(2)} = \\mathbf{${d.sumCations.toFixed(2)} \\text{ meq/L}}
        \\end{aligned}$$</div>
      </div>

      <div class="helical-step-card">
        <h4 style="margin: 0 0 0.4rem 0; color: #f87171;">Step 3: Anion Milliequivalents Calculation</h4>
        <div class="katex-eq">$$\\begin{aligned}
          \\text{Cl}^-: & \\quad \\frac{${d.cl_mg.toFixed(1)} \\text{ mg/L}}{${d.EW_CL.toFixed(2)} \\text{ mg/meq}} = ${d.cl_meq.toFixed(2)} \\text{ meq/L} \\\\[2pt]
          \\text{SO}_4^{2-}: & \\quad \\frac{${d.so4_mg.toFixed(1)} \\text{ mg/L}}{${d.EW_SO4.toFixed(2)} \\text{ mg/meq}} = ${d.so4_meq.toFixed(2)} \\text{ meq/L} \\\\[2pt]
          \\text{NO}_3^--\\text{N}: & \\quad \\frac{${d.no3_n_mg.toFixed(1)} \\text{ mg/L}}{${d.EW_NO3_N.toFixed(2)} \\text{ mg/meq}} = ${d.no3_n_meq.toFixed(2)} \\text{ meq/L} \\\\[2pt]
          \\text{Alkalinity as } \\text{CaCO}_3: & \\quad \\frac{${d.alk_mg.toFixed(1)} \\text{ mg/L}}{${d.EW_ALK.toFixed(2)} \\text{ mg/meq}} = ${d.alk_meq.toFixed(2)} \\text{ meq/L} \\\\[2pt]
          \\sum \\text{Anions} &= ${d.cl_meq.toFixed(2)} + ${d.so4_meq.toFixed(2)} + ${d.no3_n_meq.toFixed(2)} + ${d.alk_meq.toFixed(2)} = \\mathbf{${d.sumAnions.toFixed(2)} \\text{ meq/L}}
        \\end{aligned}$$</div>
      </div>

      <div class="helical-step-card">
        <h4 style="margin: 0 0 0.4rem 0; color: #f59e0b;">Step 4: Electrical Neutrality & Percentage Imbalance Check</h4>
        <div class="katex-eq">$$\\text{\\% Normalized Difference} = \\frac{|\\sum \\text{Cations} - \\sum \\text{Anions}|}{\\sum \\text{Cations} + \\sum \\text{Anions}} \\times 100\\% = \\frac{|${d.sumCations.toFixed(2)} - ${d.sumAnions.toFixed(2)}|}{${d.sumCations.toFixed(2)} + ${d.sumAnions.toFixed(2)}} \\times 100\\% = \\mathbf{${d.pctDiff.toFixed(1)}\\%}$$</div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">
          ${d.sumAnions > d.sumCations 
            ? `Since \\(\\sum \\text{Anions} (${d.sumAnions.toFixed(2)} \\text{ meq/L}) > \\sum \\text{Cations} (${d.sumCations.toFixed(2)} \\text{ meq/L})\\), the sample is <strong>NOT electrically balanced</strong>. The anions are higher, exactly confirming SolvedIn6 Problem #92.` 
            : `Since \\(\\sum \\text{Cations} (${d.sumCations.toFixed(2)} \\text{ meq/L}) \\approx \\sum \\text{Anions} (${d.sumAnions.toFixed(2)} \\text{ meq/L})\\), the sample satisfies electrical neutrality criteria.`}
        </p>
      </div>
    `;

    if (window.renderMathInElement) {
      window.renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  function loadProblem92Data() {
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };
    setVal('p92_na', P92_STATE.na_mg_l);
    setVal('p92_ca', P92_STATE.ca_mg_l);
    setVal('p92_mg', P92_STATE.mg_mg_l);
    setVal('p92_k', P92_STATE.k_mg_l);

    setVal('p92_cl', P92_STATE.cl_mg_l);
    setVal('p92_so4', P92_STATE.so4_mg_l);
    setVal('p92_no3_n', P92_STATE.no3_n_mg_l);
    setVal('p92_alk', P92_STATE.alk_caco3_mg_l);

    solveCationAnionBalance();
  }

  function loadBalancedPreset() {
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };
    setVal('p92_na', 23.0);
    setVal('p92_ca', 40.1);
    setVal('p92_mg', 12.15);
    setVal('p92_k', 0.0);

    setVal('p92_cl', 35.45);
    setVal('p92_so4', 48.03);
    setVal('p92_no3_n', 0.0);
    setVal('p92_alk', 100.08);

    solveCationAnionBalance();
  }

  function bindEvents() {
    document.querySelectorAll('.pt-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.ptTab;
        activeTab = tab;
        document.querySelectorAll('.pt-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.pt-tab-pane').forEach(p => p.classList.remove('active'));
        const pane = document.getElementById('ptTabPane_' + tab);
        if (pane) pane.classList.add('active');
      });
    });

    document.querySelectorAll('.pt-cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pt-cat-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.ptCat;
        const searchVal = document.getElementById('ptElementSearchInput')?.value || '';
        renderPeriodicGrid(cat, searchVal);
      });
    });

    const searchInput = document.getElementById('ptElementSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const activeCatBtn = document.querySelector('.pt-cat-filter-btn.active');
        const cat = activeCatBtn ? activeCatBtn.dataset.ptCat : 'ALL';
        renderPeriodicGrid(cat, e.target.value);
      });
    }

    const openBtn = document.getElementById('openPeriodicTableBtn');
    if (openBtn) openBtn.addEventListener('click', openModal);

    const closeBtn = document.getElementById('closePtModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const modalBackdrop = document.getElementById('periodicTableModal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }

    const ionInputs = [
      'p92_na', 'p92_ca', 'p92_mg', 'p92_k',
      'p92_cl', 'p92_so4', 'p92_no3_n', 'p92_alk'
    ];
    ionInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', solveCationAnionBalance);
    });

    const loadP92Btn = document.getElementById('ptLoadP92Btn');
    if (loadP92Btn) loadP92Btn.addEventListener('click', loadProblem92Data);

    const loadBalancedBtn = document.getElementById('ptLoadBalancedBtn');
    if (loadBalancedBtn) loadBalancedBtn.addEventListener('click', loadBalancedPreset);

    const copyReportBtn = document.getElementById('ptCopyReportBtn');
    if (copyReportBtn) {
      copyReportBtn.addEventListener('click', () => {
        const text = generateTextReport();
        navigator.clipboard.writeText(text).then(() => {
          const original = copyReportBtn.textContent;
          copyReportBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyReportBtn.textContent = original; }, 2000);
        });
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('periodicTableModal');
        if (modal && modal.classList.contains('open')) {
          closeModal();
        }
      }
    });
  }

  function generateTextReport() {
    const na = document.getElementById('p92_na')?.value || 0;
    const ca = document.getElementById('p92_ca')?.value || 0;
    const mg = document.getElementById('p92_mg')?.value || 0;
    const cl = document.getElementById('p92_cl')?.value || 0;
    const so4 = document.getElementById('p92_so4')?.value || 0;
    const no3 = document.getElementById('p92_no3_n')?.value || 0;
    const alk = document.getElementById('p92_alk')?.value || 0;

    const sumC = document.getElementById('res_sum_cations')?.textContent || '';
    const sumA = document.getElementById('res_sum_anions')?.textContent || '';
    const diff = document.getElementById('res_diff_meq')?.textContent || '';
    const pct = document.getElementById('res_pct_diff')?.textContent || '';

    return `=====================================================
NCEES PE WATER RESOURCES • CATION-ANION BALANCE REPORT
Reference: NCEES PE Reference Handbook § 6 • Problem #92
=====================================================

CATIONS (mg/L -> meq/L):
- Sodium (Na+):       ${na} mg/L / 23.00 = ${(na/23.0).toFixed(2)} meq/L
- Calcium (Ca2+):     ${ca} mg/L / 20.05 = ${(ca/20.05).toFixed(2)} meq/L
- Magnesium (Mg2+):   ${mg} mg/L / 12.15 = ${(mg/12.15).toFixed(2)} meq/L
TOTAL CATIONS:        ${sumC}

ANIONS (mg/L -> meq/L):
- Chloride (Cl-):     ${cl} mg/L / 35.45 = ${(cl/35.45).toFixed(2)} meq/L
- Sulfate (SO4 2-):   ${so4} mg/L / 48.03 = ${(so4/48.03).toFixed(2)} meq/L
- Nitrate (NO3- - N): ${no3} mg/L / 14.01 = ${(no3/14.01).toFixed(2)} meq/L
- Alkalinity (CaCO3): ${alk} mg/L / 50.04 = ${(alk/50.04).toFixed(2)} meq/L
TOTAL ANIONS:         ${sumA}

SUMMARY & CHARGE BALANCE:
- Absolute Difference |C - A|:  ${diff}
- Normalized Difference (%):    ${pct}
- Sample Electrical Verdict:    ${parseFloat(pct) <= 2.0 ? 'BALANCED' : 'NOT BALANCED (Anions Higher)'}
=====================================================`;
  }

  function openModal(preset = null) {
    const modal = document.getElementById('periodicTableModal');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (preset === 'p92' || preset === 'cation_anion') {
      const tabBtn = document.querySelector('.pt-tab-btn[data-pt-tab="cation_anion"]');
      if (tabBtn) tabBtn.click();
      loadProblem92Data();
    } else {
      const tabBtn = document.querySelector('.pt-tab-btn[data-pt-tab="periodic"]');
      if (tabBtn) tabBtn.click();
    }

    if (window.renderMathInElement) {
      window.renderMathInElement(modal, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  function closeModal() {
    const modal = document.getElementById('periodicTableModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  window.PeriodicTable = {
    open: openModal,
    close: closeModal,
    loadProblem92: loadProblem92Data,
    elements: ELEMENTS,
    radicals: RADICALS
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
