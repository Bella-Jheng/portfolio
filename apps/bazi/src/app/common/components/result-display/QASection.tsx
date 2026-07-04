'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Reading } from '../../../types/bazi';
import { useAuth } from '../../../lib/auth-context';
import { GoogleLoginButton } from '../google-login-button/GoogleLoginButton';
import type { MagazineTheme } from './theme';
import styles from '../../styles/bazi-content.module.css';

interface QASectionProps {
  reading: Reading;
  theme: MagazineTheme;
  onUpdate: (updated: Reading) => void;
}

const COLLAPSE_THRESHOLD = 150;

export function QASection({ reading, theme, onUpdate }: QASectionProps) {
  const { user, getToken } = useAuth();
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState('');
  const [remaining, setRemaining] = useState<number>(reading.remainingToday ?? 3);
  const [expandedSet, setExpandedSet] = useState<Set<number>>(() => {
    const last = reading.questions.length - 1;
    return last >= 0 ? new Set([last]) : new Set();
  });

  useEffect(() => {
    const last = reading.questions.length - 1;
    if (last >= 0) setExpandedSet((prev) => new Set([...prev, last]));
  }, [reading.questions.length]);

  const toggleExpand = (idx: number) =>
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });

  const limitReached = user ? remaining === 0 : false;

  const handleAskQuestion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;
    setAskError('');
    setAsking(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/result/${reading.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.aiStatusText) console.error('後端api失敗訊息：', data.aiStatusText);
        setAskError(data.error || '提問失敗');
        return;
      }
      onUpdate({ ...reading, questions: data.questions, remainingToday: data.remainingToday });
      setRemaining(data.remainingToday ?? 0);
      setQuestion('');
    } catch {
      setAskError('網路錯誤，請稍後再試');
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-[#EAE5DF] overflow-hidden bg-white shadow-sm">
      <div
        className="flex items-center gap-3 px-6 py-4 border-b border-[#EAE5DF]"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="relative w-8 h-8 shrink-0">
          <Image src={theme.catSrc} alt="" fill className="object-contain" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-[#4A4A4A]">命盤 AI 追問</h3>
          <p className="text-[10px] text-[#6B6159]">針對命盤進行追加提問</p>
        </div>
      </div>

      {reading.questions.length > 0 && (
        <div className="px-6 py-5 space-y-4 border-b border-[#EAE5DF]">
          {reading.questions.map((qa, idx) => (
            <motion.div
              key={idx}
              className="space-y-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <div className="flex justify-end">
                <div className="bg-[#4A4A4A] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] leading-relaxed">
                  {qa.question}
                </div>
              </div>
              <div className="flex justify-start gap-2">
                <div className="relative w-7 h-7 shrink-0 mt-1">
                  <Image src={theme.catSrc} alt="" fill className="object-contain" />
                </div>
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div
                    className={`${styles.mdAnswer} border rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-[#6B5D57] relative overflow-hidden transition-all ${
                      qa.answer.length > COLLAPSE_THRESHOLD && !expandedSet.has(idx)
                        ? 'max-h-[6.5rem]'
                        : ''
                    }`}
                    style={{ backgroundColor: theme.bg, borderColor: '#EAE5DF' }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{qa.answer}</ReactMarkdown>
                    {qa.answer.length > COLLAPSE_THRESHOLD && !expandedSet.has(idx) && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                        style={{ background: `linear-gradient(to top, ${theme.bg}, transparent)` }}
                      />
                    )}
                  </div>
                  {qa.answer.length > COLLAPSE_THRESHOLD && (
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="self-start text-[11px] text-[#9A9088] hover:text-[#6B5D57] transition-colors flex items-center gap-1 pl-1"
                    >
                      {expandedSet.has(idx) ? (
                        <>收合 <span className="text-[10px]">↑</span></>
                      ) : (
                        <>展開全文 <span className="text-[10px]">↓</span></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="px-6 py-5 bg-[#FAF7F4]">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-sm text-[#4A4A4A]">還有其他問題？</p>
          {user && (
            <span className={`text-xs ${limitReached ? 'text-red-500' : 'text-[#6B6159]'}`}>
              今日剩餘 {remaining}/3 題
            </span>
          )}
        </div>

        {!user ? (
          <div className="text-center py-2 space-y-3">
            <p className="text-[#6B6159] text-sm">登入後才能追加提問</p>
            <GoogleLoginButton variant="dark" className="px-6 py-2" />
          </div>
        ) : limitReached ? (
          <p className="text-[#6B6159] text-sm text-center py-2">今日提問已達上限，明天再來吧</p>
        ) : (
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="請輸入問題，越精準越好喔～"
              disabled={asking}
              className="flex-1 bg-white border border-[#EAE5DF] rounded-xl px-4 py-3 text-[#4A4A4A] placeholder:text-[#857C74] focus:outline-none focus:border-[#FCD060] transition-colors text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={asking || !question.trim()}
              className="bg-[#4A4A4A] text-white px-5 py-3 rounded-xl text-sm hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {asking ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
              ) : '詢問'}
            </button>
          </form>
        )}
        {askError && <p className="text-red-500 text-sm mt-2">{askError}</p>}
      </div>
    </div>
  );
}
