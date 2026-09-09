# 商店上架路線圖（Store Roadmap）

目標：HVAC Toolbox Pro（Excel → Web App 轉型）上架 Google Play / Apple App Store / Microsoft Store。
資料基準：2024–2025 年官方政策（含 2025-09-10 微軟個人開發者免費新政策、Google Play 個人帳號測試規定、Tauri 2.0 穩定版）。

---

## 0. 三平台總覽表

| 項目 | Google Play | Apple App Store | Microsoft Store |
|---|---|---|---|
| 開發者帳號費用 | **USD 25 一次性** | **USD 99 / 年** | **個人開發者：免費**（2025-09-10 起，原 USD 19 取消）；公司帳號約 USD 99 一次性 |
| 註冊要求 | Google 帳號 + 身份/地址驗證（部分地區） | Apple ID + 雙重認證；公司需 D-U-N-S 編號；非美籍填 W-8BEN | Microsoft 帳號 + 身份證件掃描 + 自拍驗證 |
| 打包格式 | **.aab（App Bundle）強制**（2021-08 起新 app） | .ipa（Xcode / App Store Connect 上傳） | **MSIX**（或 PWA 直接上架、UWP/Win32/.NET MAUI/Electron） |
| PWA 路徑 | TWA（Trusted Web Activity，Bubblewrap/PWABuilder 打包）或 Capacitor | 無 PWA 直上；需原生殼（Capacitor 等） | **PWA 可直接上架（PWABuilder）** |
| 審查時間 | 新 app 通常 **1–7 天**（個別更久）；新個人帳號另有 14 天封閉測試 | 通常 **24–48 小時**（最長數天） | 通常 **1–3 個工作天** |
| 本 app 額外注意 | 新個人帳號須先完成封閉測試（≥20 測試員 × ≥14 天） | 審核準則 **4.2 功能完整性**（純網頁包殼會被拒） | 個人免費政策；PWA 最省事 |
| 年費 | 0（USD 25 後免年費） | USD 99/年 | 0（個人） |

---

## 1. Google Play

### 1.1 帳號與費用
- 註冊費 **USD 25 一次性**，無年費：https://support.google.com/googleplay/android-developer/answer/6112435
- 個人帳號 vs 公司帳號：公司帳號（需 D-U-N-S）可顯示公司名並免除個人測試規定。

### 1.2 新個人帳號的測試規定（重要，影響時間表）
- 2023-11-13 起建立的**個人開發者帳號**，首次上架正式版前必須完成一次**封閉測試**：至少 **20 名測試員、連續參加 ≥14 天**，期間提交報告並經 Play 審核，之後才能申請 production。
- 官方：https://support.google.com/googleplay/android-developer/answer/14151465
- 對策：(a) 以**公司帳號**註冊（若可取得 D-U-N-S）；(b) 或接受封測流程（提前招募 20 名測試者，排進時間表）。香港公司可用公司註冊資料。

### 1.3 打包格式與技術路徑
- 新 app **必須上傳 Android App Bundle (.aab)**（2021-08 起）：https://android-developers.googleblog.com/2020/11/new-android-app-bundle-and-target-api.html
- PWA 上架路徑：**Trusted Web Activity (TWA)**，把 PWA 包進原生外殼（Bubblewrap CLI 或 **PWABuilder** 生成 .aab），需 digital asset links、每年更新 target API。
- 建議：本專案用 **Capacitor** 打包（自建原生殼，無 TWA 限制），Capacitor CLI 直接產 .aab；或 TWA 若堅持純 PWA。
- target API 要求：每年 8 月底新 app 需達最新 target API level（2025 年為 API 35），需每年更新。

### 1.4 上架清單
- 商店資訊：名稱、簡短/完整說明、分類（工具類 Productivity/Tools）、聯絡資料、隱私政策 URL（**必填**）。
- 資產：app icon 512×512 PNG（32-bit）、feature graphic 1024×500、手機截圖 2–8 張（min 320px，max 3840px，16:9 或 9:16）。
- Data safety 表單（收集哪些資料、是否分享、加密等）。
- 內容分級問卷（IARC）。
- 定價：免費或付費；香港區可設價格。

### 1.5 審查時間
- 一般 1–7 天；首次上架或含新功能時可能更久。重大假日/高峰更慢。

---

## 2. Apple App Store

### 2.1 帳號與費用
- **Apple Developer Program：USD 99/年**（個人/公司同價）：https://developer.apple.com/programs/
- 公司帳號需 **D-U-N-S** 編號；非美國開發者需填 **W-8BEN** 稅務表（否則收入扣 30% 預扣稅）。
- 需要 **Mac + Xcode** 建置/簽署 .ipa（Capacitor 專案也要在 Mac 上 build/archive）；App Store Connect 上傳亦可用 Transporter（Mac）。**無 Mac 就無法上架 iOS。**

### 2.2 審核準則對計算工具類 app 的要求
- **Guideline 4.2 – Minimum Functionality**：app 必須提供「足夠的功能」；**4.2.2**「僅是包裝網站的 app 會被拒」；**4.2.3** 若內容只是網頁內容的重新包裝也可能被拒。對策：離線可用（公式引擎本地運算）、原生 UI 元件、儲存歷史記錄/匯出 PDF 等原生功能，而非僅 WebView 載入網頁。
- 計算工具類 app 可過審，但建議避免「純單頁計算器」觀感：加入輸入校驗、單位系統、歷史、設定等。
- **Guideline 1.2**（安全/健康類）：工程計算若涉及安全（防火規範！），審核期望 app 有**免責聲明**且不誤導使用者。
- 其他：4.3 spam（勿多國語言拆多個重複 app）、2.1 完整功能（勿留「敬請期待」按鈕）、3.1.1 內購規則（付費解鎖可用 IAP）。
- 官方準則：https://developer.apple.com/app-store/review/guidelines/

### 2.3 資產與隱私
- App icon **1024×1024 PNG（不可含 alpha）**；截圖 6.7"（1320×2868）與 5.5"（1242×2208）各 1–10 張（依 iPhone 機型）。
- **App Privacy「營養標籤」**：宣告資料收集/追蹤（本 app 可填「不收集」）。
- 隱私政策 URL 必填（個人開發者網站即可）。

### 2.4 審查時間
- 典型 **24–48 小時**；第一次上架或觸發 4.2 爭議時可能延長至數天，並可能進入人機問答（App Review 訊息）。

---

## 3. Microsoft Store

### 3.1 帳號與費用（2025 新政策）
- **個人開發者：註冊費免費**（2025-09-10 起；原 USD 19 一次性取消）。近 200 地區適用，需身份證件掃描 + 自拍驗證，數分鐘完成，免信用卡。
- 官方公告：https://blogs.windows.com/windowsdeveloper/2025/09/10/free-developer-registration-for-individual-developers-on-microsoft-store/
- 公司帳號：Partner Center 註冊，費用約 **USD 99 一次性**（公司發佈用）。
- 平台現況：支援 **Win32、UWP、PWA、.NET MAUI、Electron**；MSIX 格式由微軟代管託管與分發；另有 Build 2025 公告放寬政策：https://blogs.windows.com/windowsdeveloper/2025/05/19/microsoft-store-expands-opportunities-for-windows-app-developers/

### 3.2 PWA 直上路徑（本專案最快路徑）
- 用 **PWABuilder**（https://www.pwabuilder.com/）把網站包成商店版：驗證 manifest/service worker → 產出 MSIX 套件（含 Store 資產）→ Partner Center 提交。
- 或 Capacitor/Electron/Tauri 建 Win32 桌面版再包 MSIX。
- Windows 11 全面支援（Win11 市集為主要使用者群）；PWA 在 Win10/Win11 皆可安裝。

### 3.3 資產與審查
- 商店清單資產：app icon（300×300 PNG 以上，多尺寸）、截圖（1366×768 建議，16:9，至少 1 張）、描述、隱私政策 URL、年齡分級問卷。
- 審查：通常 **1–3 個工作天**；免費工具類 app 門檻低。

---

## 4. 跨平台打包工具比較（2024–2025 現況）

| 工具 | 平台 | 打包大小/效能 | 學習曲線 | 適合本專案度 | 備註 |
|---|---|---|---|---|---|
| **Capacitor**（v7） | iOS + Android（+桌面為次要） | WebView 包殼；效能=瀏覽器 | 低（JS 為主） | ⭐⭐⭐⭐⭐ | 官方 Ionic 生態；API/plugin 豐富；iOS 仍需 Mac+Xcode；直接把現有 web app 包成原生 app，**本專案首選** |
| **Tauri 2.0**（2024-10 穩定） | Windows/macOS/Linux **+ iOS/Android（正式支援）** | 系統 WebView，二進位極小（~3–10 MB） | 中高（Rust 後端） | ⭐⭐⭐⭐ | 需 Rust 工具鏈；iOS 打包仍要 Mac；對純計算工具效能綽綽有餘；桌面版體驗佳 |
| **Electron** | Windows/macOS/Linux（無移動端） | ~100 MB+，記憶體高 | 低 | ⭐⭐⭐（僅桌面） | 生態成熟；若要同時上桌面可考慮，但體積大 |
| **PWABuilder** | Microsoft Store（PWA 直上）+ Google Play（TWA）+ 側載 | 無原生碼 | 最低 | ⭐⭐⭐⭐（MS Store） | 純打包器；MS Store 最省事路徑；Play 需 TWA 且受 target API 年更約束 |

### 建議組合（成本/人力最低）
1. **iOS + Android：Capacitor**（一套 web 程式碼，雙平台原生殼；iOS 需購入 Mac mini 級設備做建置）。
2. **Microsoft Store：PWABuilder 直上**（若已有 PWA），或 Tauri 2.0 出精緻桌面版。
3. 進階選項：日後以 **Tauri 2.0** 同時出 Windows/macOS 桌面版（體積小、免 WebView 相依憂慮）。

---

## 5. 上架所需資產清單

### 5.1 圖示（Icon）
| 商店 | 規格 |
|---|---|
| Google Play | 512×512 PNG（32-bit，sRGB）；adaptive icon 檔（前景/背景）隨 .aab |
| Apple | 1024×1024 PNG（**無 alpha/透明**）；Xcode asset 產出全尺寸 |
| Microsoft | 300×300 以上（清單用多尺寸；MSIX 內 package logo 各尺寸） |

### 5.2 螢幕截圖 / 圖形
| 商店 | 規格 |
|---|---|
| Google Play | 手機截圖 2–8 張（min 320px、max 3840px，16:9/9:16）；feature graphic 1024×500 |
| Apple | iPhone 6.7"（1320×2868）與 5.5"（1242×2208）各 1–10 張 |
| Microsoft | 至少 1 張 1366×768（16:9，PNG/JPG） |

### 5.3 文案與法務
- 商店說明（多語言：繁中/簡中/英文）。
- **隱私政策 URL（三平台必填）**：可放在專案網頁（如 GitHub Pages）。
- 支援聯絡 email。
- **免責聲明（工程計算 app 必須，見 §6）**：置於 app 內（啟動/關於頁）＋商店說明。
- 內容分級問卷（IARC 統一）。
- Apple 專屬：App Privacy 標籤、出口合規（ECC，選「無加密」可秒過）、W-8BEN。

### 5.4 開發/簽署憑證
- Play：上傳簽署金鑰（.jks）+ Play App Signing。
- Apple：分發憑證 + provisioning profile（App Store Connect 管理）。
- MS：Partner Center 關聯簽署憑證（PWABuilder 可自動生成）。

---

## 6. 免責聲明範本（工程計算 app）

### 6.1 中文（繁）
> **免責聲明**
> 本應用程式所提供的計算結果與資料（包括但不限於馬達選型、聲學估算、梯間加壓送風量等）僅供**初步估算與參考**之用，不構成專業工程設計、法律或消防審批意見。
> 1. 計算結果依賴使用者輸入與內建假設（如功率因數、效率、規範版本等），實際工程應以現行有效之國家/地方標準、製造商資料及現場條件為準。
> 2. 涉及防火、生命安全之設計（如樓梯間加壓送風）必須由**具備資格的註冊專業工程師**依現行規範（如 GB 51251-2017 等）覆核，並經相關主管部門審批。
> 3. 開發者不對因使用或信賴本應用程式輸出所造成之任何損失或損害負責。使用者應自行承擔使用風險。

### 6.2 English
> **Disclaimer**
> Results produced by this application (motor sizing, acoustics estimates, stairwell pressurisation airflows, etc.) are provided for **preliminary estimation and reference only** and do not constitute professional engineering, legal or fire-safety approval advice.
> 1. Results depend on user inputs and built-in assumptions (power factor, efficiency, code edition, etc.). Actual designs shall comply with the current national/local codes in force, manufacturer data and site conditions.
> 2. Fire-safety and life-safety designs (e.g., stairwell pressurisation) must be verified by a **qualified registered professional engineer** against current codes (e.g., GB 51251-2017) and approved by the relevant authority.
> 3. The developer accepts no liability for any loss or damage arising from the use of, or reliance on, the outputs of this application.

---

## 7. 建議時間表

| 階段 | 內容 | 時間 |
|---|---|---|
| 0 | 公式修正（依驗證報告：SPF 接 GB 51251-2017、馬達補 η、bug 修復）+ 免責聲明 | 1–2 週 |
| 1 | Web app 完成 + PWA 化（manifest、service worker、離線） | 2–4 週 |
| 2a | Microsoft Store：PWABuilder → MSIX → Partner Center（個人免費帳號） | 2–3 天（+審查 1–3 天） |
| 2b | Google Play：Capacitor 打包 .aab → 註冊 USD 25 →（個人帳號則先跑 20 測試員 ×14 天封測）→ 送審 | 1–2 週（封測另 +2–4 週） |
| 2c | Apple：購置/租用 Mac → Capacitor + Xcode → USD 99/年 → TestFlight → 送審 | 2–3 週（含 Mac 準備） |
| 3 | 資產製作（icons/截圖/隱私政策/商店文案） | 與階段 2 並行，1 週 |
| 4 | 上架後：三平台更新節奏（Play 每年 target API；iOS 每年新 SDK 建議） | 持續 |

**最短全平台時間：約 6–8 週**（Microsoft Store 最快，約 1 週內可上；Play 若用公司帳號亦快；iOS 受 Mac 設備與審核影響）。

---

## 8. 風險與對策

| 風險 | 對策 |
|---|---|
| Apple 以 4.2.2 拒審（WebView 包殼） | 離線運算、原生 UI 元件（表單/選單/歷史/匯出 PDF）、實質功能差異 |
| Play 個人帳號 20 測試員規定拖慢上架 | 用公司帳號註冊（D-U-N-S）；或提前開封測群 |
| 工程計算內容安全審查（防火規範模組） | 免責聲明 + 「僅供參考」標示 + 明確標示規範版本/有效性 + 建議由註冊工程師覆核 |
| 規範過期責任（GB 50045-95 已廢止） | 梯間加壓模組預設 GB 51251-2017，舊規範列為「歷史對照」並加警告 |
| iOS 無 Mac 無法建置 | 預算 Mac mini（M 系列）或使用雲端 Mac CI（仍建議實機測試） |
| 每年維護負擔 | 鎖定 Capacitor 主流版、每年 8 月前更新 Play target API |

---

## 9. 主要參考來源
- Google Play 註冊費：https://support.google.com/googleplay/android-developer/answer/6112435
- 新個人帳號測試規定：https://support.google.com/googleplay/android-developer/answer/14151465
- App Bundle 要求：https://android-developers.googleblog.com/2020/11/new-android-app-bundle-and-target-api.html
- Apple Developer Program：https://developer.apple.com/programs/
- App Store 審核準則（4.2 等）：https://developer.apple.com/app-store/review/guidelines/
- Microsoft Store 個人開發者免費：https://blogs.windows.com/windowsdeveloper/2025/09/10/free-developer-registration-for-individual-developers-on-microsoft-store/
- Microsoft Store 政策放寬（Build 2025）：https://blogs.windows.com/windowsdeveloper/2025/05/19/microsoft-store-expands-opportunities-for-windows-app-developers/
- PWABuilder：https://www.pwabuilder.com/
- Capacitor：https://capacitorjs.com/
- Tauri 2.0 穩定版（2024-10，iOS/Android）：https://www.oschina.net/news/315100/tauri-2-0-stable
- Electron：https://www.electronjs.org/
