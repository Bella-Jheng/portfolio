import type { Locale } from './locale';

// 比較長、成段的介面內容（首頁、排盤等待畫面），依語言各一份

export interface HomeContent {
  taglines: string[];
  steps: { num: string; emoji: string; title: string; desc: string }[];
  authorNote: string[][];
  features: { emoji: string; title: string; desc: string }[];
}

export const HOME_CONTENT: Record<Locale, HomeContent> = {
  zh: {
    taglines: ['用天干地支解讀', '你天生的個性與命格', '命格貓八字解析'],
    steps: [
      { num: '01', emoji: '📝', title: '輸入生辰', desc: '填入出生年月日時，系統換算成天干地支，排出專屬於你的命盤。' },
      { num: '02', emoji: '🤖', title: 'AI 解密命盤', desc: '提供專業知識庫給 AI，請 AI 比對五行生剋與十神關係，把艱澀的命理轉譯成看得懂的白話。' },
      { num: '03', emoji: '📖', title: '拿到完整報告', desc: '個性、財運、事業、感情、健康，連今年今月的運勢走向一次看清楚。' },
    ],
    // 作者的話：每一段是一個段落，段落內的每一行各自換行
    authorNote: [
      ['起初，是在自己人生的低潮裡，', '陰錯陽差遇見了八字。', '沒想到越學越著迷，', '後來不只幫自己看，也開始幫朋友看。'],
      ['對我來說，算命從來不是為了預言誰的命運，', '而是在你走到谷底的時候，輕輕告訴你：', '再撐一下下就好，隧道的洞口快到了。'],
      ['在你覺得看不到希望時，給你一點光；', '在風雨來臨之前，讓你先做好準備。', '人生本來就有高有低，不會一直都是低谷。'],
      ['這個網站幫助了我，也希望能幫助你。', '哪怕只是一點點安慰、一個小小的心理支柱，', '都希望在你低潮的時候，陪你多走一步。'],
    ],
    features: [
      { emoji: '🌊', title: '流年運勢', desc: '今年大運與流年如何互相牽動' },
      { emoji: '🌙', title: '流月運勢', desc: '這個月的氣場重點與提醒' },
      { emoji: '🔮', title: '個性特質', desc: '十神解讀，內外性格全公開' },
      { emoji: '💰', title: '財運狀況', desc: '正財偏財的財富能量解析' },
      { emoji: '💼', title: '工作事業', desc: '職場發展方向與機遇分析' },
      { emoji: '🌸', title: '感情桃花', desc: '感情模式與姻緣時機解析' },
      { emoji: '🌿', title: '健康狀況', desc: '身體能量強弱與注意事項' },
      { emoji: '✨', title: '補運建議', desc: '強化五行、改善運勢的方法' },
      { emoji: '🎯', title: '行動建議', desc: '年度重點方向與具體行動' },
    ],
  },
  en: {
    taglines: ['Read through the Heavenly Stems and Earthly Branches', 'the personality and destiny you were born with', 'Bazi Cat chart reading'],
    steps: [
      { num: '01', emoji: '📝', title: 'Enter your birth details', desc: 'Add your birth date and time. We convert them into Heavenly Stems and Earthly Branches and build your personal chart.' },
      { num: '02', emoji: '🤖', title: 'AI decodes your chart', desc: 'The AI reads a curated Bazi knowledge base, compares Five Element and Ten God relationships, and explains it in plain English.' },
      { num: '03', emoji: '📖', title: 'Get your full report', desc: "Personality, wealth, career, love and health — plus this year's and this month's outlook, all in one place." },
    ],
    authorNote: [
      ['It started at a low point in my life,', 'when I stumbled onto Bazi by chance.', 'The more I learned, the more hooked I got —', 'soon I was reading charts for friends, too.'],
      ['To me, fortune-telling was never about predicting fate.', "It's about quietly telling you, when you hit bottom:", 'hold on a little longer — the end of the tunnel is near.'],
      ['A little light when hope feels far away;', 'a heads-up before the storm arrives.', "Life has highs and lows — the lows don't last forever."],
      ['This site helped me, and I hope it helps you too.', "Even if it's just a bit of comfort or something to lean on,", 'I hope it walks one more step with you when times are hard.'],
    ],
    features: [
      { emoji: '🌊', title: 'Yearly Outlook', desc: 'How your luck cycle and this year interact' },
      { emoji: '🌙', title: 'Monthly Outlook', desc: "This month's energy and reminders" },
      { emoji: '🔮', title: 'Personality', desc: 'Ten Gods reading of your inner and outer self' },
      { emoji: '💰', title: 'Wealth', desc: 'Your direct and indirect wealth energy' },
      { emoji: '💼', title: 'Career', desc: 'Career direction and opportunities' },
      { emoji: '🌸', title: 'Love', desc: 'Relationship patterns and timing' },
      { emoji: '🌿', title: 'Health', desc: "Your body's strengths and cautions" },
      { emoji: '✨', title: 'Remedies', desc: 'Ways to balance your Five Elements' },
      { emoji: '🎯', title: 'Action Plan', desc: 'Key focus and concrete steps for the year' },
    ],
  },
};

export interface LoadingContent {
  steps: string[];
  knowledge: { title: string; body: string }[];
}

export const LOADING_CONTENT: Record<Locale, LoadingContent> = {
  zh: {
    steps: ['排四柱八字', '推算藏干十神', '分析大運流年', 'AI 解讀命格', '生成完整報告'],
    knowledge: [
      { title: '什麼是日主', body: '你出生那天的天干，就代表「你自己」。整張命盤都是圍繞著這個「你」在看的。' },
      { title: '金生水', body: '金屬表面遇冷會凝出水珠，所以金生水。' },
      { title: '水生木', body: '樹要有水澆灌才長得大，所以水生木。' },
      { title: '木生火', body: '木頭是最好的柴火，一點就著，所以木生火。' },
      { title: '火生土', body: '東西燒成灰燼之後就變成了土，所以火生土。' },
      { title: '土生金', body: '金屬礦石都是從土裡、山裡挖出來的，所以土生金。' },
      { title: '金的人', body: '意志堅定、重義氣、做事有原則；但有時候太固執，不容易妥協。' },
      { title: '木的人', body: '善良、有生命力、喜歡成長和學習；但有時候太理想化，容易被現實打擊。' },
      { title: '水的人', body: '聰明、腦筋轉得快、適應力強；但有時候想法多變，不容易專一。' },
      { title: '火的人', body: '熱情、直率、行動力十足；但有時候脾氣急，做事不夠沉穩。' },
      { title: '土的人', body: '穩重、值得信賴、腳踏實地；但有時候太固守舊方法，不容易變通。' },
      { title: '命盤是說明書，不是判決書', body: '它告訴你天生的個性和傾向，你可以照著它走比較順的路，也可以選擇逆著走、闖出自己的路。看懂命盤不是要你認命，是讓你更清楚自己在選什麼。' },
    ],
  },
  en: {
    steps: ['Building your Four Pillars', 'Finding hidden stems & Ten Gods', 'Reading your luck cycles', 'AI interprets your chart', 'Writing your full report'],
    knowledge: [
      { title: 'Your Day Master', body: 'The Heavenly Stem of the day you were born stands for you. The whole chart is read around it.' },
      { title: 'Metal creates Water', body: 'Cold metal gathers drops of water on its surface — so Metal creates Water.' },
      { title: 'Water creates Wood', body: 'Trees need water to grow — so Water creates Wood.' },
      { title: 'Wood creates Fire', body: 'Wood is the best fuel for a fire — so Wood creates Fire.' },
      { title: 'Fire creates Earth', body: 'What burns turns to ash and becomes soil — so Fire creates Earth.' },
      { title: 'Earth creates Metal', body: 'Metal ores are dug out of the earth and mountains — so Earth creates Metal.' },
      { title: 'Metal people', body: 'Determined, loyal and principled — but sometimes stubborn and slow to compromise.' },
      { title: 'Wood people', body: 'Kind, full of life and always growing — but sometimes too idealistic and easily let down.' },
      { title: 'Water people', body: 'Smart, quick-thinking and adaptable — but sometimes changeable and hard to pin down.' },
      { title: 'Fire people', body: 'Warm, direct and full of energy — but sometimes impatient and a little restless.' },
      { title: 'Earth people', body: 'Steady, reliable and down to earth — but sometimes stuck in old ways.' },
      { title: 'A chart is a guide, not a verdict', body: "It shows the personality and tendencies you were born with. You can follow the easier path, or go against it and make your own. Understanding your chart isn't about accepting fate — it's about knowing what you're choosing." },
    ],
  },
};
