import styles from '../../styles/bazi-content.module.css';

function splitIntoPoints(text: string): string[] {
  if (!text) return [];
  const sentences = text
    .split(/(?<=[。！？])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 1);
  if (sentences.length > 1) return sentences;
  return text
    .split('，')
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 3)
    .slice(0, 6);
}

interface StandardSlideProps {
  title: string;
  emoji: string;
  content?: string;
  accentColor: string;
  mobile?: boolean;
  tabNum?: string;
  subtitle?: string;
  renderAsHtml?: boolean;
}

export function StandardSlide({ title, emoji, content, accentColor, mobile, tabNum, subtitle, renderAsHtml }: StandardSlideProps) {
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

  if (renderAsHtml) {
    return (
      <div className="flex flex-col w-full h-full text-left gap-5">
        {header}
        <div
          className={`${styles.htmlContent} ${mobile ? '' : 'flex-1 overflow-y-auto'}`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  const points = splitIntoPoints(content);

  return (
    <div className="flex flex-col w-full h-full text-left gap-5">
      {header}
      <div className={`space-y-4 pr-2 ${mobile ? '' : 'flex-1 overflow-y-auto'}`}>
        {points.map((point, index) => (
          <p
            key={index}
            className="text-sm leading-relaxed text-[#6B5D57] font-medium pl-3 border-l-2"
            style={{ borderColor: accentColor }}
          >
            {point}
          </p>
        ))}
      </div>
    </div>
  );
}
