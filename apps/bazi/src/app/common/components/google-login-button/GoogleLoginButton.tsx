'use client';

import { useAuth } from '../../../lib/auth-context';

type Variant = 'primary' | 'outline' | 'dark';

const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'bg-bz-brown text-white hover:opacity-80',
  outline: 'border border-bz-gold/40 text-bz-gold hover:bg-bz-gold/10',
  dark: 'bg-[#4A4A4A] text-white hover:bg-black',
};

interface Props {
  variant?: Variant;
  className?: string;
  onBeforeLogin?: () => void;
}

export function GoogleLoginButton({ variant = 'primary', className = '', onBeforeLogin }: Props) {
  const { login } = useAuth();

  // 先呼叫 login 再做其他事（例如關閉選單），讓開啟 Google 登入視窗緊跟在使用者點擊之後，
  // 和可以正常登入的「開始測算」流程順序一致；iOS Safari 對非直接由點擊開啟的視窗會擋下
  const handleClick = () => {
    login();
    onBeforeLogin?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`text-sm rounded-full transition-all tracking-wider ${VARIANT_STYLES[variant]} ${className}`}
    >
      Google 登入
    </button>
  );
}
