/** 每次換頁重新掛載：頁面內容淡入。只動 opacity，不會影響頁面裡 fixed 定位的元素 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
