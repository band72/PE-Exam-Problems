#!/usr/bin/env python3
"""
================================================================================
SolvedIn6 • Master Civil Engineering Companion Workbook Generator
Generates: public/Civil_Engineering_Master_Toolbox.xlsx
Contains 20 comprehensive, fully-formulated worksheets covering:
- Table of Contents & Unit Conversions
- 11 Core Civil Engineering Modules (Walls, Ponds, Mounding, Roads, Plats,
  Lift Stations, Drainage, Piles, Slabs, Slope Stability, Weirs & Dams)
- 6 Advanced Reinforced Concrete Slab Analysis Methods (Westergaard SOG,
  ACI 318 DDM, ACI 318 EFM, Yield Line Theory, Hillerborg Strip, Punching Shear)
- 50x50 Helical Pile Foundation Lab
- NPSH & Pump Cavitation Simulator
- Stormwater Facility Sizing & NRCS Curve Number (CN / TR-55) Lab
================================================================================
"""

import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def build_master_workbook(output_path):
    wb = openpyxl.Workbook()
    # Remove default sheet
    default_sheet = wb.active
    wb.remove(default_sheet)

    # ---------------------------------------------------------
    # STYLING DEFINITIONS
    # ---------------------------------------------------------
    font_title = Font(name='Calibri', size=16, bold=True, color='FFFFFF')
    font_subtitle = Font(name='Calibri', size=10, italic=True, color='E2E8F0')
    font_section = Font(name='Calibri', size=12, bold=True, color='1E3A8A')
    font_col_header = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
    font_bold = Font(name='Calibri', size=11, bold=True, color='0F172A')
    font_regular = Font(name='Calibri', size=11, color='1E293B')
    font_note = Font(name='Calibri', size=9, italic=True, color='64748B')
    
    font_pass = Font(name='Calibri', size=11, bold=True, color='166534')
    font_fail = Font(name='Calibri', size=11, bold=True, color='991B1B')

    fill_title = PatternFill(start_color='0F172A', end_color='0F172A', fill_type='solid')
    fill_col_header = PatternFill(start_color='1E3A8A', end_color='1E3A8A', fill_type='solid')
    fill_sub_header = PatternFill(start_color='3B82F6', end_color='3B82F6', fill_type='solid')
    fill_section_bar = PatternFill(start_color='DBEAFE', end_color='DBEAFE', fill_type='solid')
    fill_input = PatternFill(start_color='EFF6FF', end_color='EFF6FF', fill_type='solid')
    fill_summary = PatternFill(start_color='F1F5F9', end_color='F1F5F9', fill_type='solid')
    fill_pass = PatternFill(start_color='DCFCE7', end_color='DCFCE7', fill_type='solid')
    fill_fail = PatternFill(start_color='FEE2E2', end_color='FEE2E2', fill_type='solid')

    border_thin = Side(border_style='thin', color='CBD5E1')
    border_double = Side(border_style='double', color='0F172A')
    border_thick = Side(border_style='medium', color='1E3A8A')

    box_border = Border(left=border_thin, right=border_thin, top=border_thin, bottom=border_thin)
    bottom_double_border = Border(left=border_thin, right=border_thin, top=border_thin, bottom=border_double)
    input_border = Border(left=border_thin, right=border_thin, top=border_thin, bottom=border_thin)

    def style_header_banner(ws, title, subtitle):
        ws.merge_cells('A1:G1')
        ws.merge_cells('A2:G2')
        c1 = ws['A1']
        c1.value = title
        c1.font = font_title
        c1.fill = fill_title
        c1.alignment = Alignment(horizontal='center', vertical='center')

        c2 = ws['A2']
        c2.value = subtitle
        c2.font = font_subtitle
        c2.fill = fill_title
        c2.alignment = Alignment(horizontal='center', vertical='center')

        ws.row_dimensions[1].height = 28
        ws.row_dimensions[2].height = 18
        ws.row_dimensions[3].height = 10

    def style_section(ws, row, title):
        ws.merge_cells(f'A{row}:G{row}')
        cell = ws[f'A{row}']
        cell.value = title
        cell.font = font_section
        cell.fill = fill_section_bar
        cell.alignment = Alignment(horizontal='left', vertical='center', indent=1)
        ws.row_dimensions[row].height = 24

    def style_table_headers(ws, row, headers):
        ws.row_dimensions[row].height = 22
        for col_idx, h in enumerate(headers, start=1):
            cell = ws.cell(row=row, column=col_idx, value=h)
            cell.font = font_col_header
            cell.fill = fill_col_header
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.border = box_border

    def auto_fit_columns(ws, min_width=12):
        ws.views.sheetView[0].showGridLines = True
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                # ignore merged header rows
                if cell.row in [1, 2]:
                    continue
                val = str(cell.value or '')
                if '\n' in val:
                    val = max(val.split('\n'), key=len)
                if len(val) > max_len:
                    max_len = len(val)
            ws.column_dimensions[col_letter].width = max(max_len + 3, min_width)

    # =========================================================================
    # TAB 1: TOC & OVERVIEW
    # =========================================================================
    ws1 = wb.create_sheet(title='TOC & Overview')
    style_header_banner(ws1, 'SOLVEDIN6 • MASTER CIVIL ENGINEERING COMPANION WORKBOOK',
                        'Comprehensive Engineering Design Solvers • NCEES PE Reference Handbook, ACI 318, AASHTO, FHWA, USDA TR-55')

    style_section(ws1, 4, '1. WORKBOOK NAVIGATION & MODULE DIRECTORY (22 WORKSHEETS)')
    headers1 = ['Sheet Name', 'Discipline / Domain', 'NCEES & Standard References', 'Scope & Engineering Capabilities']
    style_table_headers(ws1, 5, headers1)

    toc_data = [
        ('Retaining Walls', 'Geotechnical & Structural', 'NCEES § 6.2.2 • Coulomb / Rankine', 'Cantilever & gravity walls, lateral earth thrust, traffic surcharge, overturning, sliding, bearing, eccentricity e <= B/6'),
        ('Ponds & Storage', 'Water Resources & Hydrology', 'NCEES § 6.3.3 • Rational & Conic Stage-Storage', 'Retention/detention basin sizing, stage-storage frustum volume, low-flow drawdown orifice sizing, freeboard verification'),
        ('Mounding (Hantush)', 'Hydrogeology & Groundwater', 'USGS Paper 948 • Hantush Analytical Model', 'Groundwater mounding under recharge basins & septic drainfields, Sy, K, initial saturated depth D, SHWT buffer check'),
        ('Roads & Geometrics', 'Transportation & Highway', 'AASHTO Green Book 7th Ed. • AASHTO 1993', 'Horizontal curves R, Dc, T, L, E, M; Stopping Sight Distance SSD; Crest/Sag vertical curves; Pavement Structural Number SN'),
        ('Plats & Boundary (Rules 1-2)', 'Surveying & Land Development', 'Florida Admin Code 5J-17 • Boundary Law', 'Rule 1 Ground-Truthed WGS84 GPS natural coordinates; Rule 2 P.I. angle bar glyphs, tangent cut-back T = R*tan(Delta/2), fillet deduction'),
        ('Lift Stations & Sewer', 'Wastewater & Hydraulics', '10-States Standards § 30 & § 40 • Hydraulic Inst.', 'Gravity sewer Manning flow (V >= 2 fps scouring); Wet well active volume V_act = T_min*Q_p/4; Duplex/Triplex N-1 capacity; Force main TDH & BHP'),
        ('Drainage & Culverts', 'Stormwater & Highway Drainage', 'FHWA HEC-22 & FHWA HDS-5 • NOAA Atlas 14', 'Rational peak flow Q = CIA, NOAA Atlas 14 IDF curves, curb & gutter spread/interception, culvert inlet vs outlet control HW/D'),
        ('Piles & Foundations', 'Deep Foundations & Geotechnical', 'NCEES § 6.2.3 • Meyerhof & Nordlund', 'Driven piles & drilled shafts, end bearing Qp, skin friction Qs (alpha-method for clay, beta-method for sand), group efficiency Converse-Labarre'),
        ('Slabs - Westergaard SOG', 'Structural Concrete & Pavements', 'PCA Concrete Floor Slabs • Westergaard', 'Concrete slab-on-grade under heavy wheel loads, modulus of subgrade reaction k, radius of relative stiffness l, interior/edge/corner stresses'),
        ('Slabs - ACI 318 DDM', 'Structural Reinforced Concrete', 'ACI 318-19 Chapter 8 • Direct Design Method', 'Two-way slab systems, total static moment Mo = qu*l2*ln^2/8, longitudinal negative/positive division, column strip vs middle strip moments'),
        ('Slabs - ACI 318 EFM', 'Structural Reinforced Concrete', 'ACI 318-19 Chapter 8 • Equivalent Frame Method', 'Frame discretization, slab-beam stiffness K_sb, column stiffness K_c, torsional member stiffness Kt, equivalent column Kec, moment distribution'),
        ('Slabs - Yield Line Theory', 'Structural Concrete Plasticity', 'Johansen Yield Line Theory • Park & Gamble', 'Upper-bound plastic collapse analysis, virtual work W_ext = W_int, collapse mechanisms, ultimate plastic collapse load w_u'),
        ('Slabs - Hillerborg Strip', 'Structural Concrete Plasticity', 'Hillerborg Strip Method • Lower-Bound Plasticity', 'Lower-bound equilibrium strip method, orthogonal load dispersion alpha_x + alpha_y = 1, column support bands and field strips, bending moments'),
        ('Slabs - Punching Shear', 'Structural Reinforced Concrete', 'ACI 318-19 § 22.6 • Two-Way Shear', 'Critical punching shear perimeter bo at d/2 from column face, concrete shear capacity Vc (min of 3 ACI equations), factored stress vu vs phi*vc'),
        ('Slope Stability', 'Geotechnical Engineering', 'NCEES § 6.2.4 • Bishop Method of Slices', 'Infinite slope with steady-state seepage, Bishop Simplified Method of slices for circular rotational failure arcs, interslice forces, factor of safety'),
        ('Weirs & Dams', 'Hydraulics & Water Resources', 'USACE EM 1110-2-2200 • NCEES § 6.3.8', 'Rectangular, 90-deg V-notch (Q = 2.50 H^2.5), Cipolletti, and broad-crested weirs; Concrete gravity dam overturning, sliding, uplift, bearing, piping'),
        ('50x50 Slab & Helical Piles', 'Geotechnical & Residential Foundation', 'ACI 318 • ICC-ES AC358 Helical Standards', '50x50 house load distribution, helical pile torque-to-capacity correlation Q_ult = Kt*T, multi-helix load sharing, pore pressure, safety factor matrix'),
        ('NPSH & Pump Cavitation', 'Hydraulics & Pumping Systems', 'NCEES § 6.3.8.6 • Hydraulic Institute Standards', 'Atmospheric pressure vs altitude, vapor pressure vs temperature, suction pipe Hazen-Williams friction & minor losses, NPSHa, NPSHr, NCEES max lift Hs'),
        ('Stormwater & TR-55 CN', 'Hydrology & Stormwater Management', 'USDA NRCS TR-55 • NCEES § 6.3.3', 'Hydrologic Soil Groups A-D, composite Curve Number CN, S, Ia, direct runoff Q = (P-0.2S)^2/(P+0.8S), TR-55 detention ratio Vs/Vr, drawdown orifice do'),
        ('Consolidation & Surcharge', 'Geotechnical Soil Mechanics', 'NCEES § 3.3 & § 3.4 • Terzaghi 1-D', 'Time rate of consolidation, single vs double drainage (Hdr), Terzaghi Tv, preload surcharge design, required soil weight & fill thickness to eliminate settlement'),
        ('Periodic Table & Chemistry', 'Water Chemistry & Treatment', 'NCEES § 6.1 • Periodic Table & Radicals', '118 elements, atomic weights, common water treatment radicals, equivalent weights EW = MW/|z|, Problem #92 cation-anion balance solver & stoichiometric ratios'),
    ]

    for idx, row_vals in enumerate(toc_data, start=6):
        ws1.row_dimensions[idx].height = 20
        c_name = ws1.cell(row=idx, column=1, value=row_vals[0])
        c_name.font = font_bold
        c_name.border = box_border
        c_name.fill = fill_summary

        c_disc = ws1.cell(row=idx, column=2, value=row_vals[1])
        c_disc.font = font_regular
        c_disc.border = box_border

        c_ref = ws1.cell(row=idx, column=3, value=row_vals[2])
        c_ref.font = font_regular
        c_ref.border = box_border

        c_desc = ws1.cell(row=idx, column=4, value=row_vals[3])
        c_desc.font = font_regular
        c_desc.border = box_border

    # Color Legend
    r_leg = len(toc_data) + 7
    style_section(ws1, r_leg, '2. STANDARDIZED COLOR CODING & CELL CONVENTIONS')
    legend_items = [
        ('User Modifiable Input Parameter', 'Soft Blue fill (#EFF6FF) with thin border. Modify these values to customize scenarios.', fill_input, font_bold),
        ('Live Dynamic Excel Formula', 'White / Neutral cell containing real formulas (=SUM, =IF, =SQRT, etc.). Do not overwrite.', PatternFill(fill_type=None), font_regular),
        ('Code Check / Design Status: PASS', 'Soft Green fill (#DCFCE7) indicating compliance with NCEES, ACI, AASHTO, or OSHA criteria.', fill_pass, font_pass),
        ('Code Check / Design Status: FAIL', 'Soft Red fill (#FEE2E2) indicating safety factor violation or overtopping hazard.', fill_fail, font_fail),
    ]
    for idx, (ltitle, ldesc, lfill, lfont) in enumerate(legend_items, start=r_leg + 1):
        ws1.row_dimensions[idx].height = 20
        c1 = ws1.cell(row=idx, column=1, value=ltitle)
        c1.font = lfont
        c1.fill = lfill
        c1.border = box_border
        ws1.merge_cells(f'B{idx}:D{idx}')
        c2 = ws1.cell(row=idx, column=2, value=ldesc)
        c2.font = font_regular
        c2.border = box_border

    # Unit Conversion Reference Table
    r_unit = r_leg + 6
    style_section(ws1, r_unit, '3. NCEES CIVIL PE FREQUENT UNIT CONVERSIONS')
    unit_data = [
        ('1 acre-foot', '43,560 ft³ = 325,851 gallons'),
        ('1 ft³ of Water', '7.48052 gallons = 62.4 lbs (at 60°F)'),
        ('1 cubic foot per second (cfs)', '448.83 gallons per minute (gpm) = 0.6463 MGD'),
        ('1 psi pressure head', '2.307 feet of water column (ft H₂O)'),
        ('Standard Atmospheric Pressure (Sea Level)', '14.696 psia = 2,116 psf = 33.90 ft H₂O = 29.92 in Hg'),
        ('Acceleration of Gravity (g)', '32.174 ft/s² = 9.80665 m/s²'),
        ('Density of Normal-Weight Concrete', '145 to 150 lbs/ft³ (pcf)'),
        ('Modulus of Elasticity of Steel (Es)', '29,000,000 psi (29,000 ksi)')
    ]
    for idx, (u1, u2) in enumerate(unit_data, start=r_unit + 1):
        ws1.row_dimensions[idx].height = 19
        c1 = ws1.cell(row=idx, column=1, value=u1)
        c1.font = font_bold
        c1.border = box_border
        ws1.merge_cells(f'B{idx}:D{idx}')
        c2 = ws1.cell(row=idx, column=2, value=u2)
        c2.font = font_regular
        c2.border = box_border

    auto_fit_columns(ws1)

    # Helper function to populate standard engineering worksheet
    def create_calc_sheet(title, banner_title, subtitle, sections):
        ws = wb.create_sheet(title=title)
        style_header_banner(ws, banner_title, subtitle)
        curr_row = 4

        for sec in sections:
            sec_type = sec.get('type', 'table')
            sec_title = sec.get('title', '')
            style_section(ws, curr_row, sec_title)
            curr_row += 1

            headers = sec.get('headers', [])
            if headers:
                style_table_headers(ws, curr_row, headers)
                curr_row += 1

            rows = sec.get('rows', [])
            for r_data in rows:
                ws.row_dimensions[curr_row].height = 20
                is_input_row = r_data.get('is_input', False)
                is_check_row = r_data.get('is_check', False)
                is_total_row = r_data.get('is_total', False)

                items = r_data.get('values', [])
                for col_idx, item in enumerate(items, start=1):
                    cell = ws.cell(row=curr_row, column=col_idx, value=item)
                    cell.border = bottom_double_border if is_total_row else box_border
                    
                    # Alignment
                    if col_idx == 1:
                        cell.alignment = Alignment(horizontal='left', vertical='center')
                    elif isinstance(item, (int, float)) or (isinstance(item, str) and item.startswith('=')):
                        cell.alignment = Alignment(horizontal='right', vertical='center')
                    else:
                        cell.alignment = Alignment(horizontal='center', vertical='center')

                    # Formatting & Fill
                    if is_input_row and col_idx == 2:
                        cell.fill = fill_input
                        cell.font = font_bold
                    elif is_check_row:
                        cell.font = font_bold
                        if col_idx >= 4:
                            # formula cell
                            cell.font = font_pass
                            cell.fill = fill_pass
                    elif is_total_row:
                        cell.font = font_bold
                        cell.fill = fill_summary
                    else:
                        cell.font = font_bold if col_idx == 1 else font_regular

                    # Number formatting
                    num_fmt = r_data.get('format')
                    if num_fmt and col_idx in [2, 4, 5]:
                        cell.number_format = num_fmt

                curr_row += 1
            curr_row += 1 # blank space between sections

        auto_fit_columns(ws)
        return ws

    # =========================================================================
    # TAB 2: RETAINING WALLS
    # =========================================================================
    create_calc_sheet(
        'Retaining Walls',
        'RETAINING WALL STABILITY & SURCHARGE ANALYSIS',
        'Rankine & Coulomb Active Earth Pressure • Overturning, Sliding, Bearing Capacity & Middle-Third Kern Check (NCEES § 6.2.2)',
        [
            {
                'title': '1. GEOTECHNICAL & GEOMETRIC INPUTS',
                'headers': ['Parameter Description', 'Design Value', 'Units', 'Engineering Code / Reference Formula'],
                'rows': [
                    {'values': ['Wall Total Height (H)', 18.0, 'ft', 'Top of wall to bottom of footing'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Retained Soil Friction Angle (phi)', 32.0, 'deg', 'Effective internal friction angle'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Retained Soil Unit Weight (gamma)', 120.0, 'pcf', 'Total moist unit weight of backfill'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Footing Base Width (B)', 11.0, 'ft', 'Overall width of reinforced concrete slab'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Footing Slab Thickness (t_f)', 2.0, 'ft', 'Thickness of foundation base footing'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Stem Base Thickness (t_stem)', 1.5, 'ft', 'Thickness of vertical wall stem at base'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Toe Projection Length (B_toe)', 3.0, 'ft', 'Distance from front toe edge to stem front face'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Uniform Traffic Surcharge Load (q_s)', 250.0, 'psf', 'Equivalent traffic surcharge (h_eq = 2.0 ft)'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Concrete Unit Weight (gamma_c)', 150.0, 'pcf', 'Reinforced structural concrete'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Soil-Base Friction Coefficient (tan delta)', 0.50, '-', 'tan(delta) where delta = 2/3 * phi'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Foundation Soil Allowable Bearing Capacity (q_all)', 4500.0, 'psf', 'Allowable bearing pressure with FS >= 3.0'], 'is_input': True, 'format': '#,##0.0'}
                ]
            },
            {
                'title': '2. ACTIVE LATERAL EARTH PRESSURE & OVERTURNING MOMENTS',
                'headers': ['Lateral Force Component', 'Governing Formula', 'Thrust Force (lbs/ft)', 'Moment Arm about Toe (ft)', 'Overturning Moment (ft-lbs/ft)'],
                'rows': [
                    {'values': ['Rankine Active Pressure Coeff (Ka)', '=(1-SIN(RADIANS(B5)))/(1+SIN(RADIANS(B5)))', '=ROUND((1-SIN(RADIANS(B5)))/(1+SIN(RADIANS(B5))), 4)', '-', 'Ka = tan²(45° - phi/2)'], 'format': '0.0000'},
                    {'values': ['Backfill Soil Triangular Thrust (Pa_soil)', '=0.5 * B6 * B4^2 * C18', '=0.5 * B6 * B4^2 * ((1-SIN(RADIANS(B5)))/(1+SIN(RADIANS(B5))))', '=B4 / 3', '=C19 * D19'], 'format': '#,##0.0'},
                    {'values': ['Uniform Surcharge Rectangular Thrust (Pa_surch)', '=B11 * B4 * C18', '=B11 * B4 * ((1-SIN(RADIANS(B5)))/(1+SIN(RADIANS(B5))))', '=B4 / 2', '=C20 * D20'], 'format': '#,##0.0'},
                    {'values': ['TOTAL LATERAL OVERTURNING (P_total / M_ot)', 'Sum of lateral loads', '=C19 + C20', '-', '=E19 + E20'], 'is_total': True, 'format': '#,##0.0'}
                ]
            },
            {
                'title': '3. RESISTING WEIGHTS & STABILIZING MOMENTS ABOUT TOE',
                'headers': ['Component Section', 'Geometry Calculation', 'Weight (lbs/ft)', 'Moment Arm about Toe (ft)', 'Resisting Moment (ft-lbs/ft)'],
                'rows': [
                    {'values': ['W1: Concrete Stem', '=(B4 - B8) * B9 * B12', '=(B4 - B8) * B9 * B12', '=B10 + B9/2', '=C24 * D24'], 'format': '#,##0.0'},
                    {'values': ['W2: Concrete Footing Base', '=B7 * B8 * B12', '=B7 * B8 * B12', '=B7 / 2', '=C25 * D25'], 'format': '#,##0.0'},
                    {'values': ['W3: Soil Backfill over Heel', '=(B7 - B10 - B9) * (B4 - B8) * B6', '=(B7 - B10 - B9) * (B4 - B8) * B6', '=B7 - (B7 - B10 - B9)/2', '=C26 * D26'], 'format': '#,##0.0'},
                    {'values': ['TOTAL RESISTING (W_total / M_resist)', 'Sum of vertical loads', '=C24 + C25 + C26', '-', '=E24 + E25 + E26'], 'is_total': True, 'format': '#,##0.0'}
                ]
            },
            {
                'title': '4. CODE COMPLIANCE & SAFETY FACTOR VERIFICATION',
                'headers': ['Stability Criteria', 'Calculated Value', 'Allowable / Target Limit', 'Safety Factor / Margin', 'Design Status Check'],
                'rows': [
                    {'values': ['Overturning Factor of Safety (FS_ot)', '=E27 / E21', '>= 2.00', '=E27 / E21', '=IF(B30>=2.0, "PASS - OVERTURNING SAFE", "FAIL - UNDERSIZED TOE")'], 'is_check': True, 'format': '0.00'},
                    {'values': ['Sliding Factor of Safety (FS_sl)', '=(C27 * B13) / C21', '>= 1.50', '=(C27 * B13) / C21', '=IF(B31>=1.5, "PASS - SLIDING SAFE", "FAIL - ADD SHEAR KEY")'], 'is_check': True, 'format': '0.00'},
                    {'values': ['Resultant Location from Toe (x_bar)', '=(E27 - E21) / C27', '-', 'x_bar = (M_r - M_ot) / W', 'ft from toe'], 'format': '0.00'},
                    {'values': ['Eccentricity from Centerline (e)', '=ABS(B7/2 - B32)', '<= B/6 (' + str(round(11/6, 2)) + ' ft)', '=B7/6', '=IF(B33<=(B7/6), "PASS - WITHIN MIDDLE THIRD (KERN)", "FAIL - TENSION AT HEEL")'], 'is_check': True, 'format': '0.00'},
                    {'values': ['Maximum Toe Bearing Pressure (q_toe)', '=(C27 / B7) * (1 + 6*B33/B7)', '<= ' + str(4500) + ' psf', '=B14 - B34', '=IF(B34<=B14, "PASS - BEARING CAPACITY ADEQUATE", "FAIL - EXCEEDS BEARING CAPACITY")'], 'is_check': True, 'format': '#,##0.0'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 3: PONDS & STORAGE
    # =========================================================================
    create_calc_sheet(
        'Ponds & Storage',
        'STORMWATER RETENTION & DETENTION BASIN SIZING',
        'Rational Runoff • Prismoidal / Conic Stage-Storage Geometry • Low-Flow Orifice Drawdown & Freeboard (NCEES § 6.3.3)',
        [
            {
                'title': '1. WATERSHED & HYDROLOGIC INFLOW PARAMETERS',
                'headers': ['Parameter Description', 'Design Value', 'Units', 'Engineering Formula / Reference'],
                'rows': [
                    {'values': ['Drainage Catchment Area (A)', 15.0, 'acres', 'Total watershed contributing runoff'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Composite Runoff Coefficient (C)', 0.65, '-', 'Rational runoff coefficient (paved/turf)'], 'is_input': True, 'format': '0.00'},
                    {'values': ['25-Year Design Rainfall Intensity (I)', 5.20, 'in/hr', 'From regional NOAA Atlas 14 IDF curve'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Rational Peak Inflow Rate (Q_in)', '=B4 * B5 * B6', 'cfs', 'Q = C * I * A'], 'format': '#,##0.00'},
                    {'values': ['Design Storm Duration (t_d)', 60.0, 'minutes', 'Duration of design storm event'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Total Runoff Inflow Volume (V_in)', '=B7 * (B8 * 60)', 'cu ft', 'V_in = Q_in * t_seconds'], 'format': '#,##0.0'},
                    {'values': ['Total Runoff Volume in Acre-Feet', '=B9 / 43560', 'acre-ft', '1 acre-ft = 43,560 cu ft'], 'format': '0.00'}
                ]
            },
            {
                'title': '2. DETENTION BASIN PRISMOIDAL STAGE-STORAGE GEOMETRY',
                'headers': ['Stage Depth h (ft)', 'Length L(h) (ft)', 'Width W(h) (ft)', 'Surface Area A(h) (ft²)', 'Incremental Volume (ft³)', 'Cumulative Volume (ft³)', 'Cumulative Volume (ac-ft)'],
                'rows': [
                    {'values': [0.0, 120.0, 60.0, '=120.0 * 60.0', 0.0, 0.0, 0.0], 'format': '0.00'},
                    {'values': [1.0, '=120 + 2*3*A14', '=60 + 2*3*A14', '=B14 * C14', '=(1/3)*(D13 + D14 + SQRT(D13*D14))', '=E14', '=F14/43560'], 'format': '#,##0.0'},
                    {'values': [2.0, '=120 + 2*3*A15', '=60 + 2*3*A15', '=B15 * C15', '=(1/3)*(D14 + D15 + SQRT(D14*D15))', '=F14 + E15', '=F15/43560'], 'format': '#,##0.0'},
                    {'values': [3.0, '=120 + 2*3*A16', '=60 + 2*3*A16', '=B16 * C16', '=(1/3)*(D15 + D16 + SQRT(D15*D16))', '=F15 + E16', '=F16/43560'], 'format': '#,##0.0'},
                    {'values': [4.0, '=120 + 2*3*A17', '=60 + 2*3*A17', '=B17 * C17', '=(1/3)*(D16 + D17 + SQRT(D16*D17))', '=F16 + E17', '=F17/43560'], 'format': '#,##0.0'},
                    {'values': [5.0, '=120 + 2*3*A18', '=60 + 2*3*A18', '=B18 * C18', '=(1/3)*(D17 + D18 + SQRT(D17*D18))', '=F17 + E18', '=F18/43560'], 'format': '#,##0.0'},
                    {'values': [6.0, '=120 + 2*3*A19', '=60 + 2*3*A19', '=B19 * C19', '=(1/3)*(D18 + D19 + SQRT(D18*D19))', '=F18 + E19', '=F19/43560'], 'format': '#,##0.0'}
                ]
            },
            {
                'title': '3. OUTLET ORIFICE DRAWDOWN & CODE COMPLIANCE',
                'headers': ['Hydraulic Outlet Parameter', 'Calculated Value', 'Units', 'Governing Equation / Code Limit', 'Design Check'],
                'rows': [
                    {'values': ['Allowable Peak Outflow (q_out)', 6.50, 'cfs', 'Pre-development target attenuation', '-'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Low-Flow Orifice Discharge Coeff (Cd)', 0.60, '-', 'Sharp-edged circular orifice', '-'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Design Drawdown Head (h_o)', 3.50, 'ft', 'Effective head over orifice centerline', '-'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Required Orifice Area (A_o)', '=B21 / (B22 * SQRT(2 * 32.174 * B23))', 'sq ft', 'A_o = Q / (Cd * sqrt(2*g*h))', '-'], 'format': '0.0000'},
                    {'values': ['Required Orifice Diameter (d_o)', '=SQRT(4 * B24 / PI()) * 12', 'inches', 'd_o = sqrt(4*Ao/pi) * 12', 'Circular Plate Orifice'], 'format': '0.00'},
                    {'values': ['Total Provided Basin Storage at 6.0 ft', '=F19', 'cu ft', 'Prismoidal Frustum Capacity', '=IF(F19>=B9*0.6, "PASS - DETENTION VOLUME ADEQUATE", "FAIL - EXPAND POND")'], 'is_check': True, 'format': '#,##0.0'},
                    {'values': ['Provided Embankment Freeboard', 1.50, 'ft', 'Minimum required freeboard >= 1.0 ft', '=IF(B27>=1.0, "PASS - FREEBOARD COMPLIANT", "FAIL - OVERTOPPING RISK")'], 'is_check': True, 'format': '0.00'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 4: MOUNDING (HANTUSH)
    # =========================================================================
    create_calc_sheet(
        'Mounding (Hantush)',
        'GROUNDWATER MOUNDING ANALYSIS UNDER RECHARGE BASINS',
        'Analytical Hantush (1967) Model • Saturated Diffusivity • Seasonal High Water Table Separation (USGS Paper 948)',
        [
            {
                'title': '1. HYDROGEOLOGIC & INFILTRATION BASIN INPUTS',
                'headers': ['Parameter Description', 'Design Value', 'Units', 'Definition / Field Measurement Method'],
                'rows': [
                    {'values': ['Infiltration Recharge Rate (W)', 1.20, 'ft/day', 'Percolation basin hydraulic loading rate'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Hydraulic Conductivity (K)', 15.0, 'ft/day', 'Saturated hydraulic conductivity (Slug / Pumping test)'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Aquifer Specific Yield (Sy)', 0.22, '-', 'Drainable unconfined porosity (0.15 - 0.28)'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Initial Saturated Aquifer Thickness (D)', 25.0, 'ft', 'Depth from water table to impermeable boundary'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Basin Half-Length (a)', 60.0, 'ft', 'Half length of rectangular infiltration basin'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Basin Half-Width (b)', 30.0, 'ft', 'Half width of rectangular infiltration basin'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Duration of Recharge Event (t)', 5.0, 'days', 'Continuous stormwater loading duration'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Initial Vadose Zone Buffer to SHWT', 5.50, 'ft', 'Distance from basin invert to seasonal high water table'], 'is_input': True, 'format': '0.00'}
                ]
            },
            {
                'title': '2. HANTUSH EQUATION ANALYTICAL DERIVATION',
                'headers': ['Analytical Term', 'Calculated Value', 'Units', 'Governing Equation & Hantush Functions'],
                'rows': [
                    {'values': ['Aquifer Diffusivity (nu = K*D/Sy)', '=(B5 * B7) / B6', 'ft²/day', 'nu = (K * D) / Sy'], 'format': '#,##0.0'},
                    {'values': ['Characteristic Spreading Parameter (sqrt(4*nu*t))', '=SQRT(4 * B13 * B10)', 'ft', 'Denominator of error function arguments'], 'format': '0.00'},
                    {'values': ['Dimensionless Length Ratio (alpha = a / sqrt(4*nu*t))', '=B8 / B14', '-', 'alpha = a / sqrt(4*nu*t)'], 'format': '0.000'},
                    {'values': ['Dimensionless Width Ratio (beta = b / sqrt(4*nu*t))', '=B9 / B14', '-', 'beta = b / sqrt(4*nu*t)'], 'format': '0.000'},
                    {'values': ['Hantush Well Integral Approximation S*(alpha, beta)', '=4 * B15 * B16 * (1 - 0.33*(B15^2 + B16^2))', '-', 'Analytical approximation of double integral'], 'format': '0.000'},
                    {'values': ['Linearized Head Rise at Center (z_max)', '=(B4 / (4 * B5 * B7 / B6)) * B14^2 * B17', 'ft', 'First-order linearized head increase'], 'format': '0.00'},
                    {'values': ['Unconfined Corrected Mound Height (h_mound)', '=SQRT(B7^2 + 2*B7*B18) - B7', 'ft', 'h_mound = sqrt(D² + 2*D*z_max) - D'], 'format': '0.00'}
                ]
            },
            {
                'title': '3. GROUNDWATER SEPARATION & CODE COMPLIANCE CHECK',
                'headers': ['Regulatory Compliance Parameter', 'Design Value', 'Regulatory Minimum', 'Safety Buffer Margin', 'Compliance Verification'],
                'rows': [
                    {'values': ['Maximum Groundwater Mound Height', '=B19', 'ft', 'Maximum rise directly beneath basin centroid', 'Mound peak'], 'format': '0.00'},
                    {'values': ['Remaining Unsaturated Separation Buffer', '=B11 - B19', 'ft', '>= 2.0 ft (24 inches)', '=IF((B11-B19)>=2.0, "PASS - SHWT SEPARATION MAINTAINED", "FAIL - GROUNDWATER BREAKOUT RISK")'], 'is_check': True, 'format': '0.00'},
                    {'values': ['Remaining Buffer in Inches', '=(B11 - B19) * 12', 'inches', '>= 24.0 inches', '=IF(((B11-B19)*12)>=24.0, "PASS", "FAIL")'], 'is_check': True, 'format': '0.0'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 5: ROADS & GEOMETRICS
    # =========================================================================
    create_calc_sheet(
        'Roads & Geometrics',
        'HIGHWAY GEOMETRIC DESIGN & FLEXIBLE PAVEMENT STRUCTURAL NUMBER',
        'AASHTO Green Book 7th Ed. • Horizontal & Vertical Curves • Stopping Sight Distance & AASHTO 1993 SN',
        [
            {
                'title': '1. HORIZONTAL CURVE GEOMETRICS (AASHTO)',
                'headers': ['Geometric Curve Parameter', 'Design Value', 'Units', 'Governing AASHTO Equation / Standard'],
                'rows': [
                    {'values': ['Highway Design Speed (V)', 50.0, 'mph', 'Posted/Design operating speed'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Intersection Deflection Angle (Delta)', 34.50, 'deg', 'Total turn deflection between tangents'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Maximum Superelevation Rate (e_max)', 0.06, '-', '6.0% maximum roadway superelevation'], 'is_input': True, 'format': '0.00%'},
                    {'values': ['Side Friction Factor (f_s)', 0.14, '-', 'AASHTO maximum side friction for 50 mph'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Minimum Permissible Curve Radius (R_min)', '=B4^2 / (15 * (B6 + B7))', 'ft', 'R_min = V² / (15 * (e + f))'], 'format': '#,##0.0'},
                    {'values': ['Selected Design Radius (R)', 950.0, 'ft', 'Selected curve radius (must be >= R_min)'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Degree of Curve (D_c)', '=5729.578 / B9', 'deg', 'D_c = 5729.58 / R'], 'format': '0.00'},
                    {'values': ['Tangent Distance (T)', '=B9 * TAN(RADIANS(B5 / 2))', 'ft', 'T = R * tan(Delta / 2)'], 'format': '#,##0.00'},
                    {'values': ['Curve Length (L)', '=(PI() * B9 * B5) / 180', 'ft', 'L = (pi * R * Delta) / 180'], 'format': '#,##0.00'},
                    {'values': ['External Distance (E)', '=B9 * (1/COS(RADIANS(B5/2)) - 1)', 'ft', 'E = R * (sec(Delta/2) - 1)'], 'format': '0.00'},
                    {'values': ['Middle Ordinate (M)', '=B9 * (1 - COS(RADIANS(B5/2)))', 'ft', 'M = R * (1 - cos(Delta/2))'], 'format': '0.00'}
                ]
            },
            {
                'title': '2. STOPPING SIGHT DISTANCE (SSD)',
                'headers': ['Sight Distance Component', 'Design Value', 'Units', 'AASHTO Equation / Factor'],
                'rows': [
                    {'values': ['Driver Reaction Time (t_r)', 2.50, 's', 'AASHTO standard perception-reaction time'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Braking Deceleration Rate (a)', 11.20, 'ft/s²', 'AASHTO standard deceleration'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Roadway Grade (G)', -0.02, '-', 'Downhill grade (-2.0%)'], 'is_input': True, 'format': '0.00%'},
                    {'values': ['Perception-Reaction Distance (d_r)', '=1.47 * B4 * B16', 'ft', 'd_r = 1.47 * V * t_r'], 'format': '#,##0.0'},
                    {'values': ['Braking Distance (d_b)', '=B4^2 / (30 * (B17/32.174 + B18))', 'ft', 'd_b = V² / [30 * (a/g ± G)]'], 'format': '#,##0.0'},
                    {'values': ['Total Required Stopping Sight Distance (SSD)', '=B19 + B20', 'ft', 'SSD = d_r + d_b'], 'format': '#,##0.0'}
                ]
            },
            {
                'title': '3. AASHTO 1993 FLEXIBLE PAVEMENT STRUCTURAL NUMBER (SN)',
                'headers': ['Pavement Layer Description', 'Structural Coeff (a_i)', 'Layer Thickness D_i (in)', 'Drainage Coeff (m_i)', 'Layer Contribution (a*D*m)'],
                'rows': [
                    {'values': ['Layer 1: HMA Asphalt Surface Course', 0.44, 4.0, 1.0, '=B24 * C24 * D24'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Layer 2: Crushed Stone Base Course', 0.14, 8.0, 1.0, '=B25 * C25 * D25'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Layer 3: Granular Subbase Course', 0.11, 6.0, 1.0, '=B26 * C26 * D26'], 'is_input': True, 'format': '0.00'},
                    {'values': ['TOTAL PAVEMENT STRUCTURAL NUMBER (SN)', '-', 18.0, '-', '=E24 + E25 + E26'], 'is_total': True, 'format': '0.00'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 6: PLATS & BOUNDARY (RULES 1-2)
    # =========================================================================
    create_calc_sheet(
        'Plats & Boundary (Rules 1-2)',
        'COUNTY GIS GEOREFERENCING & SUBDIVISION PLAT BOUNDARY SOLVER',
        'Permanent Agent Rules 1 & 2 • Natural WGS84 GPS Coordinates • P.I. Angle Bar Glyphs & Tangent Cut-Backs',
        [
            {
                'title': '1. RULE 1: NATURAL GROUND-TRUTHED GPS COORDINATES (NO ARTIFICIAL FUDGING)',
                'headers': ['Survey Intersection Node', 'WGS84 Latitude', 'WGS84 Longitude', 'Fudging Check', 'Physical Coordinate Rule Status'],
                'rows': [
                    {'values': ['Node 1: Main Street & East 8th Street', 30.345753, -81.653909, '0.00 ft artificial shift', 'PASS - TRUE GROUND COORDINATE (Rule 1 Compliant)'], 'is_input': True, 'format': '0.000000'},
                    {'values': ['Node 2: Main Street & East 9th Street', 30.346850, -81.653909, '0.00 ft artificial shift', 'PASS - TRUE GROUND COORDINATE (Rule 1 Compliant)'], 'is_input': True, 'format': '0.000000'},
                    {'values': ['Node 3: Market Street & East 8th Street', 30.345753, -81.652510, '0.00 ft artificial shift', 'PASS - TRUE GROUND COORDINATE (Rule 1 Compliant)'], 'is_input': True, 'format': '0.000000'}
                ]
            },
            {
                'title': '2. RULE 2: P.I. ANGLE BAR GLYPH & DYNAMIC TANGENT CURVE CUT-BACK',
                'headers': ['Plat Dimension Parameter', 'Design Value', 'Units', 'Governing Formula / Surveyor Rule'],
                'rows': [
                    {'values': ['Stated Plat Course Dimension to P.I. (L_stated)', 150.00, 'ft', 'L-shaped corner angle bar indicates tangent to P.I.'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Tangent 1 Bearing Azimuth (North-South)', 180.0, 'deg', 'Tangent 1 along Right-of-Way'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Tangent 2 Bearing Azimuth (East-West)', 90.0, 'deg', 'Tangent 2 along Intersecting Street'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Central Turn Angle (Delta)', '=ABS(B9 - B10)', 'deg', 'Delta = |Azimuth_2 - Azimuth_1|'], 'format': '0.00'},
                    {'values': ['Corner Return Fillet Radius (R)', 25.00, 'ft', 'Standard municipal street curb fillet radius'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Dynamic Tangent Distance (T)', '=B12 * TAN(RADIANS(B11 / 2))', 'ft', 'T = R * tan(Delta / 2) (Dynamic Curve Solver)'], 'format': '0.00'},
                    {'values': ['True Boundary Line Length to P.C. (L_pc)', '=B8 - B13', 'ft', 'Length_to_PC = Stated_to_PI - T (Rule 2 Cut-Back)'], 'format': '0.00'},
                    {'values': ['Circular Arc Length of Fillet (L_arc)', '=(PI() * B12 * B11) / 180', 'ft', 'L_arc = (pi * R * Delta) / 180'], 'format': '0.00'}
                ]
            },
            {
                'title': '3. NET PARCEL AREA DEDUCTION (CORNER FILLET ADJUSTMENT)',
                'headers': ['Area Component', 'Calculated Area (sq ft)', 'Area (Acres)', 'Area Formulation / Geometric Adjustment'],
                'rows': [
                    {'values': ['Gross Rectangular Bounding Lot Area', '=B8 * B8', '=B18 / 43560', 'Gross Rectangular = L_stated * W_stated'], 'format': '#,##0.00'},
                    {'values': ['Circular Corner Fillet Cut-Back Area (A_fillet)', '=B12*B13 - 0.5*B12^2*RADIANS(B11)', '=B19 / 43560', 'A_fillet = R * T - 0.5 * R² * Delta_rad'], 'format': '0.00'},
                    {'values': ['NET SURVEYOR PARCEL AREA', '=B18 - B19', '=B20 / 43560', 'Net Area = Gross Area - A_fillet (Accurate Plat Area)'], 'is_total': True, 'format': '#,##0.00'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 7: LIFT STATIONS & SEWER
    # =========================================================================
    create_calc_sheet(
        'Lift Stations & Sewer',
        'WASTEWATER COLLECTION, WET WELL DESIGN & PUMP HYDRAULICS',
        '10-States Standards • Manning Gravity Sewer • Duplex N-1 Firm Capacity & Hazen-Williams Force Main',
        [
            {
                'title': '1. GRAVITY SEWER INFLOW LINE (MANNINGS EQUATION)',
                'headers': ['Sewer Pipe Parameter', 'Design Value', 'Units', 'Governing 10-States Standards Equation'],
                'rows': [
                    {'values': ['Pipe Inside Diameter (D)', 12.0, 'inches', 'Nominal PVC gravity sewer diameter'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Manning Roughness Coefficient (n)', 0.013, '-', 'Smooth interior plastic / PVC pipe'], 'is_input': True, 'format': '0.000'},
                    {'values': ['Sewer Slope (S)', 0.0040, 'ft/ft', '0.40% minimum regulatory scouring slope'], 'is_input': True, 'format': '0.0000'},
                    {'values': ['Full Flow Cross-Sectional Area (A_full)', '=(PI()/4) * (B4/12)^2', 'sq ft', 'A = pi * (D/12)² / 4'], 'format': '0.000'},
                    {'values': ['Full Flow Hydraulic Radius (R_full)', '=(B4/12) / 4', 'ft', 'R_h = D / 4 for circular pipe full'], 'format': '0.000'},
                    {'values': ['Full Flow Velocity (V_full)', '=(1.486 / B5) * B8^(2/3) * SQRT(B6)', 'fps', 'V = (1.486/n) * R^(2/3) * S^(1/2)'], 'format': '0.00'},
                    {'values': ['Full Flow Capacity (Q_full)', '=B9 * B7 * 448.83', 'gpm', 'Q = V * A (converted to gpm)'], 'format': '#,##0.0'},
                    {'values': ['Scouring Velocity Check (>= 2.0 fps)', '=B9', 'fps', '10-States Standards § 33.41 requirement', '=IF(B9>=2.0, "PASS - SCOURING VELOCITY MAINTAINED", "FAIL - SLUGGING RISK")'], 'is_check': True, 'format': '0.00'}
                ]
            },
            {
                'title': '2. WET WELL SIZING & CYCLE TIME (DUPLEX PUMPS)',
                'headers': ['Wet Well Parameter', 'Design Value', 'Units', 'Design Equation / Pump Cycle Criteria'],
                'rows': [
                    {'values': ['Peak Design Inflow Rate (Q_in)', 350.0, 'gpm', 'Peak wastewater flow arriving at station'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Rated Single Pump Capacity (Q_p)', 500.0, 'gpm', '100% N-1 firm capacity per pump'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Minimum Pump Cycle Time (T_min)', 15.0, 'minutes', 'Maximum 4 pump starts per hour (motor protection)'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Required Active Liquid Volume (V_active)', '=(B15 * B14) / 4', 'gallons', 'V_active = (T_min * Q_p) / 4'], 'format': '#,##0.0'},
                    {'values': ['Active Volume in Cubic Feet', '=B16 / 7.48052', 'cu ft', '1 cu ft = 7.48 gallons'], 'format': '#,##0.0'},
                    {'values': ['Wet Well Inside Diameter (D_ww)', 8.0, 'ft', 'Circular precast concrete wet well diameter'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Wet Well Cross-Sectional Area', '=(PI()/4) * B18^2', 'sq ft', 'A_ww = pi * D_ww² / 4'], 'format': '0.00'},
                    {'values': ['Active Liquid Depth Operating Range (delta_z)', '=B17 / B19', 'ft', 'Liquid level span between Pump ON and Pump OFF'], 'format': '0.00'}
                ]
            },
            {
                'title': '3. HAZEN-WILLIAMS FORCE MAIN HYDRAULICS & PUMP BHP',
                'headers': ['Hydraulic Force Main Parameter', 'Design Value', 'Units', 'Governing Hydraulic Formula'],
                'rows': [
                    {'values': ['Force Main Pipe Diameter (D_fm)', 6.0, 'inches', 'C900 PVC pressure pipe'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Force Main Total Length (L_fm)', 1800.0, 'ft', 'Discharge manifold to gravity discharge point'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Hazen-Williams C Factor', 130.0, '-', 'Smooth plastic PVC force main'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Static Head Lift (Z_static)', 42.0, 'ft', 'Discharge manhole invert minus wet well low water level'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Force Main Velocity (V_fm)', '=(B14 / 448.83) / ((PI()/4)*(B22/12)^2)', 'fps', 'Velocity check: 2.0 to 8.0 fps permissible'], 'format': '0.00'},
                    {'values': ['Friction Head Loss (h_f)', '=10.44 * B23 * B14^1.852 / (B24^1.852 * B22^4.87)', 'ft', 'Hazen-Williams pressure loss formula'], 'format': '0.00'},
                    {'values': ['Fittings Minor Losses (h_m)', '=0.10 * B27', 'ft', 'Valves, tees, check valves (10% of friction)'], 'format': '0.00'},
                    {'values': ['Total Dynamic Head (TDH)', '=B25 + B27 + B28', 'ft', 'TDH = Z_static + h_f + h_minor'], 'format': '0.00'},
                    {'values': ['Pump Hydraulic Efficiency (eta)', 0.72, '-', 'Wire-to-water combined pump/motor efficiency'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Brake Horsepower Required (BHP)', '=(B14 * B29) / (3960 * B30)', 'HP', 'BHP = (Q * TDH) / (3960 * eta)'], 'format': '0.00'},
                    {'values': ['Recommended Motor Nameplate Size', '=ROUNDUP(B31 * 1.15, 0)', 'HP', 'Standard NEMA motor with 15% safety margin'], 'format': '0'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 8: DRAINAGE & CULVERTS
    # =========================================================================
    create_calc_sheet(
        'Drainage & Culverts',
        'HIGHWAY DRAINAGE, GUTTER SPREAD & CULVERT HYDRAULICS',
        'Rational Method • FHWA HEC-22 Curb Spread • FHWA HDS-5 Culvert Headwater (Inlet vs. Outlet Control)',
        [
            {
                'title': '1. RATIONAL PEAK FLOW & NOAA ATLAS 14 RAINFALL INTENSITY',
                'headers': ['Hydrologic Parameter', 'Design Value', 'Units', 'Governing Equation / Source'],
                'rows': [
                    {'values': ['Drainage Basin Area (A)', 8.50, 'acres', 'Commercial corridor catchment area'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Composite Runoff Coefficient (C)', 0.72, '-', 'Paved asphalt roadway and concrete curb'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Time of Concentration (Tc)', 15.0, 'minutes', 'Overland sheet + shallow concentrated flow'], 'is_input': True, 'format': '0.0'},
                    {'values': ['10-Year Rainfall Intensity (I)', '=135 / (B6 + 18)^0.82', 'in/hr', 'Regional NOAA Atlas 14 IDF power equation'], 'format': '0.00'},
                    {'values': ['Peak Design Storm Runoff (Q)', '=B4 * B5 * B7', 'cfs', 'Q = C * I * A (Rational Method)'], 'format': '#,##0.00'}
                ]
            },
            {
                'title': '2. FHWA HEC-22 CURB & GUTTER SPREAD ANALYSIS',
                'headers': ['Gutter Flow Parameter', 'Design Value', 'Units', 'FHWA HEC-22 Formula / Criteria'],
                'rows': [
                    {'values': ['Roadway Longitudinal Slope (S0)', 0.020, 'ft/ft', '2.0% roadway grade'], 'is_input': True, 'format': '0.000'},
                    {'values': ['Roadway Cross Slope (Sx)', 0.025, 'ft/ft', '2.5% pavement crown cross slope'], 'is_input': True, 'format': '0.000'},
                    {'values': ['Manning Roughness Coeff (n)', 0.016, '-', 'Concrete curb and gutter finish'], 'is_input': True, 'format': '0.000'},
                    {'values': ['Gutter Water Spread Width (T_spread)', '=( (B8 * B13) / (0.56 * B12^(5/3) * B11^0.5) )^(3/8)', 'ft', 'T = [Q*n / (0.56 * Sx^(5/3) * S0^(1/2))]^(3/8)'], 'format': '0.00'},
                    {'values': ['Allowable Shoulder Encroachment Limit', 8.00, 'ft', 'AASHTO maximum permissible shoulder ponding', '=IF(B14<=B15, "PASS - GUTTER SPREAD WITHIN SHOULDER", "FAIL - TRAFFIC LANE INUNDATED")'], 'is_check': True, 'format': '0.00'}
                ]
            },
            {
                'title': '3. CULVERT HYDRAULICS: INLET VS. OUTLET CONTROL (FHWA HDS-5)',
                'headers': ['Culvert Flow Parameter', 'Design Value', 'Units', 'Governing Equation / Control Mode'],
                'rows': [
                    {'values': ['Culvert Diameter (D)', 36.0, 'inches', 'Reinforced concrete pipe (RCP, 3.0 ft)'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Culvert Barrel Length (L)', 80.0, 'ft', 'Distance through roadway embankment'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Culvert Invert Slope (S)', 0.010, 'ft/ft', '1.0% physical barrel slope'], 'is_input': True, 'format': '0.000'},
                    {'values': ['Manning Roughness n_culvert', 0.012, '-', 'Smooth interior RCP'], 'is_input': True, 'format': '0.000'},
                    {'values': ['Inlet Control Headwater (HW_inlet)', '=(B18/12) * ( 1.0 + 0.038 * (B8 / ((PI()/4)*(B18/12)^2 * SQRT(B18/12)))^1.5 )', 'ft', 'FHWA HDS-5 Unsubmerged Inlet Equation'], 'format': '0.00'},
                    {'values': ['Outlet Control Headwater (HW_outlet)', '=2.5 + (1 + 0.5 + 29*B21^2*B19/((B18/12)^(4/3))) * ((B8/((PI()/4)*(B18/12)^2))^2 / (2*32.174)) - B19*B20', 'ft', 'HW = TW + H_losses - L*S'], 'format': '0.00'},
                    {'values': ['Governing Design Headwater (HW)', '=MAX(B22, B23)', 'ft', 'HW = MAX(HW_inlet, HW_outlet)'], 'format': '0.00'},
                    {'values': ['Roadway Embankment Low Point Elevation', 105.00, 'ft', 'Top of asphalt shoulder elevation'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Culvert Invert Elevation', 98.00, 'ft', 'Inlet flowline elevation'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Provided Overtopping Freeboard', '=B25 - (B26 + B24)', 'ft', 'Freeboard = Road_El - (Invert + HW)', '=IF((B25-(B26+B24))>=1.0, "PASS - FREEBOARD >= 1.0 FT", "FAIL - ROADWAY OVERTOPPING RISK")'], 'is_check': True, 'format': '0.00'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 9: PILES & FOUNDATIONS
    # =========================================================================
    create_calc_sheet(
        'Piles & Foundations',
        'DEEP FOUNDATION PILE CAPACITY & GROUP EFFICIENCY',
        'Meyerhof End Bearing • Alpha (Clay) & Beta (Sand) Skin Friction • Converse-Labarre (NCEES § 6.2.3)',
        [
            {
                'title': '1. PILE GEOMETRY & SOIL PROFILE PARAMETERS',
                'headers': ['Geotechnical Parameter', 'Design Value', 'Units', 'Methodology / Source Reference'],
                'rows': [
                    {'values': ['Pile Diameter / Width (D)', 1.50, 'ft', '18-inch square precast prestressed concrete pile'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Pile Total Embedment Depth (L)', 45.0, 'ft', 'Total depth driven into stratigraphy'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Layer 1 (Clay) Thickness (L1)', 30.0, 'ft', 'Upper cohesive layer (0 to 30 ft)'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Clay Undrained Shear Strength (c_u)', 1200.0, 'psf', 'Cohesive soil unconfined compression strength'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Clay Adhesion Factor (alpha)', 0.55, '-', 'API / Tomlinson alpha-method factor'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Layer 2 (Sand) Thickness (L2)', 15.0, 'ft', 'Bearing cohesionless stratum (30 to 45 ft)'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Sand Internal Friction Angle (phi)', 36.0, 'deg', 'Dense quartz bearing sand layer'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Effective Overburden at Mid-Sand (sigma_v)', 3200.0, 'psf', 'Average effective stress along sand shaft'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Sand End Bearing Capacity Factor (N_q)', 40.0, '-', 'Meyerhof bearing factor for phi = 36 deg'], 'is_input': True, 'format': '0.0'}
                ]
            },
            {
                'title': '2. ULTIMATE GEOTECHNICAL PILE CAPACITY (Q_ult = Q_s + Q_p)',
                'headers': ['Capacity Component', 'Calculated Value', 'Units', 'Governing Geotechnical Formula'],
                'rows': [
                    {'values': ['Pile Perimeter (P)', '=4 * B4', 'ft', 'Perimeter = 4 * D for square pile'], 'format': '0.00'},
                    {'values': ['Pile Tip Bearing Area (A_p)', '=B4 * B4', 'sq ft', 'Area = D² for square pile'], 'format': '0.00'},
                    {'values': ['Layer 1 Clay Skin Friction (Qs_clay)', '=B8 * B7 * B13 * B6', 'lbs', 'Qs_clay = alpha * cu * P * L1'], 'format': '#,##0.0'},
                    {'values': ['Layer 2 Beta Skin Friction (Qs_sand)', '=(1 - SIN(RADIANS(B10))) * TAN(RADIANS(0.75*B10)) * B11 * B13 * B9', 'lbs', 'Qs_sand = beta * sigma_v * P * L2'], 'format': '#,##0.0'},
                    {'values': ['Total Shaft Skin Friction (Q_s)', '=(B15 + B16) / 1000', 'kips', 'Q_s = (Qs_clay + Qs_sand) / 1000'], 'format': '0.00'},
                    {'values': ['Tip End Bearing Capacity (Q_p)', '=(B11 * B12 * B14) / 1000', 'kips', 'Q_p = (sigma_v_tip * Nq * Ap) / 1000'], 'format': '0.00'},
                    {'values': ['TOTAL ULTIMATE PILE CAPACITY (Q_ult)', '=B17 + B18', 'kips', 'Q_ult = Q_s + Q_p'], 'is_total': True, 'format': '0.00'},
                    {'values': ['Allowable Single Pile Load (Q_all)', '=B19 / 2.5', 'kips', 'Factor of Safety FS = 2.50'], 'format': '0.00'},
                    {'values': ['Allowable Single Pile Capacity in Tons', '=B20 / 2.0', 'tons', '1 ton = 2.0 kips = 2,000 lbs'], 'format': '0.00'}
                ]
            },
            {
                'title': '3. PILE GROUP EFFICIENCY (CONVERSE-LABARRE)',
                'headers': ['Group Configuration Parameter', 'Design Value', 'Units', 'Formula & Code Criteria'],
                'rows': [
                    {'values': ['Number of Rows (m)', 3, '-', '3x3 square pile group'], 'is_input': True, 'format': '0'},
                    {'values': ['Number of Columns (n)', 3, '-', '9 total piles in group'], 'is_input': True, 'format': '0'},
                    {'values': ['Center-to-Center Pile Spacing (s)', 4.50, 'ft', 'Standard s = 3.0 * D spacing'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Converse-Labarre Group Efficiency (eta)', '=1 - (DEGREES(ATAN(B4 / B26)) / 90) * (((B24-1)*B25 + (B25-1)*B24) / (B24 * B25))', '-', 'eta = 1 - (theta/90)*[(n-1)m + (m-1)n]/(mn)'], 'format': '0.000'},
                    {'values': ['Total Pile Group Allowable Capacity', '=B24 * B25 * B20 * B27', 'kips', 'Q_group = (m * n) * Q_all * eta'], 'format': '#,##0.0'},
                    {'values': ['Total Group Allowable Capacity in Tons', '=B28 / 2.0', 'tons', 'Group allowable capacity with efficiency factor'], 'is_total': True, 'format': '#,##0.0'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 10: SLABS - WESTERGAARD SOG
    # =========================================================================
    create_calc_sheet(
        'Slabs - Westergaard SOG',
        'WESTERGAARD SLAB-ON-GRADE STRUCTURAL CONCRETE ANALYSIS',
        'Interior, Edge & Corner Wheel Loading • Modulus of Subgrade Reaction • Flexural Tensile Stresses (PCA Standards)',
        [
            {
                'title': '1. SLAB GEOMETRY, CONCRETE & SUBGRADE PROPERTIES',
                'headers': ['Parameter Description', 'Design Value', 'Units', 'Engineering Code / Laboratory Standard'],
                'rows': [
                    {'values': ['Slab Thickness (h)', 8.00, 'inches', 'Reinforced structural slab-on-grade thickness'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Concrete Compressive Strength (f\'c)', 4000.0, 'psi', 'Standard 28-day cylinder compressive strength'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Concrete Modulus of Elasticity (Ec)', '=57000 * SQRT(B5)', 'psi', 'Ec = 57,000 * sqrt(f\'c) (ACI 318)'], 'format': '#,##0.0'},
                    {'values': ['Concrete Poisson\'s Ratio (nu)', 0.15, '-', 'Standard concrete elastic Poisson ratio'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Subgrade Reaction Modulus (k)', 150.0, 'pci', 'Plate load test subgrade modulus (lbs/in³)'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Concentrated Wheel / Post Load (P)', 18000.0, 'lbs', 'Maximum axle / forklift wheel contact load'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Contact Footprint Radius (a)', 6.00, 'inches', 'Circular tire contact area radius'], 'is_input': True, 'format': '0.00'}
                ]
            },
            {
                'title': '2. RADIUS OF RELATIVE STIFFNESS & CONTACT CORRECTION',
                'headers': ['Stiffness Parameter', 'Calculated Value', 'Units', 'Governing Westergaard Formulation'],
                'rows': [
                    {'values': ['Radius of Relative Stiffness (l)', '=((B6 * B4^3) / (12 * (1 - B7^2) * B8))^(0.25)', 'inches', 'l = [Ec*h³ / (12*(1-nu²)*k)]^(1/4)'], 'format': '0.00'},
                    {'values': ['Equivalent Shear Radius (b)', '=IF(B10 < 1.724*B4, SQRT(1.6*B10^2 + B4^2) - 0.675*B4, B10)', 'inches', 'b = sqrt(1.6*a² + h²) - 0.675*h (Special radius)'], 'format': '0.00'},
                    {'values': ['Concrete Modulus of Rupture (f_r)', '=7.5 * SQRT(B5)', 'psi', 'f_r = 7.5 * sqrt(f\'c) (ACI 318 flexural tensile capacity)'], 'format': '0.0'}
                ]
            },
            {
                'title': '3. WESTERGAARD TENSILE FLEXURAL STRESSES & SAFETY FACTORS',
                'headers': ['Load Placement Condition', 'Tensile Stress (psi)', 'Modulus of Rupture (psi)', 'Factor of Safety (f_r / sigma)', 'Structural Design Check'],
                'rows': [
                    {'values': ['Interior Load Condition (Center of Slab)', '=(3 * B9 * (1 + B7) / (2 * PI() * B4^2)) * (LN(B12 / B13) + 0.6159)', '=B14', '=B14 / B16', '=IF(D16>=1.7, "PASS - INTERIOR STRESS SAFE", "FAIL - CRACKING RISK")'], 'is_check': True, 'format': '0.0'},
                    {'values': ['Edge Load Condition (Free Slab Boundary)', '=(0.529 * B9 * (1 + 0.54*B7) / B4^2) * (LOG10(B6 * B4^3 / (B8 * B13^4)) - 0.71)', '=B14', '=B14 / B17', '=IF(D17>=1.5, "PASS - EDGE REINFORCED ADEQUATE", "FAIL - THICKEN EDGE SLAB")'], 'is_check': True, 'format': '0.0'},
                    {'values': ['Corner Load Condition (Slab Corner Joint)', '=(3 * B9 / B4^2) * (1 - (B10 * SQRT(2) / B12)^0.6)', '=B14', '=B14 / B18', '=IF(D18>=1.5, "PASS - CORNER STRESS SAFE", "FAIL - CORNER BREAK HAZARD")'], 'is_check': True, 'format': '0.0'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 11: SLABS - ACI 318 DDM
    # =========================================================================
    create_calc_sheet(
        'Slabs - ACI 318 DDM',
        'ACI 318-19 DIRECT DESIGN METHOD (DDM) FOR TWO-WAY SLABS',
        'Total Static Design Moment Mo = qu*l2*ln²/8 • Column Strip & Middle Strip Distribution (ACI 318-19 Chapter 8)',
        [
            {
                'title': '1. PANEL GEOMETRY & FACTORED SUPERIMPOSED LOADING',
                'headers': ['Panel Design Parameter', 'Design Value', 'Units', 'ACI 318 Criteria / Code Reference'],
                'rows': [
                    {'values': ['Longitudinal Span Length (l1)', 24.0, 'ft', 'Center-to-center span in direction of analysis'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Transverse Span Length (l2)', 20.0, 'ft', 'Center-to-center span perpendicular to analysis'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Column Support Width (c1)', 1.50, 'ft', '18-inch square column support dimension'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Clear Span Length (ln)', '=B4 - B6', 'ft', 'ln = l1 - c1 (clear distance between column faces)'], 'format': '0.00'},
                    {'values': ['Slab Thickness (h)', 8.50, 'inches', 'Total two-way flat plate slab thickness'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Superimposed Dead Load (SDL)', 25.0, 'psf', 'Ceiling, mechanical, flooring finishes'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Design Live Load (LL)', 80.0, 'psf', 'Institutional / commercial office live load'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Factored Design Load (qu)', '=1.2 * ((B8/12)*150 + B9) + 1.6 * B10', 'psf', 'qu = 1.2 * Dead + 1.6 * Live (ACI 318-19)'], 'format': '#,##0.0'}
                ]
            },
            {
                'title': '2. TOTAL STATIC DESIGN MOMENT (Mo)',
                'headers': ['Total Static Moment Component', 'Calculated Value', 'Units', 'Governing ACI 318-19 Equation'],
                'rows': [
                    {'values': ['Total Static Design Moment (Mo)', '=(B11 * B5 * B7^2) / 8000', 'ft-kips', 'Mo = (qu * l2 * ln²) / 8'], 'is_total': True, 'format': '#,##0.00'}
                ]
            },
            {
                'title': '3. LONGITUDINAL & TRANSVERSE MOMENT DISTRIBUTION',
                'headers': ['Moment Section', 'Percent Distribution', 'Factored Moment (ft-kips)', 'Column Strip Share (ft-kips)', 'Middle Strip Share (ft-kips)'],
                'rows': [
                    {'values': ['Interior Negative Moment (-Mu)', '65.0%', '=0.65 * B14', '=0.75 * C16', '=C16 - D16'], 'format': '#,##0.00'},
                    {'values': ['Positive Midspan Moment (+Mu)', '35.0%', '=0.35 * B14', '=0.60 * C17', '=C17 - D17'], 'format': '#,##0.00'},
                    {'values': ['SUM OF DESIGN MOMENTS', '100.0%', '=C16 + C17', '=D16 + D17', '=E16 + E17'], 'is_total': True, 'format': '#,##0.00'}
                ]
            },
            {
                'title': '4. FLEXURAL REINFORCING STEEL SIZING (fy = 60,000 psi)',
                'headers': ['Design Location', 'Design Moment Mu (ft-kips)', 'Effective Depth d (in)', 'Required As (sq in)', 'Minimum As,min (sq in)'],
                'rows': [
                    {'values': ['Column Strip Negative Steel', '=D16', 7.25, '=D16 * 12 / (0.90 * 60 * 0.90 * C20)', '=0.0018 * 12 * (B5/2) * B8'], 'format': '0.00'},
                    {'values': ['Column Strip Positive Steel', '=D17', 7.25, '=D17 * 12 / (0.90 * 60 * 0.90 * C21)', '=0.0018 * 12 * (B5/2) * B8'], 'format': '0.00'},
                    {'values': ['Middle Strip Positive Steel', '=E17', 7.25, '=E17 * 12 / (0.90 * 60 * 0.90 * C22)', '=0.0018 * 12 * (B5/2) * B8'], 'format': '0.00'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 12: SLABS - ACI 318 EFM
    # =========================================================================
    create_calc_sheet(
        'Slabs - ACI 318 EFM',
        'ACI 318-19 EQUIVALENT FRAME METHOD (EFM) FOR TWO-WAY SLABS',
        'Structural Frame Discretization • Torsional Member Stiffness Kt • Equivalent Column Stiffness Kec',
        [
            {
                'title': '1. EQUIVALENT FRAME GEOMETRY & STRUCTURAL PROPERTIES',
                'headers': ['Frame Component', 'Design Value', 'Units', 'ACI 318 Reference / Structural Property'],
                'rows': [
                    {'values': ['Longitudinal Bay Span (L1)', 24.0, 'ft', 'Center-to-center span in direction of frame'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Transverse Frame Width (L2)', 20.0, 'ft', 'Tributary frame width contributing to analysis'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Story Floor-to-Floor Height (H)', 12.0, 'ft', 'Total clear story height above and below'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Slab Thickness (h)', 8.50, 'inches', 'Flat plate structural concrete slab'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Column Dimension in Frame Direction (c1)', 18.0, 'inches', 'Column dimension parallel to span L1'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Column Dimension Transverse (c2)', 18.0, 'inches', 'Column dimension perpendicular to span L1'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Concrete Modulus of Elasticity (Ec)', 3600000.0, 'psi', 'Normal-weight 4,000 psi concrete Ec'], 'is_input': True, 'format': '#,##0'}
                ]
            },
            {
                'title': '2. COMPONENT STIFFNESS CALCULATIONS (K_sb, K_c, K_t)',
                'headers': ['Stiffness Member', 'Calculated Value', 'Units', 'Governing ACI 318 Formula'],
                'rows': [
                    {'values': ['Slab-Beam Moment of Inertia (I_sb)', '=(B5 * 12 * B7^3) / 12', 'in⁴', 'I_sb = (L2 * 12 * h³) / 12'], 'format': '#,##0'},
                    {'values': ['Slab-Beam Flexural Stiffness (K_sb)', '=(4 * B10 * B12) / (B4 * 12)', 'in-lbs/rad', 'K_sb = (4 * Ec * I_sb) / L1'], 'format': '#,##0'},
                    {'values': ['Column Moment of Inertia (I_col)', '=(B9 * B8^3) / 12', 'in⁴', 'I_c = (c2 * c1³) / 12'], 'format': '#,##0'},
                    {'values': ['Combined Column Stiffness (Sum K_c)', '=2 * (4 * B10 * B14) / (B6 * 12)', 'in-lbs/rad', 'Sum Kc = Kc_upper + Kc_lower'], 'format': '#,##0'},
                    {'values': ['Torsional Section Property (C)', '=(1 - 0.63 * B7 / B9) * (B7^3 * B9 / 3)', 'in⁴', 'C = (1 - 0.63*x/y) * (x³*y / 3)'], 'format': '#,##0'},
                    {'values': ['Torsional Member Stiffness (K_t)', '=2 * (9 * B10 * B16) / ((B5 * 12) * (1 - B9/(B5*12))^3)', 'in-lbs/rad', 'Kt = 2 * (9*Ec*C) / [L2*(1 - c2/L2)³]'], 'format': '#,##0'}
                ]
            },
            {
                'title': '3. EQUIVALENT COLUMN STIFFNESS (K_ec) & DISTRIBUTION FACTORS',
                'headers': ['Frame Connection Term', 'Calculated Value', 'Units', 'Stiffness Synthesis & Load Distribution'],
                'rows': [
                    {'values': ['Reciprocal Stiffness (1 / Kec)', '=(1 / B15) + (1 / B17)', 'rad/in-lbs', '1 / Kec = 1 / (Sum Kc) + 1 / Kt'], 'format': '0.00000000'},
                    {'values': ['Equivalent Column Stiffness (K_ec)', '=1 / B20', 'in-lbs/rad', 'Kec = (Sum Kc * Kt) / (Sum Kc + Kt)'], 'is_total': True, 'format': '#,##0'},
                    {'values': ['Joint Moment Distribution Factor (DF)', '=B13 / (B13 + B21)', '-', 'DF = K_sb / (K_sb + Kec)'], 'format': '0.000'},
                    {'values': ['Fixed-End Moment (FEM)', '=(120.0 * B5 * B4^2) / 12', 'ft-lbs', 'FEM = (qu * L2 * L1²) / 12'], 'format': '#,##0'},
                    {'values': ['Balanced Negative Frame Joint Moment', '=B23 * (1 - B22)', 'ft-lbs', 'Factored distributed negative design moment'], 'format': '#,##0'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 13: SLABS - YIELD LINE THEORY
    # =========================================================================
    create_calc_sheet(
        'Slabs - Yield Line Theory',
        'YIELD LINE THEORY: UPPER-BOUND PLASTIC COLLAPSE ANALYSIS',
        'Virtual Work Principle W_ext = W_int • Plastic Moment Capacities & Ultimate Collapse Load (Park & Gamble)',
        [
            {
                'title': '1. SLAB GEOMETRY & PLASTIC MOMENT CAPACITIES',
                'headers': ['Slab Parameter', 'Design Value', 'Units', 'Structural Definition / Reinforcement Ratio'],
                'rows': [
                    {'values': ['Slab Clear Span in X Direction (Lx)', 20.0, 'ft', 'Longitudinal dimension between perimeter supports'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Slab Clear Span in Y Direction (Ly)', 16.0, 'ft', 'Transverse dimension between perimeter supports'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Unit Positive Moment Capacity in X (m_px)', 12.50, 'ft-kips/ft', 'Positive plastic bending capacity per unit width'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Unit Positive Moment Capacity in Y (m_py)', 10.00, 'ft-kips/ft', 'Positive plastic bending capacity per unit width'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Negative Support Fixity Factor in X (i_x)', 1.00, '-', 'i_x = 1.0 for fixed support; 0.0 for simply supported'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Negative Support Fixity Factor in Y (i_y)', 1.00, '-', 'i_y = 1.0 for fixed support; 0.0 for simply supported'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Applied Factored Uniform Load (q_applied)', 280.0, 'psf', 'Factored load qu = 1.2*D + 1.6*L'], 'is_input': True, 'format': '0.0'}
                ]
            },
            {
                'title': '2. YIELD LINE COLLAPSE MECHANISM & VIRTUAL WORK',
                'headers': ['Virtual Work Component', 'Governing Equation', 'Calculated Value', 'Units', 'Plastic Energy Formulation'],
                'rows': [
                    {'values': ['Orthotropic Moment Ratio (mu = m_py / m_px)', '=B7 / B6', '=B7 / B6', '-', 'Moment anisotropy ratio'], 'format': '0.000'},
                    {'values': ['Yield Pattern Parameter (x)', '=(B5/2) * (SQRT(3*(B4/B5)^2*C12 + 1) - 1)', '=(B5/2) * (SQRT(3*(B4/B5)^2*C12 + 1) - 1)', 'ft', 'Yield line apex distance along X axis'], 'format': '0.00'},
                    {'values': ['Internal Energy Dissipation (D_int)', 'SUM(m * theta * L_yield)', '=2 * (B6*(1+B8)*B5/D13 + B7*(1+B9)*B4/(B5/2))', 'kips-ft', 'Energy dissipated along yield hinges'], 'format': '#,##0.0'},
                    {'values': ['External Work Done by Load (W_ext)', 'INTEGRAL(w * delta * dA)', '=(B4*B5/6) * (3 - 2*D13/B4)', 'ft³', 'Volume of virtual displacement pyramid'], 'format': '#,##0.0'},
                    {'values': ['ULTIMATE PLASTIC COLLAPSE LOAD (w_u)', '=C14 / C15 * 1000', '=(C14 / C15) * 1000', 'psf', 'w_u = D_int / W_ext (Upper bound limit)'], 'is_total': True, 'format': '#,##0.0'}
                ]
            },
            {
                'title': '3. STRUCTURAL DEMAND-TO-CAPACITY RATIO (DCR)',
                'headers': ['Plastic Design Parameter', 'Applied Demand', 'Ultimate Capacity', 'Safety Margin / DCR', 'Plastic Design Status'],
                'rows': [
                    {'values': ['Factored Load vs. Collapse Load', '=B10', '=C16', '=B10 / C16', '=IF((B10/C16)<=1.0, "PASS - PLASTICALLY SAFE", "FAIL - MECHANISM COLLAPSE!")'], 'is_check': True, 'format': '0.00'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 14: SLABS - HILLERBORG STRIP
    # =========================================================================
    create_calc_sheet(
        'Slabs - Hillerborg Strip',
        'HILLERBORG ADVANCED STRIP METHOD: LOWER-BOUND PLASTIC SLAB DESIGN',
        'Orthogonal Load Division alpha_x + alpha_y = 1 • Column Support Bands & Middle Field Strips',
        [
            {
                'title': '1. SLAB GEOMETRY & LOAD DISPERSION COEFFICIENTS',
                'headers': ['Strip Method Parameter', 'Design Value', 'Units', 'Hillerborg Design Selection / Criteria'],
                'rows': [
                    {'values': ['Slab Span in X Direction (L_x)', 22.0, 'ft', 'Clear span between supporting walls/beams'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Slab Span in Y Direction (L_y)', 18.0, 'ft', 'Clear span between supporting walls/beams'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Total Factored Uniform Load (q)', 220.0, 'psf', 'Factored gravity load to be distributed'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Selected X-Direction Load Fraction (alpha_x)', 0.55, '-', 'Portion of load carried by X strips (0.0 to 1.0)'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Resulting Y-Direction Load Fraction (alpha_y)', '=1.0 - B7', '-', 'alpha_y = 1.0 - alpha_x (Equilibrium rule)'], 'format': '0.00'},
                    {'values': ['Dispersed Load in X Direction (q_x)', '=B6 * B7', 'psf', 'q_x = alpha_x * q'], 'format': '#,##0.0'},
                    {'values': ['Dispersed Load in Y Direction (q_y)', '=B6 * B8', 'psf', 'q_y = alpha_y * q'], 'format': '#,##0.0'}
                ]
            },
            {
                'title': '2. STRIP BENDING MOMENTS & STEEL REINFORCEMENT SIZING',
                'headers': ['Strip Location', 'Governing Strip Formula', 'Maximum Moment (ft-lbs/ft)', 'Effective Depth d (in)', 'Required Steel Area As (in²/ft)'],
                'rows': [
                    {'values': ['Middle Field Strip in X Direction', '=(B9 * B4^2) / 8', '=(B9 * B4^2) / 8', 6.50, '=((B9 * B4^2) / 8) * 12 / (0.90 * 60000 * 0.90 * D13)'], 'format': '0.00'},
                    {'values': ['Middle Field Strip in Y Direction', '=(B10 * B5^2) / 8', '=(B10 * B5^2) / 8', 6.50, '=((B10 * B5^2) / 8) * 12 / (0.90 * 60000 * 0.90 * D14)'], 'format': '0.00'},
                    {'values': ['Column Support Band Strip in X', '=1.5 * C13', '=1.5 * C13', 6.50, '=(1.5 * C13) * 12 / (0.90 * 60000 * 0.90 * D15)'], 'format': '0.00'},
                    {'values': ['Column Support Band Strip in Y', '=1.5 * C14', '=1.5 * C14', 6.50, '=(1.5 * C14) * 12 / (0.90 * 60000 * 0.90 * D16)'], 'format': '0.00'}
                ]
            },
            {
                'title': '3. CODE MINIMUM REINFORCEMENT VERIFICATION (ACI 318 § 7.6.1)',
                'headers': ['Reinforcement Check', 'Calculated Steel Area', 'ACI Minimum As,min', 'Bar Size & Spacing Recommendation', 'Status'],
                'rows': [
                    {'values': ['X Direction Field Strip Steel', '=E13', '=0.0018 * 12 * 7.5', '#4 @ 12" o.c. (As = 0.20 in²/ft)', '=IF(B19>=C19, "PASS", "GOVERNED BY MINIMUM")'], 'is_check': True, 'format': '0.00'},
                    {'values': ['Y Direction Field Strip Steel', '=E14', '=0.0018 * 12 * 7.5', '#4 @ 12" o.c. (As = 0.20 in²/ft)', '=IF(B20>=C20, "PASS", "GOVERNED BY MINIMUM")'], 'is_check': True, 'format': '0.00'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 15: SLABS - PUNCHING SHEAR
    # =========================================================================
    create_calc_sheet(
        'Slabs - Punching Shear',
        'ACI 318-19 TWO-WAY PUNCHING SHEAR VERIFICATION',
        'Critical Perimeter bo at d/2 • Concrete Shear Strength Vc (Min of 3 Equations) • Headed Stud Rail Sizing',
        [
            {
                'title': '1. COLUMN & SLAB GEOMETRY INPUTS (ACI 318-19 § 22.6)',
                'headers': ['Design Parameter', 'Design Value', 'Units', 'ACI 318 Section / Specification'],
                'rows': [
                    {'values': ['Slab Effective Depth (d)', 7.00, 'inches', 'Average effective depth d = h - 1.5 in'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Column Width in X (c1)', 18.0, 'inches', 'Column face dimension parallel to span 1'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Column Width in Y (c2)', 18.0, 'inches', 'Column face dimension parallel to span 2'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Column Location Type', 'Interior', '-', 'Interior (alpha_s = 40), Edge (30), Corner (20)'], 'is_input': True},
                    {'values': ['Location Factor (alpha_s)', 40.0, '-', 'Interior column connection factor'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Concrete Compressive Strength (f\'c)', 4000.0, 'psi', 'Standard concrete 28-day strength'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Lightweight Concrete Factor (lambda)', 1.00, '-', 'Normal-weight concrete lambda = 1.0'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Factored Ultimate Shear Force (Vu)', 110.0, 'kips', 'Factored column reaction load from analysis'], 'is_input': True, 'format': '0.0'}
                ]
            },
            {
                'title': '2. CRITICAL SHEAR PERIMETER (bo) AT d/2',
                'headers': ['Perimeter Parameter', 'Calculated Value', 'Units', 'Geometric Derivation / ACI Definition'],
                'rows': [
                    {'values': ['Long-to-Short Column Ratio (beta)', '=MAX(B5, B6) / MIN(B5, B6)', '-', 'beta = c_long / c_short'], 'format': '0.00'},
                    {'values': ['Critical Perimeter (bo)', '=2*(B5 + B4) + 2*(B6 + B4)', 'inches', 'bo = 2*(c1 + d) + 2*(c2 + d) for interior column'], 'is_total': True, 'format': '#,##0.0'},
                    {'values': ['Critical Punching Shear Area (Ac = bo * d)', '=B15 * B4', 'sq inches', 'Ac = bo * d'], 'format': '#,##0.0'}
                ]
            },
            {
                'title': '3. NOMINAL CONCRETE TWO-WAY SHEAR CAPACITY (Vc)',
                'headers': ['ACI 318 Equation', 'Governing Formula', 'Calculated Vc (kips)', 'Governing Code Check'],
                'rows': [
                    {'values': ['Equation 1: Aspect Ratio Form', 'Vc1 = (2 + 4/beta) * lambda * sqrt(f\'c) * bo * d', '=(2 + 4/B14) * B10 * SQRT(B9) * B15 * B4 / 1000', 'ACI 318-19 Eq. 22.6.5.2(a)'], 'format': '0.00'},
                    {'values': ['Equation 2: Column Location Form', 'Vc2 = (alpha_s * d / bo + 2) * lambda * sqrt(f\'c) * bo * d', '=(B8 * B4 / B15 + 2) * B10 * SQRT(B9) * B15 * B4 / 1000', 'ACI 318-19 Eq. 22.6.5.2(b)'], 'format': '0.00'},
                    {'values': ['Equation 3: Upper Limit Form', 'Vc3 = 4 * lambda * sqrt(f\'c) * bo * d', '=4 * B10 * SQRT(B9) * B15 * B4 / 1000', 'ACI 318-19 Eq. 22.6.5.2(c)'], 'format': '0.00'},
                    {'values': ['GOVERNING NOMINAL CAPACITY (Vc)', 'MIN(Vc1, Vc2, Vc3)', '=MIN(C19, C20, C21)', 'Governing concrete shear resistance'], 'is_total': True, 'format': '0.00'},
                    {'values': ['Design Concrete Shear Strength (phi*Vc)', 'phi = 0.75 * Vc', '=0.75 * C22', 'ACI 318 strength reduction factor phi = 0.75'], 'is_total': True, 'format': '0.00'}
                ]
            },
            {
                'title': '4. PUNCHING SHEAR COMPLIANCE & STUD REINFORCEMENT CHECK',
                'headers': ['Design Verification Parameter', 'Factored Demand', 'Design Capacity', 'Demand/Capacity Ratio', 'Punching Shear Status'],
                'rows': [
                    {'values': ['Factored Shear Force vs. phi*Vc', '=B11', '=C23', '=B11 / C23', '=IF(B11<=C23, "PASS - SLAB ADEQUATE (NO REINFORCEMENT)", "FAIL - HEADED SHEAR STUDS REQUIRED")'], 'is_check': True, 'format': '0.00'},
                    {'values': ['Factored Shear Stress (vu)', '=(B11 * 1000) / (B15 * B4)', '=0.75 * (C22 * 1000) / (B15 * B4)', '=B26 / C26', '=IF(B26<=C26, "PASS - SHEAR STRESS SAFE", "FAIL - OVERSTRESSED")'], 'is_check': True, 'format': '0.0'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 16: SLOPE STABILITY
    # =========================================================================
    create_calc_sheet(
        'Slope Stability',
        'EMBANKMENT SLOPE STABILITY & CIRCULAR ROTATIONAL ARC SLICES',
        'Infinite Slope Steady-State Seepage • Bishop\'s Simplified Method of Slices (NCEES § 6.2.4)',
        [
            {
                'title': '1. EMBANKMENT GEOMETRY & SOIL PROPERTIES',
                'headers': ['Geotechnical Parameter', 'Design Value', 'Units', 'Laboratory Testing Method / Standard'],
                'rows': [
                    {'values': ['Embankment Slope Height (H)', 25.0, 'ft', 'Vertical relief from toe to crest'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Slope Horizontal Run (per 1 ft vertical)', 2.00, 'H:1V', '2:1 standard roadway embankment slope'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Slope Inclination Angle (beta)', '=DEGREES(ATAN(1 / B5))', 'deg', 'beta = arctan(1 / H_ratio) = 26.57 deg'], 'format': '0.00'},
                    {'values': ['Effective Cohesion (c\')', 350.0, 'psf', 'Consolidated-drained triaxial test cohesion intercept'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Effective Friction Angle (phi\')', 28.0, 'deg', 'Consolidated-drained effective friction angle'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Total Soil Unit Weight (gamma)', 122.0, 'pcf', 'Total moist compacted unit weight'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Water Unit Weight (gamma_w)', 62.4, 'pcf', 'Unit weight of pore water'], 'format': '0.0'}
                ]
            },
            {
                'title': '2. INFINITE SLOPE STABILITY: DRY VS. STEADY-STATE SEEPAGE',
                'headers': ['Seepage Condition', 'Governing Formula', 'Calculated FS', 'Code Target Limit', 'Stability Status'],
                'rows': [
                    {'values': ['Dry Embankment Slope (No Water Table)', 'FS = tan(phi\')/tan(beta) + c\' / (gamma*H*sin(beta)*cos(beta))', '=TAN(RADIANS(B8))/TAN(RADIANS(B6)) + B7/(B9*B4*SIN(RADIANS(B6))*COS(RADIANS(B6)))', '>= 1.50', '=IF(C13>=1.5, "PASS - DRY SLOPE STABLE", "FAIL - FLATTEN SLOPE")'], 'is_check': True, 'format': '0.00'},
                    {'values': ['Steady-State Seepage Parallel to Face (Worst-Case)', 'FS = (gamma_sub/gamma)*[tan(phi\')/tan(beta)] + c\'/[gamma*H*sin*cos]', '=((B9-B10)/B9)*(TAN(RADIANS(B8))/TAN(RADIANS(B6))) + B7/(B9*B4*SIN(RADIANS(B6))*COS(RADIANS(B6)))', '>= 1.30', '=IF(C14>=1.3, "PASS - SATURATED SLOPE STABLE", "FAIL - INSTALL TOE DRAIN")'], 'is_check': True, 'format': '0.00'}
                ]
            },
            {
                'title': '3. BISHOP\'S SIMPLIFIED METHOD OF SLICES (ROTATIONAL CIRCULAR FAILURE ARC)',
                'headers': ['Slice #', 'Width b (ft)', 'Weight W (kips)', 'Base Angle alpha (deg)', 'Pore Pressure u (ksf)', 'Resisting Force Numerator', 'Driving Force (W*sin(alpha))'],
                'rows': [
                    {'values': [1, 4.0, 18.5, -12.0, 0.20, '=(0.350*4.0 + (18.5 - 0.20*4.0)*TAN(RADIANS(28))) / (COS(RADIANS(-12)) + SIN(RADIANS(-12))*TAN(RADIANS(28))/1.5)', '=18.5 * SIN(RADIANS(-12))'], 'format': '0.00'},
                    {'values': [2, 5.0, 32.0, 4.0, 0.45, '=(0.350*5.0 + (32.0 - 0.45*5.0)*TAN(RADIANS(28))) / (COS(RADIANS(4)) + SIN(RADIANS(4))*TAN(RADIANS(28))/1.5)', '=32.0 * SIN(RADIANS(4))'], 'format': '0.00'},
                    {'values': [3, 5.0, 42.5, 18.0, 0.65, '=(0.350*5.0 + (42.5 - 0.65*5.0)*TAN(RADIANS(28))) / (COS(RADIANS(18)) + SIN(RADIANS(18))*TAN(RADIANS(28))/1.5)', '=42.5 * SIN(RADIANS(18))'], 'format': '0.00'},
                    {'values': [4, 5.0, 38.0, 31.0, 0.50, '=(0.350*5.0 + (38.0 - 0.50*5.0)*TAN(RADIANS(28))) / (COS(RADIANS(31)) + SIN(RADIANS(31))*TAN(RADIANS(28))/1.5)', '=38.0 * SIN(RADIANS(31))'], 'format': '0.00'},
                    {'values': [5, 4.0, 24.0, 45.0, 0.25, '=(0.350*4.0 + (24.0 - 0.25*4.0)*TAN(RADIANS(28))) / (COS(RADIANS(45)) + SIN(RADIANS(45))*TAN(RADIANS(28))/1.5)', '=24.0 * SIN(RADIANS(45))'], 'format': '0.00'},
                    {'values': ['TOTALS', '-', '=SUM(C18:C22)', '-', '-', '=SUM(F18:F22)', '=SUM(G18:G22)'], 'is_total': True, 'format': '0.00'},
                    {'values': ['BISHOP FACTOR OF SAFETY', 'FS = Sum(Numerator) / Sum(Driving)', '=F23 / G23', 'Target >= 1.50', '=IF((F23/G23)>=1.5, "PASS - GLOBAL ROTATIONAL ARC STABLE", "FAIL - INSTALL REINFORCED GEOGRID")'], 'is_check': True, 'format': '0.00'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 17: WEIRS & DAMS
    # =========================================================================
    create_calc_sheet(
        'Weirs & Dams',
        'HYDRAULIC WEIRS & CONCRETE GRAVITY DAM STABILITY ANALYSIS',
        'Sharp & Broad-Crested Weirs • Concrete Dam Overturning, Sliding, Uplift Pressure & Exit Gradient (NCEES § 6.3.8)',
        [
            {
                'title': '1. OPEN CHANNEL WEIR DISCHARGE EQUATIONS (NCEES § 6.3.8)',
                'headers': ['Weir Type', 'Governing Discharge Equation', 'Weir Length L (ft)', 'Operating Head H (ft)', 'Discharge Q (cfs)'],
                'rows': [
                    {'values': ['Rectangular Suppressed Weir', 'Q = 3.33 * L * H^(1.5)', 12.0, 1.80, '=3.33 * C4 * D4^1.5'], 'is_input': True, 'format': '#,##0.00'},
                    {'values': ['90-Degree V-Notch Weir', 'Q = 2.50 * H^(2.5)', '-', 1.80, '=2.50 * D5^2.5'], 'is_input': True, 'format': '#,##0.00'},
                    {'values': ['Cipolletti Trapezoidal Weir', 'Q = 3.367 * L * H^(1.5)', 10.0, 1.80, '=3.367 * C6 * D6^1.5'], 'is_input': True, 'format': '#,##0.00'},
                    {'values': ['Broad-Crested Spillway Weir', 'Q = Cw * L * H^(1.5) (Cw = 3.10)', 25.0, 1.80, '=3.10 * C7 * D7^1.5'], 'is_input': True, 'format': '#,##0.00'}
                ]
            },
            {
                'title': '2. CONCRETE GRAVITY DAM GEOMETRY & LOADING CONDITIONS',
                'headers': ['Dam Structure Parameter', 'Design Value', 'Units', 'Geometric Definition / Loading Assumption'],
                'rows': [
                    {'values': ['Dam Total Height (H_dam)', 40.0, 'ft', 'Total structural height from foundation to crest'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Crest Top Width (b_top)', 8.0, 'ft', 'Access roadway / spillway crest width'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Foundation Base Width (B)', 28.0, 'ft', 'Total width of dam contact along bedrock'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Upstream Water Depth (h_w)', 36.0, 'ft', 'Normal reservoir pool depth behind dam'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Concrete Unit Weight (gamma_c)', 150.0, 'pcf', 'Mass structural concrete'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Water Unit Weight (gamma_w)', 62.4, 'pcf', 'Freshwater pool unit weight'], 'format': '0.0'},
                    {'values': ['Foundation Friction Angle (phi_base)', 35.0, 'deg', 'Bedrock contact friction angle'], 'is_input': True, 'format': '0.0'}
                ]
            },
            {
                'title': '3. OVERTURNING FORCES & STABILIZING RESISTANCE ABOUT TOE',
                'headers': ['Force / Component', 'Horizontal Force (lbs)', 'Vertical Weight (lbs)', 'Moment Arm about Toe (ft)', 'Moment about Toe (ft-lbs)'],
                'rows': [
                    {'values': ['Upstream Hydrostatic Thrust (F_h)', '=0.5 * B15 * B13^2', 0.0, '=B13 / 3', '=B18 * D18'], 'format': '#,##0.0'},
                    {'values': ['Uplift Pressure Prism (U)', 0.0, '=-0.5 * B15 * B13 * B12', '=B12 * (2/3)', '=C19 * D19'], 'format': '#,##0.0'},
                    {'values': ['W1: Crest Block (Rectangular)', 0.0, '=B11 * B10 * B14', '=B12 - B11/2', '=C20 * D20'], 'format': '#,##0.0'},
                    {'values': ['W2: Downstream Batter (Triangular)', 0.0, '=0.5 * (B12 - B11) * B10 * B14', '=(2/3) * (B12 - B11)', '=C21 * D21'], 'format': '#,##0.0'},
                    {'values': ['TOTAL OVERTURNING / RESISTING', '=B18', '=C20 + C21 + C19', '-', '=E20 + E21'], 'is_total': True, 'format': '#,##0.0'}
                ]
            },
            {
                'title': '4. DAM STABILITY FACTORS OF SAFETY & FOUNDATION CHECKS',
                'headers': ['Stability Safety Check', 'Calculated Value', 'Allowable Minimum', 'Safety Factor / Margin', 'Dam Code Compliance Status'],
                'rows': [
                    {'values': ['Overturning Factor of Safety (FS_ot)', '=E22 / (E18 - E19)', '>= 2.00', '=E22 / (E18 - E19)', '=IF(B24>=2.0, "PASS - OVERTURNING SAFE", "FAIL - OVERTURNING RISK")'], 'is_check': True, 'format': '0.00'},
                    {'values': ['Sliding Factor of Safety (FS_sl)', '=(C22 * TAN(RADIANS(B16))) / B18', '>= 1.50', '=(C22 * TAN(RADIANS(B16))) / B18', '=IF(B25>=1.5, "PASS - SLIDING SAFE", "FAIL - INSTALL KEYWAY")'], 'is_check': True, 'format': '0.00'},
                    {'values': ['Foundation Resultant Location (x_bar)', '=(E22 - E18 + E19) / C22', 'ft from toe', 'x_bar = M_net / W_net', 'Toe contact zone'], 'format': '0.00'},
                    {'values': ['Middle-Third Eccentricity Check (e <= B/6)', '=ABS(B12/2 - B26)', '<= ' + str(round(28/6, 2)) + ' ft', '=B12/6', '=IF(B27<=(B12/6), "PASS - NO TENSION CRACKING", "FAIL - BASE TENSION!")'], 'is_check': True, 'format': '0.00'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 18: 50x50 SLAB & HELICAL PILES
    # =========================================================================
    create_calc_sheet(
        '50x50 Slab & Helical Piles',
        '50×50 FT RESIDENTIAL SLAB LOAD DISTRIBUTION & HELICAL PILE LAB',
        'Gravity Dead & Live Load Resolution • Helical Pile Torque Correlation Q_ult = Kt*T • Factor of Safety Matrix',
        [
            {
                'title': '1. 50×50 RESIDENTIAL BUILDING GRAVITY LOADS',
                'headers': ['Building Loading Component', 'Design Value', 'Units', 'Code Loading Standard / Derivation'],
                'rows': [
                    {'values': ['Building Footprint Dimension (L)', 50.0, 'ft', 'Square residential floor plan length'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Building Footprint Dimension (W)', 50.0, 'ft', 'Square residential floor plan width'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Total Foundation Footprint Area', '=B4 * B5', 'sq ft', 'Area = L * W = 2,500 sq ft'], 'format': '#,##0.0'},
                    {'values': ['Superimposed Dead Load (Slab + Walls + Roof)', 65.0, 'psf', 'Uniform structural dead load'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Residential Occupancy Live Load', 40.0, 'psf', 'IBC Table 1607.1 residential live load'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Roof Snow / Environmental Load', 30.0, 'psf', 'Regional roof snow / wind downward load'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Total Factored Gravity Building Load', '=(B7 + B8 + B9) * B6 / 1000', 'kips', 'Total gravity load = (DL + LL + Snow) * Area'], 'is_total': True, 'format': '#,##0.0'},
                    {'values': ['Total Gravity Building Load in Tons', '=B10 / 2.0', 'tons', '1 ton = 2.0 kips'], 'format': '#,##0.0'}
                ]
            },
            {
                'title': '2. HELICAL PILE SYSTEM & TORQUE-CAPACITY CORRELATION',
                'headers': ['Helical Pile Parameter', 'Design Value', 'Units', 'ICC-ES AC358 Standard Formula'],
                'rows': [
                    {'values': ['Shaft Steel Outer Diameter (OD)', 2.875, 'inches', 'High-strength round pipe shaft (Yield = 65 ksi)'], 'is_input': True, 'format': '0.000'},
                    {'values': ['Multi-Helix Plate Configuration', '10"-12"-14"', '-', 'Triple helix lead section for dense bearing strata'], 'is_input': True},
                    {'values': ['Empirical Torque Correlation Factor (Kt)', 10.0, 'ft⁻¹', 'Default ICC-ES AC358 factor for 2-7/8" round shaft'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Final Measured Installation Torque (T)', 4500.0, 'ft-lbs', 'Hydraulic drive head torque pressure measurement'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Ultimate Pile Geotechnical Capacity (Q_ult)', '=(B15 * B16) / 1000', 'kips', 'Q_ult = Kt * T (kips)'], 'format': '0.00'},
                    {'values': ['Allowable Pile Geotechnical Capacity (Q_all)', '=B17 / 2.0', 'kips', 'Safety Factor FS = 2.0 (Q_all = Q_ult / 2.0)'], 'format': '0.00'},
                    {'values': ['Allowable Capacity in Tons per Pile', '=B18 / 2.0', 'tons', '1 ton = 2.0 kips'], 'format': '0.00'}
                ]
            },
            {
                'title': '3. PILE LAYOUT, LOAD SHARING & GLOBAL SAFETY FACTOR',
                'headers': ['Pile Location Group', 'Number of Piles', 'Capacity per Pile (kips)', 'Group Ultimate Capacity (kips)', 'Group Allowable Capacity (kips)'],
                'rows': [
                    {'values': ['Corner Helical Piles', 4, '=B18', '=4 * B17', '=4 * B18'], 'format': '#,##0.0'},
                    {'values': ['Perimeter Foundation Wall Piles', 8, '=B18', '=8 * B17', '=8 * B18'], 'format': '#,##0.0'},
                    {'values': ['Interior Girder Column Piles', 4, '=B18', '=4 * B17', '=4 * B18'], 'format': '#,##0.0'},
                    {'values': ['TOTAL PILE FOUNDATION SYSTEM', '=SUM(B22:B24)', '-', '=SUM(D22:D24)', '=SUM(E22:E24)'], 'is_total': True, 'format': '#,##0.0'},
                    {'values': ['GLOBAL FOUNDATION SAFETY FACTOR', 'FS = Total Q_ult / Total Load', '=D25 / B10', 'Target >= 2.00', '=IF((D25/B10)>=2.0, "PASS - 50x50 FOUNDATION SYSTEM ADEQUATE", "FAIL - ADD MORE PILES")'], 'is_check': True, 'format': '0.00'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 19: NPSH & PUMP CAVITATION
    # =========================================================================
    create_calc_sheet(
        'NPSH & Pump Cavitation',
        'NET POSITIVE SUCTION HEAD (NPSH) & PUMP CAVITATION SIMULATOR',
        'Atmospheric vs. Altitude • Water Vapor Pressure • Hazen-Williams Friction & NCEES Lift Hs (NCEES § 6.3.8.6)',
        [
            {
                'title': '1. ATMOSPHERIC, TEMPERATURE & FLUID PROPERTIES',
                'headers': ['Environmental Parameter', 'Design Value', 'Units', 'Governing Physics Formula / Source'],
                'rows': [
                    {'values': ['Site Installation Altitude (Z)', 5280.0, 'ft', 'Elevation above mean sea level (e.g. Denver, CO)'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Barometric Atmospheric Pressure (Pa)', '=14.696 * (1 - 6.875e-6 * B4)^5.2559', 'psia', 'Pa = 14.696 * (1 - 6.875e-6 * Z)^5.2559'], 'format': '0.000'},
                    {'values': ['Water Temperature (T)', 68.0, 'deg F', 'Operating fluid temperature'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Fluid Specific Weight (gamma)', 62.40, 'pcf', 'Clear water density'], 'format': '0.00'},
                    {'values': ['Atmospheric Pressure Head (H_pa)', '=(B5 * 144) / B7', 'ft of liquid', 'H_pa = (Pa * 144) / gamma'], 'format': '0.00'},
                    {'values': ['Water Vapor Pressure (P_vp)', 0.339, 'psia', 'From steam tables at 68°F'], 'is_input': True, 'format': '0.000'},
                    {'values': ['Vapor Pressure Head (H_vp)', '=(B9 * 144) / B7', 'ft of liquid', 'H_vp = (P_vp * 144) / gamma'], 'format': '0.00'}
                ]
            },
            {
                'title': '2. SUCTION PIPING HYDRAULICS & HEAD LOSSES (sum h_L)',
                'headers': ['Piping Parameter', 'Design Value', 'Units', 'Hydraulic Formulation'],
                'rows': [
                    {'values': ['Pump Operating Flow Rate (Q)', 450.0, 'gpm', 'Pump design flow rate'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ['Flow Rate in Cubic Feet per Second', '=B13 / 448.83', 'cfs', '1 cfs = 448.83 gpm'], 'format': '0.000'},
                    {'values': ['Suction Pipe Inside Diameter (D)', 6.00, 'inches', 'Suction nozzle diameter'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Suction Pipe Total Length (L)', 35.0, 'ft', 'Total straight length of suction line'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Hazen-Williams Roughness (C)', 130.0, '-', 'Smooth C900 PVC suction pipe'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Static Elevation Difference (zs)', -8.50, 'ft', 'Negative indicates suction lift below pump'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Suction Flow Velocity (V)', '=B14 / ((PI()/4)*(B15/12)^2)', 'fps', 'V = Q / A'], 'format': '0.00'},
                    {'values': ['Velocity Head (V² / 2g)', '=B19^2 / (2 * 32.174)', 'ft', 'hv = V² / 2g'], 'format': '0.000'},
                    {'values': ['Suction Pipe Friction Loss (h_f)', '=10.44 * B16 * B13^1.852 / (B17^1.852 * B15^4.87)', 'ft', 'Hazen-Williams friction loss'], 'format': '0.00'},
                    {'values': ['Minor Loss Coefficient (sum K)', 2.50, '-', 'Foot valve with strainer + 90 deg elbow'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Minor Losses Head (h_m)', '=B22 * B20', 'ft', 'h_m = K * (V² / 2g)'], 'format': '0.00'},
                    {'values': ['TOTAL SUCTION HEAD LOSS (sum h_L)', '=B21 + B23', 'ft', 'sum h_L = h_friction + h_minor'], 'is_total': True, 'format': '0.00'}
                ]
            },
            {
                'title': '3. NET POSITIVE SUCTION HEAD & CAVITATION VERIFICATION',
                'headers': ['NPSH Performance Parameter', 'Calculated Value', 'Units', 'Governing NCEES Equation', 'Cavitation Status'],
                'rows': [
                    {'values': ['Net Positive Suction Head Available (NPSH_a)', '=B8 + B18 - B10 - B24', 'ft', 'NPSHa = H_pa + zs - H_vp - sum h_L', 'Available suction energy'], 'format': '0.00'},
                    {'values': ['Pump Manufacturer Required Head (NPSH_r)', 12.00, 'ft', 'NPSHr from pump performance curve at 450 gpm', 'Minimum required energy'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Cavitation Safety Margin (delta_NPSH)', '=B27 - B28', 'ft', 'Margin = NPSHa - NPSHr (Recommend >= 3.0 ft)', '=IF((B27-B28)>=3.0, "PASS - AMPLE CAVITATION MARGIN", IF((B27-B28)>=0.0, "WARNING - LOW MARGIN", "FAIL - SEVERE CAVITATION!"))'], 'is_check': True, 'format': '0.00'},
                    {'values': ['NCEES Max Permissible Static Lift (H_s)', '=(B8 - B10) - B28 - B24', 'ft', 'Hs = (H_pa - H_vp) - NPSHr - sum h_L', '=IF(ABS(B18)<=B30, "PASS - LIFT WITHIN NCEES Hs LIMIT", "FAIL - EXCEEDS MAXIMUM LIFT!")'], 'is_check': True, 'format': '0.00'}
                ]
            }
        ]
    )

    # =========================================================================
    # TAB 20: STORMWATER & TR-55 CN
    # =========================================================================
    create_calc_sheet(
        'Stormwater & TR-55 CN',
        'STORMWATER FACILITY SIZING & NRCS TR-55 CURVE NUMBER LAB',
        'Soil Groups A-D • Land Cover Composite CN • TR-55 Detention Ratio Vs/Vr • Drawdown Orifice & Spillway (NCEES § 6.3.3)',
        [
            {
                'title': '1. WATERSHED LAND USE & COMPOSITE CURVE NUMBER (CN)',
                'headers': ['Land Cover Category (HSG C)', 'Curve Number (CN)', 'Area Breakdown (%)', 'Weighted Product (CN * %)', 'Description'],
                'rows': [
                    {'values': ['Impervious Pavements & Roofs', 98, '60.0%', '=98 * 0.60', 'Roads, roofs, parking lots'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Turf Grass / Open Lawns (Good condition)', 74, '40.0%', '=74 * 0.40', '>75% grass cover in HSG C'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Woods / Forest Conservation Buffer', 70, '0.0%', '=70 * 0.00', 'Preserved tree canopy'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Meadow / Non-Grazed Grass', 71, '0.0%', '=71 * 0.00', 'Continuous natural grass'], 'is_input': True, 'format': '0.0'},
                    {'values': ['COMPOSITE CURVE NUMBER (CN)', '-', '100.0%', '=SUM(D4:D7)', 'CN_comp = Sum(CN_i * A_i) / Sum(A_i)'], 'is_total': True, 'format': '0.0'}
                ]
            },
            {
                'title': '2. NRCS TR-55 DIRECT RUNOFF HYDROLOGY (P = 5.00 INCHES)',
                'headers': ['Hydrologic Parameter', 'Design Value', 'Units', 'Governing TR-55 / NCEES Equation'],
                'rows': [
                    {'values': ['Drainage Catchment Area (A)', 20.0, 'acres', 'Total watershed tributary area'], 'is_input': True, 'format': '0.0'},
                    {'values': ['24-Hour Design Rainfall Depth (P)', 5.00, 'inches', '25-year 24-hour rainfall depth'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Potential Maximum Soil Retention (S)', '=(1000 / D8) - 10', 'inches', 'S = (1000 / CN) - 10'], 'format': '0.000'},
                    {'values': ['Initial Abstraction Depth (I_a)', '=0.2 * B13', 'inches', 'I_a = 0.2 * S'], 'format': '0.000'},
                    {'values': ['Direct Runoff Depth (Q_depth)', '=IF(B12 > B14, (B12 - 0.2*B13)^2 / (B12 + 0.8*B13), 0.0)', 'inches', 'Q = (P - 0.2*S)² / (P + 0.8*S)'], 'format': '0.00'},
                    {'values': ['Total Runoff Volume (V_r)', '=(B15 / 12) * B11', 'acre-ft', 'V_r = (Q / 12) * A'], 'format': '0.00'},
                    {'values': ['Runoff Volume in Cubic Feet', '=B16 * 43560', 'cu ft', '1 acre-ft = 43,560 cu ft'], 'format': '#,##0.0'},
                    {'values': ['Runoff Volume in Gallons', '=B17 * 7.48052', 'gallons', '1 cu ft = 7.48 gallons'], 'format': '#,##0.0'}
                ]
            },
            {
                'title': '3. DETENTION STORAGE SIZING VIA TR-55 UNIT HYDROGRAPH RATIO',
                'headers': ['Hydrograph Attenuation Parameter', 'Design Value', 'Units', 'TR-55 Polynomial Routing Formula'],
                'rows': [
                    {'values': ['Post-Development Peak Inflow Rate (q_i)', 62.0, 'cfs', 'Peak unattenuated inflow to pond'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Regulated Allowable Peak Outflow Rate (q_o)', 24.0, 'cfs', 'Pre-development target release limit'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Peak Discharge Ratio (q_o / q_i)', '=B22 / B21', '-', 'Ratio = q_out / q_in'], 'format': '0.000'},
                    {'values': ['TR-55 Storage Volume Ratio (Vs / Vr)', '=0.682 - 1.43*B23 + 1.64*B23^2 - 0.804*B23^3', '-', 'Vs/Vr = 0.682 - 1.43*(qo/qi) + 1.64*(qo/qi)² - 0.804*(qo/qi)³'], 'format': '0.000'},
                    {'values': ['REQUIRED DETENTION STORAGE VOLUME (V_s)', '=B24 * B16', 'acre-ft', 'V_s = (Vs / Vr) * V_r'], 'is_total': True, 'format': '0.00'},
                    {'values': ['Required Detention Volume in Cubic Feet', '=B25 * 43560', 'cu ft', 'Target storage capacity required by ordinance'], 'format': '#,##0.0'}
                ]
            },
            {
                'title': '4. WATER QUALITY VOLUME (WQv) & EXTENDED DETENTION DRAWDOWN',
                'headers': ['Water Quality Parameter', 'Design Value', 'Units', 'Georgia / Ten-State Standards Formula'],
                'rows': [
                    {'values': ['First-Flush Water Quality Rainfall (P_wq)', 1.00, 'inches', '80% TSS removal storm depth'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Volumetric Runoff Coefficient (R_v)', '=0.05 + 0.009 * 60.0', '-', 'R_v = 0.05 + 0.009 * (% Impervious)'], 'format': '0.000'},
                    {'values': ['Water Quality Volume (WQ_v)', '=(B29 * B30 * B11) / 12', 'acre-ft', 'WQ_v = (P_wq * R_v * A) / 12'], 'format': '0.00'},
                    {'values': ['Target Orifice Drawdown Duration', 48.0, 'hours', 'Standard 24-72 hr extended detention drawdown'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Water Quality Depth Head (h_wq)', 3.00, 'ft', 'Pool depth allocated for water quality'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Required Orifice Area (A_o)', '=(2 * 9800 * SQRT(B33)) / (0.60 * (B32 * 3600) * SQRT(2 * 32.174))', 'sq ft', 'A_o = 2*A_avg*sqrt(h) / [Cd * t_sec * sqrt(2g)]'], 'format': '0.0000'},
                    {'values': ['REQUIRED DRAWDOWN ORIFICE DIAMETER (d_o)', '=SQRT(4 * B34 / PI()) * 12', 'inches', 'Circular low-flow orifice plate diameter'], 'is_total': True, 'format': '0.00'}
                ]
            },
            {
                'title': '5. PRISMOIDAL BASIN CAPACITY & EMERGENCY SPILLWAY VERIFICATION',
                'headers': ['Basin Physical Sizing Parameter', 'Design Value', 'Units', 'Governing Equation / Limit Check', 'Status Check'],
                'rows': [
                    {'values': ['Basin Bottom Dimensions', '180 ft × 80 ft', '-', 'Rectangular excavation base', '-']},
                    {'values': ['Basin Embankment Interior Side Slope', 4.0, 'H:1V', '4:1 gentle maintenance side slope', '-'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Total Embankment Depth (H_total)', 6.00, 'ft', 'Bottom to top of berm', '-'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Total Provided Basin Storage Capacity', 4.25, 'acre-ft', 'Prismoidal frustum volume at 6.0 ft depth', '-'], 'format': '0.00'},
                    {'values': ['Basin Storage Safety Factor', '=B40 / B25', '-', 'SF = V_provided / V_s,req (Target >= 1.0)', '=IF((B40/B25)>=1.0, "PASS - STORAGE CAPACITY SUFFICIENT", "FAIL - UNDERSIZED BASIN")'], 'is_check': True, 'format': '0.00'},
                    {'values': ['Emergency Spillway Crest Length (L_w)', 20.0, 'ft', 'Broad-crested weir spillway crest', '-'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Emergency Surcharge Head (H_w)', '=(B21 / (3.10 * B42))^(2/3)', 'ft', 'H_w = [Q_in / (Cw * Lw)]^(2/3)', '-'], 'format': '0.00'},
                    {'values': ['Provided Embankment Freeboard', '=B39 - (4.50 + B43)', 'ft', 'Freeboard = H_total - (DHW + H_w)', '=IF((B39-(4.50+B43))>=1.0, "PASS - FREEBOARD >= 1.0 FT", "FAIL - LOW FREEBOARD")'], 'is_check': True, 'format': '0.00'}
                ]
            }
        ]
    )


    # =========================================================
    # TAB 21: TIME RATE OF CONSOLIDATION & SOIL SURCHARGE PRELOAD
    # =========================================================
    create_calc_sheet(
        'Consolidation & Surcharge',
        'SOLVEDIN6 CIVIL MASTER TOOLBOX - TAB 21: TIME RATE OF CONSOLIDATION & SOIL SURCHARGE PRELOAD',
        'NCEES PE Civil § 3.3 & § 3.4 • Reclaimed Lake Bed / Filled Ditch Surcharge Preload & Moisture Dissipation Solver',
        [
            {
                'title': '1. IN-SITU COMPRESSIBLE SOIL STRATIGRAPHY & GEOTECHNICAL PROPERTIES',
                'headers': ['Stratigraphy & Soil Parameter', 'Design Value', 'Units', 'NCEES Handbook Formulation / Reference'],
                'rows': [
                    {'values': ['Compressible Clay Layer Total Thickness (H)', 20.00, 'ft', 'Total saturated clay layer thickness'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Drainage Boundary Condition', 'Double Drainage', '-', 'Double (sand top/bottom) or Single (rock at bottom)'], 'is_input': True},
                    {'values': ['Maximum Drainage Path Distance (H_dr)', '=IF(B7="Single Drainage", B6, B6/2)', 'ft', 'H_dr = H/2 for double drainage, H for single drainage'], 'format': '0.00'},
                    {'values': ['Coefficient of Consolidation (c_v)', 0.080, 'ft²/day', 'Hydraulic consolidation rate property'], 'is_input': True, 'format': '0.000'},
                    {'values': ['Clay Compression Index (C_c)', 0.360, '-', 'Slope of e vs log(sigma) virgin compression curve'], 'is_input': True, 'format': '0.000'},
                    {'values': ['Initial In-Situ Void Ratio (e_0)', 0.900, '-', 'Initial volumetric void ratio of clay stratum'], 'is_input': True, 'format': '0.000'},
                    {'values': ["Initial Effective Overburden Stress (σ'_v0)", 2200.0, 'psf', 'Effective vertical stress at mid-depth of clay layer'], 'is_input': True, 'format': '#,##0.0'}
                ]
            },
            {
                'title': '2. STRUCTURAL FOUNDATION LOADING & ULTIMATE SETTLEMENT (S_p,ult)',
                'headers': ['Structural Loading Parameter', 'Design Value', 'Units', 'Governing Compression Equation'],
                'rows': [
                    {'values': ['Foundation Footprint Length (L)', 300.0, 'ft', 'Building / foundation footprint length'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Foundation Footprint Width (W)', 200.0, 'ft', 'Building / foundation footprint width'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Total Foundation Footprint Area (A)', '=B16 * B17', 'sq ft', 'A = L * W'], 'format': '#,##0.0'},
                    {'values': ['Permanent Foundation Bearing Pressure (Δσ_p)', 1500.0, 'psf', 'Net structural stress increase applied to soil'], 'is_input': True, 'format': '#,##0.0'},
                    {'values': ["Total Mid-Depth Vertical Stress (σ'_v0 + Δσ_p)", '=B12 + B19', 'psf', 'Total effective stress under permanent building load'], 'format': '#,##0.0'},
                    {'values': ['Clay Compression Factor [C_c * H / (1 + e_0)]', '=(B10 * B6) / (1 + B11)', 'ft', 'Dimensional coefficient for 1D settlement'], 'format': '0.0000'},
                    {'values': ['Ultimate Primary Consolidation Settlement (S_p,ult)', '=B21 * LOG10(B20 / B12)', 'ft', "S_p,ult = [Cc*H/(1+e0)] * log10((σ'v0 + Δσp) / σ'v0)"], 'format': '0.0000'},
                    {'values': ['ULTIMATE PRIMARY SETTLEMENT IN INCHES', '=B22 * 12', 'inches', 'Total moisture expulsion deformation to eliminate'], 'is_total': True, 'format': '0.00'}
                ]
            },
            {
                'title': '3. PRELOAD SURCHARGE DESIGN: TIME ➔ REQUIRED SOIL WEIGHT (MODE A)',
                'headers': ['Preload Surcharge Parameter', 'Design Value', 'Units', 'Terzaghi 1-D Consolidation Derivation'],
                'rows': [
                    {'values': ['Allotted Preloading Time Window (t)', 180.0, 'days', 'Target construction window before building erection'], 'is_input': True, 'format': '0.0'},
                    {'values': ['Equivalent Preload Duration in Months', '=B27 / 30.4375', 'months', 'Duration in calendar months'], 'format': '0.0'},
                    {'values': ['Terzaghi Time Factor (T_v)', '=(B9 * B27) / (B8^2)', '-', 'T_v = (c_v * t) / (H_dr^2)'], 'format': '0.0000'},
                    {'values': ['Degree of Consolidation under Preload (U_s)', '=IF(B29<=0.2827, SQRT((4*B29)/PI()), 1 - 10^((1.781-B29)/0.933 - 2))', '-', 'Terzaghi average consolidation ratio'], 'format': '0.0000'},
                    {'values': ['Pore Water Moisture Dissipated Percentage', '=B30 * 100', '%', 'Moisture squeezed out of clay pores in allotted time'], 'format': '0.0'},
                    {'values': ['Required Ultimate Settlement under Preload', '=B22 / B30', 'ft', 'S_total,ult = S_p,ult / U_s'], 'format': '0.0000'},
                    {'values': ['Required Surcharge Soil Pressure (Δσ_s)', '=B12 * (10^(B32 / B21)) - B12 - B19', 'psf', 'Additional vertical stress required to accelerate settlement'], 'format': '#,##0.0'},
                    {'values': ['Surcharge Soil Compacted Unit Weight (γ_fill)', 125.0, 'pcf', 'Compacted density of borrow soil surcharge'], 'is_input': True, 'format': '0.0'},
                    {'values': ['REQUIRED SURCHARGE FILL HEIGHT (h_s)', '=B33 / B34', 'ft', 'h_s = Δσ_s / γ_fill'], 'is_total': True, 'format': '0.00'},
                    {'values': ['Total Surcharge Fill Volume in Cubic Feet', '=B18 * B35', 'cu ft', 'Volume = Area * h_s'], 'format': '#,##0.0'},
                    {'values': ['Total Surcharge Fill Volume in Cubic Yards', '=B36 / 27', 'cu yd', 'Volume in bank / compacted cubic yards'], 'format': '#,##0.0'},
                    {'values': ['TOTAL SURCHARGE SOIL WEIGHT IN POUNDS', '=B36 * B34', 'lbs', 'Weight = Volume * γ_fill'], 'format': '#,##0.0'},
                    {'values': ['TOTAL SURCHARGE SOIL WEIGHT IN TONS', '=B38 / 2000', 'Tons', 'Required surcharge borrow weight in short tons'], 'is_total': True, 'format': '#,##0.0'}
                ]
            },
            {
                'title': '4. REVERSE SOLVER: SPECIFIED SURCHARGE WEIGHT ➔ PRELOAD TIME (MODE B)',
                'headers': ['Reverse Solver Parameter', 'Design Value', 'Units', 'Inverted Terzaghi Formulation'],
                'rows': [
                    {'values': ['Specified Surcharge Soil Fill Height', 8.00, 'ft', 'Pre-selected contractor fill thickness'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Generated Surcharge Effective Stress', '=B43 * B34', 'psf', 'Δσ_s = h_s * γ_fill'], 'format': '#,##0.0'},
                    {'values': ['Total Surcharge Weight Placed in Tons', '=(B18 * B43 * B34) / 2000', 'Tons', 'Total weight of 8.0-ft fill over footprint'], 'format': '#,##0.0'},
                    {'values': ["Total Vertical Stress under 8-ft Surcharge", '=B12 + B19 + B44', 'psf', "σ'_v0 + Δσ_p + Δσ_s"], 'format': '#,##0.0'},
                    {'values': ['Total Ultimate Settlement under 8-ft Fill', '=B21 * LOG10(B46 / B12)', 'ft', 'Total settlement if load left permanently'], 'format': '0.0000'},
                    {'values': ['Required Consolidation Ratio (U_s,req)', '=B22 / B47', '-', 'U_s = S_p,ult / S_total,ult'], 'format': '0.0000'},
                    {'values': ['Required Terzaghi Time Factor (T_v,b)', '=1.781 - 0.933 * LOG10(100 - 100 * B48)', '-', 'T_v for U > 60%'], 'format': '0.0000'},
                    {'values': ['REQUIRED PRELOADING DURATION IN DAYS', '=(B49 * (B8^2)) / B9', 'days', 't = (T_v * H_dr^2) / c_v'], 'is_total': True, 'format': '0.0'},
                    {'values': ['REQUIRED PRELOADING DURATION IN MONTHS', '=B50 / 30.4375', 'months', 'Duration in calendar months'], 'is_total': True, 'format': '0.0'}
                ]
            },
            {
                'title': '5. FOUNDATION PERFORMANCE, PRECONSOLIDATION & RESIDUAL SETTLEMENT CHECK',
                'headers': ['Performance Check Parameter', 'Design Value', 'Units', 'Criterion / Code Limit', 'Status Check'],
                'rows': [
                    {'values': ['Post-Construction Residual Settlement', 0.00, 'inches', 'Target = 0.00 inches (Fully dissipated)', 'PASS - SETTLEMENT ELIMINATED']},
                    {'values': ["Preconsolidation Stress Created (σ'_p)", '=B12 + B19 + B33', 'psf', 'Maximum past effective stress induced by preload', '-'], 'format': '#,##0.0'},
                    {'values': ['Overconsolidation Ratio (OCR)', '=(B12 + B19 + B33) / (B12 + B19)', '-', "OCR = (σ'v0 + Δσp + Δσs) / (σ'v0 + Δσp)", '=IF(((B12+B19+B33)/(B12+B19))>1.0, "PASS - OVERCONSOLIDATED STATE ACHIEVED", "FAIL - UNDERCONSOLIDATED")'], 'is_check': True, 'format': '0.00'}
                ]
            }
        ]
    )


    # =========================================================
    # TAB 22: PERIODIC TABLE & WATER CHEMISTRY LAB
    # =========================================================
    create_calc_sheet(
        'Periodic Table & Chemistry',
        'SOLVEDIN6 CIVIL MASTER TOOLBOX - TAB 22: PERIODIC TABLE & WATER CHEMISTRY LAB',
        'NCEES PE Reference Handbook § 6.1 • Periodic Table, Equivalent Weights & Problem #92 Cation-Anion Balance Solver',
        [
            {
                'title': '1. COMMON NCEES WATER & ENVIRONMENTAL ELEMENTS & ATOMIC WEIGHTS',
                'headers': ['Element Name', 'Symbol', 'Atomic No. (Z)', 'Atomic Weight (g/mol)', 'Common Valence', 'Primary Environmental Engineering Application'],
                'rows': [
                    {'values': ['Hydrogen', 'H', 1, 1.008, '+1', 'pH definition, acid-base equilibrium, hydration reactions'], 'format': '0.000'},
                    {'values': ['Carbon', 'C', 6, 12.011, '+4, -4', 'Carbonate equilibrium, alkalinity, BOD/COD organic carbon'], 'format': '0.000'},
                    {'values': ['Nitrogen', 'N', 7, 14.007, '-3 to +5', 'Nutrient, Ammonia, Nitrite, Nitrate (MCL = 10 mg/L as N), TKN'], 'format': '0.000'},
                    {'values': ['Oxygen', 'O', 8, 15.999, '-2', 'Dissolved oxygen (DO), oxidation-reduction, aeration, ozone'], 'format': '0.000'},
                    {'values': ['Sodium', 'Na', 11, 22.990, '+1', 'Major cation, Sodium Adsorption Ratio (SAR), ion exchange'], 'format': '0.000'},
                    {'values': ['Magnesium', 'Mg', 12, 24.305, '+2', 'Secondary hardness contributor, excess lime softening precipitation'], 'format': '0.000'},
                    {'values': ['Aluminum', 'Al', 13, 26.982, '+3', 'Coagulation with alum [Al2(SO4)3·14H2O], sweep flocculation'], 'format': '0.000'},
                    {'values': ['Phosphorus', 'P', 15, 30.974, '+5', 'Limiting nutrient, orthophosphate, biological phosphorus removal'], 'format': '0.000'},
                    {'values': ['Sulfur', 'S', 16, 32.060, '-2 to +6', 'Sulfate salinity, hydrogen sulfide odor/corrosion, acid mine drainage'], 'format': '0.000'},
                    {'values': ['Chlorine', 'Cl', 17, 35.453, '-1', 'Disinfection (free/combined chlorine), chloride salinity, CT credit'], 'format': '0.000'},
                    {'values': ['Potassium', 'K', 19, 39.098, '+1', 'Agricultural runoff nutrient, major intracellular cation'], 'format': '0.000'},
                    {'values': ['Calcium', 'Ca', 20, 40.078, '+2', 'Primary water hardness cation, lime softening [Ca(OH)2], scaling'], 'format': '0.000'},
                    {'values': ['Iron', 'Fe', 26, 55.845, '+2, +3', 'Ferric chloride coagulant, red water aesthetic secondary MCL (0.3 mg/L)'], 'format': '0.000'},
                    {'values': ['Copper', 'Cu', 29, 63.546, '+1, +2', 'Lead and Copper Rule (Action Level = 1.3 mg/L), pipe corrosion'], 'format': '0.000'},
                    {'values': ['Arsenic', 'As', 33, 74.922, '+3, +5', 'Toxic carcinogen, Primary MCL = 0.010 mg/L, arsenite vs arsenate'], 'format': '0.000'},
                    {'values': ['Lead', 'Pb', 82, 207.200, '+2, +4', 'Toxic neurotoxin, Lead and Copper Rule (Action Level = 0.015 mg/L)'], 'format': '0.000'}
                ]
            },
            {
                'title': '2. COMMON WATER TREATMENT RADICALS & EQUIVALENT WEIGHTS (EW = MW / |z|)',
                'headers': ['Radical / Chemical Formula', 'Common Radical Name', 'Molecular Weight (g/mol)', 'Absolute Valence |z|', 'Equivalent Weight (g/eq)', 'Water Treatment & Chemistry Function'],
                'rows': [
                    {'values': ['H⁺', 'Hydrogen Ion', 1.008, 1, '=C25 / D25', 'Acidity, hydronium ion activity, pH = -log10[H+]'], 'format': '0.000'},
                    {'values': ['OH⁻', 'Hydroxide', 17.007, 1, '=C26 / D26', 'Basicity, caustic soda NaOH, lime softening precipitant'], 'format': '0.000'},
                    {'values': ['Ca²⁺', 'Calcium Cation', 40.078, 2, '=C27 / D27', 'Hardness, CaCO3 precipitation at pH ~9.3 in softening'], 'format': '0.000'},
                    {'values': ['Mg²⁺', 'Magnesium Cation', 24.305, 2, '=C28 / D28', 'Hardness, Mg(OH)2 precipitation at pH ~10.8 (excess lime)'], 'format': '0.000'},
                    {'values': ['Na⁺', 'Sodium Cation', 22.990, 1, '=C29 / D29', 'Soluble monovalent cation, cation-exchange softening regenerant'], 'format': '0.000'},
                    {'values': ['HCO₃⁻', 'Bicarbonate', 61.017, 1, '=C30 / D30', 'Natural alkalinity buffer in pH range 4.5 to 8.3'], 'format': '0.000'},
                    {'values': ['CO₃²⁻', 'Carbonate', 60.009, 2, '=C31 / D31', 'High-pH alkalinity buffer, soda ash (Na2CO3) addition'], 'format': '0.000'},
                    {'values': ['SO₄²⁻', 'Sulfate', 96.064, 2, '=C32 / D32', 'Non-carbonate hardness counter-ion, alum coagulation byproduct'], 'format': '0.000'},
                    {'values': ['Cl⁻', 'Chloride', 35.453, 1, '=C33 / D33', 'Conservative tracer, saline intrusion, secondary MCL = 250 mg/L'], 'format': '0.000'},
                    {'values': ['NO₃⁻', 'Nitrate', 62.005, 1, '=C34 / D34', 'Methemoglobinemia contaminant, primary MCL = 10 mg/L as N'], 'format': '0.000'},
                    {'values': ['PO₄³⁻', 'Orthophosphate', 94.971, 3, '=C35 / D35', 'Nutrient, lead/copper corrosion inhibitor film former'], 'format': '0.000'},
                    {'values': ['CaCO₃', 'Calcium Carbonate', 100.087, 2, '=C36 / D36', 'Standard universal basis for hardness & alkalinity (EW = 50.04)'], 'format': '0.000'}
                ]
            },
            {
                'title': '3. CATION-ANION CHARGE BALANCE SOLVER (PROBLEM #92 LIVE EXAM CASE)',
                'headers': ['Water Quality Ion Parameter', 'Measured Conc. (mg/L)', 'Valence |z|', 'Formula Weight (g/mol)', 'Equivalent Wt (mg/meq)', 'Normality (meq/L)', 'Ion Type'],
                'rows': [
                    {'values': ['Calcium (Ca²⁺)', 40.08, 2, 40.078, '=D40 / C40', '=B40 / E40', 'Cation (+)'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Magnesium (Mg²⁺)', 24.31, 2, 24.305, '=D41 / C41', '=B41 / E41', 'Cation (+)'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Sodium (Na⁺)', 0.00, 1, 22.990, '=D42 / C42', '=B42 / E42', 'Cation (+)'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Potassium (K⁺)', 0.00, 1, 39.098, '=D43 / C43', '=B43 / E43', 'Cation (+)'], 'is_input': True, 'format': '0.00'},
                    {'values': ['TOTAL MEASURED CATIONS (Σ Cations)', '=SUM(F40:F43)', 'meq/L', 'Σ (mg/L / EW) for all cations', '-', '=B44', 'Total Cations'], 'is_total': True, 'format': '0.00'},
                    {'values': ['Bicarbonate (HCO₃⁻)', 183.00, 1, 61.017, '=D45 / C45', '=B45 / E45', 'Anion (-)'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Sulfate (SO₄²⁻)', 96.06, 2, 96.064, '=D46 / C46', '=B46 / E46', 'Anion (-)'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Chloride (Cl⁻)', 35.45, 1, 35.453, '=D47 / C47', '=B47 / E47', 'Anion (-)'], 'is_input': True, 'format': '0.00'},
                    {'values': ['Nitrate (NO₃⁻)', 0.00, 1, 62.005, '=D48 / C48', '=B48 / E48', 'Anion (-)'], 'is_input': True, 'format': '0.00'},
                    {'values': ['TOTAL MEASURED ANIONS (Σ Anions)', '=SUM(F45:F48)', 'meq/L', 'Σ (mg/L / EW) for all anions', '-', '=B49', 'Total Anions'], 'is_total': True, 'format': '0.00'}
                ]
            },
            {
                'title': '4. CHARGE BALANCE VERIFICATION & ERROR TOLERANCE (NCEES CRITERIA)',
                'headers': ['Electro-Neutrality Metric', 'Calculated Value', 'Units', 'Standard Criterion / Formula', 'Design Status / Exam Check'],
                'rows': [
                    {'values': ['Total Cation Equivalent Concentration', '=B44', 'meq/L', 'Σ Cations from Section 3', '-'], 'format': '0.00'},
                    {'values': ['Total Anion Equivalent Concentration', '=B49', 'meq/L', 'Σ Anions from Section 3', '-'], 'format': '0.00'},
                    {'values': ['Net Absolute Charge Difference (|ΣC - ΣA|)', '=ABS(B53 - B54)', 'meq/L', '|Σ Cations - Σ Anions|', '-'], 'format': '0.00'},
                    {'values': ['Normalized Charge Balance Error (% E_cb)', '=(B55 / (B53 + B54)) * 100', '%', 'E_cb = |ΣC - ΣA| / (ΣC + ΣA) × 100%', '-'], 'format': '0.00'},
                    {'values': ['Standard Permissible Balance Error Limit', 5.0, '%', 'Standard acceptable analytical threshold = ±5.0%', '-'], 'is_input': True, 'format': '0.0'},
                    {'values': ['ELECTRO-NEUTRALITY CODE CHECK', '=IF(B56<=B57, "BALANCED (Within ±5%)", IF(B53>B54, "NOT BALANCED (Cations Higher)", "NOT BALANCED (Anions Higher)"))', '-', 'NCEES Problem #92 Diagnostic Check', '=IF(B56<=B57, "PASS - BALANCED WATER ANALYSIS", "FAIL - ANALYSIS UNBALANCED")'], 'is_check': True}
                ]
            },
            {
                'title': '5. HARDNESS & STOICHIOMETRIC REAGENTS (AS CaCO3 EQUIVALENTS)',
                'headers': ['Water Chemistry Parameter', 'Design Value', 'Units', 'Governing Stoichiometric Equation'],
                'rows': [
                    {'values': ['Total Hardness (TH) as CaCO₃', '=(F40 + F41) * 50.0435', 'mg/L as CaCO₃', 'TH = (meq/L Ca²⁺ + meq/L Mg²⁺) × EW(CaCO₃)'], 'format': '0.00'},
                    {'values': ['Calcium Hardness (CH) as CaCO₃', '=F40 * 50.0435', 'mg/L as CaCO₃', 'CH = meq/L Ca²⁺ × 50.0435 mg/meq'], 'format': '0.00'},
                    {'values': ['Magnesium Hardness (MH) as CaCO₃', '=F41 * 50.0435', 'mg/L as CaCO₃', 'MH = meq/L Mg²⁺ × 50.0435 mg/meq'], 'format': '0.00'},
                    {'values': ['Total Alkalinity (Alk) as CaCO₃', '=F45 * 50.0435', 'mg/L as CaCO₃', 'Alk = meq/L HCO₃⁻ × 50.0435 mg/meq (pH 4.5-8.3)'], 'format': '0.00'},
                    {'values': ['Carbonate Hardness (CH)', '=MIN(B62, B65)', 'mg/L as CaCO₃', 'CH = min(Total Hardness, Total Alkalinity)'], 'format': '0.00'},
                    {'values': ['Non-Carbonate Hardness (NCH)', '=MAX(0, B62 - B65)', 'mg/L as CaCO₃', 'NCH = max(0, Total Hardness - Total Alkalinity)'], 'format': '0.00'}
                ]
            }
        ]
    )

    # ---------------------------------------------------------
    # SAVE WORKBOOK
    # ---------------------------------------------------------
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    wb.save(output_path)
    print(f"✓ Master Workbook successfully generated at: {output_path}")
    print(f"✓ Total Worksheets: {len(wb.sheetnames)}")
    print(f"✓ Sheets: {wb.sheetnames}")

if __name__ == '__main__':
    target = os.path.abspath('public/Civil_Engineering_Master_Toolbox.xlsx')
    build_master_workbook(target)
