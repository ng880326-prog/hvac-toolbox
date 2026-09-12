# 最深層全維度審計（邏輯·系統·成效·運作·效能） 
## 1. 邏輯與物理性質（出貨引擎實測）：28/28 通過 
- ✅ pws(0)=0.6112 vs table 0.6113  (0.024%)
- ✅ pws(10)=1.2280 vs table 1.2281  (0.009%)
- ✅ pws(20)=2.3388 vs table 2.339  (0.008%)
- ✅ pws(30)=4.2460 vs table 4.246  (0.001%)
- ✅ pws(40)=7.3835 vs table 7.384  (0.007%)
- ✅ pws(50)=12.3499 vs table 12.349  (0.007%)
- ✅ pws(60)=19.9438 vs table 19.94  (0.019%)
- ✅ pws(80)=47.4116 vs table 47.39  (0.046%)
- ✅ pws(100)=101.4187 vs table 101.325  (0.092%)
- ✅ pws monotonic -20..60C
- ✅ W monotonic in RH
- ✅ h monotonic in T
- ✅ duct Pa/m monotonic in Q
- ✅ Hazen-Williams monotonic in V
- ✅ state(T,RH)->W->RH round-trip  (max err 0.0000%)
- ✅ invariant Tdp <= Twb <= T
- ✅ RH=100% => Tdp == T
- ✅ dry air density ~1.204 kg/m3 @20C,0%RH  (1.2038)
- ✅ state finite over grid (-15..55C, 5..100%RH)  (all finite)
- ✅ Hazen-Williams DN15 parity 400 Pa/m  (400.00)
- ✅ RT conversion 100RT=351.685kW
- ✅ LMTD 6/2 = 3.641
- ✅ 3ph current 5.5kW/380V=9.83A  (9.831)
- ✅ dB add 80+80=83.01
- ✅ Sutherland mu(24C)=1.837e-5  (1.832e-5)
- ✅ GB51251 A@40m=38008  (38008)
- ✅ mixed state lies between the two (T)  (26.79)
- ✅ coil load plausible (0<Qt<200kW for 3kg/s)  (73.7 kW)
 ## 2. 系統完整性 - 模組數：22 - manifest/SW/圖示/隱私頁：見 deep_check.py（CLEAN）
 ## 3-4. 成效與運作（逐模組互動測試） 
- 互動探針（輸入→輸出反應、摺疊開合）：全部通過
 ### 運作細節 - 主題切換：light → dark ✅ - 語言切換：'通用' → 'GENERAL' ✅ - 手機目錄 chips：6 ✅ - 重置按鈕：第一個輸入格 99 → 0 ✅ - CSV 匯出：psychro_summary.csv ✅ - 複製結果 toast：'⚠ 複製失敗 手動選取' ✅
- 離線重載：✅ tiles=22
 ## 5. 效能  | 頁面 | 載入(ms) | DOM 節點 | JS heap(MB) | |---|---|---|---|
| home | 691 | 242 | 10 |
| convert | 9 | 354 | 10 |
| webtools | 5 | 441 | 10 |
| psychro | 4 | 630 | 10 |
| ducts | 6 | 573 | 10 |
| coil | 6 | 803 | 10 |
| wheel | 5 | 641 | 10 |
| vrf | 5 | 308 | 10 |
| pipes | 5 | 993 | 10 |
| npsh | 4 | 313 | 10 |
| insulation | 5 | 324 | 10 |
| pn | 4 | 300 | 10 |
| hx | 4 | 324 | 10 |
| chiller | 5 | 1075 | 10 |
| boiler | 4 | 336 | 10 |
| motor | 4 | 363 | 10 |
| ahu | 4 | 516 | 10 |
| fcu | 4 | 441 | 10 |
| sac | 4 | 363 | 10 |
| fan | 4 | 566 | 10 |
| acoustics | 5 | 347 | 10 |
| stairwell | 4 | 316 | 10 |
| verify | 4 | 279 | 10 |
 - 最慢頁面：無（全部 <2.5s）
- console/page 錯誤：0 - 失敗或 4xx+ 請求：0
 ## 總評 - ✅ 全維度通過