'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '../../styles/bazi-content.module.css';
import type { Reading } from '../../../types/bazi';
import { useAuth } from '../../../lib/auth-context';

interface AdminQASectionProps {
  reading: Reading;
  onUpdate: (updated: Reading) => void;
}

const COLLAPSE_THRESHOLD = 150;

const E = {
  bg:     '#F5F5F5',
  accent: '#1A1A1A',
  text:   '#1A1A1A',
  muted:  '#888888',
  border: '#E0E0E0',
};

export function AdminQASection({ reading, onUpdate }: AdminQASectionProps) {
  const { getToken } = useAuth();
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState('');
  const adminQs = reading.adminQuestions ?? [];

  const [expandedSet, setExpandedSet] = useState<Set<number>>(() => {
    const last = adminQs.length - 1;
    return last >= 0 ? new Set([last]) : new Set();
  });

  useEffect(() => {
    const last = (reading.adminQuestions?.length ?? 0) - 1;
    if (last >= 0) setExpandedSet((prev) => new Set([...prev, last]));
  }, [reading.adminQuestions?.length]);

  const toggleExpand = (idx: number) =>
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });

  const handleAsk = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;
    setError('');
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
        body: JSON.stringify({ question, adminQuestion: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.aiStatusText) console.error('後端api失敗訊息：', data.aiStatusText);
        setError(data.error || '提問失敗');
        return;
      }
      onUpdate({ ...reading, adminQuestions: data.adminQuestions });
      setQuestion('');
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setAsking(false);
    }
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-sm"
      style={{ border: `1px solid ${E.border}`, backgroundColor: 'white' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b"
        style={{ backgroundColor: E.bg, borderColor: E.border }}
      >
        <svg
          className="w-4 h-4 shrink-0"
          style={{ color: E.accent }}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <div>
          <h3 className="font-bold text-sm" style={{ color: E.text }}>管理員私人提問</h3>
          <p className="text-[10px]" style={{ color: E.muted }}>此區塊內容僅管理員可見，不顯示給使用者</p>
        </div>
      </div>

      {/* Q&A list */}
      {adminQs.length > 0 && (
        <div className="px-6 py-5 space-y-4 border-b" style={{ borderColor: E.border }}>
          {adminQs.map((qa, idx) => (
            <motion.div
              key={idx}
              className="space-y-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              {/* Question bubble (right) */}
              <div className="flex justify-end">
                <div
                  className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] leading-relaxed text-white"
                  style={{ backgroundColor: E.accent }}
                >
                  {qa.question}
                </div>
              </div>

              {/* Answer bubble (left) */}
              <div className="flex justify-start">
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div
                    className={`${styles.mdAnswer} border rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm relative overflow-hidden transition-all ${
                      qa.answer.length > COLLAPSE_THRESHOLD && !expandedSet.has(idx)
                        ? 'max-h-[6.5rem]'
                        : ''
                    }`}
                    style={{ backgroundColor: E.bg, borderColor: E.border, color: E.text }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{qa.answer}</ReactMarkdown>
                    {qa.answer.length > COLLAPSE_THRESHOLD && !expandedSet.has(idx) && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                        style={{ background: `linear-gradient(to top, ${E.bg}, transparent)` }}
                      />
                    )}
                  </div>
                  {qa.answer.length > COLLAPSE_THRESHOLD && (
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="self-start text-[11px] transition-colors flex items-center gap-1 pl-1 hover:opacity-70"
                      style={{ color: E.muted }}
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

      {/* Input area */}
      <div className="px-6 py-5" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="font-bold text-sm mb-3" style={{ color: E.text }}>私人追問（無題數限制）</p>
        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="輸入私人問題…"
            disabled={asking}
            className="flex-1 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors disabled:opacity-50"
            style={{
              border: `1px solid ${E.border}`,
              color: E.text,
            }}
            onFocus={(ev) => (ev.currentTarget.style.borderColor = `${E.accent}80`)}
            onBlur={(ev) => (ev.currentTarget.style.borderColor = E.border)}
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="px-5 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{ backgroundColor: E.accent }}
            onMouseEnter={(ev) => (ev.currentTarget.style.backgroundColor = '#A37208')}
            onMouseLeave={(ev) => (ev.currentTarget.style.backgroundColor = E.accent)}
          >
            {asking ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
            ) : '詢問'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}
