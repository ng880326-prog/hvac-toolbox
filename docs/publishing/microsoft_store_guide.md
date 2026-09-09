# Microsoft Store — PWABuilder 上架（最快路徑）

> App 已是完整 PWA（manifest + service worker + 192/512 圖示 + 快捷鍵），
> PWABuilder 僅需一個公開 HTTPS 網址即可生成 MSIX。

## Step 1: 託管（任選其一，皆 1 命令）
```powershell
# A. GitHub Pages（免費）
#    1. 開新 repo 名 hvac-toolbox → 上傳 app/ 內所有檔案（保持 app/ 目錄結構不變）
#    2. Settings > Pages > Deploy from branch (main) → 網址: https://<you>.github.io/hvac-toolbox/
#    （如保留子目錄: https://<you>.github.io/<repo>/app/  注意 manifest scope 需一致）
# B. Cloudflare Pages（免費, 推薦: 全球快取快）
#    npx wrangler pages deploy app --project-name hvac-toolbox
# C. Netlify / Vercel（免費 plan）
```

## Step 2: PWABuilder 生成 MSIX（免費）
1. 瀏覽器開 **https://www.pwabuilder.com**
2. 貼上你的網址 → **Start** → 等評分（應 ≥ 100/100）
3. **Package for Stores** → **Microsoft Store**
4. 選擇 **MSIX**（Windows 10/11 通用）→ 下載 `.msix` 包
   → 自動附帶 Manifest + 簽章管線（PWABuilder 免費處理）

## Step 3: 合作夥伴中心提交（免費）
1. 開 **Microsoft Partner Center** → 註冊（個人開發者，2025-09-10 起**免費**）
   https://partner.microsoft.com/
2. 建立應用（Product name: HVAC Toolbox Pro）
3. 上傳 PWABuilder 的 MSIX → 填下方文案 → 提交
4. 審查 **1–3 個工作天**

---

## 可直接貼上的商店文案（EN + 繁中）

**Name**: HVAC Toolbox Pro
**Short description** (≤100 字):
EN: HVAC engineering calculator — psychrometrics, ducts, pipes, coils, VRF, chillers & more. 21 tools, offline.
繁中: 暖通工程計算 — 濕空氣·風管·水管·盤管·VRF·冷機等 21 個工具，可離線使用。

**Description** (4000 字內):
EN:
HVAC Toolbox Pro puts 21 professional HVAC engineering calculators in your pocket, rebuilt from the industry-standard workbook used on Hong Kong projects.

Modules: Psychrometric calculator (with chart), air-side & duct sizing (friction table), water pipe sizing (Hazen-Williams), AHU/PAU standard coil (load, SHR, condensate, ADP), energy-recovery wheel, VRF multi-split selection with official pipe-length & height compensation, chillers (COP/IPLV + MHI GART catalogue), boilers (steam & expansion tank), motors, acoustics, NPSH, insulation (condensation check), stairwell pressurisation (GB 51251-2017) and more.

Features: live charts & AHU schematic, bilingual (English / 繁體中文), dark mode, offline-first PWA, result copy / CSV / print summary.

Formulas verified against ASHRAE Fundamentals 2025, CIBSE, IEC and GB standards. For engineering reference only — final design must be checked by a registered professional engineer.

繁中:
HVAC Toolbox Pro 將 21 個專業暖通空調工程計算工具放進口袋——由香港工程項目使用的工作簿標準升級重建。

模組：濕空氣計算（含圖表）、風管與水系統 sizing、AHU/PAU 標準盤管（負荷·SHR·冷凝水·ADP）、轉輪熱回收、VRF 多聯機選型（含官方管長/高差補償）、冷機（COP/IPLV＋MHI GART 型錄）、鍋爐（蒸汽與膨脹水箱）、馬達、聲學、NPSH、保溫（結露檢核）、梯間加壓（GB 51251-2017）等。

功能：即時圖表與 AHU 示意圖、雙語（English／繁體中文）、深色模式、離線 PWA、結果複製／CSV／列印摘要。

公式對照 ASHRAE Fundamentals 2025、CIBSE、IEC 與 GB 標準檢驗。僅供工程參考——實際設計須由註冊專業工程師覆核。

**Category**: Utilities / Productivity
**Keywords**: HVAC, air conditioning, psychrometrics, duct sizing, pipe sizing, coil, chiller, VRF, engineering calculator, 暖通, 空調, 工程計算

**Screenshots**（4 張, 1366×768 或手機比例）:
1. 首頁（模組總覽） 2. 濕空氣計算＋圖表 3. 盤管 AHU/PAU（含示意圖） 4. 風管/水管 sizing 表
(Chrome DevTools 裝置模式截圖即可)

**Icon**: 已就緒 `app/icons/icon-512.png`（亦可上傳 `.png` 原圖）

## 備註
- Windows 10/11 均支援 MSIX；Store 版本自動獲微軟簽署
- PWA 版與 Capacitor Android 版共用同一 `app/` 原始碼——以後修改同步 `npx cap sync` 即可

---

## ���: �W·��ȫ�����c�[˽�����ύ�r�����ã�

**Network security warning / Privacy statement** (Store review ��, ���N� app �������[˽���ߙ�):

> This application performs HVAC engineering calculations entirely on-device.
> It does not collect, transmit, or store any personal data; it has no analytics,
> no advertising, no tracking, and no server communication except the single
> initial download of app assets. User preferences (language, theme) are stored
> locally in the browser (localStorage) and never leave the device.
> Network access is used only on first launch for installation; all modules
> work offline. Transport is HTTPS-only.

> ����ʽ��ȫ���b�öˈ��� HVAC ����Ӌ�㡣���ռ�������ݔ���������κ΂����Y�ϣ�
> �o�������o�V�桢�o׷ۙ�����״����d app �Y�a��o�κ��ŷ���ͨӍ��
> ʹ����ƫ�ã��Z�ԡ����}���H��춞g�[�����أ�localStorage�������x�_�b�á�
> ����ģ�M���x��ʹ�ã���ݔ�H�� HTTPS��

**����С��ʾ**:
- MS Store ������ܕ��͡��W·��ȡ�������ᆖ �� ����������퓡��P춡���� (�汾 1.0.0���[˽��ȫ��) ���������w
- PWABuilder ���ɵ� MSIX �Ԏ��C���������M�����ύ Partner Center ����΢ܛ��K����
- ���x Windows 10 Ŀ��: �����ԡ�x64 + x86�����߹��x�����������
