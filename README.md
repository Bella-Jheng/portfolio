# 前端工程作品集：技術解析與工程思維展示

本專案不僅是一個作品展示平台，更是我對現代前端工程實踐、架構決策以及 UX 細節追求的具體展現。

## 🚀 專案概述

這是一個兼具高效能、響應式設計且注重**可擴充性**與**維護性**的作品集網站。透過靈活的架構設計與模擬後端開發環境，確保了在無真實 API 支援下仍能提供流暢且專業的互動體驗。

## 🛠 技術棧 (Tech Stack)

- **核心框架**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Monorepo 管理**: [Nx](https://nx.dev/) - 提供結構化的工作區、代碼共享與優化的建構流水線。
- **狀態管理**: [Zustand](https://github.com/pmndrs/zustand) - 輕量化、解耦的全域狀態管理方案。
- **資料獲取**: [TanStack Query (React Query)](https://tanstack.com/query/latest) - 管理伺服器狀態、快取機制與載入狀態。
- **API 模擬**: [MSW (Mock Service Worker)](https://mswjs.io/) - 攔截網路請求，模擬真實後端互動。
- **樣式處理**: [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 提升開發效率並維持設計規範。
- **動態效果**: [Framer Motion](https://www.framer.com/motion/) - 實現平滑的頁面轉場與精緻的微互動。

## 🏗 核心工程特點

### 1. Monorepo 架構設計 (Nx)

採用 Nx 管理專案，展現了處理中大型工作流程的能力：

- **清晰邊界**：將應用程式 (apps/portfolio) 與封裝過的邏輯 (libs) 完全分離。
- **相依性圖譜**：更有效地控管組件間的依附關係，提升程式碼複用率。

### 2. 模擬後端協作思維 (Mock-First Development)

深入整合 **MSW + React Query** 層：

- **開發效益**：在前端開發初期無需等待真實後端與資料庫，能獨立推進邏輯與邊際情境測試。
- **面試加分**：這體現了在大型團隊中，前端工程師如何透過標準協定與後端協作的能力。

### 3. 響應式與視覺細節

- **Design Tokens**：透過 `tailwind.config.js` 統一定義色彩與間距。
- **Mobile-First**：針對行動裝置優化導覽選單與格線佈局，確保跨裝置體驗的一致性。

## 💡 工程決策與挑戰

- **為什麼選擇 Zustand？** 相比 Redux 的繁瑣，Zustand 在本專案中提供了更健康的性能平衡。特別是處理一些 UI 的開關或是簡單的全域 Flag 時，它的開發效率極高。
- **資料流設計**：採用 React Query 封裝 API 請求，實作了優雅的 Cache 策略與狀態處理，確保使用者在瀏覽不同作品時能獲得即時的響應。

## 📂 目錄結構亮點

```
├── apps/
│   └── portfolio/
│       ├── src/app/
│       │   ├── (pages)/      # 以路由模組化的分層
│       │   ├── api/          # MSW Handler 與 Data Providers
│       │   ├── components/   # 核心組件切分 (Atomic Design 思維)
│       │   └── store/        # Zustand Stores
├── libs/                     # 共用邏輯與型別宣告
└── nx.json                   # Nx Workspace 配置
```

## 🚀 未來規劃 (Roadmap)

- **自動化履歷管理**：整合現有的廣告組版系統 (CMS)，實現透過後台 GUI 直接入稿、更新履歷資料，徹底解決手動更新 Mock Data 的繁瑣過程。
- **真實 API 串接**：開發與後台對接的 API 層，取代現有的 MSW 模型，將專案提升至具備真實資料交互能力的動態架構。

---

## 🚦 快速運行

1.  **安裝**: `npm install`
2.  **開發**: `npm run dev` (自動啟動 Next.js 服務與 MSW)
3.  **編譯**: `nx build portfolio`
