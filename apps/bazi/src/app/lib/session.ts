// 登入後最多維持 7 天，超過就強制登出、需要重新登入，避免共用裝置或遺失的手機一直保持登入
// 前端（auth-context）與後端（verify-id-token）共用同一個時限
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// signedInAtMs：最後一次「實際登入」的時間（毫秒）；token 自動續期不算
export function getSessionRemainingMs(signedInAtMs: number, nowMs = Date.now()): number {
  return signedInAtMs + SESSION_MAX_AGE_MS - nowMs;
}
