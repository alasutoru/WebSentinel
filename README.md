# WebSentinel - 究極輕量化網路哨兵

基於 Chrome Manifest V3 架構構建的現代化隱私與安全擴充功能。
依循「第一性原理」設計，屏棄傳統廣告阻擋器臃腫的記憶體佔用與隱私風險，採用瀏覽器原生的 `declarativeNetRequest` API，實現零延遲、零隱私外洩且極低資源消耗的網路防護。

## 核心

### 1. 廣告與騷擾阻擋 (AdBlock)
   阻擋主流廣告聯播網 (Google Ads, DoubleClick, Facebook Ads)。
   攔截惱人的彈出視窗 (Popups) 與惡意跳轉。
   清除頁面上的廣告佔位區塊。

### 2. 進階隱私防護 (Privacy Shield)
   反追蹤 (Anti-Tracking)：阻擋 Google Analytics, FB Pixel, Hotjar 等行為追蹤器。
   反指紋採集 (Anti-Fingerprinting)：防止網站讀取您的硬體資訊以生成獨特識別碼。
   反挖礦劫持 (Anti-Cryptojacking)：阻擋惡意腳本盜用您的 CPU 進行挖礦。

### 3. 零信任安全架構 (Zero Trust Architecture)
   與一般廣告阻擋器最大的不同之處：
   強制 HTTPS：直接切斷所有不安全的 `http://` 連線，防止中間人攻擊。
   隱形模式 (Referrer Stripping)：移除 HTTP Header 中的來源參照，讓網站無法得知您從哪裡連結過來。
   第三方 iframe 封鎖：預設阻擋所有跨網域的內嵌框架（防禦點擊劫持與惡意廣告），除非在白名單中。

### 4. 動態白名單管理 (Dynamic Whitelist)
   內建 YouTube, Google, Facebook 等常用服務白名單，確保核心體驗。
   提供即時控制面板，使用者可動態加入信任網域，解決特定網站功能失效問題。

---

## 架構與效能優勢

不會在背景執行持續性的 JavaScript 程序，只有在您打開控制面板時才會喚醒相關邏輯，對筆電電池續航力極為友善。

| 特性    | 傳統擴充功能 (Legacy AdBlock)       | WebSentinel (Manifest V3) |
| :---- | :---------------------------- | :------------------------ |
| 過濾機制  | 使用 JavaScript 逐一檢查請求          | 瀏覽器底層 C++ 直接處理            |
| 記憶體佔用 | 高 (需載入龐大過濾引擎)                 | 極低 (趨近於零)                 |
| 隱私風險  | 需讀取所有瀏覽紀錄 (Read/Write Access) | 無權讀取 (僅提供規則給瀏覽器)          |
| 網頁效能  | 處理請求時可能造成延遲                   | 無延遲 (Native Speed)        |


---

## 安裝

為開發者與進階用戶設計的開源專案，請透過「開發人員模式」安裝。

1.  下載專案
    ```bash
    git clone https://github.com/YourUsername/WebSentinel.git
    ```
2.  開啟 Chrome 擴充功能頁面
       在網址列輸入 `chrome://extensions/`
3.  啟用開發模式
       開啟右上角的「開發人員模式 (Developer mode)」開關。
4.  載入擴充功能
       點擊左上角的「載入未封裝項目 (Load unpacked)」。
       選擇 `WebSentinel` 資料夾。

### 自定義圖示
專案預設包含黑色極簡風格圖示。若需更換，請準備 PNG 檔案並替換 `WebSentinel/images/` 資料夾中的圖片：
   `icon16.png` (16x16)
   `icon48.png` (48x48)
   `icon128.png` (128x128)

---

## 進階配置

### 更新阻擋規則
所有阻擋規則由 Python 腳本生成，方便大量管理。若需新增黑名單：

1.  編輯 `build_rules.py`，將網域加入對應的列表 (`ad_domains` 或 `security_domains`)。
2.  執行腳本重新生成 JSON：
    ```bash
    python3 WebSentinel/build_rules.py
    ```
3.  回到 Chrome 擴充功能頁面點擊「重新整理」。

---

## ⚠️ 注意事項

1.  HTTP 斷線機制：因為啟用了零信任安全，所有非 HTTPS 的舊網站將無法開啟。這是刻意設計的安全性功能。
2.  iframe 阻擋：部分新聞網站的影片播放器或內嵌留言板可能會被攔截導致黑屏。遇到這情況，請點擊擴充功能圖示，將該網域加入白名單即可。
---
License: MIT
