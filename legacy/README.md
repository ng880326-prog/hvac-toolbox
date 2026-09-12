# legacy/ — 舊版單檔原型（已停用，請勿使用）

呢個目錄係最初嘅單頁原型，2026-02 由 repo 根目錄搬入嚟封存。**唔係應用程式嘅一部分**：

- `tools/serve.js` 只 serve `app/`（`--root app`），GitHub Pages workflow 只部署 `app/`，
  `capacitor.config.json` 嘅 `webDir` 亦係 `app/`。
- 因此 `legacy/index.html` ＋ `legacy/js/` 係**死碼**：無任何建置、部署或測試會讀到佢。
- 佢仍然留喺 git 只為歷史參考。要跑請自己開一個 server 指向 `legacy/`。

## 為何要封存而唔留喺根目錄

搬入 `legacy/` 之前，佢同 `app/` 完全同名同結構（`index.html`、`js/`、`css/`、`icons/`、
`sw.js`、`manifest.webmanifest`），所以：

1. 任何人（包括商店上架流程）指向 repo 根目錄，就會打包到**舊版 App**。
2. 舊版內含已修復嘅引擎錯誤（濕空氣冰面飽和壓力係數差 1000 倍），而且無 privacy.html
   （商店審核會直接退回）。
3. 兩份 UI 同名檔案令人誤改錯檔——實際發生過：修正只落入 `app/`，`dist/` 與 Android 資產
   仍然係舊版，直到加咗 sha256 防漂移檢查才被發現。

現行唯一真本係 `app/`；上架副本由 `npm run package:site` 產生，並由 `npm run check` 驗證一致。
