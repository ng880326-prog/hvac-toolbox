# R6 工作簿交付紀錄（無損修正）

日期：2026-02 ｜ 交付檔：`00_HVAC Toolbox_R6.xlsm`（2.08 MB）｜ 原檔 `00_HVAC Toolbox_R5.xlsm` 未改動

## 一、為何唔可以直接交付 openpyxl 產生嘅 R6

最初嘅做法（`tools/fix_r6.py`，openpyxl + keep_vba）公式改得正確，但 **openpyxl 唔支援 Excel 檔案內
全部部件，會靜靜丟棄**。用 `tools/verify_r6_fidelity.py` 逐部件量度，該版本：

| 部件 | R5 | openpyxl 版 R6 | 影響 |
|---|---|---|---|
| `<controls>` 表單按鈕（21 張表） | 有 | **全部消失** | 原檔各表嘅按鈕列（Home／Reset／跳去其他表）唔見 |
| `<drawing>` 繪圖引用 | 21 張表有 | **16 張表變 None**，其餘指向重新編號嘅部件 | 示意圖／按鈕圖層消失或錯配 |
| `xl/drawings/*` | 57 個 | 27 個（少 33 個） | 同上 |
| `xl/media/*` | 5（含 `hdphoto1.wdp`） | 4 | 內嵌圖片消失 |
| `xl/charts/_rels/*` | 3 個 | 0 | 圖表關聯消失，Excel 可能提示修復 |
| `xl/printerSettings/*` | 22 個 | 0 | 列印設定（紙張／方向／縮放）消失 |

> 過程中一度誤判為「21 張表全部失去繪圖」——原因係我用嘅 regex 假設 `Id` 一定排在 `Target` 之前，
> 而 openpyxl 寫檔時次序相反，導致解析結果為空。修正解析後嘅準確數字係上表
> （**16 張表失去繪圖、21 張表失去表單按鈕**）。教訓：驗證器本身都要先驗證。

## 二、無損做法（現行交付）

`tools/patch_workbook_min.py`：

1. **意圖來源**：`tools/r6_formula_intent.json`（3,733 格、14 張表），由 openpyxl 版 R6 抽出，
   純文字、可 diff、可重現（唔需要 openpyxl 才能重建）。
2. **檔案來源**：`00_HVAC Toolbox_R5.xlsm`，**除下列以外全部部件逐位元組複製**。
3. 只改動該 3,733 格嘅 `<f>`（並移除其過期快取值），另加：
   - 刪除 `xl/calcChain.xml`（Excel 會重建）；
   - `workbook.xml` 加 `<calcPr calcId="191029" fullCalcOnLoad="1"/>` → **開檔即全量重算**。
4. 內建守衛：寫檔後逐張表做 XML well-formed 檢查，並拒絕任何以 `=` 開頭嘅 `<f>`（避免 `==` 錯誤）。

重跑方式（唔會覆蓋交付檔）：

```powershell
python tools/fix_r6.py                                   # → tools/R6_openpyxl_intent.xlsm（意圖檔，已 .gitignore）
python -c "import sys; sys.path.insert(0,'tools'); import patch_workbook_min as P; P.extract_intent()"
python tools/patch_workbook_min.py --out "00_HVAC Toolbox_R6.xlsm"
python tools/verify_r6_fidelity.py                       # 部件完整性
python tools/verify_r6_values.py                         # 直接求值工作簿公式
python tools/verify_r6.py                                # 修正點結構＋獨立數值
```

## 三、發現並修正嘅實質缺陷（agent 版本漏咗）

`fix_r6.py` 把 Wheel 飽和表 `BJ10:BT168` 公式化，但第 11 行起嘅 `BK`／`BL` 用咗**水面係數**
（`-5800.2206/BJ…`）。該表由工作表自身驅動格決定範圍，而 `D9`／`D11` 為空 → 表覆蓋 **−40…0 ℃**，
即**整張表都喺冰面區**，所以用水面係數等於全表錯：

| 溫度 | 修正前（水面係數） | 修正後（冰面分支） | ASHRAE 冰面值 |
|---|---|---|---|
| −39.5 ℃ | 0.0201 kPa | **0.013591 kPa** | 0.01359 |
| −39.0 ℃ | — | **0.014377 kPa** | 0.01433 |
| −25.0 ℃ | — | **0.063289 kPa** | 0.06329 |
| 0.0 ℃ | — | **0.611154 kPa** | 0.6112 |

修正：`BK`／`BL` 改成 `IF(BJ<273.16, 冰面, 水面)`（與 App 引擎同一分界），共 318 格；
`patch_workbook_min.py` 內嘅 `wheel_ice_correction()` 會喺套用前自動改寫並列出數量，
所以重跑亦會得到同樣結果。agent 報告聲稱嘅 0.01359 kPa **現時才真正出現在工作簿內**。

## 四、驗證證據

| 檢查 | 結果 |
|---|---|
| `tools/verify_r6_fidelity.py`（R5 vs R6 逐部件） | 圖表 8／8、繪圖 57／57、媒體 5／5、列印設定 22／22、控制項 173／173、VBA 1／1；**0 部件遺失**（除可重建嘅 calcChain）、0 張表失去繪圖或控制項 |
| `tools/verify_r6_values.py`（**直接對工作簿公式求值**） | **20 ok / 0 fail**：冰面 −39.5／−39.0／−25.0／0 ℃ 全部吻合；模擬 `D11=40` 時 20 ℃ 走水面分支得 2.3388 kPa；AS5 = 18.94e-6；BP10 = `pi x a x b`；Supporting 6 守衛齊全；318 格冰面分支 |
| `tools/verify_r6.py`（agent 驗證器） | **PASS**（公式結構、獨立數值、`vbaProject.bin` 保留、VML 28 個、R5 未改動） |
| openpyxl 可讀取 | 34 張表全部載入成功，無 XML 錯誤 |

## 五、尚未完成（需你在 Excel 內做）

- 沙盒無法執行 Excel COM／LibreOffice，**R6 未曾在 Excel 內實機重算**。已設 `fullCalcOnLoad="1"`，
  開啟時會自動重算（數秒）。請在 Excel 開啟確認無「修復」提示後再發布。
- **Coil／Coil Support 兩張表仍有相同嘅 <0 ℃ pws 問題**（屬 fluids_thermal 範疇），本次未動。
  要一併修：把兩個表名加入 `tools/fix_r6.py` 嘅 `TARGET_SHEETS`，重跑上列四步即可。
- App 端（`app/js/engine`）嘅同一批修正已同步，並由 `node tests/run_tests.mjs` 102 條向量把關。
