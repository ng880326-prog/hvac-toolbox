# 最終品質打磨（手機 App 級：Apple HIG／Futu 水準）

日期：2026-02 ｜ 範圍：22 個模組 × 手機／平板／桌面 × 中英雙語 × 深淺主題

## 一、新增嘅機械化掃描工具

| 工具 | 檢查內容 |
|---|---|
| `tools/polish_audit.py` | 每頁每尺寸：console／page error、失敗請求、橫向溢出（連溢出元件清單）、**觸控目標 < 44×44 px**、**輸入框字級 < 16 px（iOS 聚焦會放大頁面）**、無障礙名稱缺失、**渲染完全空白嘅卡**、< 11 px 文字；另做英文切換與深色主題掃描 |
| `tools/contrast_audit.py` | 逐個文字節點計算 WCAG 2.1 對比（AA：一般 4.5:1／大字 3:1），自動合成半透明與**漸層背景**（漸層取最亮端＝白字最壞情況），兩種主題各跑一次 |
| `tools/verify_polish.py` | 行為驗證：每模組標題、語言切換、**空狀態出現／消失**、切換模組自動回到頂部、manifest 上架欄位、screenshots 可載入 |
| `tools/make_store_screenshots.py` | 產生商店用截圖（窄版 1080×2338 ×2、寬版 1280×800）並寫入 manifest |

## 二、掃出並修好嘅問題

### 1. 真 UI 缺陷：配對選擇器完全空白
`app/js/modules/psychro.js` 用咗 `T(I18N.pairOpts[v])`（對已翻譯物件再查一次字典）→ 4 個分段按鈕
**冇任何文字**，用戶根本唔知可以選咩。改為 `L(I18N.pairOpts[v])`。

### 2. iOS／iPadOS 聚焦自動放大
原本只有 ≤520 px 嘅 `.field input/select` 係 16 px，**平板完全冇覆蓋**，而表格內嘅編輯格
（`.cell-in`、psychro／wheel 設計條件表）只有 13 px。現在所有文字輸入（含表格格）在觸控裝置或
≤820 px 一律 16 px。

### 3. 觸控目標低於 Apple HIG 44 pt
分段控制（30–32 px）、`.btn`、`.toc-btn`、表格輸入格、供應商連結（17 px）全部偏細。
觸控裝置上：分段／按鈕／輸入格／checkbox 最小高 44 px、目錄 chip 40 px、連結 44 px；
滑鼠裝置保持較緊密嘅工程版面（桌面 app 慣例）。

### 4. 對比未達 WCAG AA（4 項）
| 位置 | 修正前 | 修正後 |
|---|---|---|
| 白字在品牌漸層（主要按鈕／選中列／啟動中嘅側欄項／大 KPI 卡／toast） | 3.68:1（亮端） | **5.35:1**（新增 `--grad-surface` 專用深色漸層） |
| 深色主題同一批漸層（起點係亮青 #22d3ee） | **1.81:1** | **5.35:1** |
| 深色主題連結（瀏覽器預設色） | **1.76:1** | 12:1（`--brand-2` 並加底線） |
| 大 KPI 卡上嘅小標籤（85% 白） | 4.35:1 | **5.05:1**（96% 白） |
| 品牌字 `Pro`（#fde68a 在青底） | 4.30:1 | **4.60:1**（#fef08a） |
| 淺色 `--ink-soft` 在帶色面板 | 4.35:1 | 7.6:1（#475569 → #3f4a5a） |
| 綠色 flag／合格列文字（#059669） | 3.52:1 | **5.22:1**（新增 `--ok-text` #047857） |

### 5. 空白卡（讀落似壞咗）
輸入未齊時卡只顯示一個空框。`ui.results()` 現在會顯示一致嘅虛線提示
「— 請於上方輸入數值 · enter values above」，有數值即自動消失。

### 6. 其他手機級細節
- **每模組標題**：`document.title` 隨模組與語言切換（App 切換器／瀏覽器分頁睇得到係邊個工具）。
- **切換模組自動回到頂部**（原檔只喺部分路徑做過）。
- **iOS 動態視窗高度**：`100dvh`（保留 `vh` 作後備），側欄唔再被收合嘅地址欄切斷。
- **`text-size-adjust: 100%`**：iOS 橫向唔會再擅自放大文字。
- **錨點偏移**：`scroll-padding-top` / `scroll-margin-top`，目錄跳轉唔會被置頂列遮住。
- **< 11 px 文字**：AHU 示意圖標註、濕空氣圖圖例／座標標籤全部提升到 11 px。
- **觸控回饋**：去除藍色 tap 高亮、`:active` 輕微縮放、統一 0.18–0.2 s 過渡。
- **長標籤防溢出**：表格格與結果標籤 `overflow-wrap: anywhere`。
- **manifest**：描述更新為 22 模組／離線運算，加入 3 張商店截圖（PWABuilder／Partner Center 需要）。

## 三、最終驗證（全部通過）

| 檢查 | 結果 |
|---|---|
| `tools/polish_audit.py` | **0 findings**（22 模組 × 3 尺寸 × 中英 + 深色主題） |
| `tools/contrast_audit.py` | **全部取樣文字符合 WCAG AA**（13 頁 × 2 主題） |
| `tools/verify_polish.py` | **15 ok / 0 fail**、0 console error |
| `node tests/run_tests.mjs` | **PASS 102 / 102** |
| `node tests/smoke.mjs` | **SMOKE OK**（22 模組、無重複 id、無 NaN） |
| `npm run check` | dist 54 檔案與 app/ 完全一致 |
| `tools/deep_audit_full.py` | **logic 28/28、uifails 0、errors 0、offline tiles 22、csv ✓** |
| 逐頁驗證 | wheel 22/22、psychro 21/21、pipes 27/27、chiller 25/25 |

截圖：`docs/verification/*_{desktop,mobile,tablet}*.png`、商店用 `app/screenshots/*.png`。
