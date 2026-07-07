import styles from '../../styles/bazi-content.module.css';
import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';

interface PersonalitySummaryCardProps {
  reading: Reading;
  theme: MagazineTheme;
}

export function PersonalitySummaryCard({ reading, theme }: PersonalitySummaryCardProps) {
  const { personality } = reading.fortune;

  return (
    <div
      className="relative w-full lg:w-1/2 flex flex-col h-full rounded-2xl p-5 overflow-hidden"
      style={{ backgroundColor: `${theme.accent}0D`, border: `1px solid ${theme.accent}30` }}
    >
      <span
        className="absolute -right-3 -top-6 text-[7rem] leading-none select-none pointer-events-none"
        style={{ color: theme.accent, opacity: 0.12 }}
      >
        ❝
      </span>

      <div className="flex items-center gap-2 mb-3 border-b pb-2 relative z-10" style={{ borderColor: `${theme.accent}30` }}>
        <span className="text-base">✨</span>
        <h3 className="font-black text-sm tracking-wider" style={{ color: theme.accent }}>命主特質速覽</h3>
      </div>

      {personality ? (
        <div
          className={`${styles.htmlContent} flex-1 overflow-y-auto relative z-10`}
          dangerouslySetInnerHTML={{ __html: personality }}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#9A9088] relative z-10">
          <span className="text-2xl">🔍</span>
          <p className="text-xs">尚未生成性格分析</p>
        </div>
      )}
    </div>
  );
}
