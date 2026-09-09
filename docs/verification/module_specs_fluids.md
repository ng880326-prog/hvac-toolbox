# 流體/熱工模組規格（Module Specs: Fluids & Thermal）

模組：Pipe Sizing / Hx / Chiller / Boiler / NPSH / Insulations / PN。
格式：輸入（名稱、單位、預設）→ 輸出（名稱、單位）＋公式編號（對應 `fluids_thermal.md` 章節）。

---

## 1. Pipe Sizing（配管選徑）

### 1A. Water Pipe Sizing（水管）

**輸入**
| 欄位 | 單位 | 預設 | 註 |
|---|---|---|---|
| Select System | 閉式/開式 | 閉式 | 決定 C 值（E7: 閉式 140／開式 100） |
| Roughness Factor C | – | 140 | =IF(系統閉式,140,100) |
| Design Criteria: Max. Velocity | m/s | **2.5** | 上限約束 |
| Design Criteria: Max. Pressure Loss | Pa/m | **400** | 上限約束 |
| Chilled/Heating Water Temperatures（供/回） | °C | 供 10 / 回 18（ΔT=8） | 用於容量↔流量 |
| Design flow 或 capacity | kW / RT / L/s | – | 三種輸入方式（E19/F19 單位切換） |
| 管徑表（DN、OD、壁厚） | mm | BS 鋼管表 | ID = OD−2×壁厚 |

**輸出**
| 欄位 | 單位 | 公式 |
|---|---|---|
| Flowrate | L/s、m³/h | M = π(D/1000)²/4·V·1000；N = M×3.6 |
| Velocity | m/s | V = 反解 HW（§1）或約束反算 |
| Pressure Loss | Pa/m | §1 HW 式 `6.819*(V/C)^1.852/(D/1000)^1.167*1000*9.81` |
| 選徑指標 | ► | 在 V≤2.5 與 ΔP≤400 雙約束下選最小 DN（`IF(...<=... , V, "Check")`） |
| Capacity | kW / RT | kW = L/s×4.186789×ΔT；RT = kW/3.517 |
| 水頭損失/100m | m/100m | `ΔP/1000/9.81*100` |

### 1B. Condensate Drain Pipe（凝水管）
**輸入**：管徑（mm）與盤管負載（kW/RT）查表。**輸出**：坡度 **1:40（≤40mm）／1:70（較大管）**、管徑建議。經驗表（§13.2）。

### 1C. Steam Pipe Sizing（蒸汽管）
**輸入**
| 欄位 | 單位 | 預設 |
|---|---|---|
| System | Boiler plant / Terminals | – |
| Steam flow（或 kW） | kg/hr | – |
| Steam pressure BR10 | bar g | – |
| 給水/凝水溫度 | °C | – |
| 蒸汽表：壓力→T_sat、h_f、h_g | bar g / °C / kJ/kg | 0.4–? barg 表 |

**輸出**
| 欄位 | 單位 | 公式 |
|---|---|---|
| Steam Temp | °C | VLOOKUP(BR10, 壓力溫度表) |
| Steam Enthalpy h_g | kJ/kg | 表查（EF 區 SUM） |
| Input energy per kg/hr | W | `(h_g − h_f)/3.6`（§13.1） |
| kg/hr ↔ kW | kg/hr、kW | `BR7/(h_g−h_f)*3600` 或 `kW*3600/(h_g−h_f)` |
| 蒸汽管徑 | Ø | 流速表 HLOOKUP/MIN（表查） |

---

## 2. Hx（板式熱交換器選型）

**輸入**
| 欄位 | 單位 | 預設 | 註 |
|---|---|---|---|
| Capacity | kW 或 RT | – | 可切換（×/÷3.516） |
| Hot Side In / Out | °C | – | 檢查：熱入 ≥ 熱出 |
| Cold Side In / Out | °C | – | 檢查：冷出 ≥ 冷入 |
| U-value | W/m²K | **5000** | 板式水-水 |
| 機型表（HISAKA SX 系列尺寸） | m² / H / W / L | 內建 | VLOOKUP |

**輸出**
| 欄位 | 單位 | 公式 |
|---|---|---|
| ΔT 熱側 / 冷側 | K | ABS(入−出) |
| LMTD（或 ΔT） | K | `(ΔT1−ΔT2)/LN(ΔT1/ΔT2)`；ΔT1=ΔT2 → 算術平均（§5） |
| 溫度交叉檢查 | ok/x | 冷出−熱入 與 冷入−熱出 乘積 ≤0 → x（§5） |
| Heat Transfer Area | m² | `Q(kW)×1000/(U×LMTD)` |
| 熱/冷側流量 | kg/s、m³/h | `Q/4.185/ΔT`；×3.6 → m³/h |
| 選型（型號/尺寸/流量警告） | – | VLOOKUP + 流量限制檢查 |

---

## 3. Chiller（冷卻負荷與主機）

**輸入**
| 欄位 | 單位 | 預設 |
|---|---|---|
| Capacity | kW / RT / HP / Btu/h / kcal/h | –（換算表互轉） |
| 冷負荷密度 | W/m² 或 ft²/RT | – |
| 效率 | COP 或 ikW/RT | – |
| IPLV/NPLV 各載點 ikW/RT | ikW/RT | 100/75/50/25% |

**輸出**
| 欄位 | 單位 | 公式 |
|---|---|---|
| 單位換算（RT/kW/HP/Btu/kcal） | – | §3（×3.516、×860、×12000、÷3412、÷2.6⚠️） |
| COP ↔ kW/RT | – | `COP = 3.516/(kW/RT)`（§8.1） |
| IPLV / NPLV | ikW/RT | `0.01A+0.42B+0.45C+0.12D`（§8.2，AHRI 550/590） |
| 冷凝水溫（IPLV） | °C | 29.4 / 23.9 / 18.3 / 18.3 |
| 負荷密度換算 | ft²/RT↔m²/kW↔W/m² | `ft2/RT ÷ (10.7×3.516)`⚠️ 建議 10.76391 |
| 總 RT / 冷卻量 | RT | SUM |

---

## 4. Boiler（鍋爐房）

### 4A. Steam Boiler Plant（蒸汽鍋爐）
**輸入**
| 欄位 | 單位 | 預設 |
|---|---|---|
| Nos. of Boiler | nos | – |
| Boiler Capacity (Each) | Ton/hr | – |
| 額定壓力 | bar g | 10 |
| 燃料（柴油/天然氣）消耗表 | kg/hr、Nm³/hr | 內建 VLOOKUP |
| 儲存時間（除氧器/凝結水箱） | mins | – |

**輸出**
| 欄位 | 單位 | 公式 |
|---|---|---|
| Total Plant Capacity | Ton/hr | 台數×單台 |
| 換算 | kg/hr / kW / HP / Btu/h / kcal(Mcal)/hr | `kg/hr=Ton/hr×1000`；`kW=Ton/hr×668`（§7.1）；`HP=kW/9.83`⚠️；`Btu/h=HP×33439`⚠️；`Mcal/hr=kW×860`❌（應 ×0.86） |
| 給水泵流量 | m³/hr | `(Ton/hr×1.13)×1.1`（§7.3） |
| 除氧水泵/泵選型 | m³/hr | 給水泵×1.2~1.5 |
| 凝結水箱容量 | kg | 蒸發量×儲存分鐘 |
| 煙囪（單/合併） | Ø、面積 | 合併 ×1.2、直徑取整 50 mm |
| 接管尺寸（進水/出汽/排污/安全閥/燃料） | Ø | VLOOKUP 廠家表 |

### 4B. Hot Water Boiler Plant（熱水鍋爐）
**輸入**：台數、單台容量 MW、供/回水溫（°C）。**輸出**：總容量 MW、流量 `L/s = MW×1000/4.185/ΔT`、m³/h、煙囪（同上）。

### 4C. 缺失功能：膨脹水箱（見報告 §7.4，建議另建）。

---

## 5. NPSH（泵氣蝕餘量）

**輸入**
| 欄位 | 單位 | 預設 |
|---|---|---|
| 流體表面絕對壓力（開式=大氣壓） | kPa | 101.325 |
| 槽底標高 h1、泵吸入標高 x、有效液位 h2 | m | – |
| 流體溫度 tv | °C | – |
| 吸入管摩擦+速度頭 Hf | m | – |
| 泵 NPSHr | m | – |

**輸出**
| 欄位 | 單位 | 公式 |
|---|---|---|
| Ha | m | `P/9.8`⚠️（建議 /9.80665 並考慮熱水 ρ） |
| Hz = h2 + (h1−x) | m | §10 |
| Hv | m | 蒸汽表線性內插 → `p_v/9.8` |
| NPSHa | m | `Ha ± Hz − Hf − Hv` |
| NPSH = NPSHa − NPSHr | m | ≥0 → 不氣蝕 |
| 蒸汽表 | °C↔kPa | 0.01°C/0.6113 → 374.14°C/22090（ASME 臨界） |

---

## 6. Insulations（管道保溫）

**輸入**
| 欄位 | 單位 | 預設 | 註 |
|---|---|---|---|
| 保溫材料導熱係數 λ | W/mK | 0.024–0.04（材質表 VLOOKUP） | 20°C 基準 |
| 表面換熱係數 α | W/m²K | 戶外/非空調/空調 分級表 | BEC 2012 §6.11 |
| 環境露點 qd、流體溫 q1、環境溫 qm | °C | 示例 28.8/27（露點） | BEC 條件 |
| 管外徑 D | mm | 管表 VLOOKUP | |
| 試算厚度 t | mm | 1…N | 迭代 |

**輸出**
| 欄位 | 單位 | 公式 |
|---|---|---|
| 防結露厚度 c | mm | `1000×(λ/α)×((qd−q1)/(qm−qd))`（§11.2） |
| 等效平板厚度 | mm | `0.5×(D+2t)×LN(1+2t/D)`（§11.1） |
| 最小保溫厚度（BEC 2012 表） | mm | 依管徑/工況查表 |
| 國內項目保溫厚度 | mm | 依 GB 50264 表（AT:AV 區） |

---

## 7. PN（系統壓力分級）

**輸入**
| 欄位 | 單位 | 預設 |
|---|---|---|
| 泵揚程 / 樓高 / 靜壓 | m | – |
| 泵位置（Chiller/Hx 前後） | – | – |

**輸出**
| 欄位 | 單位 | 公式 |
|---|---|---|
| 系統壓力 | m / bar / kPa / MPa | `m×0.09804139432`⚠️（建議 0.0980665）、`bar×100`、`kPa×0.001`、`MPa×1000` |
| 最小 PN 級 | PN | {4, 6, 10, 16, 20, 25} 取 ≥ 計算壓力 |
| Pressure break 提示 | – | 靜壓超限時提示減壓（N17 檢查） |
