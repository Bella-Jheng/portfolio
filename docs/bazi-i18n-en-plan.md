# apps/bazi 英文版規劃

目前 apps/bazi 完全沒有任何 i18n 基礎設施（沒裝 next-intl/react-intl，沒有 `[locale]` 路由，沒有 middleware），語言寫死在 `<html lang="zh-TW">`。中文字串遍布 63 個檔案、約 9,251 個字元，且部分中文字其實是程式內部的型別識別值，不只是顯示文字，所以這不是單純的「換語言包」工程。

## 1. i18n 基礎架構（第一步，所有東西的前提）

- 選定方案（next-intl 是目前 App Router 最常用的，repo 內其他 app 也沒有先例可參考，算是全新建置）
- 建立語言路由（`[locale]` segment 或 cookie/path 切換）
- 新增 `middleware.ts` 處理語言偵測與導流
- `apps/bazi/src/app/(pages)/layout.tsx` 的 `<html lang>`、`metadata.openGraph.locale`、title/description 改成依語言動態產生

## 2. 命理術語資料層（風險最高，不是單純翻譯）

- `apps/bazi/src/app/lib/bazi-calculator.ts`：`TenGod`、`DayMasterStrength` 是中文字面值的 TypeScript union type，貫穿整個程式邏輯與回傳值，不能直接改字串，需要額外包一層「中文值轉英文顯示」的 mapping layer
- `apps/bazi/src/app/types/bazi.ts`：`KNOWLEDGE_TAGS`（中文 key）、`SHICHEN`（十二時辰）同樣需要對應的英文顯示層
- 需要先決定八字術語的英譯策略：用拼音（Bi Jian、Jie Cai）還是意譯（Rob Wealth 等命理界慣用譯名），這會影響後面所有翻譯的一致性

## 3. AI 生成內容層

- `apps/bazi/src/app/lib/anthropic.ts`：三個 prompt builder（命盤解讀、詳細分析、自訂問答）目前明確要求 AI 輸出繁體中文，需改成依語言參數切換輸出語言指令，且用詞要跟第 2 項的術語 mapping 一致
- `suggestKnowledgeTags` 的中文 tag 比對邏輯要處理雙語

## 4. API 錯誤訊息

- `src/app/api/**/route.ts` 底下多個 route（calculate、feedback、result、youtube-transcript）目前直接回傳中文字串當作 API 回應內容，前端直接顯示，需要改成 error code 或依語言回傳訊息

## 5. UI 文案（使用者會看到的部分）

主要集中在：

- 首頁 `page.tsx`（slogan、步驟、特色）
- `BirthForm`、`KnowledgeForm`
- 結果頁一系列 slides（`result-display/` 下約 15 個檔案）
- `Header`/`Footer`、`GoogleLoginButton`（登入文字）
- `modal-store.ts` 相關的 alert/confirm 文案

可以先排除、暫不處理的：`dashboard`、`knowledge`、`test` 頁面是 admin-only 工具，不影響一般使用者體驗，可晚點做或永遠留中文。

## 6. 日期格式

- 4 處 `toLocaleDateString('zh-TW')`（feedback、dashboard、KnowledgeForm）要依語言動態切換

## 7. SEO

- 英文版 title/description 需要重新想英文關鍵字，不是直接翻譯中文版（中文版用的是「八字算命」「命格貓」這類中文 SEO 字）

## 8. 法律頁面

- 目前完全沒有 Terms/Privacy 頁面，如果英文版要對外上線（尤其牽涉 Google OAuth），可能需要補這塊，中英文都要生

## 待決定事項

1. 要做完整雙語切換，還是先出一個純英文版本（之後再補切換器）？
2. admin 工具頁面要不要翻？
3. 八字術語用拼音還是意譯？
