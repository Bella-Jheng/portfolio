/*
  commit 範例：feat(apps/bazi): add feedback widget and admin feedback review page

  規則：
  type 不可空白，需在 conventional 預設清單中（feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert）
  scope 不可空白，需為 root / apps/portfolio / apps/bazi，或 libs、libs/子路徑
  header（type(scope): subject）總長度不得超過 100 字
*/

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-case': [0],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 120],
    'custom-scope-enum': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'custom-scope-enum': ({ scope }) => {
          const allowedScopes = ['root', 'apps/portfolio', 'apps/bazi'];

          if (!scope || scope.trim().length === 0) return [false, 'scope 不可為空'];
          if (scope === 'libs' || scope.startsWith('libs/')) return [true];
          if (allowedScopes.includes(scope)) return [true];

          return [
            false,
            `不合法的 scope：「${scope}」，請使用以下其中之一：\n  - ${allowedScopes.join(
              '\n  - '
            )}\n  - libs 或 libs/子路徑`,
          ];
        },
      },
    },
  ],
};
