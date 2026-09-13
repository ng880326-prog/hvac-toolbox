# Page ⑧ — FCU / Fan / SAC (風機盤管 · 風機 · 小型空調機)

Workbook sheets: `13_FCU`, `14_Fan`, `15_SAC` (see `docs/audit/page_mapping.md`).
App modules: `app/js/modules/fcu.js`, `fan.js`, `sac.js`.
Verifier: `tools/verify_page8.py` — **27 ok / 0 fail**, 0 console errors.

## 1. What the workbook does, and what the app now mirrors

### 13_FCU — fan coil unit schedule

| Workbook | App |
|---|---|
| Unit row per model: cooling/heating capacity, air flow (CMH / L/s), leaving-air wet-bulb, entering water/air conditions | same four blocks, values editable, `L/s` shown to 1 decimal (CMH ÷ 3.6 parity) |
| System column (2-pipe / 4-pipe) | `seg` selector — drives which coil blocks are shown |
| Brand column (Trane / Savier) | `seg` selector |
| Fan static pressure column (Pa) | input, carried into the fan-power note |
| Entering-air condition notes (`*between air inside …`) | note lines under the tables |

### 14_Fan — fan selection

The module already mirrored the workbook (Kruger / National / Östberg × ≤1450 / ≤2900 rpm × 300 / 600 / 800 / 1000 Pa = 252 catalogue rows). No formula change was needed; this pass only confirmed row-by-row parity and that the selection table still satisfies `L/s = CMH / 3.6`.

### 15_SAC — split air conditioner record

| Workbook | App |
|---|---|
| G2:R33 — a field list used as a project record (model, capacity, refrigerant, power, pipe sizes, drain, controller…) | `type:'text'` spec-record card with the same field list; free text (not numeric) so labels such as `R410A` are accepted |
| Hong Kong catalogue prefill values | same prefill, clearly marked as a starting point |

The SAC card previously rendered those fields as number inputs, which silently blanked any non-numeric entry — fixed by adding a text field type.

## 2. Defects found and fixed in this pass

1. **`flag is not defined` in `sac.js`** — the module called `flag()` without importing it; the page threw as soon as a recommendation line was reached. Fixed by importing from `ui.js`.
2. **SAC text fields had no text type** — non-numeric specs could not be stored (see above).
3. **AHU “use estimated flow” button did not update the field** — the estimate wrote to state but never refreshed the input; fixed (page ⑦ change, shares `form()` with page ⑧).
4. **FCU default fan speed** — the workbook catalogue rows are the `High` speed; the module defaulted to `Medium` and therefore disagreed with every catalogue row. Default is now `High`.
5. **FCU CHW/HWS design pairs were fixed constants** — now editable (7/12.5 and 60/50 presets from `presets.js`), so a project with different ΔT is not forced into the factory pair.

## 3. BEC / standards basis used on this page

* Fan power: `P = Q · Δp / (η_fan · η_motor)` with the workbook's 0.7/0.7 from `Motor!AG21`.
* Split/FCU equipment efficiency bands follow the workbook; equipment-efficiency tables of **BEC 2024** (`Tables 6.12a–c`) are quoted on the chiller page (⑤).
* Air flow conversion `m³/s = CMH / 3600`, `L/s = CMH / 3.6` — asserted for every catalogue row.

## 4. Verification

```
python tools/verify_page8.py     → RESULT: 27 ok / 0 fail
node tests/run_tests.mjs         → PASS 129 / 129   (includes FCU/fan vectors)
node tests/smoke.mjs             → SMOKE OK         (fcu, fan, sac all render + interact)
```

Each verifier check reads the rendered `.res` tiles from the live page and compares them with a value
recomputed in Python from the workbook formula, so a green run means the app and the sheet agree on
that cell, not merely that the page rendered.
