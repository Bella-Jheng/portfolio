'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from '../nav-link/NavLink';
import { UserAvatar } from '../user-avatar/UserAvatar';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin, readingId, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isPaiPanActive = pathname === '/' || pathname.startsWith('/result/');

  const handlePaiPan = (closeMenu = false) => {
    if (closeMenu) setIsOpen(false);
    if (isAdmin) { router.push('/'); return; }
    router.push(user && readingId ? `/result/${readingId}` : '/');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bz-magazine-bg/90 backdrop-blur-md border-b border-black/5">
      <div className="container mx-auto px-5 md:px-10">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/cats/bazi-cat-default.png"
              alt="Bazi Cat Logo"
              width={30}
              height={30}
              className="transition-transform group-hover:scale-105"
            />
            <span className="text-bz-magazine-text font-black text-xl tracking-[0.15em]">八字命理</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink active={isPaiPanActive} onClick={() => handlePaiPan()}>排盤</NavLink>
            {isAdmin && (
              <>
                <NavLink href="/dashboard" active={pathname === '/dashboard'}>命盤列表</NavLink>
                <NavLink href="/knowledge" active={pathname === '/knowledge'}>知識庫</NavLink>
                <NavLink href="/test" active={pathname === '/test'}>排盤測試</NavLink>
              </>
            )}
            {!loading && (user ? (
              <div className="flex items-center gap-3">
                {user.photoURL && <UserAvatar src={user.photoURL} alt={user.displayName ?? ''} size={32} />}
                <NavLink active={false} onClick={logout}>登出</NavLink>
              </div>
            ) : (
              <button
                onClick={login}
                className="bg-bz-magazine-text text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-bz-brown transition-all tracking-wide shadow-sm"
              >
                Google 登入
              </button>
            ))}
          </nav>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-bz-magazine-text focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden absolute top-16 left-0 right-0 bg-bz-magazine-bg border-b border-black/5 px-6 pb-6 pt-4 flex flex-col gap-4 shadow-lg z-40"
          >
            <NavLink mobile active={isPaiPanActive} onClick={() => handlePaiPan(true)}>排盤</NavLink>
            {isAdmin && (
              <>
                <NavLink mobile href="/dashboard" active={pathname === '/dashboard'} onClick={closeMenu}>命盤列表</NavLink>
                <NavLink mobile href="/knowledge" active={pathname === '/knowledge'} onClick={closeMenu}>知識庫</NavLink>
                <NavLink mobile href="/test" active={pathname === '/test'} onClick={closeMenu}>排盤測試</NavLink>
              </>
            )}

            <div className="pt-2 flex items-center justify-between">
              {!loading && (user ? (
                <div className="flex items-center gap-3 w-full justify-between">
                  <div className="flex items-center gap-3">
                    {user.photoURL && <UserAvatar src={user.photoURL} alt={user.displayName ?? ''} size={36} />}
                    <span className="text-sm font-medium text-bz-magazine-text">{user.displayName ?? '使用者'}</span>
                  </div>
                  <NavLink active={false} onClick={() => { logout(); closeMenu(); }}>
                    <span className="py-2 px-4 border border-black/10 rounded-full text-sm font-medium tracking-wide">登出</span>
                  </NavLink>
                </div>
              ) : (
                <button
                  onClick={() => { login(); closeMenu(); }}
                  className="bg-bz-magazine-text text-white text-sm font-medium py-3 rounded-full hover:bg-bz-brown transition-all tracking-wide shadow-sm w-full text-center"
                >
                  Google 登入
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
