# 八字命理 — 開發記錄

## 專案概述

以 Next.js 16 + Firebase Firestore + Google Gemini API 建構的八字命理分析工具。  
使用者輸入出生年月日時，系統計算八字命盤並透過 AI 給出命理分析。  
另設有知識庫管理頁面，供管理員上傳命理知識讓 AI 作為參考依據。

### 為什麼想做這個專案

因為對八字有興趣，買了線上課程學習，但學完之後發現知識量太大，光靠人工背記不住，加上經驗不足，實際幫人算命時常常卡關，越算越沒信心。

於是想到：與其一直硬背,不如把課程裡的知識系統化。作法是把「知識衛星」頻道 40 支教學影片的字幕爬出來，先讓 AI 做第一輪筆記整理，再把整理好的知識放進系統裡，之後能持續擴充功能。

會特別做成一個網站，而不是單純丟給 AI 問答，是因為目標不只是「查得到答案」：

- 希望也想讓朋友們有一樣的工具能提前預判問題、在對的時機做選擇，而且不只自己用
- 因此第一個做的功能是綁定 Google 帳號，讓每個人有自己專屬的空間問問題，讓朋友能自行輸入問題，不用透過我轉述
- 我自己也能夠透過搜集來的各種命盤來增加我自己的經驗值，不用透過一個一個算來累積

**上線後的實際回饋：** 網站上線後，也真的成為我跟朋友之間更多話題的來源，他們會回饋使用心得跟修改建議；同時透過大量命盤的累積，讓我對各種命盤規則的掌握變得更精準，也因為更了解朋友的性格特質，讓我更知道怎麼跟彼此相處。

### 技術棧

| 層級 | 技術 |
|------|------|
| 前端框架 | Next.js 16 (App Router) |
| 樣式 | Tailwind CSS（自訂 `bz-*` 色票） |
| 資料庫 | Firebase Firestore (Admin SDK) |
| AI | Google Gemini 2.5 Flash（`@google/generative-ai`，免費層）|
| 字幕解析 | `youtube-transcript` |
| 測試 | Vitest 3.x |
| 部署目標 | Vercel |

---

## 開發時程

| 日期 | 里程碑 |
|------|--------|
| 2026-05-20 | 初始化專案，Firebase + AI 整合基礎建設 |
| 2026-05-27 | 功能大幅擴充：ResultDisplay 拆分成模組化 slides、表單頁、知識庫管理、追問功能 |
| 2026-05-27 | Refactor：readingId 集中到 AuthProvider，修正首頁跳轉競速條件 |
| 2026-05-27 ~ 28 | 部署除錯：解決 Vercel 上所有 API 403 問題、加入 source maps |
| 2026-06-06 ~ 09 | 架構重構：TanStack Query 整合、目錄結構調整、API hooks 拆分、參數命名規範化 |
| 2026-06-09 | 安全性：API Response 減量、Cache-Control headers |
| 2026-06-12 ~ 13 | Q&A 追問系統整合、AI 錯誤訊息轉發前端、加入 husky + commitlint、Firestore null 防呆 |
| 2026-06-29 | 社群分享優化：LINE/IG 內建瀏覽器偵測並導出至外部瀏覽器、OpenGraph 分享卡 metadata |
| 2026-07-04 | 登入入口統一：抽出 `GoogleLoginButton`，in-app browser 導轉邏輯收斂進 `login()` 本身 |
| 2026-07-05 ~ 06 | 分享卡片功能：下載 PNG、行動裝置原生分享、五行貓咪圖轉 WebP + 長效快取 |
| 2026-07-07 | 修復分享卡截圖「空白貓咪」多輪除錯、修正更正生日後結果過期的 bug、新增手機版卡片輪播與按需生成詳解 |
| 2026-07-08 | 架構重構：Firestore 讀寫收斂為 Repository + Service 分層；建立 Vitest 測試框架並補上第一支排盤純函式測試 |

從第一個 commit 到部署成功約 **8 天**，密集開發集中在 5/27 ~ 5/28；截至 7/8，累積開發時程約 **50 天**，近期重心從功能擴充轉向架構收斂（Repository/Service 分層）與測試基礎建設。

---

## 功能進度

### 核心功能

- [x] 八字命盤計算（天干、地支、五行）
- [x] 命理知識資料建置與收集
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

## 遇到的問題、取捨與解法
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

### 9. Vercel 部署後所有需要 Firebase Auth 的 API 一律回 403

**現象：** 本地開發完全正常，部署到 Vercel 後所有需要登入的 API（`/api/dashboard/readings`、`/api/result/:id` 等）全部回 403，無法判斷是哪一步出錯，因為 `catch` 都是空的。

**根本原因（三層）：**

**第一層：`FIREBASE_PRIVATE_KEY` 格式錯誤**
從 Firebase Console 下載的 service account JSON 裡，`private_key` 欄位格式是：
```
-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n
```
貼到 Vercel 環境變數時，把 header/footer 弄丟了，只剩中間的 base64 內容。Firebase Admin SDK 無法解析沒有 PEM header 的 key，初始化直接失敗，但錯誤被 `catch {}` 吃掉，對外只看到 403。

正確格式（Vercel 環境變數填入）：
```
-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n
```
用 `\n` 而不是真實換行，程式碼裡有 `.replace(/\\n/g, '\n')` 會自動轉換。

**第二層：`getAuth()` 在 cold start 時先於 Firebase 初始化被呼叫**
`db` 是用 Proxy 做懶初始化，本身 import 不會觸發 Firebase app 建立。但 `verifyAdmin` 裡是直接呼叫 `getAuth()`，在 Vercel serverless cold start 時，Firebase app 還沒初始化，`getAuth()` 就 throw 了，又被 `catch` 吃掉。

本地之所以沒問題：Node.js 是持久進程，其他 request 早就初始化過 app 了。

修法：在 `firebase.ts` 新增 `getAdminAuth()`，內部先呼叫 `getDb()` 確保 app 已建立再回傳 `getAuth()`。所有 API route 改用這個 helper。

**第三層：Vercel 環境變數沒有開 Preview**
Vercel 的環境變數分 Production / Preview / Development 三個範圍，只設 Production 的話 Preview 部署拿不到，一樣 403。

**學到的事：**
- 空的 `catch {}` 是除錯的大敵，至少要 `console.error` 把錯誤吐到 Vercel Function Logs
- Vercel serverless 每個 Lambda 都是獨立 cold start，不能假設其他 module 已被初始化過
- PEM key 格式的 header/footer 不是裝飾，沒有就整個壞掉

---

### 10. TanStack Query 整合取代手動 fetch 狀態管理

**背景：** 原本每個頁面都用 `useState` + `useEffect` 管理 loading / error / data 三個 state，加上 `getToken()` 取得 Firebase token 後才能發請求，boilerplate 非常多。

**方案選型：**

| 方案 | loading/error 管理 | cache | 重複請求去重 |
|------|------|------|------|
| useState + useEffect | 手動 | 無 | 無 |
| SWR | 自動 | 有 | 有 |
| TanStack Query v5 | 自動 | 精細可控 | 有 |

選擇 TanStack Query 的理由：對 `setQueryData` 的細粒度快取操作支援更好，適合 dashboard 那種「刪一筆、更新一筆」的局部更新場景。

**實作：**

1. `Providers.tsx` 用 `useState` 建立穩定的 `QueryClient` 實例（避免每次 render 重建）：
   ```tsx
   const [queryClient] = useState(
     () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } })
   );
   ```

2. 新增 `lib/use-fetcher.ts` 共用 hook，回傳帶 Firebase Bearer token 的 `apiFetch<T>` function：
   ```ts
   export function useFetcher() {
     const { getToken } = useAuth();
     return async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
       const token = await getToken();
       // ...自動附 Authorization header
     };
   }
   ```

3. 所有 `useQuery` / `useMutation` 寫在 `(pages)/頁面名稱/api/` 子目錄，一個 hook 一個檔案（`use-[verb]-[noun].ts`），頁面元件只 import，不包含 fetch 邏輯。

**遇到的型別問題：** 原始寫法 `return res.json() as Promise<T>` 在 async function 裡不會真正 await，TanStack Query 無法推斷 `TData`，導致 `mutateAsync` 回傳 `Promise<never>`。正確寫法是 `return (await res.json()) as T`。

---

### 11. 目錄結構調整：`components/` → `common/`

**背景：** 原有結構把通用元件放在 `components/Common/` 和 `components/Layout/`，與路由相關的 `(pages)/` 同層，但 `(pages)/` 裡的 api 子目錄讓兩個關注點混在一起。

**調整後結構：**
```
src/app/
├── (pages)/               # 路由頁面 + 頁面專屬 api/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── api/           # dashboard 專屬 hooks
│   ├── form/
│   └── result/[id]/
├── common/
│   ├── api/               # 跨頁面共用 helpers（readings-cache.ts）
│   └── components/
│       ├── layout/        # Providers, Header
│       ├── birth-form/
│       ├── result-display/
│       └── ...
└── lib/                   # 非 React 工具函式
```

**主要取捨：** `layout/` 從 `components/Layout/`（深度 2）移到 `common/components/layout/`（深度 3），所有 `../../lib/` import 都需改為 `../../../lib/`。這是一次性成本，完成後結構更清晰。

---

### 12. `patchReadings` 共用快取 helper

**問題：** dashboard 的三個 mutation（save、delete、approve-correction）都需要在 `onSuccess` 時更新 `['readings']` query 快取的特定項目，每個 hook 都寫一遍 `queryClient.setQueryData` 造成重複。

**解法：** 提取到 `common/api/readings-cache.ts`：
```ts
export function patchReadings(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (prev: Reading[]) => Reading[],
) {
  queryClient.setQueryData(
    READINGS_KEY,
    (prev: { readings: Reading[] } | undefined) => ({ readings: updater(prev?.readings ?? []) }),
  );
}
```

三個 hook 呼叫 `patchReadings(queryClient, prev => prev.map(...))` 即可，不重複處理包裝格式。

---

### 13. TypeScript control-flow narrowing 造成 `never` 型別錯誤

**現象：** dashboard `page.tsx` 裡 `saveMutation.mutate({ id: selected?.id, ... })` 出現 `Property 'id' does not exist on type 'never'`，無論怎麼加型別標注都無法解決。

**根本原因：** 元件有一個 early return：
```tsx
if (selected) {
  return <DetailView reading={selected} />;  // selected 在這裡是 Reading
}
// 以下 selected 被 TypeScript narrow 成 null
```

所有在 early return 之後存取 `selected?.id` 的程式碼，TypeScript 的 control-flow analysis 都推斷 `selected` 是 `null`，`null.id` 是 `never`。

**解法：** list view 只在 `selected === null` 時渲染，所以 save 成功後根本不需要更新 `selected`。直接在 `onSuccess` 呼叫 `cancelEdit()`，移除所有存取 `selected.id` 的程式碼，型別錯誤自然消失。這也是正確的架構：list view 的 mutation 成功後只需清除編輯狀態，cache 的更新由 `patchReadings` 負責。

---

### 14. 參數命名規範化：禁用單字元參數名稱

**背景：** 程式碼裡累積了大量單字元 arrow function 參數，如 `(e) =>`, `(r) =>`, `(s) =>`, `(c) =>` 等，讀程式碼時需要靠上下文猜測意義。

**統一規範（跨 ~25 個檔案）：**

| 原始 | 替換後 | 情境 |
|------|--------|------|
| `(e)` | `(event)` | React / DOM event handler |
| `(e)` | `(error)` | `catch (e)` 錯誤捕捉 |
| `(e)` | `(entry)` | 知識庫條目 filter |
| `(e)` | `(readerEvent)` | FileReader onload |
| `(e)` | `(dragEvent)` | DragEvent handler |
| `(r)` | `(reading)` | Reading 物件 |
| `(s)` | `(sentence)` | 文字切割後的句子 |
| `(s)` | `(shichen)` | 時辰陣列 map |
| `(s)` | `(section)` | TenGods 分析段落 |
| `(s)` | `(star)` | StarField 星星 |
| `(c)` | `(cycle)` | MajorFortuneCycle |
| `(d)` | `(doc)` | Firestore document |
| `(f)` | `(prevForm)` | `setEditForm((f) => ...)` |
| `(v)` | `(dateValue)` | BirthDateValue onChange |
| `(g)` | `(gender)` | Gender 選項 map |
| `(u)` | `(authUser)` | Firebase onAuthStateChanged |
| `(p)` | `(pendingItem)` | PendingFile 陣列操作 |
| `(p)` | `(prevIndex)` | setTrackIndex updater |
| `(i)` / `idx` | `(index)` | 陣列 index |
| `(m)` | `(tabMode)` | Mode tab map（mode 已被 state 佔用）|
| `(t)` | `(existingTag)` | tag filter callback |
| `(a, b)` | `(entryA, entryB)` | Object.entries sort |

TypeScript 零錯誤驗證通過（`npx tsc --noEmit`）。

---

### 15. API Response 減量與 Cache-Control：避免個資外洩

**問題發現：** 使用者在瀏覽器 DevTools 的 Network 面板可以看到完整的 Response，其中包含生日、姓名、性別等個人資料。具體發現兩個問題：

1. **`/api/calculate` 重複命盤分支（line 40）**：已有命盤時直接回傳 `{ id: doc.id, ...doc.data() }`，把整份 Firestore document（含所有個資欄位）全吐到 Response
2. **`/api/calculate` 新命盤分支（line 125）**：回傳 `{ id, pillars, fortune }`，其中 `pillars` 和 `fortune` 前端根本不用——`use-calculate.ts` 的 `onSuccess` 只讀 `data.id` 做 router.push

**技術現實說明：** Request Payload（使用者送出的生日資料）**無法隱藏**。瀏覽器是送出請求的主體，DevTools 永遠看得到瀏覽器自己的行為。HTTPS 保護的是第三方（中間人攻擊），不是使用者自己的 DevTools。真正需要保護的是 Response 不要多吐不必要的資料。

**修改內容：**

```ts
// 修前（已有命盤）
return NextResponse.json({ id: doc.id, ...doc.data() });

// 修後：只回傳 id，前端只需要這個跳轉
return NextResponse.json(
  { id: doc.id },
  { headers: { 'Cache-Control': 'no-store, private' } },
);
```

```ts
// 修前（新命盤）
return NextResponse.json({ id, pillars, fortune });

// 修後：前端只需要 id
return NextResponse.json(
  { id },
  { headers: { 'Cache-Control': 'no-store, private' } },
);
```

**同步補上 `Cache-Control: no-store, private` 的端點：**

| 端點 | 說明 |
|------|------|
| `POST /api/calculate` | 算命結果 |
| `GET /api/result/[id]` | 命盤詳情 |
| `POST /api/result/[id]` | 追問回應 |
| `GET /api/dashboard/readings` | 管理員命盤列表 |

`no-store` 防止瀏覽器與 CDN 快取敏感回應；`private` 明確標示僅限當前使用者，禁止代理伺服器快取。

**學到的事：** API 設計上「只回傳呼叫方真正需要的欄位」本來就是好習慣，剛好也是最簡單的個資保護。Response 減量比加密更務實——不吐出去就不會洩漏。

---

### 16. Google OAuth 403：LINE 內建瀏覽器封鎖登入

**問題發現：** 把網站連結貼到 LINE 傳給朋友，朋友點開後嘗試 Google 登入，直接出現 403 Forbidden，完全無法登入。換成一般瀏覽器（Safari / Chrome）開同一個連結，登入完全正常。

確認根因：Google OAuth 明確封鎖在 **WebView（in-app browser）** 環境中發起的登入請求。LINE、Facebook、Instagram 等社群 App 的內建瀏覽器都是 WebView，Google 偵測到 User-Agent 後直接回 403，`signInWithPopup` 不會彈出視窗就直接報錯。

**額外發現的坑：** 偵測邏輯一開始只加在 `Header.tsx` 的登入按鈕，但 `page.tsx`（首頁 Modal）、`QASection.tsx`、`dashboard/page.tsx`、`knowledge/page.tsx` 都直接呼叫 `login()`，完全繞過偵測。Instagram 的 in-app browser 因為 WebView 限制較寬鬆所以能登入，進一步確認問題確實出在 LINE 的 WebView 環境。

**解法：**

**Step 1** — 建立 `lib/detect-browser.ts`，兩層偵測：

```ts
// Layer 1：比對已知社群 App 的 UA token（LINE / FB / IG / WeChat / TikTok 等）
const IN_APP_TOKEN_RE = /Line\/|FBAN|FBAV|Instagram|.../i;

// Layer 2：mobile 裝置但 UA 結尾不像乾淨的 Chrome / Safari / Firefox
// → 捕捉未來出現的新 in-app browser，不需要逐一加到 blocklist
const CLEAN_MOBILE_BROWSER_RE = /(?:Chrome|CriOS)\/[\d.]+ (?:Mobile )?Safari\/[\d.]+$/;

export function isInAppBrowser(): boolean {
  if (IN_APP_TOKEN_RE.test(ua)) return true;
  return MOBILE_RE.test(ua) && !CLEAN_MOBILE_BROWSER_RE.test(ua);
}
```

Layer 2 的原理：所有 in-app browser 都是拿 Chrome / Safari 的 UA 再**往後追加**自己的 identifier（例如 `Line/14.6.0`）。乾淨的標準瀏覽器 UA 結尾是固定格式，有多餘字串幾乎確定是 WebView。

**Step 2** — 針對不同環境的跳轉策略：

```ts
export function openInExternalBrowser(): void {
  const url = window.location.href;

  // LINE iOS 原生支援 openExternalBrowser=1，偵測到此參數會開啟 Safari
  if (/Line\//i.test(ua)) {
    const sep = url.includes('?') ? '&' : '?';
    window.location.href = `${url}${sep}openExternalBrowser=1`;
    return;
  }

  // Android：intent:// scheme 讓系統選擇瀏覽器開啟
  if (/android/i.test(ua)) {
    window.location.href = `intent://${...}#Intent;scheme=https;...;end`;
    return;
  }
}
```

**Step 3** — 把偵測邏輯移進 `auth-context.tsx` 的 `login()` 本身，而非個別 UI 元件：

```ts
const login = async () => {
  if (isInAppBrowser()) {
    openInExternalBrowser();
    return;
  }
  await signInWithPopup(auth, googleProvider);
};
```

這樣不管哪個頁面、哪個按鈕呼叫 `login()`，偵測自動生效，不需要各處重複處理。

**學到的事：**

- 「只修 UI 按鈕」是常見的漏洞：邏輯保護要放在最底層（service / context），而不是每個呼叫點各自加 guard。
- User-Agent 的 blocklist 永遠追不完，**allowlist（正向判斷是否為標準瀏覽器）** 作為第二層是更健壯的做法。
- `openExternalBrowser=1` 是 LINE 官方支援的參數，不是 hack，有文件依據。iOS 上 `window.open` 會被 LINE 封鎖，必須靠這個參數才能真正跳到 Safari。

---

### 17. 天生卡貓咪圖片：轉 WebP + 長效快取，減少重複下載

**問題：** 結果頁與分享卡共用的 5 張五行貓咪圖（`bazi-cat-wood/fire/earth/gold/water.png`）沒有設定任何 Cache-Control，每次進站、每次點「分享天生卡」都可能重新下載，浪費流量也拖慢載入速度。

**解法：**

1. 用 `sharp` 把 5 張 png 轉成 webp，體積省 64~82%（例如 water 282KB → 50KB）。
2. `next.config.js` 加 `headers()`，對 `/cats/:path*` 設 `Cache-Control: public, max-age=31536000, immutable`：

```js
async headers() {
  return [
    { source: '/cats/:path*', headers: [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ]},
  ];
},
```

3. 這個 header 同時讓走 `/_next/image` optimizer 的用法（`QASection.tsx`、`Header.tsx` 等）在正式環境自動繼承長效快取（Next 內部以 `Math.max(minimumCacheTTL, 上游 Cache-Control)` 決定 maxAge），不需要額外改動這些元件。開發模式下 Next 官方刻意強制 optimizer 走 `max-age=0`，方便本機隨時看到最新圖，屬預期行為。
4. 順手清掉 `public/cats/` 下 7 張沒被任何程式碼引用的舊圖，省約 4MB。

**學到的事：** 靜態圖片放在 `public/` 不會自動有長效快取；`next/image` 的 optimizer 快取只是 4 小時預設值（`minimumCacheTTL`），真正決定快取時間的還是原始檔案的 HTTP Cache-Control——在 `next.config.js` 用 `headers()` 統一設定，比逐一元件加 `unoptimized` 更省事也更一致。

---

### 18. 一人一次命盤限制忽略修正資料，導致填錯重填後仍看到舊結果

**問題發現：** 使用者回報流程：開始測算 → 登入 → 進入表單頁 → **填錯**生日送出 → 上一頁 → 改對日期 → **再送出一次** → `/result/[id]` 顯示的卻是**第一次填錯**的結果。

**根因：** `POST /api/calculate` 的「一般使用者限一次命盤」邏輯（防止重複呼叫 Gemini/Anthropic 增加成本）在查到 `createdBy` 已有既有 reading 時，直接 `return { id: doc.id }`，完全跳過驗證與重算——不管這次送出的表單資料是否跟舊的不同：

```ts
// 修前
if (createdBy && !isAdmin) {
  const existing = await db.collection('readings')
    .where('createdBy', '==', createdBy).orderBy('createdAt', 'desc').limit(1).get();
  if (!existing.empty) {
    const doc = existing.docs[0];
    return NextResponse.json({ id: doc.id }, { ... }); // 新資料整包被丟掉
  }
}
```

專案裡已經有「查看結果後想改日期」的正規流程（`request-correction` 使用者申請 → `approve-correction` admin 審核），但那是給**已經看過結果**之後的修正走的，跟這個「送出當下就填錯、根本還沒看到結果」的情境不是同一件事，不應該也要求 admin 審核。

**解法：** 用一個 session cookie（`bazi_viewed_reading`，httpOnly、無 maxAge，關瀏覽器即失效，不另外加資料庫欄位）標記「使用者本人已經打開過 `/result/[id]` 看過結果」，`GET /api/result/[id]` 在確認是本人（非 admin）造訪時寫入：

```ts
// result/[id]/route.ts
if (userId && !isAdmin && userId === createdBy) {
  response.cookies.set(VIEWED_READING_COOKIE, doc.id, { httpOnly: true, sameSite: 'lax', path: '/' });
}
```

`POST /api/calculate` 送出時，依「是否已查看」＋「這次資料是否跟舊的相同」決定要不要覆蓋重算，邏輯抽成獨立純函式 `resolveResubmitAction`（方便脫離 Firestore/AI API 單獨測試）：

```ts
// lib/reading-resubmit.ts
export function resolveResubmitAction(existing, incoming, hasBeenViewed) {
  const isSameInput = /* 逐欄位比對 name/gender/birthYear/Month/Day/Hour */;
  return hasBeenViewed || isSameInput ? 'reuse' : 'overwrite';
}
```

| 已查看？ | 資料是否相同 | 行為 |
|---|---|---|
| 否 | 不同 | **覆蓋既有 reading 重新計算**（填錯重填的情境） |
| 否 | 相同 | 沿用既有 id，不重算（避免重複點擊浪費 API 成本） |
| 是 | 不同 | 鎖住，沿用既有 id（要改請走 `request-correction` 給 admin 審核） |
| 是 | 相同 | 沿用既有 id |

**驗證方式：** 因為正式環境接的是真實 Firebase 專案（`bazi-4b8f0`）與真實付費 AI API，沒有 emulator，選擇不打真實 API/DB，改用 `tsx` 直接對 `resolveResubmitAction` 跑純邏輯測試，涵蓋上表四種組合，全數通過。

**學到的事：**

- 「一人限一次」這類防濫用規則，容易忽略「使用者根本還沒消費到這次額度、只是手滑填錯」的邊界情況——判斷條件不能只看「有沒有既有紀錄」，還要看「使用者是否已經真正拿到過這次的結果」。
- 「當下這次操作」的狀態（例如是否看過某個結果）優先用 session cookie 標記，不需要為此加一個永久資料庫欄位；資料庫欄位該留給真的需要跨裝置、跨 session 持久的資料。
- 沒有 emulator 的正式環境專案，驗證 bug fix 時把「會不會被鎖住/覆蓋」的決策邏輯抽成純函式獨立測試，是不牽動真實 API 費用與正式資料庫、又能實際跑過程式碼（而非用眼睛看 code review）的折衷做法。

---

### 19. Firestore 讀寫散落在 9 個 route.ts，改成 Repository + Service 分層

**問題發現：** `db.collection('readings')` / `db.collection('knowledge')` 直接寫死在 `calculate`、`result/[id]`、`recalculate`、`approve-correction`、`request-correction`、`generate-detail`、`user/reading`、`dashboard/readings`、`dashboard/readings/[id]`、`knowledge`、`knowledge/[id]` 共 11 個 route 檔案裡。除了 DB 呼叫本身散落，還有**業務流程重複**：`recalculate`、`approve-correction`、`dashboard/readings/[id]` PATCH 這 3 個 route 都各自貼了一份幾乎一樣的「重算 pillars → 查 knowledge → 算大運 → 呼叫 AI 生成 fortune → 存回 Firestore」流程；查 `knowledge` collection 的 tags 篩選邏輯甚至被複製貼上了 5 次（其中已有共用函式 `lib/reading-context.ts` 的 `buildReadingGenerationContext`，但有 4 處沒被呼叫，各自重寫了一份）。

**解法：** 比照後端 MVC 概念分三層，route.ts 只剩 thin controller：

```
route.ts (Controller)          — 驗證身份、解析 request、呼叫 service/repo、組裝 response
  ↓
reading-service.ts (Service)   — 業務邏輯：組 knowledge context、呼叫 AI、決定寫入欄位
  ↓
readings-repository.ts /
knowledge-repository.ts (Model) — 純 Firestore CRUD，不含任何業務邏輯
```

- `lib/repositories/readings-repository.ts`：`getById`、`create`、`update`、`delete`、`findLatestByUser`、`listForDashboard`、`countTodayQuestionsForUser`
- `lib/repositories/knowledge-repository.ts`：`listAll`、`create`、`update`、`delete`、`queryByTags`（取代 5 處重複的 tags 查詢 + fallback 邏輯）
- `lib/services/reading-service.ts`：`buildGenerationContext`（吃 `knowledgeRepository`，取代 `reading-context.ts`）、`createOrReuse`（首頁送出生日）、`regenerateFortune`（`recalculate` / `approve-correction` / `dashboard` 編輯三處共用，用 `extraFields` 參數帶入各自要多寫的欄位如 `correctionApproved`）、`askQuestion`、`generateDetail`、`requestCorrection`
- 業務層的預期錯誤（找不到資料、權限不足、超過提問額度）改用 `ServiceError`（帶 `status` + `payload`）拋出，route.ts 統一 `catch` 轉成對應 HTTP status，不用每個 route 各自判斷

`lib/reading-context.ts` 整個刪除，邏輯併入 `reading-service.ts`。`verifyAdmin`/`extractUid` 這類身份驗證邏輯這次沒有動，範圍只限 DB 操作與其直接相關的業務流程。

**驗證：** `npx tsc --noEmit` 與 `eslint` 全數通過；`grep -rn "db.collection(" src/app` 確認全專案只剩兩個 repository 檔案會碰 Firestore。

**學到的事：** 「重複的 DB 呼叫」和「重複的業務流程」是兩種不同層次的重複，只抽 Repository 只解決前者；`recalculate`/`approve-correction`/`dashboard 編輯` 三個 route 表面上是三個功能，本質上是同一段「重算命盤」邏輯配不同觸發來源與附加欄位，用一個 Service 方法 + 參數化的 `extraFields` 統一起來，之後要調整生成邏輯只需要改一個地方。

---

### 20. 建立 Vitest 測試框架：Node 版本相容性踩雷

**背景：** 專案裡完全沒有測試框架，#18 修 `resolveResubmitAction` 的 bug 時只能用 `tsx` 跑一次性腳本驗證，沒有留下可重複執行、可回歸的測試。決定針對純函式先補上正式的測試框架，第一支測試鎖定 `calculateBaziPillars`——用一組手動核對過的真實生日（1996/03/08 23:08 → 年柱丙子、月柱辛卯、日柱乙巳、時柱丙子）當 fixture，確保之後改動排盤演算法時能立刻抓到回歸錯誤。

**Node 版本踩雷過程：**

1. 先裝了 `vitest@^4.1.10`，執行時直接報錯：
   ```
   SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'
   ```
   查證後發現 Vitest 4.x 底層的 `rolldown` 依賴 `util.styleText`，這個 API 是 **Node 20.12.0** 才加入的，而開發機當時是 Node 18.17.0，物理上就跑不起來。

2. 嘗試升級到 Node 22（`nvm install 22` → 22.23.1），又撞到另一個問題：
   ```
   Cannot find module '@rolldown/binding-darwin-arm64'
   ```
   這是已知的 npm optional dependency 安裝問題（[npm/cli#4828](https://github.com/npm/cli/issues/4828)），在 workspace 環境下原生綁定沒有正確安裝。

3. 權衡之後決定不追新版：改裝 `vitest@^3.2.7`（不依賴 rolldown 的原生綁定），搭配 Node **20.9.0** 即可正常執行，不需要動到全域 Node 版本或折騰 npm 的 optional deps bug。

**最終設定：**

```
.nvmrc                          → 20.9.0（鎖定版本，避免團隊/CI 環境漂移）
apps/bazi/vitest.config.ts      → environment: 'node'，只收 src/**/*.test.ts
apps/bazi/package.json          → "test": "vitest run"，devDependency vitest@^3.2.7
apps/bazi/src/app/lib/bazi-calculator.test.ts
```

```ts
// bazi-calculator.test.ts
it('1996/03/08 23:08 → 丙子 / 辛卯 / 乙巳 / 丙子', () => {
  const pillars = calculateBaziPillars(1996, 3, 8, 23);
  expect(`${pillars.year.stem}${pillars.year.branch}`).toBe('丙子');
  expect(`${pillars.month.stem}${pillars.month.branch}`).toBe('辛卯');
  expect(`${pillars.day.stem}${pillars.day.branch}`).toBe('乙巳');
  expect(`${pillars.hour?.stem}${pillars.hour?.branch}`).toBe('丙子');
});
```

**學到的事：**

- 挑測試框架版本不能只看功能，要先確認底層工具鏈（這裡是 rolldown/esbuild）對 Node 版本的硬性要求，尤其是主版本剛升級不久的套件（Vitest 4.x）常會把底層引擎也一併換代。
- 遇到 npm optional dependency 缺失的錯誤，`rm -rf node_modules && npm i` 不是唯一解法——先評估「降級到相容版本」是不是風險更低、影響範圍更小的做法，尤其在 monorepo 裡整個重裝 `node_modules` 會牽動所有 app。
- `.nvmrc` 應該在專案一開始就鎖定，而不是等到裝套件炸掉才回頭補——這次踩雷完全是因為本機 Node 版本跟套件需求不同步導致的。

---

## 待辦事項

- [ ] 啟用 Firestore API（`bazi-4b8f0` 專案）
- [ ] 取得 Google AI API Key 並填入 `.env.local`
- [ ] 測試 YouTube 字幕解析流程
- [ ] 確認標籤篩選是否正確影響 AI 分析結果
- [ ] Vercel 部署環境變數設定
- [ ] 補 `reading-resubmit.ts`（`resolveResubmitAction`）與 `detect-browser.ts`（`isInAppBrowser` 等）的 Vitest 測試
