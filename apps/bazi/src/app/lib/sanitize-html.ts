import DOMPurify from 'isomorphic-dompurify';

// fortune 內容由 AI 生成後存進 Firestore，Firestore rules 目前允許任何登入者直接改寫資料庫，
// 等於這裡收到的字串不能假設是安全的，渲染前一律要清掉可執行的標籤/屬性（script、onerror 等）。
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}
