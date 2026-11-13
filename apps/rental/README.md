# 租屋小幫手（apps/rental）

找房時把租屋截圖丟進來，AI 自動讀出地址、租金、房型、聯絡電話和 LINE，標在 Google 地圖上，再一鍵產生私訊範本。

## 功能

- **地圖首頁**：每間房間以價格標籤顯示，依狀態上色：尚未聯絡、已聯絡、已看房、已出租；「最想要」是獨立的愛心，可以跟任何狀態同時存在，地圖標籤上會顯示愛心；上方可篩選狀態，底部導覽列切換地圖或清單
- **上傳截圖解析**：一次最多 6 張，可以設定「同一間物件」或「每張各一間」；AI 沒把握的欄位會用黃色標出
- **詳細頁**：所有欄位都能就地編輯；可以切換來源（591／FB 社團／IG／其他）並貼上房源出處連結（貼 591、FB、IG 的網址會自動切換來源）；電話可直接撥打，LINE ID 可直接開 LINE（官方帳號 @ID、一般 ID、「LINE 同電話」三種情況都有處理）
- **備註**：依日期記錄，最新一條會顯示在地圖和清單卡片上
- **私訊範本**：詢問是否還在、約看房、問細節，會自動帶入聯絡人、租金和物件編號，產生後可以再修改再複製

## 開發

```bash
cp apps/rental/.env.template apps/rental/.env.local   # 填入 key
npx nx serve rental                                    # http://localhost:42422
npx nx build rental
```

環境變數的說明寫在 `.env.template`：

| 變數 | 用途 |
| --- | --- |
| `GOOGLE_AI_API_KEY` | Gemini 解析截圖，可以跟 apps/bazi 共用同一把 |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | 地圖顯示和地址轉座標，要啟用 Maps JavaScript API 和 Geocoding API，並限制 HTTP referrer |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Advanced Marker 需要 Map ID；沒填會用 `DEMO_MAP_ID`（只適合開發） |
| `NEXT_PUBLIC_FIREBASE_API_KEY`、`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`、`NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Google 登入（Firebase Authentication），可以跟 apps/bazi 共用同一個專案；要在 Firebase 的 Authorized domains 加上這個網站的網域 |
| `FIREBASE_PROJECT_ID`、`FIREBASE_CLIENT_EMAIL`、`FIREBASE_PRIVATE_KEY` | Firebase 服務帳號，後端用來驗證登入憑證、讀取 Firestore 的允許名單；跟 apps/bazi 同一組即可 |

沒有設定 Maps key 也能用清單、解析和私訊，只是不會顯示地圖。

## 誰可以用 AI 解析

後端會驗證 Google 登入憑證，再到 Firestore 的 **`rentalAllowedUsers`** 集合確認，只有名單裡的帳號能呼叫 AI，避免網址外流後被別人消耗額度。名單只在伺服器端讀取，不會出現在前端。

新增使用者：Firebase Console → Firestore Database → `rentalAllowedUsers` 集合（第一次要先「開始集合」建立）→ 新增文件

- **文件 ID**：對方的 Google email，**全部小寫**（例如 `you@gmail.com`）
- 欄位：Firestore 規定至少要一個欄位，隨便填就好，例如 `name`（字串）：`我自己`

移除使用者：把那份文件刪掉即可，不需要重新部署。

## 部署（Vercel）

Build 設定已經寫在 `vercel.json`，在 Vercel 匯入時只要設定兩件事：

1. Vercel → Add New → Project → Import `Bella-Jheng/portfolio`
2. **Root Directory** 選 `apps/rental`，Framework 會自動抓成 Next.js
3. 在 Environment Variables 填入上面的變數，按 Deploy

之後每個 PR 都會自動產生 Preview 網址。

## 資料存在哪裡

v1 的資料存在**這台裝置的瀏覽器**（localStorage，`src/lib/store.ts`）。換手機或清掉瀏覽器資料後，資料就會不見。要跟一起找房的人共用，可以把 store 換成 Firestore（apps/bazi 已經有 Firebase 設定可以參考），畫面元件不需要改。

截圖本身不會保存，只留一張縮小的縮圖。
