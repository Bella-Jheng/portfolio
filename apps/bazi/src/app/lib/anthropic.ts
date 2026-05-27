import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BaziPillars, FortuneReading, Gender } from '../types/bazi';
import { formatPillarsForPrompt } from './bazi-calculator';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

function sanitizeJsonControlChars(input: string): string {
  let inString = false;
  let escaped = false;
  let result = '';
  for (const char of input) {
    if (escaped) { result += char; escaped = false; continue; }
    if (char === '\\' && inString) { result += char; escaped = true; continue; }
    if (char === '"') { inString = !inString; result += char; continue; }
    if (inString && char.charCodeAt(0) < 0x20) {
      if (char === '\n') result += '\\n';
      else if (char === '\r') result += '\\r';
      else if (char === '\t') result += '\\t';
      else result += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
      continue;
    }
    result += char;
  }
  return result;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const status = (err as { status?: number })?.status;
      const isRetryable = status === 503 || status === 429 || status === 500 ||
        (err instanceof Error && (err.message.includes('503') || err.message.includes('overloaded')));
      if (!isRetryable || i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

export async function generateBaziReading(params: {
  name?: string;
  gender?: Gender;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number;
  pillars: BaziPillars;
  knowledge: string;
  currentYear: number;
  majorFortuneInfo?: { currentCycle: string; currentAnnual: string };
}): Promise<FortuneReading> {
  const { name, gender, birthYear, birthMonth, birthDay, birthHour, pillars, knowledge, currentYear, majorFortuneInfo } = params;

  const genderText = gender === 'male' ? '男' : gender === 'female' ? '女' : '未提供';
  const birthTimeText = birthHour !== undefined ? `${birthHour}時` : '（未提供時辰）';
  const nameText = name || '（未提供）';

  const knowledgeSection = knowledge
    ? `\n以下是命理知識庫，請根據這些知識進行分析：\n---\n${knowledge}\n---\n`
    : '';

  const cycleSection = majorFortuneInfo
    ? `\n【當前大運 / 流年】\n目前大運：${majorFortuneInfo.currentCycle}\n今年流年：${majorFortuneInfo.currentAnnual}\n`
    : '';

  const prompt = `你是一位精通子平八字的命理師。請根據以下已排出的八字命盤，依照子平命理規則進行深度分析。
${knowledgeSection}${cycleSection}
【命主資料】
姓名：${nameText}
性別：${genderText}
出生：${birthYear}年${birthMonth}月${birthDay}日${birthTimeText}

【八字命盤】（已由系統排出，請直接使用）
${formatPillarsForPrompt(pillars)}

---

## 分析步驟（請依序執行，結果融入回覆）

### Step 1：確認日主五行
日柱天干即為日主。天干五行：甲乙=木、丙丁=火、戊己=土、庚辛=金、壬癸=水。

### Step 2：計算格局（身強 / 身弱）

各柱權重：年干5%、年支20%、月干5%、月支35%、日支20%、時干5%、時支10%

地支藏干五行比例（用於地支加分計算）：
子=水100%；丑=土33%金33%水33%；寅=木50%火40%土10%；卯=木100%；辰=水33%木33%土33%；
巳=火50%土40%金10%；午=火50%土50%；未=火40%木20%土40%；申=金50%水40%土10%；
酉=金100%；戌=火45%土45%金10%；亥=水60%木40%

計算「同我（同五行）+ 生我（生日主）」的加分合計：
- 同五行 = 全部權重加分
- 生日主的五行 = 全部權重加分（⚠️ 水生木，所以日主為木時，水也計入加分）
- 地支含多種五行，按比例計算

判斷標準：
- 加分 ≥ 45% → 身強
- 加分 < 45% → 身弱
- 加分 > 80% → 疑似從強格
- 加分 < 20% → 疑似從弱格

### Step 3：用神 / 忌神判斷

五行相生：水生木、木生火、火生土、土生金、金生水

| 格局 | 用神（喜） | 忌神（避） |
|------|----------|----------|
| 身強 | 剋我（官殺）、我剋（財）、我生（食傷） | 生我（印）、同我（比劫） |
| 身弱 | 生我（印）、同我（比劫） | 剋我（官殺）、我剋（財）、我生（食傷） |
| 從強 | 生我、同我 | 剋我、我剋、我生 |
| 從弱 | 剋我、我剋、我生 | 生我、同我 |

各日主身強用神：木→火土金；火→金水土；土→金水木；金→火水木；水→木火土
各日主身弱用神：木→水木；火→木火；土→火土；金→土金；水→金水

### Step 4：十神關係（以日主為基準，用於感情與事業解讀）
- 我剋：正財（異性）/ 偏財（同性）→ 財運、男生感情、父親
- 剋我：正官（異性）/ 七殺（同性）→ 工作事業、女生感情
- 我生：傷官（異性）/ 食神（同性）→ 才華創意、女生子女
- 生我：正印（異性）/ 偏印（同性）→ 貴人、母親
- 同我：劫財（異性）/ 比肩（同性）→ 平輩、競爭

天干陰陽：甲丙戊庚壬=陽；乙丁己辛癸=陰

---

## 輸出要求

請分析以下九個面向（繁體中文），每個面向都要有具體說明，不要只給結論：

1. **命盤總覽**（200-500字）：格局判斷（附加分合計%）、用神忌神、命格（月令主氣十神決定，例：傷官格、正財格）、目前走的大運（請根據出生資料與性別推算起運歲數與大運方向）
2. **性格特質**（200-500字）：日主五行 + 最突出的 2~3 個十神組合特質，語氣親切像對本人說話
3. **${currentYear} 年整體運勢**（200-500字）：大運 × 流年組合評級，說明邏輯
4. **${currentYear} 年財運**（200-500字）：用神忌神判斷 + 具體建議
5. **${currentYear} 年工作事業**（200-500字）：十神角度 + 今年適合的行動
6. **${currentYear} 年感情桃花**（200-500字）：夫妻星 + 桃花時機 + 夫妻宮狀態
7. **${currentYear} 年健康**（200-500字）：命盤弱點五行 + 今年需注意部位
8. **補運建議**（200-500字）：用神顏色、方向、生肖、飾品
9. **年度重點行動建議**：具體可操作的 3~5 個建議（每條一句話，以「1. 2. 3.」格式列出）
10. **大運 × 流年解析**（200-500字）：${majorFortuneInfo
  ? `根據目前大運「${majorFortuneInfo.currentCycle}」與今年流年「${majorFortuneInfo.currentAnnual}」，解析此大運的核心氣場與五行特質對命主的影響，再說明今年流年干支與大運的交互作用（相生、相剋、沖合），點出今年整體的有利方向與需要注意的風險。`
  : '（未提供大運資訊，請略過此項，輸出空字串）'}

11. **十神命格格局深度解析**（遵循徐玉蘭老師體系）：
    - 判定身強身弱（得令/得地/得助三項各別說明）
    - 確認格局（月柱透出十神優先，再看月支本氣）
    - 說明複合格局（若有制化關係需標注）
    - 用神忌神（身強：洩剋耗為用；身弱：生比為用）
    - 六個面向各 2–4 句：①核心性格 ②優勢能力 ③潛在風險 ④事業方向 ⑤感情特質（依性別分析夫星/妻星） ⑥身強弱對此格局的影響
    - 注意：晚子時（23:00–24:00）歸當日計算，月柱不變

請以以下 JSON 格式回覆，不要加入其他文字：
{
  "overview": "命盤總覽（含格局與大運）...",
  "personality": "性格特質...",
  "fortune": "整體運勢...",
  "wealth": "財運...",
  "career": "工作事業...",
  "romance": "感情桃花...",
  "health": "健康...",
  "remedy": "補運建議...",
  "actions": "1. 具體建議一\n2. 具體建議二\n3. 具體建議三",
  "cycleAnalysis": "大運 × 流年解析...",
  "tenGodAnalysis": "【格局】格局名稱｜身強/弱｜用神：XX｜忌神：XX\n【核心性格】...\n【優勢能力】...\n【潛在風險】...\n【事業方向】...\n【感情特質】...\n【格局影響】..."
}`;

  const result = await withRetry(() => model.generateContent(prompt));
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');

  return JSON.parse(sanitizeJsonControlChars(jsonMatch[0])) as FortuneReading;
}

export async function answerCustomQuestion(params: {
  question: string;
  pillars: BaziPillars;
  fortune: FortuneReading;
  knowledge: string;
  name?: string;
  gender?: Gender;
}): Promise<string> {
  const { question, pillars, fortune, knowledge, name, gender } = params;

  const genderText = gender === 'male' ? '男' : gender === 'female' ? '女' : '未提供';
  const knowledgeSection = knowledge
    ? `\n命理知識庫：\n---\n${knowledge}\n---\n`
    : '';

  const prompt = `你是一位精通子平八字的命理師。請根據以下資料回答問題。
${knowledgeSection}
【命主資料】
姓名：${name || '（未提供）'}  性別：${genderText}

【八字命盤】
${formatPillarsForPrompt(pillars)}

【既有分析摘要】
個性格局：${fortune.personality ?? '（未提供）'}
整體運勢：${fortune.fortune}
桃花感情：${fortune.romance}
健康：${fortune.health}
工作事業：${fortune.career}

【問題】
${question}

請用繁體中文回答（200-500字），結合命盤格局（身強/身弱）、用神忌神與十神關係作答，直接回答問題，不需要重複問題或加入額外說明。`;

  const result = await withRetry(() => model.generateContent(prompt));
  return result.response.text();
}

export async function suggestKnowledgeTags(title: string, content: string): Promise<string[]> {
  const prompt = `你是命理知識分類專家。根據以下知識內容，從標籤清單中選出 1-5 個最相關的標籤。

【可用標籤】
五行：金、木、水、火、土
主題：桃花、財運、健康、事業、運勢、婚姻、子女、流年
其他：通用、天干、地支、基礎

【知識標題】
${title}

【知識內容（前800字）】
${content.slice(0, 800)}

請只回傳 JSON 陣列，例如：["金", "桃花"]
不要回傳任何其他文字。`;

  const result = await withRetry(() => model.generateContent(prompt));
  const text = result.response.text().trim();
  const match = text.match(/\[.*\]/s);
  return match ? JSON.parse(match[0]) : [];
}
