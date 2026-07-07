import styles from '../../styles/bazi-content.module.css';

interface StandardSlideProps {
  title: string;
  emoji: string;
  content?: string;
  detail?: string;
  accentColor: string;
  mobile?: boolean;
  tabNum?: string;
  subtitle?: string;
}

export function StandardSlide({ title, emoji, content, detail, accentColor, tabNum, subtitle }: StandardSlideProps) {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full py-12 text-[#636363]">
        <span className="text-4xl mb-3">🔍</span>
        <p className="text-sm">尚未有此項解析資料，可使用下方 Admin 重新排盤</p>
      </div>
    );
  }

  const header = (
    <div className="shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        {tabNum && (
          <span className="text-sm font-bold font-mono" style={{ color: accentColor }}>{tabNum}</span>
        )}
        <h2 className="text-xl font-black tracking-widest text-[#4A4A4A]">{title}</h2>
        <div className="h-px flex-1" style={{ backgroundColor: accentColor + '60' }} />
      </div>
      {subtitle && (
        <p className="text-sm text-[#9A9A9A] mt-1 pl-1">{subtitle}</p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full text-left gap-5">
      {header}
      <div
        className={`${styles.htmlContent} pl-3 border-l-2`}
        style={{ borderColor: accentColor }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {detail && (
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-[#EAE5DF]" />
            <span className="text-[10px] font-mono tracking-widest text-[#B0A898] uppercase shrink-0">完整分析</span>
            <div className="flex-1 border-t border-[#EAE5DF]" />
          </div>
          <div className={styles.htmlContent} dangerouslySetInnerHTML={{ __html: detail }} />
        </div>
      )}
    </div>
  );
}
