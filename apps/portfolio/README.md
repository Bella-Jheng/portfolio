# Portfolio — 個人作品集網站

> 一個用來展示個人技術能力與設計品味的作品集網站，涵蓋完整的前端工程實踐。

---

## 動機

在求職過程中，履歷表往往無法完整呈現一個工程師的技術深度與產品思維。我希望透過一個**自己親手打造的作品集網站**，讓面試官能直觀感受到我的程式碼品質、UI/UX 判斷力，以及在沒有 spec 限制下的技術選型能力。

這個網站本身就是一份「活的作品」——它不只展示我做過的項目，更展示我**如何思考、如何架構、如何實作**一個從零開始的前端產品。

---

## 功能特色

| 功能 | 說明 |
|------|------|
| 首頁 Hero | 滾動觸發的漸層背景動畫、視差花卉裝飾 |
| 作品集頁 | 分類篩選（前端 / PM / 後端 / 其他）、響應式卡片格線 |
| 作品詳情 | 圖片/影片 Gallery、分享功能（Facebook、Line、複製連結） |
| 履歷頁 | 工作經歷時間軸、技能標籤、一鍵匯出 PDF |
| 雙語切換 | 支援繁體中文 / 英文，語言偏好持久化至 localStorage |
| 全域 Loading | 搭配 React Query 載入狀態的動畫轉場 |

---

## 系統架構

### Monorepo 架構

本專案以 **Nx Workspace** 管理，`apps/portfolio` 為主應用，`libs/` 提供跨專案共用工具函式。這種結構讓大型專案的依賴管理與模組邊界更清晰，也為未來擴充其他 app（如 admin、blog）保留彈性。

```
portfolio/                  ← Nx Monorepo 根目錄
├── apps/
│   └── portfolio/          ← 本應用
│       └── src/app/
│           ├── (pages)/    ← Next.js App Router 頁面
│           ├── api/        ← API 函式 + Mock 資料
│           ├── components/ ← UI 元件（依原子設計分層）
│           ├── store/      ← Zustand 全域狀態
│           └── hooks/      ← Custom hooks
└── libs/                   ← 共用工具函式庫
```

### 前端分層設計

```
Pages（頁面）
  └── Feature Components（功能元件，如 Gallery、ProjectSlider）
        └── Atom Components（基礎元件，如 Tag、Tabs、Overlay）
```

元件依「關注點分離」原則拆分，Atom 元件不含業務邏輯，Feature 元件負責資料串接與互動邏輯。

### 資料流

```
Page 發起 React Query hook
  → API 函式（含 lang 參數）
  → MSW 攔截並回傳對應語系的 Mock 資料
  → React Query 快取（staleTime: 60s）
  → Component 渲染
```

語言切換時，React Query 的 query key 包含 `language`，自動觸發對應語系的資料重新拉取，不需手動清除快取。

---

## 技術棧

### 核心框架

| 技術 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16 (App Router) | SSR/SSG 框架、路由、Turbopack 建置 |
| **React** | 19 | UI 渲染、Server/Client Components |
| **TypeScript** | Strict mode | 型別安全、減少執行期錯誤 |

選用 Next.js App Router 而非 Pages Router，是為了熟悉目前業界的主流方向，並實際體驗 Server Component 與 Client Component 的邊界切分。

### 狀態管理

| 技術 | 用途 |
|------|------|
| **TanStack Query (React Query)** | 非同步資料快取、loading/error 狀態管理 |
| **Zustand** | 輕量全域狀態（語言偏好、全域 loading） |

刻意區分兩種狀態管理工具的職責：React Query 負責「伺服器狀態」，Zustand 負責「UI 狀態」。這是工程師常見的架構選型判斷，而非將所有狀態都塞進同一個地方。

### 樣式系統

| 技術 | 用途 |
|------|------|
| **Tailwind CSS** | Utility-first 快速排版、響應式設計 |
| **SCSS Modules** | 複雜動畫與第三方元件覆寫（如 Swiper） |
| **自訂設計 Token** | 統一色票（pr-brown、pr-green 等）、字型、陰影 |

Tailwind 設定中定義了完整的設計語言（顏色、字型、間距），讓整個專案的 UI 一致性由設定檔保障，而非靠約定俗成。

### API 模擬

| 技術 | 用途 |
|------|------|
| **MSW (Mock Service Worker)** | 在瀏覽器端攔截 HTTP 請求，回傳 Mock 資料 |

使用 MSW 而非直接 hardcode 假資料，原因在於：API 層與元件層完全解耦，未來接真實後端 API 時，只需移除 MSW handler，無需修改任何元件或 hook。這也讓開發流程更貼近真實的前後端分離協作模式。

更關鍵的原因是為後續規劃鋪路：目前所有文案、專案資料都還是直接寫在程式碼裡，每次要改一個字都得重新部署。規劃中的下一步是自己開發一個後台可視化編輯介面，讓文案可以直接在介面上修改、即時生效。因為 API 函式從一開始就不知道資料背後是 MSW 還是真後端，屆時只需要把 MSW handler 換成真正呼叫後台編輯介面的 API，元件與 hook 完全不用改，這個決定現在看起來只是省事，實際上是在為之後要串接的可視化後台預留好介面邊界。

### 多語系

| 技術 | 實作方式 |
|------|------|
| **Zustand + localStorage** | 語言偏好持久化，重新開啟頁面不失去設定 |
| **雙份 Mock 資料** | `projects-data-zh.ts` / `projects-data-en.ts` 各自維護 |
| **自訂 `t()` helper** | `t({ zh: "...", en: "..." })` 輕量翻譯函式，無需引入 i18n 函式庫 |

考量專案規模，刻意不引入 `next-intl` 或 `i18next`，以最小成本實現雙語需求，同時保留未來升級的彈性。

### 其他工具

| 技術 | 用途 |
|------|------|
| **Swiper.js** | 作品集輪播 Slider |
| **@svgr/webpack** | SVG 直接作為 React Component 引入 |
| **html2canvas / jsPDF** | 履歷頁 PDF 匯出 |
| **Nx** | Monorepo 建置、任務管線、快取 |

---

## 工程實踐亮點

### 1. 元件設計：關注點分離

`Gallery` 元件同時支援圖片與影片，並內建 Lightbox（全螢幕檢視）。它對外只暴露一個 `media[]` 陣列的 props 介面，內部的切換邏輯、縮圖同步、全螢幕處理全部封裝在元件內部，使用方無需知道任何實作細節。

### 2. 效能意識：Skeleton Loading

作品列表切換分類時，畫面會先顯示 8 個 Skeleton Placeholder，避免「內容閃爍」或「空白跳動」的不良體驗。這個細節展示了對 Perceived Performance 的重視。

### 3. 動畫策略：漸進增強

所有動畫（視差花卉、滾動淡入、Hover 效果）都以純 CSS / Tailwind 實作，不依賴 Animation library。這減少了 bundle size，也讓動畫行為更可預測、更易維護。

### 4. 型別安全

TypeScript strict mode 全開，`types/` 目錄統一管理各資料結構（`Project`、`FullProject`、`Resume`），API 函式的輸入輸出皆有明確型別，消除 `any` 的存在。

### 5. 可擴充的 API 設計

目前所有資料由 MSW 模擬，但 API 函式（`project-list-api.ts` 等）設計上與 Mock 完全解耦。只要將 `fetch` 的目標 URL 指向真實後端，整個應用即可無縫切換到生產模式。

---

## 實作過程與踩過的坑

這個專案不是一路順風建起來的，過程中遇到的問題和排查方式，反而更能反映真實的工程能力。以下記錄幾個比較有代表性的關卡。

### 1. Next.js 版本與 Vercel 建置失敗的拉鋸

專案初期在 Vercel 上部署時反覆遇到建置失敗，一度在 Next.js 16 與 15 之間來回切換版本（`update next` → `fix vercel build problem` → 再次調整）才找到能穩定通過建置的組合。這段經驗讓我體會到：monorepo 中版本鎖定（`package-lock.json`）與 CI/CD 環境的相容性檢查，往往比本地開發時想像的更容易出狀況，之後養成了每次升級大版本就先在乾淨環境跑一次完整 build 的習慣。

後續 Vercel 也曾自動掃出 React Server Components 的 CVE 資安漏洞，透過官方提供的修補工具將 `next`、`react-server-dom-*` 系列套件一次升級到安全版本，順手驗證沒有因升級而破壞既有功能。

### 2. MSW 在正式環境的服務註冊競態問題

這是整個專案中最棘手的 bug。開發階段使用 MSW（Mock Service Worker）攔截 API 請求運作良好，但正式環境偶爾會出現「請求莫名 404」的間歇性錯誤，且無法穩定重現。

排查後定位到兩個根因：

- **React Strict Mode 下 `worker.start()` 被呼叫兩次**：開發模式下 effect 會執行兩次，若沒有防呆機制，第二次啟動可能與第一次衝突，導致 Service Worker 進入不穩定狀態。解法是用 `useRef` 做啟動旗標，確保整個 App 生命週期只呼叫一次。
- **Service Worker 被瀏覽器提前終止**：瀏覽器在頁面閒置或分頁切換時可能主動終止背景執行的 Service Worker。React Query 若在這個時間點觸發 `refetch`（例如 `refetchOnWindowFocus`），請求會繞過已經失效的 Service Worker，直接打到不存在的真實網址而 404。

短期解法是關閉 `refetchOnWindowFocus`、`retry`，並將 `staleTime` 設為 `Infinity`，減少重新請求觸發的時機。但這終究是治標，真正解法是後來把正式環境改為呼叫**真正的 API Route Handler**（`app/api/**/route.ts`，直接讀取原本給 MSW 用的 mock 資料），MSW 完全限縮回「僅開發環境使用」的角色。這樣一來正式環境不再依賴 Service Worker 是否註冊成功，從根本上消除了這個競態條件。

這個過程也提醒我：Mock 方案在本地測試順暢，不代表能無腦搬到正式環境，凡是牽涉瀏覽器背景生命週期（Service Worker、Web Worker、分頁休眠）的機制，都得額外驗證邊界情境。

### 3. 資料結構演進：從「各頁面各寫一份」到「統一 Schema」

專案中期發現作品詳情頁的各個區塊（Gallery、挑戰、學習心得等）分散在不同型別定義中，中英文兩份 mock 資料的結構也逐漸長歪、彼此不對稱。透過一次重構把 `project-detail-api.type.ts` 的區塊型別統一，讓 `ProjectSectionBlock` 元件能用同一套 schema 渲染任何區塊類型，中英文資料也被迫對齊同一份結構，減少了之後新增專案卡片時複製貼上出錯的機會。

### 4. 一些較小但值得記錄的修正

- **分類篩選閃爍舊資料**：切換作品分類時，畫面會先閃過一次舊分類的結果才更新成正確清單，是因為 React Query 的 query key 設計沒有讓分類切換即時反映在 loading 狀態上，補上正確的 key 依賴後解決。
- **相對路徑匯入寫錯**：重構元件搬移資料夾後，`ProjectSlider` 的相對匯入路徑沒有跟著更新，導致建置階段才報錯，之後養成搬移檔案後立刻跑一次 `tsc` 檢查的習慣。

---

## 本地開發

```bash
# 安裝依賴（於 monorepo 根目錄）
npm install

# 啟動開發伺服器（Turbopack）
npx nx serve portfolio

# 建置生產版本
npx nx build portfolio
```

---

## 專案背景

這個作品集是我在求職空窗期間獨立完成的個人項目，從設計稿到程式碼全程一人負責。技術選型盡量貼近目前業界前端主流（Next.js App Router、React Query、Zustand、Tailwind），同時保持架構的簡潔，避免為了用技術而用技術。

如果您對任何實作細節有疑問，歡迎在面試中深入討論。
