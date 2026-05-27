# 八字命理 — 開發記錄

## 專案概述

以 Next.js 16 + Firebase Firestore + Google Gemini API 建構的八字命理分析工具。  
使用者輸入出生年月日時，系統計算八字命盤並透過 AI 給出命理分析。  
另設有知識庫管理頁面，供管理員上傳命理知識讓 AI 作為參考依據。

### 技術棧

| 層級 | 技術 |
|------|------|
| 前端框架 | Next.js 16 (App Router) |
| 樣式 | Tailwind CSS（自訂 `bz-*` 色票） |
| 資料庫 | Firebase Firestore (Admin SDK) |
| AI | Google Gemini 2.5 Flash（`@google/generative-ai`，免費層）|
| 字幕解析 | `youtube-transcript` |
| 部署目標 | Vercel |

---

## 功能進度

### 核心功能

- [x] 八字命盤計算（天干、地支、五行）
- [x] Gemini AI 命理分析（四大主題：運勢、感情、健康、事業）
- [x] 命盤結果頁面
- [x] 結果持久化至 Firestore（可分享連結）

### 知識庫管理

- [x] 知識條目 CRUD（Firestore `knowledge` collection）
- [x] 多來源輸入介面（仿 NotebookLM 設計）
  - [x] 手動輸入
  - [x] 檔案上傳（`.txt`、`.md`、`.srt`、`.vtt`）
  - [x] YouTube 影片字幕解析
- [x] 拖曳上傳（Drag & Drop）
- [x] AI 自動建議知識標籤
- [x] 標籤式知識篩選（依日主五行 + 問題主題，非全量注入）

### UI / 其他

- [x] 太極 SVG favicon（深墨色底 + 金色太極）
- [x] 中英文語言切換

---

### 0. 資料庫從 Prisma 改為 Firebase

**背景：** 專案初期 AI 建議使用 Prisma 作為資料庫方案，理由是「輕量化」。

**Prisma 是什麼：** Prisma 是 ORM（Object-Relational Mapper，物件關聯映射層）。它本身不是資料庫，而是一個讓你用 TypeScript 程式碼操作 SQL 資料庫的工具，背後需要搭配 PostgreSQL 等真正的資料庫。它的作用是把 SQL 翻譯成 TypeScript，例如：

```ts
// Prisma 寫法（背後轉成 SQL）
prisma.knowledge.findMany({ where: { category: 'general' } });

// 等同於原生 SQL
SELECT * FROM knowledge WHERE category = 'general';
```

**問題發現：** 我本身沒用過 Prisma，在深入研究前先問了一個關鍵問題：**這能部署到 Vercel 嗎？** AI 回答「不行」，因此決定不採用。

**事後釐清（重要）：** 這個回答是不準確的。Prisma 搭配 Neon 或 Supabase 等雲端 PostgreSQL 服務，是**可以**部署到 Vercel 的。AI 給了不完整的資訊，這提醒我 AI 的建議需要自己驗證。

**為什麼最終選 Firebase：**

Firebase Firestore 是 NoSQL 文件資料庫，SDK 本身就很直覺，不需要 ORM：

```ts
// Firebase 直接操作，不需要 SQL 也不需要 ORM
db.collection('knowledge').where('category', '==', 'general').get();
```

選擇原因：
1. **熟悉度** — Firebase 是已有經驗的技術，不需要同時學 Prisma + PostgreSQL
2. **Vercel 相容** — Firebase Admin SDK 在 serverless function 上運作順暢，設定簡單
3. **Schema 彈性** — 命理資料結構會演進，NoSQL 不需要預先定義欄位，比關聯式資料庫更適合

**學到的事：** 技術選型要先確認部署環境的限制。AI 給的資訊不一定完整，尤其是基礎設施相關的問題要自己去驗證。

---

## 系統架構

### 使用者算命流程

```
填寫出生資訊（BirthForm）
    ↓ POST /api/calculate
計算四柱八字（bazi-calculator）
    ↓
getDominantElements → 取得日主五行（如「金」）
    ↓
Firestore：撈 tags 包含「金/桃花/財運/健康/事業/運勢/通用」的知識
    ↓
呼叫 Gemini → 產出四項分析
    ↓
結果存入 Firestore → 重導至 /result/[id]
    ↓ 使用者追問
POST /api/result/[id] → 同樣標籤篩選 → Gemini 回答 → 存回 Firestore
```

### AI Token 使用點

| 觸發 | 函式 | 模型 |
|------|------|------|
| 使用者送出八字 | `generateBaziReading` | Gemini 2.0 Flash |
| 使用者追問問題 | `answerCustomQuestion` | Gemini 2.0 Flash |
| 上傳知識時建議標籤 | `suggestKnowledgeTags` | Gemini 2.0 Flash |

---

## 遇到的問題、取捨與解法

### 1. `entries.map is not a function` 崩潰

**現象：** 知識庫頁面一開啟就崩潰，console 出現 `TypeError: entries.map is not a function`。

**除錯過程：** 第一眼看到報錯以為是資料結構問題，但追查下去才發現根本原因是 `GET /api/knowledge` 回傳 HTTP 500。`fetchEntries` 沒有檢查 `res.ok`，直接把錯誤物件 `{ error: '...' }` 存入 `entries` state，物件不是陣列所以 `.map()` 報錯。這是典型的錯誤處理缺失，讓表面症狀掩蓋了真正的問題。

**解法：** 加上 `res.ok` 檢查，並保護性地用 `Array.isArray` 確保 state 永遠是陣列：

```ts
if (!res.ok) { setError('無法載入知識庫'); return; }
const data = await res.json();
setEntries(Array.isArray(data) ? data : []);
```

**學到的事：** API 呼叫一定要檢查 HTTP status，不能假設回傳值一定是預期格式。

---

### 2. Firestore API 未啟用（500 根本原因）

**現象：** `GET /api/knowledge` 持續 500，但 Firebase 初始化程式碼看起來完全正常。

**除錯過程：** 一開始懷疑是 `service-account.json` 格式錯誤或路徑問題。直接在 terminal 跑 Node.js 測試 Firebase 連線，才拿到明確的錯誤訊息：

```
7 PERMISSION_DENIED: Cloud Firestore API has not been used in project bazi-4b8f0
before or it is disabled.
```

原來是 Firebase 專案建立後沒有手動啟用 Firestore API，這一步不是自動的。

**解法：** 前往 Firebase Console → Firestore → 建立資料庫。

**學到的事：** 遇到含糊的 500 錯誤，優先在 server 端直接測試，而不是一直看前端程式碼。

> **狀態：待處理**

---

### 3. Favicon 無法顯示正確樣式

**現象：** 分頁標籤先顯示地球預設圖示；改用 Next.js `icon.tsx` + `☯` 字元後，favicon 變成紫色 emoji，`color: '#c9a84c'` 完全無效。

**除錯過程：** 一開始以為是 CSS 優先級問題，試了多種寫法都無效。後來才意識到問題出在 OS 層級——`☯`（U+262F）在 macOS 和多數系統上會被 emoji 渲染引擎接管，直接套用系統色彩，CSS 根本沒有機會介入。這是我第一次遇到 Unicode 字元與 emoji 渲染衝突的問題。

**取捨：**
- 用 `☯︎`（加 U+FE0E 變體選擇符強制文字模式）→ 不確定跨平台支援
- 用 `icon.tsx` + `ImageResponse` 渲染 SVG → 多一層轉換
- 直接放 `public/favicon.svg`，用 SVG path 手繪 → 最直接可控

最後選擇手繪 SVG，完整控制配色，不依賴任何字元渲染行為：

```svg
<path d="M50,10 A40,40 0 0,1 50,90 A20,20 0 0,1 50,50 A20,20 0 0,0 50,10Z" fill="#c9a84c"/>
<circle cx="50" cy="30" r="10" fill="#c9a84c"/>
<circle cx="50" cy="70" r="10" fill="#1a1a0e"/>
```

---

### 4. YouTube 字幕抓取方案選型

**需求：** 使用者貼上 YouTube 連結，系統自動解析字幕存入知識庫（參考 NotebookLM 的設計）。

**方案評估過程：**

最直覺的做法是裝 `youtube-transcript` 套件，但在安裝前先停下來評估安全風險：
- 這是一個非官方的小型套件，供應鏈風險存在
- 但實際上它做的事情只是抓 YouTube 的公開字幕資料
- 「自己實作」和「用這個套件」在安全性上幾乎沒有差別，只差在誰寫的程式碼

也評估過 YouTube Data API v3（官方）：
- 發現一個關鍵限制：**字幕下載需要 OAuth**，API key 只能取得影片 metadata
- 這意味著正式走官方路線，複雜度會大幅提升，且使用者需要 Google 登入授權

**最終決策：** 用 `youtube-transcript`。理由：
1. **完全免費**，不需要 API key
2. 300k/week 下載量，有大量使用者在監控套件安全性
3. 若字幕品質不夠，可用 **NotebookLM 輔助**（同樣免費）處理後貼入手動輸入

**猶豫點：** 非官方套件 YouTube 改版就可能失效，這是已知風險，但對於目前規模接受這個取捨。

---

### 5. 知識庫全量注入 → 標籤式 RAG

**問題發現：** 在理解算命 API 流程時注意到 `calculate/route.ts` 每次都把 `knowledge` collection 全部撈出來塞進 prompt。這在知識庫小的時候沒問題，但會有兩個隱患：
1. 知識多了之後 token 費用線性增長
2. AI 要從大量不相關知識裡找到有用的，分析品質可能下降

**方案選型：**

| 方案 | 效果 | 複雜度 | 費用 |
|------|------|--------|------|
| 全量注入（原始） | 低效 | 無 | 高 |
| 限制筆數 | 粗糙 | 低 | 降低 |
| 向量搜尋（RAG） | 最精準 | 高 | 需要 embedding API |
| 標籤式篩選（採用） | 夠用 | 中 | 幾乎不增加 |

**取捨思考：** 真正的 RAG 需要 embedding model + 向量資料庫（Pinecone 等），對現在的規模是過度工程。標籤式篩選雖然沒有語意搜尋，但命理知識本來就有清楚的分類結構（五行、主題），用標籤反而更精準可控。

**實作方式：**
- 上傳知識時 AI 自動打標籤（從預定義分類選取）
- 算命時從命盤算出「日主五行」（八字中最重要的命元素）
- Firestore `array-contains-any` 只撈符合日主五行 + 問題主題的知識
- 舊資料（無標籤）自動 fallback

---

### 6. Anthropic API 無免費方案，換用 Google Gemini

**現象：** Anthropic API 帳號餘額 $0，$5 贈點未發放，無法使用 API。

**評估過程：**

原本用 Anthropic Claude 是因為 Claude 的中文品質和指令遵循能力優秀。但遇到一個根本問題：**沒有真正的免費層**，$5 贈點是一次性且不一定發放。

同時也評估了這個 app 的實際使用規模（個人 / 小量用戶），真正需要的是「可以持續免費運作」，而不是「最頂尖的模型」。

| | Anthropic Claude | Google Gemini |
|---|---|---|
| 費用 | 用多少付多少，無免費層 | 永久免費層（每天 1,500 次請求）|
| 中文品質 | 極佳 | 良好 |
| 適合規模 | 商業產品 | 個人 / 小型專案 |

**決策：** 換用 Google Gemini 2.0 Flash。

**降低改動成本的做法：** 保留 `lib/anthropic.ts` 檔名，只替換內部實作，讓所有 import 這個 lib 的 API routes 完全不需要修改——這是單一職責原則的實際應用。

---

### 7. Firebase Admin SDK 在 Next.js build 時初始化失敗

**現象：** Vercel 部署時 build 階段出現 Firebase 初始化錯誤。本地開發正常，但 `next build` 跑到一半就因為找不到環境變數而崩潰。

**根本原因：** 原始寫法是 `export const db = getDb()`，這讓 Firebase Admin SDK 在模組被 import 的瞬間就執行初始化。Next.js build 時會靜態分析所有 route，導致 `getDb()` 在 build 階段被呼叫，但此時 `FIREBASE_PROJECT_ID` 等環境變數尚未注入。

**解法：** 用 JavaScript `Proxy` 實現懶初始化——`db` 的 import 介面維持不變，但真正的初始化延遲到第一次 request 進來時才執行：

```ts
let _db: ReturnType<typeof getFirestore> | null = null;

function getDb() {
  if (_db) return _db;
  // 只有第一次被 request 觸發時才真的初始化
  const app = getApps().length === 0
    ? initializeApp({ credential: cert(getCredential()) })
    : getApps()[0];
  _db = getFirestore(app);
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop as string);
  },
});
```

這樣所有 import `db` 的地方完全不需要改，只是把初始化時機從「模組載入時」推遲到「第一次呼叫時」。

**學到的事：** Next.js build 是靜態分析，不等於執行期環境。任何需要 runtime 環境變數的初始化都不能放在模組頂層直接執行。

---

### 8. readingId 分散在元件，導致重複呼叫與重導邏輯混亂

**現象：** 登入後首頁偶爾不會自動跳轉到結果頁；Header 的「排盤」連結不管有沒有既有命盤都只導向 `/`，使用者需要再做一次操作才能回到自己的結果。

**根本原因：** `readingId`（使用者是否有既有命盤）的 fetch 邏輯只放在首頁元件裡，而且每次渲染都重新呼叫一次 `/api/user/reading`。這造成兩個問題：
1. Header 等其他元件無法知道 `readingId`，只能靜態連到 `/`
2. 首頁同時有 `loading`（auth）和 `getToken`（非同步）兩個依賴，競速條件讓跳轉不穩定

**解法：** 把 `readingId` fetch 提升到 `AuthProvider`，在 `onAuthStateChanged` 觸發（即登入成功）時統一取一次，並暴露 `readingId` 和 `readingLoading` 給所有元件使用：

```ts
// auth-context.tsx — 登入後自動 fetch，全域共用
const fetchReading = useCallback(async (currentUser: User) => {
  setReadingLoading(true);
  const token = await currentUser.getIdToken();
  const res = await fetch('/api/user/reading', { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  setReadingId(data.readingId ?? null);
  setReadingLoading(false);
}, []);
```

首頁和 Header 都改成讀 context 的值，不再各自 fetch。「排盤」按鈕也從 `<Link href="/">` 改成 button，依據 `readingId` 智慧導向 `/result/:id` 或 `/`。

**學到的事：** 跨元件共用的非同步狀態應該放在最近的共同 Provider，而不是讓每個元件各自 fetch。競速條件通常是「狀態分散」的症狀，不是個別元件的 bug。

---

## 架構設計思考

### 同命盤快取 vs 個人化記錄

**問題：** 如果兩個人生日完全相同（同年月日時），八字命盤就一樣，AI 主分析的輸出也會幾乎相同。是否應該用生日當 key 快取分析結果，避免重複呼叫 AI？

**分析：**

| | 同命盤的兩人 |
|---|---|
| 四柱八字 | 完全相同 |
| AI 主分析（運勢/感情/健康/事業）| 幾乎相同 |
| 追問內容 | 各自獨立 |
| 名字 | 各自不同，且 prompt 有帶入，影響措辭 |

**為什麼不用名字當 key：** 名字非唯一、是選填欄位，無法可靠識別同一人。

**為什麼現在不做快取優化：**
1. 規模小，同生日的使用者幾乎不會同時出現
2. prompt 有帶入名字，快取後兩人會看到完全相同的分析文字，體驗反而變差
3. `questions`（追問）本來就必須 per-reading，無法共用

**若未來規模變大，可考慮的拆法：**
```
pillar_cache    ← key: "birthYear-birthMonth-birthDay-birthHour"
  fortune, romance, health, career  ← 快取 AI 主分析

readings        ← key: uuid（每人一筆）
  name, gender, pillarCacheId       ← 指向 cache
  questions[]                       ← 各自追問
```

**結論：** 維持現有設計（每次算命一筆獨立 reading），避免過早優化增加複雜度。等真正遇到效能瓶頸再拆。

---

## 環境變數說明

| 變數 | 用途 | 取得方式 |
|------|------|------|
| `GOOGLE_AI_API_KEY` | Gemini AI 分析（免費） | aistudio.google.com |
| `FIREBASE_PROJECT_ID` | Firestore 連線 | Firebase Console > 專案設定 |
| `FIREBASE_CLIENT_EMAIL` | Firestore 認證 | Firebase Console > 服務帳號 |
| `FIREBASE_PRIVATE_KEY` | Firestore 認證 | Firebase Console > 服務帳號 |

本地開發亦可將 Firebase 服務帳號金鑰存為 `apps/bazi/service-account.json`（已加入 `.gitignore`）。

---

## 待辦事項

- [ ] 啟用 Firestore API（`bazi-4b8f0` 專案）
- [ ] 取得 Google AI API Key 並填入 `.env.local`
- [ ] 測試 YouTube 字幕解析流程
- [ ] 確認標籤篩選是否正確影響 AI 分析結果
- [ ] Vercel 部署環境變數設定
