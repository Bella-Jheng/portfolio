# Order（訂單管理頁）

獨立的 Nx / Next.js App Router 專案，完全獨立、無跨專案依賴。

## 啟動方式

在 monorepo 根目錄執行（Nx 會依 `project.json` 找到這個 app）：

```bash
npx nx serve order      # 開發模式，預設 port 42421
npx nx build order      # 產出 build
```

單元測試（在 `apps/order` 目錄下）：

```bash
cd apps/order
npx vitest run
```

## 頁面能力對照需求

- 訂單列表：編號 / 客戶名稱 / 來源 / 狀態 / 金額 / 建立時間，桌機為表格、手機為卡片。
- 關鍵字搜尋（編號、客戶名稱皆可比對，忽略大小寫）。
- 狀態篩選（全部 / pending / paid / cancelled）與來源篩選（全部 / web / app / pos）。
- 依「建立時間」或「金額」排序，可切換遞增 / 遞減。
- 點擊列表項目後，右側（桌機）或下方（手機）顯示訂單明細。
- 明細內可變更狀態，成功後列表、明細、統計卡片會同步更新（見下方「狀態同步」）。
- 統計卡片：總訂單數、已付款金額總和、待處理訂單數、取消訂單數。
- Empty state（搜尋不到資料）、Loading state（skeleton，模擬 300~800ms 延遲）皆有處理。
- 搜尋欄有 400ms debounce，篩選 / 排序 / 搜尋 / 選取的訂單皆反映在 URL query string 上，可分享網址還原畫面狀態。

## 架構

```
src/app/
  types/order.ts            # Order / OrderItem / OrderStatus / OrderSource 型別定義
  api/
    data/orders.json         # 假資料（唯一的原始資料來源）
    repository/
      orders-repository.ts   # 資料存取層：讀取 JSON、過濾/排序、統計，純函式方便測試
      orders-repository.test.ts
      simulate-delay.ts      # 模擬 300~800ms 網路延遲
    orders/
      route.ts                # GET /api/orders            列表（支援 search/status/source/sort）
      stats/route.ts           # GET /api/orders/stats       統計（永遠以「全部訂單」計算，不受篩選影響）
      [id]/route.ts            # GET/PATCH /api/orders/:id   明細 / 修改狀態
    orders-api.ts             # 前端 API 層：fetch 包裝 + React Query hooks
    orders-api.type.ts        # API 請求/回應型別
  hooks/
    use-order-query-params.ts  # URL query string 作為篩選/排序/選取狀態的唯一來源
    use-debounced-value.ts
  components/
    order-page/               # 容器元件：組裝以下元件、管理資料流
    order-stats-cards/
    order-filter-bar/
    order-list/
    order-detail-panel/
    order-status-badge/
    confirm-dialog/            # 確認對話框，受控 props 驅動
    loading-skeleton/
  providers/query-provider.tsx # 獨立的 React Query Provider
```

資料流是單向的：畫面元件只透過 `orders-api.ts` 的 hooks 溝通，完全不知道背後是 JSON 檔案；`orders-api.ts` 呼叫 Next.js route handler（`/api/orders/*`），route handler 再呼叫 `orders-repository.ts` 做實際的過濾/排序/統計。之後若要換成真的後端，只需要替換 `orders-repository.ts` 內部實作，UI 與 route 的介面不需要變動。

## 狀態管理與取捨

- **沒有另外導入 Zustand / Redux**：篩選條件、排序、目前選取的訂單，天生就是「可以被分享的畫面狀態」，所以直接用 URL query string（`useOrderQueryParams`）當作唯一來源，不再另外用一份 client store 存重複的狀態。這是刻意的取捨，避免題目提醒的「過度設計」。
- **伺服器資料一律交給 React Query**：`orders`、`orders/stats`、`orders/:id` 各自是獨立的 query，透過 `queryKey` 依賴篩選條件自動重新抓取，並用 `placeholderData` 保留上一頁資料，避免篩選時畫面整個閃爍成 Loading。
- **狀態同步**：`useUpdateOrderStatus` 在 PATCH 成功後，直接用 `setQueryData` 更新明細與列表快取中對應的那一筆訂單（避免不必要的重新 fetch 造成閃爍），並 `invalidateQueries` 讓統計卡片重新計算（因為總額/各狀態數量需要重新加總）。
- **統計永遠以全部訂單計算**：`/api/orders/stats` 不吃篩選參數，代表「目前所有訂單的總覽」，不會因為你正在搜尋而讓總覽數字跟著變動。這是一個假設，如果需求其實是「篩選後的統計」，只要把 `stats/route.ts` 改成接受同樣的 query params 並呼叫 `filterAndSortOrders` 即可。
- **computed / memoization**：`filterAndSortOrders`、`computeOrderStats` 皆為純函式，過濾/排序邏輯放在 route handler（模擬真實後端行為），前端只用 `useMemo` 組裝 query 參數物件，避免每次 render 都建立新的 query key 造成多餘的 refetch。

## Loading 與確認對話框

局部 loading 用單純的 skeleton（`loading-skeleton.tsx`），動畫透過 Tailwind config 的 `shimmer` keyframe 完成，沒有額外寫 global CSS。

`ConfirmDialog` 是遮罩 + 對話框 + 取消/確認按鈕的單純 props 驅動元件，只在「取消訂單」這種不可逆動作時跳出確認。

## 已知限制

- 假資料存在記憶體中（route handler 內的模組變數），重啟開發伺服器後狀態會重置，這是符合題目「本地假資料」情境下的合理簡化，不是真正的持久化。
- 搜尋/排序目前皆在 route handler 端處理（模擬真實 API 行為），資料量以目前的假資料規模來說沒有分頁需求，故未實作 pagination。
