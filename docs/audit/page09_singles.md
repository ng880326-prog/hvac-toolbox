# Page ⑨ — the remaining sheets (Motor · PN · SPF(PRC) · Hx · Insulations · singles)

Sheets covered here: `Motor`, `30_PN`, `32_SPF_PRC_`, `24_Hx`, `29_Insulations`, plus the sheets that
needed no change (`Acoustics`, `Website`, `34_Supplier`).
Modules: `motor.js`, `pn.js`, `stairwell.js`, `hx.js`, `insulation.js`, `acoustics.js`, `webtools.js`.
Verifiers: `tools/verify_motor.py` **24/24**, `tools/verify_hx.py` **26/26**,
`tools/verify_insulation.py` **48/48**; engine `129/129`; BEC table suite `tests/insulation_tables.mjs` **26/26**.

---

## 1. Motor (`Motor` sheet)

| Workbook | App |
|---|---|
| `X6:AC26` rating schedule: kW → running current, phase, starting method, starting current, MCB | 21-row editable schedule; `pickKw` selects the rating |
| `AE4:AE23` isolator sizes 16 … 3150 A | isolator selector bound to the schedule row |
| 起動方式 DOL 6× / Υ-Δ 2.5× / Auto-transformer 1.5× / VSD 1.3× | same four multipliers |
| `AG21` fan power `1 m³/s × 1000 Pa / 0.7 / 0.7 × 1.2` | fan motor power card (same 0.7/0.7 and 1.2 service factor) |
| `AL` pump power `V̇·H·9.8/η·SF` | pump motor power card |
| `N9/N13/N15` 300 Pa/m, terminal coil 30 000 Pa, evaporator/HX coil 80 000 Pa | static & pump-head estimation card, defaults identical |
| `AW9` `ER = 0.002342·H/(Δt·η)` | ER card with the default limit flag |
| voltages 220 / 380 V, pressure units | unit selectors |

Verified values (from `tools/verify_motor.py`, all against the workbook cells): 3 kW → 5.3624 A,
DOL 32.1743 A, MCB 20 A, isolator 250 A; fan power 1 m³/s × 1000 Pa → 2.449 kW; pump head
12.68 m; ER = 0.002342·30/(10·0.7) = 0.010037.

---

## 2. PN (`30_PN` sheet) — pump arrangement and pressure grade

The sheet holds pump arrangement sketches, PN grade, elevations of chiller / terminal / pump, the
minimum required pressure for the chiller and for terminal unit 2 (in **m** and **bar**), and a unit
conversion block (kPa ↔ m ↔ bar ↔ MPa).

The module already carried the height-driven minimum-pressure calculation (`hc`, `hp`, `ht`), and this
pass added the **pressure unit conversion** (kPa / m / bar / MPa) that the sheet's other half provides.
No other gap: the remaining cells are the arrangement drawings, which carry no engineering data.

---

## 3. SPF(PRC) (`32_SPF_PRC_` sheet) — 梯間加壓送風估算

The sheet is the **GB 50045-95** stairwell pressurisation estimate: stair type A / B1 / B2 / C / D ×
floor band (< 20 / 20–32 層) → basic air volume (A 25 000–30 000 / 35 000–40 000 m³/h, B1
16 000–20 000 / 20 000–25 000, B2 12 000–16 000 / 18 000–22 000, C 15 000–20 000 / 22 000–27 000,
D not applicable), then floor-ratio, single/double-door and number-of-exits correction factors.

`stairwell.js` already carries **both** that legacy table (`stairBaseFlow`, `stairFlow`) and the
current **GB 51251-2017** table (`stairBaseFlowGB`, `stairFlowGB` with the ×1.2 design factor and the
0.75 single-door factor). Locked by vectors, e.g. `A, 19 層 → 30 000`, `A, 20 層 → 35 000`,
`A h=40 m → 38 008`, `design = ×1.2 → 45 610`. No change required.

---

## 4. Hx (`24_Hx` sheet) — heat exchanger sizing

Rebuilt to mirror the sheet cell for cell (`hx.js`):

* capacity with the **kW / RT** selector — workbook `C6 =IF(D5=M6,C5*3.516,C5/3.516)`, `M7` picks the unit actually used;
* hot/cold side in/out temperatures, side ΔT `=ABS(in − out)` (workbook `C13`, `C17`);
* LMTD terminals `ΔT1 = T_h,in − T_c,out`, `ΔT2 = T_h,out − T_c,in` (workbook `O6`, `O7`), with the
  arithmetic-mean branch when the terminals are equal (`IF(O6-O7=0,(C17+C13)/2,…)`);
* water flow `m = Q/(cp·ΔT)` with the workbook's **cp = 4.185 kJ/kg·K** (`P32`, `Q32`) and the sheet's
  ×3.6 m³/h echo (`P33`, `Q33`);
* area `A = Q·1000/(U·LMTD)` with the workbook's **U = 5000 W/m²·K** (`C23`), plus a U reference table
  whose top row is that same 5000 W/m²·K plate value;
* the counter-flow schematic that the sheet draws at `G25:H36`.

**Workbook defects found**

1. `C25` labels the relation **“A = U∆T / Q”** — inverted. The formula in `C27` is
   `M7/C23/O8*1000`, i.e. `A = Q/(U·ΔT)`, which is what the app uses and what the note in the module
   records.
2. The HISAKA plate-type block (`L15:M20`, `N15:R20`, `C31:C32`) is **empty**: the sheet has no vendor
   model, plate count or dimensions. The app therefore quotes the vendor's own online selection page
   (`www.hisaka.co.jp/simulator`, the hyperlink the sheet carries) instead of inventing dimensions.
3. `J41` (the “ok / x” status flag that gates `C27`, `C31`, `C32`) is empty, so every downstream cell
   resolves to `"-"`.

---

## 5. Insulations (`29_Insulations` sheet) — the biggest gap, and the BEC 2024 upgrade

### 5.1 What the workbook actually contains

The sheet is a **blank BEC 2012 template** titled
*“Minimum Insulation Thickness Requirement - BEC 2012”* with the reference
*“Code of Practice for Energy Efficiency of Building Services Installation Section 6.11”*, and a
right-hand panel *“Calculation of Thickness of Insulation”* (Technical Guidelines §6.11).

* `Q13` Equation (a) `c = 1000*(λ/h)*{(θd−θ1)/(θm−θd)}` — provisional thickness in mm.
* `Q21` Equation (b) `c = 0.5*(do+2La)*ln[1+2La/do]` — the circular-surface correction, solved by
  iteration for the pipe thickness `La`.
* `Q28` `S28 = ROUNDUP(S13,0)`; `Q27` duct/AHU casing: `c = La` (no circular surface).
* Three side-by-side result tables: pipework (`D15:F31`), duct/AHU casing (`H15:I20`), refrigerant
  suction pipework (`K15:N31`, line temperatures 0 / −10 / −20 °C).

**Every visible thickness cell reads `"-"`, and the cause is a range error, not missing data:**

| Cell | Formula | Why it shows `-` |
|---|---|---|
| `F18` (DN15) | `=IF(SUM(AB27:AK27)=0,"-",…)` | the pipework data lives in `AB10:AK25`; the summed rows `AB27:AK42` are zero-filled |
| `I18:I20` (duct) | `=IF(SUM(AB54:AK54)=0,"-",…)` | the casing data lives in `AB50:AK52` |
| `L20:N20` (refrigerant) | `=IF(SUM(AB100:AK100)=0,"-",…)` | those rows are blank |
| `S13`, `S18`, `S21`, `S23` | gated by `S6:S10` | the calculation inputs `S6:S10` are **empty** |
| `S21`/`S23` | `=MIN(AP4:AP5003)`, `VLOOKUP(…,AP4:AR5003,2)` | the simulation table `AP4:AS5003` returns `#VALUE!` in every row, so the iterative solve never ran |

So the sheet is a template that was never filled: the numbers sit in the hidden source ranges and the
public cells were never pointed at them.

### 5.2 The data found in the hidden ranges, and its verification

`AB10:AK25` is a complete 16 × 10 table (outer diameters 21.3 … 406.4 mm × the ten
ambient/λ/h columns), `AB50:AK52` the casing table at ΔT 10 / 15 / 20 °C, and `AB3:AK8` the column
metadata (exposure index, λ, h). I checked it against the published standard, cell by cell:

* **BEC 2012 Table 6.11a** (`BEC_2012.pdf`, pp. 23–26) — identical to `AB10:AK25` in all 160 cells;
* **BEC 2012 Table 6.11c / TG Table 6.11.1(a)** — identical to `AB50:AK52`.

That parity is asserted permanently by `tests/insulation_tables.mjs`
(“BEC 2012 Table 6.11a === workbook AB10:AK25”).

### 5.3 Upgrade to BEC 2024 (current edition)

The user asked for **BEC 2024**, which changes this page substantially, so the module now carries both
editions with 2024 as the default:

| | BEC 2012 (workbook) | BEC 2024 (default) |
|---|---|---|
| Conductivity columns | λ = 0.024 / **0.04** W/m·K | λ = 0.024 / **0.038** W/m·K |
| Ambient conditions | Outdoor · Unconditioned · Conditioned | Outdoor · Unconditioned · **Ceiling void / void of conditioned space** · Conditioned |
| Table shape | 16 × 10 | 16 × **14** |
| Conditioned-space basis | ASHRAE 90.1-2007, 13 mm floor | ASHRAE 90.1-2019, 13 mm floor |
| Outdoor/unconditioned basis | 27 °C dew point @ 90 % RH (≈28.8 °C DB), 2009 ASHRAE Fundamentals | same, **2021** ASHRAE Fundamentals |
| Ceiling-void basis | — | 26 °C dew point @ 85 % RH (≈28.8 °C DB), declared by the REA |
| Commercial sizes | — | **TG Table 6.11.1(e)**, all 16 diameters × 14 columns |
| Refrigerant suction pipe | blank block in the workbook | Table 6.11b, 11 copper diameters × 0 / −10 / −20 °C |

Sources: `BEC_2024_ENG.pdf` pp. 32–34 (Tables 6.11a / 6.11b / 6.11c) and `TG-BEC_2024.pdf` §6.11.1
Tables 6.11.1(a) (ΔT 10 °C supplement) and 6.11.1(e) (commercial sizes).

### 5.4 The module as built

* **Sub-table A — chilled water pipework**: DN15 … DN400, showing the code minimum, the value from
  Equations (a)+(b), and (2024 only) the commercial product size; the row nearest the entered outside
  diameter is highlighted.
* **Sub-table B — suction refrigerant pipework**: 11 copper diameters at the selected line temperature.
* **Sub-table C — ductwork / AHU casing**: ΔT 10 / 15 / 20 °C (flat, so `c` is the thickness).
* Pickers for edition, ambient condition, λ (material presets 0.022 … 0.044) and h
  (outdoor 9 / 13.5, indoor 5.7 / 10, “any value” for conditioned space).
* **Compliance flag** on the proposed thickness against the tabulated minimum.
* A **second card** for the calculation itself: λ, h, θd, θl/ΔT, θm, do → `c` (Equation a),
  `La,min` (Equation b, inverted by bisection), equivalent thickness at the proposed `t`, surface
  temperature and a condensation flag, with a “use this edition's basis” button.
* When λ/h is not one of the tabulated pairs, the standard column shows `—` and the value comes from
  Equations (a)+(b) — exactly what BEC §6.11.1(a)(iv) prescribes for other materials.

### 5.5 Verification

* `tests/run_tests.mjs` — 18 new vectors locking Equation (a), the Equation (b) inversion
  (`do 21.3, c 32.593 → La 20.09` = BEC 6.11a's 20 mm; `do 406.4 → 30.42` = 6.11a's 31 mm),
  refrigerant `−20 °C, OD 6 → 27.2` = 6.11b's 28 mm, the four ΔT/λ/h cells that pin the 2024 column
  pairings and the ceiling-void basis, and the domain guards (`h = 0`, `θm = θd`, `c = 0` → NaN).
* `tests/insulation_tables.mjs` — 26 checks: table shape, workbook parity for both editions, the
  equations reproducing Table 6.11a within 1.5 mm over 192 cells, Table 6.11c never below Equation (a)
  and within a commercial-size step (+8 mm worst), monotonicity in λ and h, commercial size ≥ code
  minimum, and the 2021 → 2024 differences.
* `tools/verify_insulation.py` — **48 ok / 0 fail** in the browser: every table cell above, the
  edition switch, the ceiling-void column, the conditioned-space “tabulated only” behaviour, the
  refrigerant ΔT selection, the not-tabulated-λ fallback, the compliance flags, and the calculation
  card against an independent Python implementation of both equations.

---

## 6. Sheets examined and left unchanged

| Sheet | Finding |
|---|---|
| `Acoustics` | module covers the sheet's NC/attenuation inputs and the duct-borne calculation; the remaining cells are presentation. |
| `Website` | a link list; the app carries it in `webtools.js`. |
| `34_Supplier` | **deliberately excluded** — contact details (and the workbook's embedded credentials) are private data and are not shipped in the app. |

## 7. Test-suite housekeeping

* `tests/smoke.mjs` — the DOM stub now implements `replaceChildren`, the standard API the insulation
  page uses to rebuild a container in place.
* `package.json` — `npm test` and `npm run check` now run `tests/insulation_tables.mjs` as well.
* `tools/contrast_audit.py` — one unescaped regex sequence in the embedded JavaScript removed, which
  had been emitting a Python `SyntaxWarning` on every run.
