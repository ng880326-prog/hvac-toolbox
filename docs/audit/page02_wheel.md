# 第②頁對照：Wheel（轉輪熱回收）

> 依據：`analysis/sheets/05_Wheel.txt`、表印刷區 `Wheel!$B$2:$AC$45`、隱藏表 `Wheel Support`、
> `xl/drawings/drawing7.xml`、`xl/worksheets/sheet5.xml`。
> 現況程式：`app/js/modules/wheel.js`（82 行）。

## 一、原檔實際有乜（逐格對照）

| # | 原檔位置 | 內容 | App 現況 |
|---|---|---|---|
| 1 | B2 / E2 G2 / E3 G3 / E4 G4 | 「Select System」選項按鈕（夏／冬模式，連結格 AF1：1＝冬走顯熱、2＝夏走全熱）；Altitude 0 m；Pressure 101.325 kPa；Air Density ρair 1.2 kg/m³ | ❌ 全缺（無高度／壓力／ρ，亦無系統模式切換） |
| 2 | B6:K11 標題區 | 「Design Conditions」表：C 欄 Seasons、D DB(oC)、E WB(oC)、F RH(%)，右邊 G WB / H w / I h / J Dew pt. / K RH 為計算值 | ⚠️ 只有 T／RH 兩個輸入，無 WB 輸入、無 w／h／露點／WB 顯示 |
| 3 | B8:C9 / B10:C11 | 四行入風條件：**Supply Inlet（Summer / Winter）＋ Exhaust Inlet（Summer / Winter）** | ⚠️ 只有單一「新風／排風」，無夏冬兩組 |
| 4 | B13:E16 | Air Flow：Vs、Ve（格式 0.00，快取 **1132**）、Supply:Exhaust Ratio；F16 警告 `Ratio > 1.5 - Out of Range` / `< 0.7 - Out of Range` | ⚠️ 有 Vs／Ve，❌ 無比例與 0.7–1.5 範圍警告 |
| 5 | B17:D19 | Thermal Wheel Recovery Efficiency：`Sensible Heat ηS`、`Total Heat ηT`（格式 **0.0%**，快取 2354 / 2356） | ⚠️ 有 εs／εl，但無 ηT（全熱）與 ηS 的原檔命名；原檔快取值 2354% 為無效殘值 |
| 6 | M5:T16 夏欄 | Maximum Total Energy Recovered：`QT = min(Vs,Ve)·ρ·C·(h_o,1 − h_r,1)·ηT`（AF1=1 時 n/a）；Maximum Sensible：`QS = min·ρ·C·(t_o,1 − t_r,1)·ηS`；`QT = QS + QL`、`QL = QT − QS`；實際 `QS = VS·ρ·C·(t_o,1 − t_o,2)` | ❌ 無「最大可回收」「QL = QT − QS」分法（現用 m·Δh 直接算 QL） |
| 7 | M18:T28 | Supply Outlet Condition：DB **to,2 = t_o,1 − Q/(m·ρ·C)**、WB（Psy. Chart）、h_o,2；Exhaust Outlet Condition：DB **tr,2 = Q/(m·ρ·C) + t_r,1**、WB、h_r,2 | ⚠️ 只有一個「出輪」狀態（新風側），排風出口只有 T/W 字串 |
| 8 | V5:AC40 冬欄 | 同結構但**只計顯熱**：`QS = min·ρ·C·(t_r,1 − t_o,1)·ηS`（預熱）；冬欄 QT 線 n/a；`Q28「Supply moisture content unchanged」` | ❌ 完全缺失（現模組係單一「冬季工況」硬編碼，非可並列） |
| 9 | Q22 / Z22 / Z24 / Z33 / H36 / V25 | 原檔診斷字句：`< X oC dew point of supply air`、`< X oC dew point of exhuast air`、`Exhaust moisture content unchanged`、`Saturated at h = X kJ/kg`、`**Condensation occurs at exhaust outlet`、`**Condensation occurs; exhaust temperature to be determined by saturated enthalpy` | ⚠️ 有簡化版結霜／結露警告，❌ 缺「露點以上/以下」與「飽和焓決定」判語 |
| 10 | B21:F28（夏）、B30:F37（冬） | **儲存格砌成嘅轉輪示意圖**：Outdoor（to,1）↔ 中央「Thermal Wheel」↔ Indoor（to,2）；回風 tr,1 → 轉輪 → 戶外 tr,2，四個接點顯示 `DB/WB` | ❌ 完全缺失（你提過嘅「冇跟足原本繪圖」正是此處） |
| 11 | drawing7.xml | 表上按鈕：Home / Reset / Coil load / Sensible Heat Recovery / Total Heat Recovery | ⚠️ App 有全域導覽＋重設，無「跳去 Coil」捷徑 |
| 12 | 隱藏表 Wheel Support | 8 個工況區塊（夏/冬 × 供/排 × 入/出），每塊各自算 Atmospheric Pressure、WB、w、h、RH、ρ | ✅ App 用引擎即時計算，等效 |

### 原檔公式關鍵（逐條核對）

```
m        = min(Vs, Ve)                              （O6/O10：IF(D14>D15,"Ve","Vs")）
ρ·C      = G4 × 1.02 = 1.224                        （原檔用 ρ×1.02 代替 ρ·cp）
QT_max   = m · ρC · (h_o,1 − h_r,1) · ηT            （夏；AF1=1 時 n/a）
QS_max   = m · ρC · (t_o,1 − t_r,1) · ηS            （夏）
QS_winter= m · ρC · (t_r,1 − t_o,1) · ηS            （冬，預熱）
QL       = QT − QS                                  （O16）
t_o,2    = t_o,1 − QS_actual/(m·ρC)                 （O22）
t_r,2    = Q_actual/(m·ρC) + t_r,1                  （O34）
ratio    = Vs/Ve，>1.5 或 <0.7 → Out of Range       （D16 / F16）
```

## 二、發現嘅原檔問題（建議點處理）

1. **ηS / ηT 快取值 2354 / 2356 而格式係 `0.0%`** → 顯示 235400%，屬無效殘值（或誤把風量／轉速打入）。App 唔應該照抄，預設用 0.75 / 0.70 並讓用戶改。
2. **Vs / Ve 快取 1132 但單位標示 `m3/s`** → 1132 m³/s 等於 4,075,200 m³/h，非現實；當 **L/s** 才合理（1.132 m³/s，Q ≈ 27 kW）。建議 App 加單位選擇（L/s ↔ m³/s ↔ m³/h），預設 L/s 並以 1132 為初值，忠實還原同時避免單位陷阱。
3. **ρ×1.02 代替 ρ·cp** → 原檔把 cp 當 1.02 kJ/kg·K（實際乾空氣 1.006）。App 沿用標準 1.006（差異 <1.5%），並在說明註明原檔簡化。
4. **靜壓／高度**原始值 0 m / 101.325 kPa；App 會由高度推算壓力（可手動覆寫），ρ 由狀態計算（可鎖 1.2）。

## 三、建議改法（照原檔排位、現代 UI）

1. **頂卡：系統條件** — 夏季／冬季模式切換（對應原檔選項按鈕）、Altitude、Pressure、ρair。
2. **設計條件卡（照原檔 9 欄 × 4 行）** — 供風入口（夏／冬）、排風入口（夏／冬）各一行，可輸入 DB／WB／RH，右側即時顯示 WB、w、h、露點、RH。
3. **風量卡** — Vs、Ve（＋單位選擇）、Supply:Exhaust Ratio，比 <0.7 或 >1.5 時顯示原檔警告字句。
4. **效率卡** — ηS、ηT（0.75 / 0.70 預設），附註原檔殘值。
5. **結果：夏 ｜ 冬 兩欄並排**（手機自動上下堆疊），欄內照原檔次序：最大全熱／顯熱回收 → QS／QL／QT → 供風出口（DB／WB／h）→ 排風出口（DB／WB／h）→ 診斷字句（露點、飽和焓、結露）。冬欄只出顯熱，並標示「含濕量不變」。
6. **SVG 示意圖** — 重繪原檔轉輪圖（戶外 to,1 ↔ 轉輪 ↔ 室內 to,2；室內 tr,1 → 轉輪 → 戶外 tr,2），四接點顯示 DB/WB，夏／冬各一組。
7. **保留**現有結霜／結露診斷，並改用感測值（露點、飽和焓）判斷。

**功能影響評估**：計算引擎不變（仍係 `psychro.js` 純函數），只係把原檔公式以並列欄呈現；現有單工況輸入會被「4 行設計條件」取代，舊輸入值需重新對應（模組內做遷移，唔會影響其他模組）。

**驗收**：與原檔 1132 L/s、ρC＝1.224、ηS 0.75、35/28 新風、24/17 回風比對 O22 / O34 / O16 三條式子；加入 `vectors.js` 回歸向量；跑 `npm run check` ＋ 瀏覽器抽查。
