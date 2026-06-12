'use client';

const TOC_ITEMS = [
  { num: '一', title: '大運×流年解析', desc: '當前大運流年交互影響與趨勢解析',                      tabIdx: 0 },
  { num: '二', title: '個性特質',      desc: '命格解讀、十神分析與內外在性格全觀',                  tabIdx: 1 },
  { num: '三', title: '財運狀況',      desc: '天生財庫、求財機遇與守財防漏財指南',                  tabIdx: 2 },
  { num: '四', title: '工作事業',      desc: '適合行業職能定位與職場開運策略',                      tabIdx: 3 },
  { num: '五', title: '感情桃花',      desc: '姻緣時機、桃花強弱與感情相處建議',                    tabIdx: 4 },
  { num: '六', title: '健康狀況',      desc: '經絡臟腑五行對應與日常養生保養',                      tabIdx: 5 },
  { num: '七', title: '補運建議',      desc: '喜用神開運方位、幸運顏色與生肖速查',                  tabIdx: 6 },
  { num: '八', title: '年度行動建議',  desc: `${new Date().getFullYear()} 流年特別提示與具體行事準則`, tabIdx: 7 },
];

interface TocListProps {
  onTabSelect?: (tabIdx: number) => void;
}

export function TocList({ onTabSelect }: TocListProps) {
  return (
    <div className="w-full lg:w-1/2 flex flex-col border border-[#EAE5DF] rounded-2xl p-5 h-full">
      <div className="flex items-center gap-2 mb-3 border-b border-[#EAE5DF]/60 pb-2">
        <span className="text-base">📖</span>
        <h3 className="font-black text-sm tracking-wider text-[#4A4A4A]">章節內容</h3>
        <span className="text-[10px] text-[#9A9088] ml-1">點擊可查看</span>
      </div>
      <div className="space-y-1 text-xs overflow-y-auto pr-1 flex-1">
        {TOC_ITEMS.map(({ num, title, desc, tabIdx }) => (
          <button
            key={num}
            onClick={() => onTabSelect?.(tabIdx)}
            className={`flex items-start gap-2 w-full text-left rounded-lg px-2 py-1.5 -mx-2 transition-colors group ${
              onTabSelect ? 'hover:bg-[#EAE5DF] cursor-pointer' : 'cursor-default'
            }`}
          >
            <span className="font-bold text-[#6B6159] shrink-0 w-4 mt-0.5">{num}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-[#4A4A4A] ${onTabSelect ? 'group-hover:underline underline-offset-2' : ''}`}>{title}</p>
              <p className="text-[10px] text-[#5C5449] mt-0.5">{desc}</p>
            </div>
            <svg className="w-3 h-3 text-[#C4BDB5] group-hover:text-[#7A6E65] shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
