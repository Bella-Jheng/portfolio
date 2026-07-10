# 個人專案 Monorepo

本 Repo 以 [Nx](https://nx.dev/) 管理多個獨立網站，收錄我在前端工程實踐、架構決策以及 UX 細節上的具體展現。

## 🚀 專案概述

透過 Nx Workspace 將多個 Next.js 應用整合在同一個 monorepo 中，共享工具函式庫（`libs/`）與統一的建置流程，同時保有每個網站各自的技術選型彈性。

## 📦 專案列表 (Apps)

- **[portfolio](apps/portfolio/README.md)** — 前端工程作品集網站，展示 Next.js + Nx 架構設計、Mock-First 開發流程與工程決策細節。
- **[bazi（八字命理）](apps/bazi/DEVLOG.md)** — 以 Next.js + Firebase + Google Gemini API 打造的八字命理分析工具，使用者輸入出生年月日時即可取得 AI 命理解析，並設有知識庫管理後台供內容擴充。

各專案的技術棧、架構設計與工程決策詳見上方連結的個別文件。

## 🚦 快速運行

```bash
# 於 monorepo 根目錄安裝依賴
npm install

# 啟動 portfolio
nx serve portfolio

# 啟動 bazi
nx serve bazi
```
