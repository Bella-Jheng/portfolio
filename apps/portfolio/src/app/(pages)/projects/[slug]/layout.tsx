import { PROJECTS_DATA_ZH } from '../../../api/data/projects-data-zh';

/**
 * 在 build 時就把每個作品詳細頁產生成靜態頁。
 * 不這樣做的話，詳細頁每次點擊都要等 Vercel 喚醒伺服器即時產生（冷啟動可能好幾秒），
 * 等待期間畫面完全沒反應，看起來就像「卡片點了沒用」。
 * 靜態頁可以在卡片出現在畫面上時就先預載，點下去立刻換頁。
 */
export function generateStaticParams() {
  return PROJECTS_DATA_ZH.map((p) => ({
    slug: p.link.split('/').filter(Boolean).pop() as string,
  }));
}

export default function ProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
