'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const pathname = usePathname();
  const { user, loading, isAdmin, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = (href: string) =>
    `text-sm font-medium tracking-wide transition-colors ${
      pathname === href
        ? 'text-[#FCD060]'
        : 'text-[#9E9E9E] hover:text-[#4A4A4A]'
    }`;

  const mobileLinkClass = (href: string) =>
    `text-base font-bold tracking-wide transition-colors py-2 border-b border-black/5 ${
      pathname === href ? 'text-[#FCD060]' : 'text-[#4A4A4A]'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFDF5]/90 backdrop-blur-md border-b border-black/5">
      <div className="container mx-auto px-5 md:px-10">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/logo-nobg.png"
              alt="Bazi Cat Logo"
              width={56}
              height={56}
              className="transition-transform group-hover:scale-105"
            />
            <span className="text-[#4A4A4A] font-black text-xl tracking-[0.15em] hidden sm:block">
              八字命理
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={linkClass('/')}>
              排盤
            </Link>

            {isAdmin && (
              <>
                <Link href="/dashboard" className={linkClass('/dashboard')}>
                  命盤列表
                </Link>
                <Link href="/knowledge" className={linkClass('/knowledge')}>
                  知識庫
                </Link>
              </>
            )}

            {!loading &&
              (user ? (
                <div className="flex items-center gap-3">
                  {user.photoURL && (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName ?? ''}
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-[#FDE49B]"
                    />
                  )}
                  <button
                    onClick={logout}
                    className="text-[#9E9E9E] hover:text-[#4A4A4A] text-sm font-medium tracking-wide transition-colors"
                  >
                    登出
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="bg-[#4A4A4A] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-black transition-all tracking-wide shadow-sm"
                >
                  Google 登入
                </button>
              ))}
          </nav>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-[#4A4A4A] focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden absolute top-16 left-0 right-0 bg-[#FFFDF5] border-b border-black/5 px-6 pb-6 pt-4 flex flex-col gap-4 shadow-lg z-40"
          >
            <Link
              href="/"
              className={mobileLinkClass('/')}
              onClick={() => setIsOpen(false)}
            >
              排盤
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/dashboard"
                  className={mobileLinkClass('/dashboard')}
                  onClick={() => setIsOpen(false)}
                >
                  命盤列表
                </Link>
                <Link
                  href="/knowledge"
                  className={mobileLinkClass('/knowledge')}
                  onClick={() => setIsOpen(false)}
                >
                  知識庫
                </Link>
              </>
            )}

            <div className="pt-2 flex items-center justify-between">
              {!loading &&
                (user ? (
                  <div className="flex items-center gap-3 w-full justify-between">
                    <div className="flex items-center gap-3">
                      {user.photoURL && (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName ?? ''}
                          width={36}
                          height={36}
                          className="rounded-full ring-2 ring-[#FDE49B]"
                        />
                      )}
                      <span className="text-sm font-medium text-[#4A4A4A]">
                        {user.displayName ?? '使用者'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="text-[#9E9E9E] hover:text-[#4A4A4A] text-sm font-medium tracking-wide transition-colors py-2 px-4 border border-black/10 rounded-full"
                    >
                      登出
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      login();
                      setIsOpen(false);
                    }}
                    className="bg-[#4A4A4A] text-white text-sm font-medium py-3 rounded-full hover:bg-black transition-all tracking-wide shadow-sm w-full text-center"
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
