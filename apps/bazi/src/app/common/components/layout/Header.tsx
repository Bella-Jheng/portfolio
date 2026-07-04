'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { GoogleLoginButton } from '../google-login-button/GoogleLoginButton';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from '../nav-link/NavLink';
import { UserAvatar } from '../user-avatar/UserAvatar';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin, readingId, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isPaiPanActive = pathname === '/' || pathname.startsWith('/result/');

  const handlePaiPan = () => {
    setIsOpen(false);
    if (isAdmin) { router.push('/'); return; }
    router.push(user && readingId ? `/result/${readingId}` : '/');
  };

  const close = () => setIsOpen(false);


  return (
    <>
      <header className="top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between h-16 px-8">

          {/* Logo — px-8 aligns with homepage top-left text */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/cats/bazi-cat-default.webp"
              alt="Bazi Cat Logo"
              width={30}
              height={30}
              className="transition-transform group-hover:scale-105"
            />
            <span className="text-bz-brown font-black text-xl tracking-[0.15em]">八字命理</span>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-bz-brown focus:outline-none"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/15 z-[9000]"
              onClick={close}
            />

            {/* Panel */}
            <motion.nav
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-72 bg-[#FFFDF5]/90 backdrop-blur-md border-l border-black/8 z-[9001] flex flex-col px-8 py-6 shadow-2xl"
            >
              {/* Close */}
              <div className="flex justify-end mb-10">
                <button onClick={close} className="p-1 text-bz-brown" aria-label="Close menu">
                  <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <div className="flex flex-col gap-5 flex-1">
                <NavLink mobile active={isPaiPanActive} onClick={handlePaiPan}>排盤</NavLink>
                {isAdmin && (
                  <>
                    <NavLink mobile href="/dashboard" active={pathname === '/dashboard'} onClick={close}>命盤列表</NavLink>
                    <NavLink mobile href="/knowledge" active={pathname === '/knowledge'} onClick={close}>知識庫</NavLink>
                    <NavLink mobile href="/test" active={pathname === '/test'} onClick={close}>排盤測試</NavLink>
                  </>
                )}
              </div>

              {/* Auth */}
              <div className="border-t border-black/10 pt-6">
                {!loading && (user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.photoURL && (
                        <UserAvatar src={user.photoURL} alt={user.displayName ?? ''} size={36} />
                      )}
                      <span className="text-sm font-medium text-bz-brown">{user.displayName ?? '使用者'}</span>
                    </div>
                    <button
                      onClick={() => { logout(); close(); }}
                      className="text-sm text-bz-mid tracking-wide hover:text-bz-brown transition-colors"
                    >
                      登出
                    </button>
                  </div>
                ) : (
                  <GoogleLoginButton
                    variant="primary"
                    className="w-full py-3 font-medium text-center"
                    onBeforeLogin={close}
                  />
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

    </>
  );
}
