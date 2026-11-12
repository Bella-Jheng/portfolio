# Claude 工作規範

## Commit 訊息：一律遵守 commitlint

所有 commit 都必須通過 repo 的 commitlint 規則，規則以根目錄的 `commitlint.config.js` 為準（若有更新，以該檔案為主）。

- 格式：`type(scope): subject`，整行（header）不超過 100 字
- `type`：conventional 清單之一 —— `feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `build` / `ci` / `chore` / `revert`
- `scope`：不可空白，只能是 `commitlint.config.js` 裡 `allowedScopes` 列出的值（目前為 `root`、`apps/portfolio`、`apps/bazi`、`apps/order`、`apps/rental`），或 `libs`、`libs/子路徑`
  - 用完整路徑，例如 `apps/bazi`，**不可**寫成 `bazi`
  - 改到多個 app 或根目錄設定時用 `root`
- body 每行建議不超過 120 字
- 範例：`feat(apps/bazi): add feedback widget and admin feedback review page`

### 提交前檢查

- commit 前先確認依賴已安裝（`node_modules` 存在），讓 husky 的 `commit-msg`（commitlint）與 `pre-commit`（tsc、lint-staged）真的會執行
- 不確定訊息是否合規時，先用 `echo "<訊息>" | npx --no -- commitlint` 驗證
- **禁止**用 `--no-verify` 或任何方式跳過 husky 檢查
- PR 標題同樣使用上述格式
