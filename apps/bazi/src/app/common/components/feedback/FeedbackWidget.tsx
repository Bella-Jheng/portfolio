'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../lib/auth-context';
import { useFetcher } from '../../../lib/use-fetcher';
import { GoogleLoginButton } from '../google-login-button/GoogleLoginButton';

export function FeedbackWidget() {
  const { user } = useAuth();
  const apiFetch = useFetcher();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showLabel, setShowLabel] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 提示氣泡每隔幾秒出現、隱藏一次，重複循環吸引注意
  useEffect(() => {
    const interval = setInterval(() => setShowLabel((prev) => !prev), 3000);
    return () => clearInterval(interval);
  }, []);

  // 這個元件被裝在有 framer-motion transform 的祖先裡（ResultDisplay 的外層 motion.div），
  // 那個 transform 會讓底下的 fixed 元素變成相對於它定位，而不是相對於真正的視窗，導致超寬的氣泡被裁切。
  // Portal 到 body 讓 fixed 定位真的以視窗為準。
  useEffect(() => setMounted(true), []);

  const handleOpen = () => {
    setSubmitted(false);
    setError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });
      setSubmitted(true);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '送出失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="fixed bottom-20 right-6 z-50 w-11">
        {/* 這層只負責水平置中（Tailwind transform），不能跟下面 framer-motion 的 animate 放同一個元素，
           否則 framer-motion 會直接覆蓋 inline style 的 transform，讓 -translate-x-1/2 失效而歪掉 */}
        <div className="absolute -top-11 left-1/2 -translate-x-1/2">
          <AnimatePresence>
            {showLabel && !open && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="relative bg-white text-[#4A4A4A] text-xs font-medium px-3 py-1.5 rounded-2xl border border-[#EAE5DF] shadow-md whitespace-nowrap">
                  意見回饋
                  <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1.5 w-3 h-3 bg-white border-r border-b border-[#EAE5DF] rotate-45" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          onClick={handleOpen}
          aria-label="意見回饋"
          className="relative w-11 h-11 rounded-full bg-white shadow-lg border border-[#EAE5DF] flex items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
        >
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            <Image src="/cats/bazi-cat-default.webp" alt="" width={30} height={30} />
          </div>
          <motion.span
            className="absolute -top-0.5 -right-0.5 z-10 w-3 h-3 rounded-full bg-[#E87878] border-2 border-white"
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="feedback-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9000] bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="feedback-panel"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="fixed inset-0 z-[9001] flex items-center justify-center px-5"
            >
              <div className="relative bg-white border border-[#EAE5DF] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 text-[#B0A898] hover:text-[#4A4A4A] transition-colors"
                  aria-label="關閉"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-center gap-2">
                  <Image src="/cats/bazi-cat-default.webp" alt="" width={28} height={28} />
                  <h3 className="text-[#4A4A4A] font-black text-sm tracking-wide">告訴我們你的想法</h3>
                </div>

                {!user ? (
                  <div className="py-4 space-y-4 text-center">
                    <p className="text-sm text-[#6B6159]">請先登入才能送出回饋</p>
                    <GoogleLoginButton variant="dark" className="w-full py-2.5 font-medium" />
                  </div>
                ) : submitted ? (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-2xl">🎉</p>
                    <p className="text-sm text-[#6B6159]">感謝你的回饋，我們會仔細閱讀！</p>
                    <button
                      onClick={() => setOpen(false)}
                      className="mt-2 w-full py-2.5 rounded-full border border-[#EAE5DF] text-[#4A4A4A] text-sm font-bold hover:bg-[#FAF7F4] transition-all"
                    >
                      關閉
                    </button>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={4}
                      placeholder="有任何建議、問題或想說的話，都歡迎留言給我們"
                      className="w-full bg-transparent border border-[#EAE5DF] rounded-xl px-3 py-2.5 text-sm text-[#4A4A4A] placeholder:text-[#B0A898] focus:outline-none focus:border-[#4A4A4A]/40 resize-none"
                    />
                    {error && <p className="text-xs text-[#E87878]">{error}</p>}
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !message.trim()}
                      className="w-full py-2.5 rounded-full bg-[#4A4A4A] text-white text-sm font-bold hover:bg-[#2D2420] transition-all disabled:opacity-40"
                    >
                      {submitting ? '送出中…' : '送出回饋'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
