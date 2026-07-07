import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BaziPillars, FortuneReading, Gender } from '../types/bazi';
import { formatPillarsForPrompt } from './bazi-calculator';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? '');
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
      await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
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
  strength: string;
}): Promise<FortuneReading> {
  const { name, gender, birthYear, birthMonth, birthDay, birthHour, pillars, knowledge, currentYear, majorFortuneInfo, strength } = params;

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

### Step 2：格局（身強 / 身弱）— 已由系統預算
此命主格局：**${strength}**（由命盤邏輯預先計算完成，請直接採用此結果，勿自行重新判斷）。

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

請分析以下面向（繁體中文），這階段只需要「白話重點結論」。
⚠️ HTML 格式說明：標註「HTML 格式」的欄位請使用 <p>、<ul>/<ol>、<li>、<strong> 等標籤，不要使用 Markdown。字數計算不含 HTML 標籤本身。
⚠️ 每個結論：純文字 40-80 字，完全不使用命理術語（十神、正官、七殺、傷官、格局、用神、忌神、日主、大運、流年等一律禁止），改用一般人能懂的白話，像跟完全不懂命理的朋友講結論一樣，直接講結論本身，不要說「本節將分析...」這類鋪陳。

1. **性格特質**（HTML 格式，200-300字）：日主五行 + 最突出的 2~3 個十神組合特質，語氣親切像對本人說話，直接點明是哪個柱的哪個十神帶出這個特質
2. **${currentYear} 年財運**（HTML 格式，200-500字）：白話重點結論 + 具體建議
3. **${currentYear} 年工作事業**（HTML 格式，200-500字）：白話重點結論 + 具體建議 + 今年適合的行動
4. **${currentYear} 年感情桃花**（HTML 格式，200-500字）：白話重點結論 + 具體建議 + 桃花時機 + 夫妻宮狀態
5. **${currentYear} 年健康**（HTML 格式，200-500字）：白話重點結論 + 今年需注意部位 + 具體建議
6. **補運建議**（HTML 格式，200-500字）：根據用神五行給出顏色、方向、生肖、飾品建議
7. **年度重點行動建議**（純文字，禁止使用 HTML 或 Markdown）：具體可操作的 3~5 個建議，每條一句話，嚴格以「1. 2. 3.」數字加句點格式列出，每條以 \n 換行，例如：1. 建議一\n2. 建議二\n3. 建議三
0. **命格關鍵詞**：3 個最能代表此命主個性的短詞，每個 2~4 字，以「・」分隔，例如「精緻・原則・執行力」
8. **${currentYear} 年運勢**（HTML 格式，200-500字）：${majorFortuneInfo
  ? `內部參考：目前大運「${majorFortuneInfo.currentCycle}」、今年流年「${majorFortuneInfo.currentAnnual}」。⚠️ 輸出時完全不要出現「大運」「流年」這兩個詞，也不要提到任何干支或五行組合名稱（如戊土、丙火、甲乙丙丁、子丑寅卯等），全部轉換成一般人聽得懂的白話說法，點出今年整體的有利方向與需要注意的風險。`
  : '（未提供運勢資訊，請略過此項，輸出空字串）'}
9. **十神命格格局白話重點結論**（遵循徐玉蘭老師體系）：
  - 六個面向各 2–4 句：①核心性格 ②優勢能力 ③潛在風險 ④事業方向 ⑤感情特質（依性別分析夫星/妻星） ⑥身強弱對此格局的影響
  - 注意：晚子時（23:00–24:00）歸當日計算，月柱不變

請以以下 JSON 格式回覆，不要加入其他文字：
{
  "personality": "性格特質（純文字）...",
  "wealth": "<p>財運 HTML...</p>",
  "career": "<p>工作事業 HTML...</p>",
  "romance": "<p>感情桃花 HTML...</p>",
  "health": "<p>健康 HTML...</p>",
  "remedy": "<p>補運建議 HTML...</p>",
  "actions": "1. 具體建議一\n2. 具體建議二\n3. 具體建議三",
  "cycleAnalysis": "<p>${currentYear} 年運勢 HTML...</p>",
  "tenGodAnalysis": "【格局】格局名稱｜身強/弱｜用神：XX｜忌神：XX\n【核心性格】...\n【優勢能力】...\n【潛在風險】...\n【事業方向】...\n【感情特質】...\n【格局影響】...",
  "traits": "關鍵詞一・關鍵詞二・關鍵詞三"
}`;

  const result = await withRetry(() => model.generateContent(prompt));
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');

  return JSON.parse(sanitizeJsonControlChars(jsonMatch[0])) as FortuneReading;
}

const DETAIL_SECTIONS = {
  wealth: { key: 'wealthDetail', instruction: (year: number) => `**${year} 年財運**（HTML 格式，200-500字）：用神忌神判斷 + 結合流年干支說明財星狀況 + 具體建議` },
  career: { key: 'careerDetail', instruction: (year: number) => `**${year} 年工作事業**（HTML 格式，200-500字）：十神角度 + 點明官殺/食傷在哪個柱 + 今年適合的行動` },
  romance: { key: 'romanceDetail', instruction: (year: number) => `**${year} 年感情桃花**（HTML 格式，200-500字）：夫妻星（男看財星、女看官殺）在哪個柱 + 桃花時機 + 夫妻宮狀態` },
  health: { key: 'healthDetail', instruction: (year: number) => `**${year} 年健康**（HTML 格式，200-500字）：命盤弱點五行（哪個柱過旺或過弱）+ 今年需注意部位` },
  remedy: { key: 'remedyDetail', instruction: () => `**補運建議**（HTML 格式，200-500字）：根據用神五行給出顏色、方向、生肖、飾品建議` },
  cycleAnalysis: {
    key: 'cycleAnalysisDetail',
    instruction: (year: number, majorFortuneInfo?: { currentCycle: string; currentAnnual: string }) => majorFortuneInfo
      ? `**${year} 年運勢**（HTML 格式，200-500字）：內部參考目前大運「${majorFortuneInfo.currentCycle}」與今年流年「${majorFortuneInfo.currentAnnual}」的核心氣場與五行特質對命主的影響，分析今年整體運勢走向、有利方向與需要注意的風險。⚠️ 輸出時完全不要出現「大運」「流年」字樣，也不要提到任何干支或五行組合名稱（如戊土、丙火、甲乙丙丁、子丑寅卯等），全部轉換成一般人聽得懂的白話說法。這一項不需要點名命盤干支，跟其他面向的「引用命盤」要求不同。`
      : `**${year} 年運勢**（未提供運勢資訊，請輸出空字串）`,
  },
  tenGodAnalysis: {
    key: 'tenGodAnalysisDetail',
    instruction: () => `**十神命格格局深度解析**（遵循徐玉蘭老師體系）：
    - 先標明「主星」（格局十神，即月柱透出或月支本氣的十神）與「副星」（命盤中其他主要出現的十神）
    - 判定身強身弱（得令/得地/得助三項各別說明）
    - 確認格局（月柱透出十神優先，再看月支本氣）
    - 說明複合格局（若有制化關係需標注）
    - 用神忌神（身強：洩剋耗為用；身弱：生比為用）
    - 六個面向各 2–4 句：①核心性格 ②優勢能力 ③潛在風險 ④事業方向 ⑤感情特質（依性別分析夫星/妻星） ⑥身強弱對此格局的影響
    - 注意：晚子時（23:00–24:00）歸當日計算，月柱不變`,
  },
} as const;

export type DetailSection = keyof typeof DETAIL_SECTIONS;

export async function generateDetailedAnalysis(params: {
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
  strength: string;
  sections: DetailSection[];
  existingSummary?: Partial<FortuneReading>;
}): Promise<Partial<FortuneReading>> {
  const { name, gender, birthYear, birthMonth, birthDay, birthHour, pillars, knowledge, currentYear, majorFortuneInfo, strength, sections, existingSummary } = params;

  const genderText = gender === 'male' ? '男' : gender === 'female' ? '女' : '未提供';
  const birthTimeText = birthHour !== undefined ? `${birthHour}時` : '（未提供時辰）';
  const nameText = name || '（未提供）';

  const knowledgeSection = knowledge
    ? `\n以下是命理知識庫，請根據這些知識進行分析：\n---\n${knowledge}\n---\n`
    : '';

  const cycleSection = majorFortuneInfo
    ? `\n【當前大運 / 流年】\n目前大運：${majorFortuneInfo.currentCycle}\n今年流年：${majorFortuneInfo.currentAnnual}\n`
    : '';

  const summarySection = existingSummary
    ? `\n【已產出的白話重點結論】（本次詳細分析需與其結論保持一致，不可矛盾）\n${sections.map((s) => `${s}：${existingSummary[s] ?? '（無）'}`).join('\n')}\n`
    : '';

  const requested = sections.map((s, i) => `${i + 1}. ${DETAIL_SECTIONS[s].instruction(currentYear, majorFortuneInfo)}`).join('\n');
  const jsonExample = sections.map((s) => `  "${DETAIL_SECTIONS[s].key}": "..."`).join(',\n');

  const prompt = `你是一位精通子平八字的命理師。請根據以下已排出的八字命盤，依照子平命理規則進行深度分析。
${knowledgeSection}${cycleSection}${summarySection}
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

### Step 2：格局（身強 / 身弱）— 已由系統預算
此命主格局：**${strength}**（由命盤邏輯預先計算完成，請直接採用此結果，勿自行重新判斷）。

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

⚠️ HTML 格式說明：使用 <p>、<ul>/<ol>、<li>、<strong> 等標籤，不要使用 Markdown。字數計算不含 HTML 標籤本身。
⚠️ 引用命盤：具體點名命盤干支（如「日主${pillars.day.stem}、月支${pillars.month.branch}、大運…」），讓命主能對照上方排盤理解，不要只說「你的命盤顯示」等模糊語。

${requested}

請以以下 JSON 格式回覆，不要加入其他文字：
{
${jsonExample}
}`;

  const result = await withRetry(() => model.generateContent(prompt));
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');

  return JSON.parse(sanitizeJsonControlChars(jsonMatch[0])) as Partial<FortuneReading>;
}

export async function answerCustomQuestion(params: {
  question: string;
  pillars: BaziPillars;
  fortune: FortuneReading;
  knowledge: string;
  name?: string;
  gender?: Gender;
  majorFortuneInfo?: { currentCycle: string; currentAnnual: string };
}): Promise<string> {
  const { question, pillars, fortune, knowledge, name, gender, majorFortuneInfo } = params;

  const genderText = gender === 'male' ? '男' : gender === 'female' ? '女' : '未提供';
  const knowledgeSection = knowledge
    ? `\n命理知識庫：\n---\n${knowledge}\n---\n`
    : '';

  const cycleSection = majorFortuneInfo
    ? `\n【當前大運 / 流年】（以此為準，忽略既有分析中的大運流年資訊）\n目前大運：${majorFortuneInfo.currentCycle}\n今年流年：${majorFortuneInfo.currentAnnual}\n`
    : '';

  const prompt = `你是一位精通子平八字的命理師。請根據以下資料回答問題。
${knowledgeSection}${cycleSection}
【命主資料】
姓名：${name || '（未提供）'}  性別：${genderText}

【八字命盤】
${formatPillarsForPrompt(pillars)}

【既有分析摘要】
個性格局：${fortune.personality ?? '（未提供）'}
命格關鍵詞：${fortune.traits ?? '（未提供）'}
十神格局分析：${fortune.tenGodAnalysis ?? '（未提供）'}
桃花感情：${fortune.romance ?? '（未提供）'}
健康：${fortune.health ?? '（未提供）'}
工作事業：${fortune.career ?? '（未提供）'}

【問題】
${question}

請用繁體中文回答（200-500字），結合命盤格局（身強/身弱）、用神忌神與十神關係作答，直接回答問題，不需要重複問題或加入額外說明。請使用 Markdown 格式：段落用空行分隔，重點用 **粗體**，條列用 \`-\`，不要使用 HTML 標籤。`;

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
