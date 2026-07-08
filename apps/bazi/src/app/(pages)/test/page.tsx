'use client';

import { useState } from 'react';
import { SHICHEN } from '../../types/bazi';
import { useRequireAdmin } from '../../lib/use-require-admin';
import {
  calculateBaziPillars,
  calculateMajorFortune,
  STEMS,
  BRANCHES,
} from '../../lib/bazi-calculator';
import type { BaziPillars } from '../../types/bazi';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 120 }, (_, index) => currentYear - index);
const months = Array.from({ length: 12 }, (_, index) => index + 1);
const days = Array.from({ length: 31 }, (_, index) => index + 1);

const ELEMENT_COLOR: Record<string, string> = {
  木: '#7AC97A', 火: '#E87878', 土: '#FCD060', 金: '#C8900A', 水: '#9070C0',
};

const STEM_ELEMENTS: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};
const BRANCH_ELEMENTS: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土',
  巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

interface TestCase {
  label: string;
  year: number; month: number; day: number; hour?: number;
  expectedDay: string;
}

const KNOWN_CASES: TestCase[] = [
  { label: '1900/01/01 無時辰', year: 1900, month: 1, day: 1, expectedDay: '甲戌' },
  { label: '2024/02/10 無時辰（三甲辰日）', year: 2024, month: 2, day: 10, expectedDay: '甲辰' },
  { label: '2024/02/11 無時辰', year: 2024, month: 2, day: 11, expectedDay: '乙巳' },
  { label: '1996/03/08 23時（晚子時→次日）', year: 1996, month: 3, day: 8, hour: 23, expectedDay: '乙巳' },
  { label: '1996/03/08 無時辰', year: 1996, month: 3, day: 8, expectedDay: '甲辰' },
];

function PillarCard({ label, stem, branch, isDay }: { label: string; stem: string; branch: string; isDay?: boolean }) {
  const stemEl = STEM_ELEMENTS[stem] ?? '';
  const branchEl = BRANCH_ELEMENTS[branch] ?? '';
  const color = ELEMENT_COLOR[stemEl] ?? '#4A4A4A';
  return (
    <div className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border ${isDay ? 'border-[#FCD060] bg-[#FFFDF5]' : 'border-[#EAE5DF] bg-white'}`}>
      <span className="text-[10px] text-[#6B6159] font-mono tracking-widest">{label}</span>
      <div className="flex items-start gap-0.5 mt-1">
        <span className="text-3xl font-black leading-none" style={{ color: isDay ? '#FCD060' : '#3A3A3A' }}>{stem}</span>
        <span className="text-[9px] text-[#6B6159] mt-1">{stemEl}</span>
      </div>
      <div className="flex items-start gap-0.5">
        <span className="text-3xl font-black leading-none text-[#3A3A3A]">{branch}</span>
        <span className="text-[9px] text-[#6B6159] mt-1">{branchEl}</span>
      </div>
      <span className="text-[9px] font-mono text-[#857C74]">{stem}{branch}</span>
      <div className="w-2 h-2 rounded-full mt-0.5" style={{ backgroundColor: color }} />
    </div>
  );
}

export default function TestPage() {
  const { authorized, checking } = useRequireAdmin();

  const [year, setYear] = useState(1996);
  const [month, setMonth] = useState(3);
  const [day, setDay] = useState(8);
  const [hour, setHour] = useState<number | undefined>(23);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [result, setResult] = useState<BaziPillars | null>(null);

  const selectClass = 'bg-[#FAF7F4] border border-[#EAE5DF] rounded-xl px-3 py-2.5 text-[#4A4A4A] focus:outline-none focus:border-[#FCD060] transition-colors text-sm w-full';

  if (checking || !authorized) return null;

  const calculate = () => {
    try {
      const pillars = calculateBaziPillars(year, month, day, hour);
      setResult(pillars);
    } catch (error) {
      console.error(error);
    }
  };

  const runKnownCase = (tc: TestCase) => {
    setYear(tc.year);
    setMonth(tc.month);
    setDay(tc.day);
    setHour(tc.hour);
    const pillars = calculateBaziPillars(tc.year, tc.month, tc.day, tc.hour);
    setResult(pillars);
  };

  const majorFortune = result
    ? (() => {
        const yearStemIdx = STEMS.indexOf(result.year?.stem ?? '');
        const monthStemIdx = STEMS.indexOf(result.month?.stem ?? '');
        const monthBranchIdx = BRANCHES.indexOf(result.month?.branch ?? '');
        if (yearStemIdx < 0 || monthStemIdx < 0 || monthBranchIdx < 0) return null;
        return calculateMajorFortune(year, month, day, gender, yearStemIdx, monthStemIdx, monthBranchIdx);
      })()
    : null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FFFDF5] px-5 pt-10 pb-16">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-[#6B6159] border border-[#EAE5DF] rounded-full px-3 py-1 bg-white/60">
              DEV TOOL
            </span>
          </div>
          <h1 className="text-[#4A4A4A] font-black text-2xl tracking-widest">八字排盤測試工具</h1>
          <p className="text-[#6B6159] text-xs">純前端計算，不呼叫 AI API，不花任何 Token</p>
        </div>

        {/* Known Test Cases */}
        <div className="bg-white/80 border border-[#EAE5DF] rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-black tracking-widest text-[#4A4A4A]">已知測資</h2>
          <div className="space-y-2">
            {KNOWN_CASES.map((tc) => {
              const pillars = calculateBaziPillars(tc.year, tc.month, tc.day, tc.hour);
              const actualDay = pillars.day.stem + pillars.day.branch;
              const pass = actualDay === tc.expectedDay;
              return (
                <button
                  key={tc.label}
                  onClick={() => runKnownCase(tc)}
                  className="w-full flex items-center justify-between text-left px-4 py-2.5 rounded-xl border border-[#EAE5DF] hover:border-[#FCD060] transition-all bg-[#FAF7F4] hover:bg-white group"
                >
                  <span className="text-xs text-[#4A4A4A] font-medium">{tc.label}</span>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-xs font-mono text-[#636363]">期待 {tc.expectedDay}</span>
                    <span className={`text-xs font-mono font-bold ${pass ? 'text-green-600' : 'text-red-500'}`}>
                      {pass ? '✓ ' : '✗ '}{actualDay}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="bg-white/80 border border-[#EAE5DF] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-black tracking-widest text-[#4A4A4A]">自訂輸入</h2>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#6B6159] font-bold tracking-widest">年</label>
              <select value={year} onChange={event => setYear(Number(event.target.value))} className={selectClass}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#6B6159] font-bold tracking-widest">月</label>
              <select value={month} onChange={event => setMonth(Number(event.target.value))} className={selectClass}>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#6B6159] font-bold tracking-widest">日</label>
              <select value={day} onChange={event => setDay(Number(event.target.value))} className={selectClass}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#6B6159] font-bold tracking-widest">時辰</label>
              <select
                value={hour ?? ''}
                onChange={event => setHour(event.target.value === '' ? undefined : Number(event.target.value))}
                className={selectClass}
              >
                <option value="">不知道</option>
                {SHICHEN.map(shichen => (
                  <option key={shichen.branch} value={shichen.hours[0]}>{shichen.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[10px] text-[#6B6159] font-bold tracking-widest shrink-0">性別（大運用）</label>
            {(['male', 'female'] as const).map(genderOption => (
              <button
                key={genderOption}
                type="button"
                onClick={() => setGender(genderOption)}
                className={`px-4 py-1.5 rounded-lg border text-xs font-medium transition-all ${gender === genderOption ? 'bg-[#4A4A4A] text-white border-[#4A4A4A]' : 'border-[#EAE5DF] text-[#636363] hover:border-[#4A4A4A]'}`}
              >
                {genderOption === 'male' ? '男' : '女'}
              </button>
            ))}
          </div>

          <button
            onClick={calculate}
            className="w-full bg-[#FCD060] text-[#4A4A4A] font-black py-3 rounded-xl tracking-widest text-sm hover:bg-[#FDE49B] transition-all"
          >
            排盤 ✦
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white/80 border border-[#EAE5DF] rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black tracking-widest text-[#4A4A4A]">排盤結果</h2>
              <span className="text-[10px] font-mono text-[#6B6159]">
                {year}/{String(month).padStart(2,'0')}/{String(day).padStart(2,'0')}
                {hour !== undefined ? ` ${SHICHEN.find(shichen=>shichen.hours[0]===hour)?.branch ?? ''}時` : ' 無時辰'}
              </span>
            </div>

            {/* Pillars */}
            <div className={`grid gap-3 ${result.hour ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {result.hour && <PillarCard label="時柱" stem={result.hour.stem} branch={result.hour.branch} />}
              <PillarCard label="日柱" stem={result.day.stem} branch={result.day.branch} isDay />
              <PillarCard label="月柱" stem={result.month.stem} branch={result.month.branch} />
              <PillarCard label="年柱" stem={result.year.stem} branch={result.year.branch} />
            </div>

            {/* Raw data */}
            <div className="bg-[#FAF7F4] rounded-xl p-4 space-y-1.5 font-mono text-xs text-[#6B5D57]">
              <p>年柱：{result.year.stem}{result.year.branch}（{result.year.element}）</p>
              <p>月柱：{result.month.stem}{result.month.branch}（{result.month.element}）</p>
              <p>日柱：{result.day.stem}{result.day.branch}（{result.day.element}）</p>
              {result.hour && <p>時柱：{result.hour.stem}{result.hour.branch}（{result.hour.element}）</p>}
            </div>

            {/* Major Fortune */}
            {majorFortune && (
              <div className="space-y-2">
                <h3 className="text-xs font-black tracking-widest text-[#4A4A4A]">大運</h3>
                <p className="text-[10px] text-[#6B6159]">
                  出生後 {Math.floor(majorFortune.startDays / 3)} 年
                  {(majorFortune.startDays % 3) * 4 > 0 ? ` ${(majorFortune.startDays % 3) * 4} 個月` : ''} 上大運
                </p>
                <div className="overflow-x-auto">
                  <table className="text-center text-xs border-collapse w-full">
                    <tbody>
                      <tr>
                        {majorFortune.cycles.map((cycle, index) => (
                          <td key={index} className="px-2 py-1 text-[#636363] font-mono">{cycle.startAge}</td>
                        ))}
                      </tr>
                      <tr>
                        {majorFortune.cycles.map((cycle, index) => (
                          <td key={index} className="px-2 py-2">
                            <div className="flex flex-col items-center leading-none gap-0.5">
                              <span className="font-black text-[#4A4A4A]">{cycle.stem}</span>
                              <span className="font-black text-[#4A4A4A]">{cycle.branch}</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
