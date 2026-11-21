import { calculateBaziPillars } from '../bazi-calculator';
import type { FortuneReading } from '../../types/bazi';

/**
 * 訪客 Demo 的範例命盤（虛構人物，不是真人的資料）。
 *
 * 想換成真的 AI 排出來的內容：用管理員帳號替一個虛構人物排盤（建議把每個「完整分析」都點開生成好），
 * 再把那份命盤的 id 填到環境變數 DEMO_TEMPLATE_READING_ID，範例就會改成複製那一份（提問紀錄不會帶過去）。
 * 沒填時用下面這份內建的範例。
 */

export const DEMO_BIRTH = { name: '體驗小貓', gender: 'female' as const, birthYear: 1995, birthMonth: 8, birthDay: 15, birthHour: 10 };

const p = (...lines: string[]) => lines.map((line) => `<p>${line}</p>`).join('');

// 內建範例（乙亥 甲申 戊寅 丁巳，戊土日主）。格式跟 AI 回傳的一樣，結果頁的格局、用神標籤才解析得出來
const FALLBACK_FORTUNE: FortuneReading = {
  traits: '穩重・可靠・責任感',
  personality:
    '你給人的第一印象是穩穩的、讓人安心，朋友遇到事情常常第一個想到找你商量。做決定前習慣把每個環節想清楚，不喜歡臨時改計畫；一旦答應別人的事就會做到。壓力來的時候你會先自己扛，比較少說出口，偶爾要記得讓身邊的人分擔一點。',
  fortune: '今年整體是「先整理、再出發」的一年，把手上的事情收尾好，下半年會比較順。',
  wealth: p('今年的錢比較適合穩穩存，不適合追高或跟風投資。', '把固定支出整理一次，你會發現可以多存下一筆。'),
  wealthDetail: p(
    '財運重點在「守」：收入穩定，但臨時的人情支出偏多，建議預留一筆機動預算。',
    '下半年有機會因為工作表現拿到額外獎金，拿到後先存起來再決定用途。',
  ),
  career: p('工作上會被交付更多責任，是被看見的好機會。', '主動把做過的成果整理成紀錄，年底談加薪時很有用。'),
  careerDetail: p(
    '主管對你的信任感提高，容易被指派跨部門的協調工作。',
    '適合學一個新工具或新技能，明年會派上用場；換工作的話建議等到下半年再行動。',
  ),
  romance: p('感情上適合放慢腳步，多聊天、多了解對方。', '單身的人容易在朋友聚會或工作場合認識新對象。'),
  romanceDetail: p(
    '桃花時機在春天和秋天，對方多半是個性開朗、話比較多的人。',
    '有伴的人今年要多留意溝通方式，把想法說出來，不要讓對方用猜的。',
  ),
  health: p('注意腸胃和睡眠，壓力大的時候特別容易反映在身體上。', '規律吃飯、每天走走路，就是最好的保養。'),
  healthDetail: p('秋冬換季時容易疲倦，記得早點休息。', '久坐的話每小時起來活動一下，肩頸會舒服很多。'),
  remedy: p('幸運色是紅色、橘色和米黃色；可以多往南方走走。', '飾品可以選暖色系的石頭，或是陶瓷小物放在桌上。'),
  remedyDetail: p(
    '辦公桌可以放一盞暖色的小燈，或擺一個陶土材質的小盆栽。',
    '重要的會議穿一點紅色或橘色，會讓你比較有自信、說話更有說服力。',
  ),
  actions: '1. 每個月固定存下一筆錢，金額不用大但要持續\n2. 把今年做過的成果整理成一份清單\n3. 每週安排一個完全不碰工作的晚上\n4. 春天和秋天多參加朋友聚會',
  cycleAnalysis: p('今年像是在打地基：前半年事情多、比較忙，後半年開始看到成果。', '適合學習、整理和建立習慣，不適合衝動做大決定。'),
  cycleAnalysisDetail: p(
    '上半年貴人運不錯，遇到困難時願意開口求助，事情會比想像中順利。',
    '下半年適合把累積的實力拿出來，爭取新的機會或新的角色。',
  ),
  monthlyFortune: p('這個月適合把延宕已久的事情一次處理完，心情會輕鬆很多。'),
  monthlyFortuneDetail: p('月中容易有臨時的工作插進來，行程記得留一點彈性。', '月底適合跟好朋友聚一聚，充個電。'),
  tenGodAnalysis:
    '【格局】七殺格｜身弱｜用神：火、土｜忌神：木、水\n' +
    '【核心性格】做事認真、責任感重，習慣把事情扛在自己身上。\n' +
    '【優勢能力】抗壓性高，越是緊急的狀況越能冷靜處理。\n' +
    '【潛在風險】容易給自己太大壓力，忽略休息。\n' +
    '【事業方向】適合需要穩定執行力的工作，例如管理、專案協調。\n' +
    '【感情特質】欣賞有能力、有主見的另一半，相處上需要多一點表達。\n' +
    '【格局影響】身弱的人遇到壓力要懂得借力，多找可以信任的夥伴一起分擔。',
  tenGodAnalysisDetail: p(
    '主星是七殺：月干透出甲木，代表外在的挑戰和壓力會推著你成長。',
    '日主戊土生在申月，不得令；年支亥水、月支申金又洩弱土氣，整體偏弱，所以用神取生扶日主的火和土。',
    '遇到壓力大的時候，找可以依靠的長輩或前輩（印星）幫忙，是最適合你的解法。',
  ),
};

/** 內建範例命盤的內容（不含 id、建立者、時間），每次都用計算器算出四柱，跟出生資料保證一致 */
export function fallbackDemoReading(): Record<string, unknown> {
  const { birthYear, birthMonth, birthDay, birthHour } = DEMO_BIRTH;
  return {
    ...DEMO_BIRTH,
    pillars: calculateBaziPillars(birthYear, birthMonth, birthDay, birthHour),
    fortune: FALLBACK_FORTUNE,
  };
}

/** 從範本命盤複製要給訪客看的欄位（提問、更改日期、管理員資料都不帶過去） */
export function fromTemplate(template: Record<string, unknown>): Record<string, unknown> {
  const keep = ['gender', 'birthYear', 'birthMonth', 'birthDay', 'birthHour', 'pillars', 'fortune', 'fortuneEn'];
  const picked = Object.fromEntries(keep.filter((key) => template[key] !== undefined).map((key) => [key, template[key]]));
  return { ...picked, name: DEMO_BIRTH.name };
}
