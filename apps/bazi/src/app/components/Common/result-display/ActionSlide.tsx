function splitIntoActions(text: string): string[] {
  if (!text) return [];
  const numbered = text
    .split(/\n?\d+[.、．]\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (numbered.length > 1) return numbered.slice(0, 5);
  return text
    .split(/[。\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .slice(0, 5);
}

interface ActionSlideProps {
  actionsText?: string;
  accentColor: string;
  mobile?: boolean;
}

export function ActionSlide({ actionsText, accentColor, mobile }: ActionSlideProps) {
  if (!actionsText) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full py-12 text-[#636363]">
        <span className="text-4xl mb-3">🎯</span>
        <p className="text-sm">尚未有行動建議資料，可使用下方 Admin 重新排盤</p>
      </div>
    );
  }

  const actions = splitIntoActions(actionsText);

  return (
    <div className="space-y-6 w-full h-full flex flex-col justify-start text-left">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <h2 className="text-xl font-black tracking-widest text-[#4A4A4A]">年度重點行動建議</h2>
        <div className="h-px flex-1 bg-[#EAE5DF]" />
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 pr-2 ${mobile ? '' : 'flex-1 overflow-y-auto'}`}>
        {actions.map((action, i) => (
          <div
            key={i}
            className="bg-[#FAF7F4] border border-[#EAE5DF] rounded-2xl p-5 flex items-start gap-4 hover:shadow-sm transition-all"
          >
            <span
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
              style={{ backgroundColor: accentColor }}
            >
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed text-[#6B5D57] font-semibold pt-0.5">{action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
