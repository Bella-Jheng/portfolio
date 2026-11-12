# 租屋小幫手（apps/rental）

找房時把租屋截圖丟進來，AI 自動讀出地址、租金、房型、聯絡電話和 LINE，標在 Google 地圖上，再一鍵產生私訊範本。

## 功能

- **地圖首頁**：每間房間以價格標籤顯示，依狀態上色：尚未聯絡（橘）、已聯絡（藍）、已看房（綠）、最想要（粉，有愛心）、已出租（灰）；上方可篩選狀態、切換地圖或清單
- **上傳截圖解析**：一次最多 6 張，可以設定「同一間物件」或「每張各一間」；AI 沒把握的欄位會用黃色標出
- **詳細頁**：所有欄位都能就地編輯；電話可直接撥打，LINE ID 可直接開 LINE（官方帳號 @ID、一般 ID、「LINE 同電話」三種情況都有處理）
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
| `APP_ACCESS_CODE` | 建議設定。設了之後要輸入存取碼才能呼叫 AI，避免網址外流後被別人消耗額度 |

沒有設定 Maps key 也能用清單、解析和私訊，只是不會顯示地圖。

## 部署（Vercel）

Build 設定已經寫在 `vercel.json`，在 Vercel 匯入時只要設定兩件事：

1. Vercel → Add New → Project → Import `Bella-Jheng/portfolio`
2. **Root Directory** 選 `apps/rental`，Framework 會自動抓成 Next.js
3. 在 Environment Variables 填入上面的變數，按 Deploy

之後每個 PR 都會自動產生 Preview 網址。

## 資料存在哪裡

v1 的資料存在**這台裝置的瀏覽器**（localStorage，`src/lib/store.ts`）。換手機或清掉瀏覽器資料後，資料就會不見。要跟一起找房的人共用，可以把 store 換成 Firestore（apps/bazi 已經有 Firebase 設定可以參考），畫面元件不需要改。

截圖本身不會保存，只留一張縮小的縮圖。
