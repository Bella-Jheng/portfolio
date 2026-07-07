import { db } from './firebase';
import {
  calculateMajorFortune,
  getAnnualPillar,
  calculateDayMasterStrength,
  getDominantElements,
  STEMS,
  BRANCHES,
} from './bazi-calculator';
import type { BaziPillars, Gender } from '../types/bazi';

export interface ReadingGenerationContext {
  knowledge: string;
  currentYear: number;
  majorFortuneInfo?: { currentCycle: string; currentAnnual: string };
  strength: string;
}

export async function buildReadingGenerationContext(
  pillars: BaziPillars,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  gender?: Gender,
): Promise<ReadingGenerationContext> {
  const dominantElements = getDominantElements(pillars);
  const queryTags = [...dominantElements, '桃花', '財運', '健康', '事業', '運勢', '通用'];

  let knowledgeDocs = (
    await db.collection('knowledge').where('tags', 'array-contains-any', queryTags).get()
  ).docs;

  // 尚未有標籤的舊資料 fallback
  if (knowledgeDocs.length < 3) {
    const all = await db.collection('knowledge').orderBy('createdAt', 'asc').limit(20).get();
    const existing = new Set(knowledgeDocs.map((doc) => doc.id));
    knowledgeDocs = [...knowledgeDocs, ...all.docs.filter((doc) => !existing.has(doc.id))];
  }

  const knowledge = knowledgeDocs
    .map((doc) => {
      const docData = doc.data();
      return `【${docData.title}】\n${docData.content}`;
    })
    .join('\n\n');

  const currentYear = new Date().getFullYear();
  const yearStemIdx = STEMS.indexOf(pillars.year.stem);
  const monthStemIdx = STEMS.indexOf(pillars.month.stem);
  const monthBranchIdx = BRANCHES.indexOf(pillars.month.branch);
  let majorFortuneInfo: { currentCycle: string; currentAnnual: string } | undefined;
  if (gender && yearStemIdx >= 0 && monthStemIdx >= 0 && monthBranchIdx >= 0) {
    const mf = calculateMajorFortune(birthYear, birthMonth, birthDay, gender, yearStemIdx, monthStemIdx, monthBranchIdx);
    const virtualAge = currentYear - birthYear + 1;
    const cycleIdx = mf.cycles.findLastIndex((cycle) => cycle.startAge <= virtualAge);
    const cycle = cycleIdx >= 0 ? mf.cycles[cycleIdx] : null;
    const annual = getAnnualPillar(currentYear);
    majorFortuneInfo = {
      currentCycle: cycle ? `${cycle.stem}${cycle.branch}（起運歲 ${cycle.startAge}，${cycle.startYear} 年起）` : '尚未入大運',
      currentAnnual: `${annual.stem}${annual.branch}（${currentYear} 年）`,
    };
  }

  const strength = calculateDayMasterStrength(pillars);

  return { knowledge, currentYear, majorFortuneInfo, strength };
}
