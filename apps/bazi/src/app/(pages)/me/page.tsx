'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useLocale } from '../../lib/i18n/locale-context';
import { localizeError } from '../../lib/i18n/messages';
import { usePush } from '../../lib/push-client';
import { useInstallPrompt } from '../../lib/install-prompt';
import { INSTALL_STEP, useOnboardingStore } from '../../lib/onboarding-store';
import { GoogleLoginButton } from '../../common/components/google-login-button/GoogleLoginButton';
import { LanguageToggle } from '../../common/components/language-toggle/LanguageToggle';
import { UserAvatar } from '../../common/components/user-avatar/UserAvatar';

/** 「我的」：帳號、語言、通知、加到主畫面、重看介紹；管理員另外有後台連結和功能更新推播 */
export default function MePage() {
  const router = useRouter();
  const { user, loading, isAdmin, logout, getToken } = useAuth();
  const { locale, t } = useLocale();
  const push = usePush(getToken);
  const { platform } = useInstallPrompt();
  const showOnboarding = useOnboardingStore((s) => s.show);

  const handleLogout = () => {
    // 結束訪客體驗：登出後回到正式模式的首頁（網址不帶 demo=1）
    if (user?.isAnonymous) void logout().then(() => router.replace('/'));
    else void logout();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FFFDF5] px-5 pt-6 pb-8">
      <div className="mx-auto max-w-md space-y-5">
        <h1 className="text-2xl font-black tracking-wider text-[#2D2420]">{t('me.title')}</h1>

        {/* 帳號 */}
        <Section title={t('me.account')}>
          {loading ? null : user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {user.photoURL && <UserAvatar src={user.photoURL} alt={user.displayName ?? ''} size={40} />}
                <span className="truncate text-sm font-medium text-[#2D2420]">
                  {user.isAnonymous ? t('demo.user') : (user.displayName ?? t('common.user'))}
                </span>
              </div>
              <button type="button" onClick={handleLogout} className="min-h-[44px] shrink-0 px-2 text-sm text-[#6B5D57]">
                {user.isAnonymous ? t('demo.end') : t('common.logout')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#6B5D57]">{t('me.signInHint')}</p>
              <GoogleLoginButton variant="primary" className="w-full py-3" />
            </div>
          )}
        </Section>

        {/* 語言 */}
        <Section title={t('me.language')}>
          <Row label={t('me.languageLabel')}>
            <LanguageToggle />
          </Row>
        </Section>

        {/* 通知與加到主畫面 */}
        <Section title={t('me.notifications')}>
          <p className="text-xs leading-relaxed text-[#6B5D57]">{t('me.notifyDesc')}</p>
          <div className="mt-3">
            {push.state === 'on' && (
              <Row label={t('me.notifyOnLabel')}>
                <button type="button" onClick={push.disable} disabled={push.busy} className={pillClass(false)}>
                  {t('me.notifyTurnOff')}
                </button>
              </Row>
            )}
            {push.state === 'off' && (
              <Row label={t('me.notifyOffLabel')}>
                {user ? (
                  <button type="button" onClick={push.enable} disabled={push.busy} className={pillClass(true)}>
                    {push.busy ? t('leave.enabling') : t('me.notifyTurnOn')}
                  </button>
                ) : (
                  <span className="text-xs text-[#7A7068]">{t('me.notifyNeedLogin')}</span>
                )}
              </Row>
            )}
            {push.state === 'needs-install' && <p className="text-sm text-[#6B4E00]">{t('me.notifyNeedsInstall')}</p>}
            {push.state === 'denied' && <p className="text-sm text-[#6B4E00]">{t('leave.denied')}</p>}
            {push.state === 'unsupported' && <p className="text-sm text-[#7A7068]">{t('me.notifyUnsupported')}</p>}
            {push.state === 'unconfigured' && <p className="text-sm text-[#7A7068]">{t('me.notifyUnconfigured')}</p>}
            {push.error && <p className="mt-2 text-xs text-[#B42318]">{localizeError(push.error, locale)}</p>}
          </div>
          {platform && platform !== 'installed' && (
            <button
              type="button"
              onClick={() => showOnboarding(INSTALL_STEP)}
              className="mt-4 min-h-[44px] w-full rounded-xl border border-[#EAE5DF] bg-[#FFF8E0] text-sm font-bold text-[#6B4E00]"
            >
              📲 {t('me.installGuide')}
            </button>
          )}
        </Section>

        {/* 其他 */}
        <Section title={t('me.more')}>
          <button type="button" onClick={() => showOnboarding(0)} className="min-h-[44px] w-full text-left text-sm text-[#2D2420]">
            {t('me.replayIntro')} <span aria-hidden className="float-right text-[#B5ABA1]">›</span>
          </button>
        </Section>

        {isAdmin && (
          <Section title={t('me.admin')}>
            <div className="flex flex-col">
              <AdminLink href="/dashboard">{t('nav.dashboard')}</AdminLink>
              <AdminLink href="/knowledge">{t('nav.knowledge')}</AdminLink>
              <AdminLink href="/test">{t('nav.test')}</AdminLink>
            </div>
            <FeatureUpdateForm />
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#EAE5DF] bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-xs font-bold tracking-[0.15em] text-[#8A6D2F]">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[#2D2420]">{label}</span>
      {children}
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="flex min-h-[44px] items-center justify-between border-b border-[#F2ECDF] text-sm text-[#2D2420] last:border-0">
      {children}
      <span aria-hidden className="text-[#B5ABA1]">›</span>
    </Link>
  );
}

const pillClass = (primary: boolean) =>
  `min-h-[40px] rounded-full px-4 text-sm font-bold disabled:opacity-50 ${
    primary ? 'bg-[#4A4A4A] text-white' : 'border border-[#D8CFC8] text-[#4A4A4A]'
  }`;

/** 管理員：發送功能更新推播（推給所有開啟通知的裝置，依裝置語言選中文或英文） */
function FeatureUpdateForm() {
  const { getToken } = useAuth();
  const [form, setForm] = useState({ titleZh: '', bodyZh: '', titleEn: '', bodyEn: '', url: '/feedback' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('確定要推播給所有開啟通知的人嗎？')) return;
    setSending(true);
    setResult(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/push/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(res.ok ? `已送出 ${data.sent} 台裝置` : (data.error ?? '發送失敗'));
    } catch {
      setResult('網路錯誤，請稍後再試');
    } finally {
      setSending(false);
    }
  };

  const input = 'w-full rounded-xl border border-[#EAE5DF] bg-[#FAF7F4] px-3 py-2.5 text-sm text-[#4A4A4A]';
  return (
    <form onSubmit={submit} className="mt-4 space-y-2 border-t border-[#F2ECDF] pt-4">
      <p className="text-sm font-bold text-[#2D2420]">功能更新推播</p>
      <label className="block text-xs text-[#6B5D57]">
        中文標題
        <input className={input} value={form.titleZh} onChange={set('titleZh')} maxLength={60} required />
      </label>
      <label className="block text-xs text-[#6B5D57]">
        中文內容
        <textarea className={input} value={form.bodyZh} onChange={set('bodyZh')} maxLength={200} rows={2} required />
      </label>
      <label className="block text-xs text-[#6B5D57]">
        English title（選填）
        <input className={input} value={form.titleEn} onChange={set('titleEn')} maxLength={60} />
      </label>
      <label className="block text-xs text-[#6B5D57]">
        English body（選填）
        <textarea className={input} value={form.bodyEn} onChange={set('bodyEn')} maxLength={200} rows={2} />
      </label>
      <label className="block text-xs text-[#6B5D57]">
        點開後的頁面
        <input className={input} value={form.url} onChange={set('url')} maxLength={200} />
      </label>
      <button type="submit" disabled={sending} className="min-h-[44px] w-full rounded-xl bg-[#4A4A4A] text-sm font-bold text-white disabled:opacity-50">
        {sending ? '發送中…' : '推播給所有人'}
      </button>
      {result && <p className="text-xs text-[#6B5D57]">{result}</p>}
    </form>
  );
}
