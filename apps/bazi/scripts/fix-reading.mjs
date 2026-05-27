/**
 * 用法: node scripts/fix-reading.mjs [name] [newMonth] [newDay]
 * 例如: node scripts/fix-reading.mjs 鄭明元 2 9
 *
 * 會找到 name 相符的記錄、更新 birthMonth/birthDay，並重新計算四柱
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const [, , targetName, newMonthStr, newDayStr] = process.argv;
if (!targetName || !newMonthStr || !newDayStr) {
  console.error('用法: node scripts/fix-reading.mjs <姓名> <月> <日>');
  process.exit(1);
}
const newMonth = parseInt(newMonthStr, 10);
const newDay = parseInt(newDayStr, 10);

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── 內嵌計算邏輯（避免 ESM/CJS 混用問題）──────────────────────────────────
const STEMS   = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const STEM_EL = { 甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水' };
const BRANCH_EL = { 子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水' };

function mod(n, m) { return ((n % m) + m) % m; }

function getJDN(year, month, day) {
  let y = year, m = month;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524;
}

const JDN_BASE = 2415021;

const JIEQI_COEFF = {
  1:5.4055,2:4.8073,3:6.3900,4:5.1525,5:5.9480,6:6.3780,
  7:7.1902,8:7.3708,9:7.5844,10:8.1087,11:7.4089,12:7.1921,
};
function getSolarTermDay(year, m) {
  const C = JIEQI_COEFF[m], Y = year % 100 === 0 ? 100 : year % 100;
  return Math.floor(Y * 0.2422 + C) - Math.floor((Y - 1) / 4);
}

function pillar(stemIdx, branchIdx) {
  const stem = STEMS[mod(stemIdx, 10)], branch = BRANCHES[mod(branchIdx, 12)];
  return { stem, branch, element: `${STEM_EL[stem]}/${BRANCH_EL[branch]}` };
}

function calculateBaziPillars(year, month, day, hour) {
  const liChun = getSolarTermDay(year, 2);
  const yearForPillar = (month < 2 || (month === 2 && day < liChun)) ? year - 1 : year;
  const yearStemIdx = mod(yearForPillar - 1984, 10);
  const yearBranchIdx = mod(yearForPillar - 1984, 12);

  // Month
  const termDay = getSolarTermDay(year, month);
  const after = day >= termDay;
  let branchIdx, stemYear;
  if (month === 1) {
    branchIdx = after ? 1 : 0; stemYear = after ? year : year - 1;
  } else if (month === 2) {
    branchIdx = after ? 2 : 1; stemYear = after ? year : year - 1;
  } else {
    const MAP = { 3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,11:11,12:0 };
    const cur = MAP[month];
    branchIdx = after ? cur : mod(cur - 1, 12); stemYear = year;
  }
  const yearStemForMonth = mod(stemYear - 1984, 10);
  const monthStemIdx = mod(yearStemForMonth % 5 * 2 + branchIdx, 10);

  // Day
  let jdn = getJDN(year, month, day);
  if (hour === 23 || hour === 0) jdn += 1;
  const d = jdn - JDN_BASE;
  const dayStemIdx = mod(d, 10), dayBranchIdx = mod(d + 10, 12);

  // Hour
  let hourPillar;
  if (hour !== undefined) {
    const hBranch = hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12;
    const dStemForHour = mod(jdn - JDN_BASE, 10); // already adjusted JDN
    const hStem = mod((dStemForHour % 5) * 2 + hBranch, 10);
    hourPillar = pillar(hStem, hBranch);
  }

  return {
    year:  pillar(yearStemIdx, yearBranchIdx),
    month: pillar(monthStemIdx, branchIdx),
    day:   pillar(dayStemIdx, dayBranchIdx),
    ...(hourPillar ? { hour: hourPillar } : {}),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const snap = await db.collection('readings').where('name', '==', targetName).get();
  if (snap.empty) {
    console.error(`找不到姓名為「${targetName}」的記錄`);
    process.exit(1);
  }

  for (const doc of snap.docs) {
    const data = doc.data();
    const oldMonth = data.birthMonth, oldDay = data.birthDay;
    const { birthYear, birthHour } = data;

    const pillars = calculateBaziPillars(birthYear, newMonth, newDay, birthHour ?? undefined);

    console.log(`\n找到記錄 ${doc.id}：${data.name} ${birthYear}/${oldMonth}/${oldDay}`);
    console.log(`修正為：${birthYear}/${newMonth}/${newDay}`);
    console.log(`新日柱：${pillars.day.stem}${pillars.day.branch}`);

    await doc.ref.update({
      birthMonth: newMonth,
      birthDay: newDay,
      pillars,
      updatedAt: new Date().toISOString(),
    });

    console.log(`✓ 已更新（注意：AI 分析文字未重算，如需重算請到 App 按「重新排盤」）`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
